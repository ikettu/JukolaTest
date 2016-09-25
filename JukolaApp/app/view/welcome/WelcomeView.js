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

    items: [
        {
            xtype:'image',
            src:'resources/jukola-logo.png',
            width:180,
            height:328
        }
    ]
});
