/* globals ol,localforage */
Ext.define('JukolaApp.view.offlinemap.OfflineMapView', {
    extend: 'Ext.Container',

    requires: ['Ext.LoadMask'],

    xtype: 'offlinemap',


    config: {
        // hashtag
        routeId: undefined,

        // instance of MenuModel
        node:undefined
    },

    map : undefined,

    geolocation : undefined,
    geolocationLayer : undefined,
    positionFeature : undefined,

    initialize: function() {
        Ext.log("map initialize");
        this.callParent();
        this.initMap();
        this.initGeolocation();

        this.on({
            painted: 'doResize',
            scope: this
        });
    },

    updateNode: function(newNode) {
        var me=this;
        if (newNode) {
            me.showMap(newNode);
        }
    },


    storeKeyPrefix:'offlinemap_',

    getKey:function(key) {
        return this.storeKeyPrefix+key;
    },


    olCachingImageLoadFunc: function(image, src) {
        Ext.log('olCachingImageLoadFunc('+image+','+src+')');

        var me = this,
            key = 'offlinemap_'+src
        ;

        localforage.getItem(key, function(err, value) {

            if (value) {
               var blob = value,
                   imageURI = window.URL.createObjectURL(blob);
               image.getImage().src = imageURI;

            } else {

                var req = new XMLHttpRequest();
                req.open('GET', src, true);
                req.responseType = 'arraybuffer';
                req.addEventListener('load',function()  {
                    var blob = new Blob([req.response]);
                    localforage.setItem(key, blob,function(err, val) {
                        Ext.log('val: '+val);
                        var imageURI = window.URL.createObjectURL(blob);
                        image.getImage().src = imageURI;
                    });
                });
                req.send(null);

            }


        });

    },

    weatherLayers: function(node) {
      var
        weatherLayer = new ol.layer.Tile({
            opacity: 0.25,
            source: new ol.source.TileWMS({
                url: 'http://wms.fmi.fi:80/fmi-apikey/dd9a5197-3143-440a-8635-1373fa3d583b/geoserver/ows?',
                params: {
                    'LAYERS': 'Weather:precipitation-forecast',
                    'VERSION': '1.1.1',
                    'FORMAT': 'image/png',
                    'TILED': true
                }
            })


        });
        return weatherLayer;
    }, 

    initLayers: function(node) {
        var me=this;
        var TM35FIN = ol.proj.get('EPSG:3067');

/*
        var jnsLayer = new ol.layer.Image({
//           minResolution:1,
           maxResolution:10,
           source : new ol.source.ImageStatic({
              imageLoadFunction: me.olCachingImageLoadFunc,
              url : 'resources/map/N5424R.png',
              projection: TM35FIN,
              imageExtent: [632001.00, 6941999, 644001, 6953999],
              imageSize: [6000, 6000]
           })
        });
*/
        var jnsLayer2 = new ol.layer.Image({
//           minResolution:1,
//           maxResolution:512,
           source : new ol.source.ImageStatic({
              imageLoadFunction: me.olCachingImageLoadFunc,
              url : 'resources/map/N54L.png',
              projection: TM35FIN,
              imageExtent: [596004, 6905996, 644004, 6953996],
              imageSize: [6000, 6000]
           })
        });



        var enoLayer2 = new ol.layer.Image({
//           minResolution:0.25,
           maxResolution:64,
           opacity:0.8,
           source : new ol.source.ImageStatic({
              imageLoadFunction: me.olCachingImageLoadFunc,
              url : 'resources/map/Enonkarttapohjaa.jpg',
              projection: TM35FIN,
              imageExtent: [660347, 6965678, 661479, 6966473],
              imageSize: [1132, 795]
           })
        });

        return [jnsLayer2, enoLayer2];

//        return new ol.layer.Tile({
//             source: new ol.source.OSM()
//         });




    },

    initMap: function(node) {
        var me = this;
        if (!me.map) {

            var layers = me.initLayers(node);

            if (navigator.onLine) {
              layers.push(me.weatherLayers());
            }


            var projection = layers[0].getSource().getProjection(),

                olmap = new ol.Map({

                    layers: layers,

                    logo: false,

                    view: new ol.View({
                        projection : projection,
                        center: ol.proj.transform([30.153677, 62.788682],'EPSG:4326',projection),
//                        center: ol.proj.transform([29.7576053, 62.5973648],'EPSG:4326',projection),
                        resolution: 2,
                        minResolution: 0.25,
                        maxResolution: 128
                   })
                }),

                container=me.down('#container');

            if (container.element.dom.firstChild) {
                Ext.fly(container.element.dom.firstChild).destroy();
            }

            olmap.setTarget(container.element.dom);
            me.map = olmap;
        }

    },

    initGeolocation: function() {
      var me = this;

      if (!me.geolocationLayer) {
        me.positionFeature = new ol.Feature();
        me.positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: '#3399CC'
              }),
              stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
              })
            })
        }));

        me.geolocationLayer = new ol.layer.Vector({
            map : me.map,
            source : new ol.source.Vector({
                features: [me.positionFeature]
            })
        });
      }

      if (!me.geolocation) {
        me.geolocation = new ol.Geolocation({
            projection : me.map.getView().getProjection(),
            tracking : true,
            trackingOptions: {
                 maximumAge : 60
            }
        });

        me.geolocation.on('error', function(error) {
          Ext.toast({
            message: error.message,
            timeout: 5000,
            ui:'ligth'
          });
        });

        me.geolocation.on('change:position', function() {
           var coordinates = me.geolocation.getPosition();
           Ext.log("coords: "+coordinates);
           me.positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        });
      }


    },

    showMap:function(node) {

        var me=this;

        me.initMap();

        me.setMasked(false);
    },

    doResize: function() {
        var me = this;
        if (me.map) {
            me.map.updateSize();
        }
    },

    items: [
        {
            itemId:'container',
            width:'100%',
            height:'100%',
            masked: {xtype:'loadmask'}
        }
    ]
});
