Ext.define('JukolaApp.view.weather.WeatherView', {
    extend: 'Ext.Container',

    requires: ['Ext.LoadMask','Ext.plugin.Responsive'],

    xtype: 'weather',

    config: {
        // hashtag
        routeId: undefined,

        // instance of MenuModel
        node:undefined
    },

    url:'https://crossorigin.me/http://data.fmi.fi/fmi-apikey/dd9a5197-3143-440a-8635-1373fa3d583b/wfs?request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::timevaluepair&place=eno&param=temperature,windspeedmsm,WindDirection,WeatherSymbol3',
 
    
    initialize: function() {
        var me=this;
        
        Ext.log('initialize');
        
        me.on({
            activate : me.checkRefresh,
            scope: me
        });
        
        me.callParent();
    },
 
     updateNode: function(newNode) {
        var me=this;
        if (newNode) {
           me.fetchData();  
        }
    },
       
    createDataMap:function(doc, dataId) {
            var i, datamap={},
                 datas=doc.querySelectorAll('*|MeasurementTimeseries[*|id=mts-1-1-'+dataId+'] *|MeasurementTVP')
                 ;
 
            
            for(i in datas) {
                if (!datas.hasOwnProperty(i)) {
                    continue;
                }
                var data=datas[i],
                  time=Ext.Date.parse(data.querySelector('*|time').textContent,'c'),
                  timeFormatted = Ext.Date.format(time, 'D H:i'),
                  value=data.querySelector('*|value').textContent;
                
                datamap[timeFormatted] = value;
            }
            
            return datamap;
    },
       
    fetchData:function() {
        
      var me=this,
          dataview=me.down('dataview'), store=dataview.getStore(),
          req = new XMLHttpRequest();

      if (me.isVisible()) {
         me.setMasked({
           xtype:'loadmask'
         });
       }
  
          
       req.open('GET', me.url, true);
       req.responseType='document';

       req.addEventListener('load',function()  {
            var doc= req.response;

            var i,
                 temps=doc.querySelectorAll('*|MeasurementTimeseries[*|id=mts-1-1-Temperature] *|MeasurementTVP'),
                 symbolmap = me.createDataMap(doc,'WeatherSymbol3'),
                 precipitation1hmap = me.createDataMap(doc,'Precipitation1h'),
                 windspeedmsmap = me.createDataMap(doc,'WindSpeedMS')
                 ;
                       
 
            store.removeAll();

            for(i in temps) {
                if (!temps.hasOwnProperty(i)) {
                    continue;
                }
                var tempElem=temps[i],
                  time=Ext.Date.parse(tempElem.querySelector('*|time').textContent,'c'),
                  timeFormatted = Ext.Date.format(time, 'D H:i'),
                  temp=tempElem.querySelector('*|value').textContent;
                
                Ext.log('adding '+temp);
                store.add({
                    ts:time,
                    time:timeFormatted,
                    temp:temp,
                    symbol:symbolmap[timeFormatted]||93,
                    windspeedms:windspeedmsmap[timeFormatted]||0,
                    precipitation1h:precipitation1hmap[timeFormatted]||0
                });
            }
            
            me.setMasked(false);

 
       });

       req.send(null);
       
    },
    
    
    checkRefresh: function() {
        var me=this, store=me.down('dataview').getStore(), now = new Date()// for testing Ext.Date.add(new Date(), Ext.Date.HOUR, 3)
        ;
        
        Ext.log('checkRefresh '+now);
        
        while(store.getCount()>0 && store.first().get('ts')<now) {
            Ext.log('Removing old weather '+store.first);
            store.removeAt(0);
        }
        
        if (store.getCount() < 33) {
            me.fetchData();
        }
        
    },
    
    items: [
    {
        itemId:'dataview',
        reference:'dataview',
        xtype:'dataview',
        width:'100%',
        height:'100%',
        store: [],
        itemTpl: '<div style="display: flex;align-items: center;"><b>{time}</b> <img src="resources/weatherSymbols/{symbol:round}.svg" width="40" height="40"/>  {temp:round}&#176;C {windspeedms:round}m/s  {precipitation1h:round}mm</div>'
    }]
    
});