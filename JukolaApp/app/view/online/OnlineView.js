Ext.define('JukolaApp.view.online.OnlineView', {
    extend: 'Ext.Container',
    
    requires: ['JukolaApp.widget.IFrame'],
    
    xtype: 'online',
    
    config: {
        // hashtag    
        routeId: undefined,
    
        // instance of MenuModel
        node:undefined,
    },
    
    initConfig: function(config) {
        var me = this,
            url = config.node.get('url');
        me.callParent(arguments);
        Ext.log('online url: '+url);
        me.add({
            xtype:'iframe',
            width:'100%',
            height:'100%',
            src: url
        });
    }
    
});
