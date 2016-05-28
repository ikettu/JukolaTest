Ext.define('JukolaApp.view.offline.WelcomeView', {
    extend: 'Ext.Container',
    
    xtype: 'welcome',
    
    items: [
        {
            xtype:'image',
            src:'resources/jukola-logo.png',
            width:180,
            height:328
        },
        {
            html:'Jukola 2017'
        }
    ]
});