/* globals ol,localforage */
Ext.define('JukolaApp.view.offlinemap.OfflineImageView', {
    extend: 'Ext.Container',

    requires: ['Ext.LoadMask'],

    xtype: 'offlineimage',


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
        var me = this;
        Ext.log("map initialize");
        me.callParent();
        me.initMap();
    
        var tracking = me.getNode().get('tracking')||false;
        
        if (tracking) {
            me.initGeolocation();
            me.on({
                activate: function() {
                    me.startTracking();
                },
                deactivate: function() {
                    me.pauseTracking();
                },
                scope: me
            });
        }

        me.on({
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
            key = 'offlineimage_'+src
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

    initLayers: function(/*node*/) {
        var me=this,
            extent=[0,0,1132, 795],
//            extent=[0,0,4426,5123],
            projection = new ol.proj.Projection({
               code:'x-image',
               units:'pixels',
               extent: extent
            }),
            layer1 = new ol.layer.Image({
                imageLoadFunction: me.olCachingImageLoadFunc,
                source: new ol.source.ImageStatic({
                    url : 'resources/map/Eno2017kisakeskus_viestinta_1.gif',
                    projection: projection,
                    imageExtent: extent,
                    imageSize: [extent[2], extent[3]]
                })
            });
/*            
            layer1 = new ol.layer.Image({
                imageLoadFunction: me.olCachingImageLoadFunc,
                extent: extent,
                source: new ol.source.ImageStatic({
                    url : 'resources/map/Eno2017kisakeskus_viestinta_025m.gif',
                    projection: projection,
                    imageExtent: extent,
                    imageSize: [extent[2], extent[3]]
                })
            });
*/

        return [layer1];
    },

    initMap: function(node) {
        var me = this;
        if (!me.map) {

            var layers = [];

            layers = layers.concat(me.initLayers(node));

            var baseLayer = layers[0],
                projection = baseLayer.getSource().getProjection(),
                extent = baseLayer.getExtent(),
                center = extent? ol.extent.getCenter(extent) : [100,100],
                olmap = new ol.Map({

                    layers: layers,

                    logo: false,

                    view: new ol.View({
                        projection : projection,
                        center: center,
                        extent: extent,
                        
                        resolution: 1,
                        minResolution: 0.25,
                        maxResolution: 2
/*                        
                        resolution: 2,
                        minResolution: 0.5,
                        maxResolution: 4
*/                        
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

    initGeolocation: function(node) {
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
            tracking : false,
            trackingOptions: {
                 maximumAge : 15000
            }
        });

        me.geolocation.on('error', function(error) {
          Ext.toast({
            message: error.message,
            timeout: 5000
          });
        });

        me.geolocation.on('change:position', function() {
           var coordinates = me.geolocation.getPosition();
           Ext.log("coords: "+coordinates);
           me.positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        });
      }

    },

    startTracking: function() {
        var me=this;
        Ext.log("Start tracking.");
        me.geolocation.setTracking(true);
    },
    
    pauseTracking: function() {
        var me = this;
        Ext.log("Pause tracking.");
        me.geolocation.setTracking(false);
    },

    showMap:function(node) {

        var me=this;

        me.initMap(node);

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
