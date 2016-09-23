/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('JukolaApp.Application', {
    extend: 'Ext.app.Application',
    
    requires: ['JukolaApp.AnalyticsManager'],
    
    name: 'JukolaApp',

    stores: [
        'MenuStore'
    ],
    
    defaultToken : 'welcome',
    
    launch: function () {
        var splash = Ext.get('splash');
        if (splash) {
            splash.destroy();
        }
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
