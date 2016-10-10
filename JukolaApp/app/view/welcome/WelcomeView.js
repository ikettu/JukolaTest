/* globals Ext */
Ext.define('JukolaApp.view.welcome.WelcomeView', {
    extend: 'Ext.Container',

    requires:['Ext.Img'],

    xtype: 'welcome',

    listeners: {
        show: function() {
            var leftMenu = Ext.Viewport.getMenus().left;
            if (leftMenu && !leftMenu.isVisible()) {
                Ext.Viewport.showMenu('left');
            }
        }
    },

    initialize: function() {
        var me = this;
        
        me.eventStore = new Ext.data.Store({
            data: [
                {date : Ext.Date.parse('17.06.2017 14:00 EET', 'd.m.Y H:i T'), text:'Venlojen viestin lähtöön'},
                {date : Ext.Date.parse('17.06.2017 23:00 EET', 'd.m.Y H:i T'), text:'Jukolan viestin lähtöön'}
            ]
        });
        
        var tpl = new Ext.XTemplate(
            '<div style="font-size:larger; font-weight:bolder;">{[this.until(values.date)]} {text}</div>', {
               until:function(date) {
                  var elapsed=Math.abs(Ext.Date.getElapsed(date)),
                  millisInMinute = (60*1000),
                  millisInHour = (60 * millisInMinute),
                  millisInDay = (24 * millisInHour),
                  days = Math.floor(elapsed / millisInDay),
                  hours = Math.floor( (elapsed % millisInDay) / millisInHour),
                  minutes = Math.floor( (elapsed - (days*millisInDay) - (hours*millisInHour)) / millisInMinute )
                  ;
                  
                  return days+"päivää " /* +('0'+hours).slice(-2)+":"+('0'+minutes).slice(-2) */;
                  
                  
               }
            });
        
        me.add({
           xtype:'dataview',
           store:me.eventStore,
           itemTpl: tpl
        });
        
        me.callParent();
    },
    

    items: [
        {
            xtype:'image',
            src:'resources/jukola-logo.png',
            width:180,
            height:328
        }
    ]
});
