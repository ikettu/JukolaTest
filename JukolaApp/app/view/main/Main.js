/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 *
 */
Ext.define('JukolaApp.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',

    requires: [
        'Ext.MessageBox', 
        'Ext.Button',
        'Ext.list.Tree',
        'Ext.navigation.View',
        
        'JukolaApp.store.MenuStore',
        'JukolaApp.view.main.MainController',
        'JukolaApp.view.welcome.WelcomeView'
    ],

    controller: 'main',

    layout: 'hbox',
    
    items: [
        {
            xtype: 'container',
            userCls: 'main-nav-container',
            reference: 'navigation',
            scrollable: true,
            width:200,
            plugins: 'responsive',
            responsiveConfig: {
                'width < 500': {
                    width:46
                }
            },
            
            
            items: [
                {
                    xtype: 'button',
                    dock: 'top',
                    ui: 'header',
                    iconCls: 'x-fa fa-bars',
                    margin: '0 0 0 10',
                    listeners: {
                        tap: 'onToggleNavigationSize'
                    }
                },
                
                {
                    xtype: 'treelist',
                    reference: 'navigationTree',
                    ui: 'navigation',
                    store: 'MenuStore',
                    expanderFirst: false,
                    expanderOnly: false,
                    listeners: {
                        itemclick: 'onNavigationItemClick',
                        selectionchange: 'onNavigationTreeSelectionChange'
                    }
                }
            ]
        },
        {
            xtype: 'navigationview',
            flex: 1,
            reference: 'mainCard',
            userCls: 'main-container',
            navigationBar: false
        }        
    ]
});
