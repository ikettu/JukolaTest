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
        'Ext.LoadMask','Ext.plugin.Responsive',

        'JukolaApp.store.MenuStore',
        'JukolaApp.view.main.MainController',
        'JukolaApp.view.welcome.WelcomeView'
    ],

    controller: 'main',

    layout: 'hbox',

    items: [
        {
            xtype:'titlebar',
            reference:'titlebar',
            docked:'top',
            shadow: true,
            style:'background-color: #c00000; color: #ffffff',
            items: [
                {
                    xtype: 'button',
                    align: 'left',
                    ui: 'action',
                    iconCls: 'x-fa fa-bars',
                    listeners: {
                        tap: 'onToggleMenu'
                    }
                }, {
                    xtype: 'button',
                    align: 'right',
                    ui: 'action',
                    iconCls: 'x-fa fa-moon-o',
                    enableToggle: true,
                    handler: function() {
                        var me = this;
                        if (me.isPressed()) {
                          //  me.setIconCls('x-fa fa-moon-o');
                            Fashion.css.setVariables({
                                 "dark-mode": "true"
                            });
                        } else {
                          //  me.setIconCls('x-fa fa-sun-o');
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
            margin: '6 0 0 0',
            reference: 'mainCard',
            userCls: 'main-container',
            navigationBar: false,
            plugins: 'responsive',
            responsiveConfig: {
                'width > 960': {
                    margin: 16,
                    shadow: true
                }
                
            }
        }
    ]
});
