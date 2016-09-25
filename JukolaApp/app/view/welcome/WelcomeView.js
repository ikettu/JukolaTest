Ext.define('JukolaApp.view.welcome.WelcomeView', {
    extend: 'Ext.Container',

    requires:['Ext.Img'],

    xtype: 'welcome',

    listeners: {
        show: function() {
            Ext.Viewport.showMenu('left');
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
