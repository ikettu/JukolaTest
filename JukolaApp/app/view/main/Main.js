/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting causes an instance of this class to be created and
 * added to the Viewport container.
 *
 */
/* globals Ext, Fashion */
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

                }, {
                    xtype: 'button',
                    docked: 'right',
                    ui: 'action',
                    iconCls: 'x-fa fa-sun-o',
                    enableToggle: true,
                    handler: function() {
                        var me = this;
                        if (me.isPressed()) {
                            me.setIconCls('x-fa fa-moon-o');
                            Fashion.css.setVariables({
                                 "dark-mode": "true"
                            });
                        } else {
                            me.setIconCls('x-fa fa-sun-o');
                            Fashion.css.setVariables({
                                "dark-mode": "false"
                            });
                        }
                    }
                }

            ]
        }, {
            xtype: 'navigationview',
            flex: 1,
            reference: 'mainCard',
            userCls: 'main-container',
            navigationBar: false
        }
    ]
});
