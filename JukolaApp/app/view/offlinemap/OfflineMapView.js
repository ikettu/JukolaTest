Ext.define('JukolaApp.view.offlinemap.OfflineMapView', {
    extend: 'Ext.Container',
    
    xtype: 'offlinemap',
    
    
    config: {
        // hashtag    
        routeId: undefined,
    
        // instance of MenuModel
        node:undefined,
    },
    
    map : undefined,

    

    initialize: function() {
        this.callParent();
        this.initMap();

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
    
    initLayer: function(node) {
        return new ol.layer.Tile({
             source: new ol.source.OSM()
         });  
    },
    
    initMap: function(node) {
        var me = this;
        if (!me.map) {

            var layer = me.initLayer(node),
            
                projection = layer.getSource().getProjection(),
            
                olmap = new ol.Map({
                    
                    layers: [ layer ],
              
                    view: new ol.View({
                        projection : projection,
                        center: ol.proj.transform([29.7576053, 62.5973648],'EPSG:4326',projection),
                        resolution: 5
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
    
    showMap:function(node) {
      
        var me=this;

        me.initMap();        
            
        XMap = me.map;
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
            height:'100%'
        }
    ]
});