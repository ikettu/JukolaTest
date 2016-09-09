Ext.define('JukolaApp.view.welcome.WelcomeView', {
    extend: 'Ext.Container',
    
    requires:['Ext.Img'],
    
    xtype: 'welcome',
    
    items: [
        {
            xtype:'image',
            src:'resources/jukola-logo.png',
            width:180,
            height:328
        }
    ]
});