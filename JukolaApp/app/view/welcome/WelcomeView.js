Ext.define('JukolaApp.view.welcome.WelcomeView', {
    extend: 'Ext.Container',
    
    requires:['Ext.Img'],
    
    xtype: 'welcome',
    
    listeners: {
        show: function() {
            var menu = this.up('app-main').down('#navigation');
            menu.setHidden(false);
        }
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