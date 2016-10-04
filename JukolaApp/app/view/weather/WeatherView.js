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

    url:'http://data.fmi.fi/fmi-apikey/dd9a5197-3143-440a-8635-1373fa3d583b/wfs?request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::timevaluepair&place=eno&param=temperature,windspeedmsm,WindDirection,WeatherSymbol3',
 
 
 
     updateNode: function(newNode) {
        var me=this;
        if (newNode) {
           me.fetchData();  
        }
    },
       
    fetchData:function() {
        
      var me=this,
          dataview=me.down('dataview'), store=dataview.getStore(),
          req = new XMLHttpRequest();

       req.open('GET', me.url, true);
       req.responseType='document';

       req.addEventListener('load',function()  {
            var doc= req.response;

            var i, symbolmap={},
                 symbols=doc.querySelectorAll('*|MeasurementTimeseries[*|id=mts-1-1-WeatherSymbol3] *|MeasurementTVP'),
                 temps=doc.querySelectorAll('*|MeasurementTimeseries[*|id=mts-1-1-Temperature] *|MeasurementTVP');
 
            
            for(i in symbols) {
                if (!symbols.hasOwnProperty(i)) {
                    continue;
                }
                var s=symbols[i],time=Ext.Date.parse(s.querySelector('*|time').textContent,'c'),
                  timeFormatted = Ext.Date.format(time, 'D H:i'),
                  symbol=s.querySelector('*|value').textContent;
                
                symbolmap[timeFormatted] = symbol;
            }
WSB = symbols; 
 
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
                    time:timeFormatted,
                    temp:temp,
                    symbol:symbolmap[timeFormatted]
                });
            }
 
       });

       req.send(null);
       
    },
    
    items: [
    {
        itemId:'dataview',
        reference:'dataview',
        xtype:'dataview',
        width:'100%',
        height:'100%',
        store: [{}],
        itemTpl: '<div style="display: flex;align-items: center;">{time} <img src="resources/weatherSymbols/{symbol:round}.svg" width="40" height="40"/>  {temp:round}&#176;C</div>'
    }]
    
});