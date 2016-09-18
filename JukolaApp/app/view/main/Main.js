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
            xtype:'container',
            docked:'top',
            width:'100%',
//            height:50,
            ui: 'header',
            layout: 'hbox',
            style:'background-color: #c00000; color: #ffffff',
            items: [
                {
                    xtype: 'button',
//                    width: 30,
                    ui: 'header',
                    iconCls: 'x-fa fa-bars',
                    margin: '2 2 2 10',
                    listeners: {
                        tap: 'onToggleNavigationSize'
                    }
                },
                {
                    xtype: 'component',
                    reference:'heading',
                    flex: 1,
                    ui: 'header',
                    margin: '7 14 7 7',
                    style: 'font-weight: bold;',
                    html: 'JukolaApp'

                }
                
            ]
        },
        
        
        {
            xtype: 'container',
            itemId:'navigation',
            userCls: 'main-nav-container',
            reference: 'navigation',
            scrollable: true,
            width:200,
            height:'100%',
            plugins: 'responsive',
            responsiveConfig: {
                'width < 500': {
                    hidden: true
                }
            },
            
            
            items: [
                
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
