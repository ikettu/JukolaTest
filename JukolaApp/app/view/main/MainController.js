/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 */
/* globals localforage */
Ext.define('JukolaApp.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',
    
    requires:[
        'JukolaApp.store.MenuStore',
        'JukolaApp.view.welcome.WelcomeView',
        'JukolaApp.view.online.OnlineView',
        'JukolaApp.view.offline.OfflineView',
        'JukolaApp.view.offlinemap.OfflineMapView'
    ],

    listen : {
        controller : {
            '#' : {
                unmatchedroute : 'onRouteChange'
            }
        }
    },

    routes: {
        'reload': 'clearCaches',
        ':node': 'onRouteChange'
    },

    config: {
        showNavigation: true
    },

    collapsedCls: 'main-nav-collapsed',

    init: function (view) {
        var me = this,
            refs = me.getReferences();

        me.callParent([ view ]);

        me.nav = refs.navigation;
        me.navigationTree = refs.navigationTree;
    },

    onNavigationItemClick: function () {
        // The phone profile's controller uses this event to slide out the navigation
        // tree. We don't need to do anything but must be present since we always have
        // the listener on the view...
    },

    onNavigationTreeSelectionChange: function (tree, node) {
        var to = node && (node.get('routeId') || node.get('viewType'));

        if (to) {
            this.redirectTo(to);
        }
    },

    onRouteChange: function (id) {
        
        var me = this,
            navigationTree = me.navigationTree,
            store = navigationTree.getStore();
            
        if (store.isLoading()) {
            Ext.defer(me.setCurrentView, 1000, me, [id]);
            return;
        }
        
        me.setCurrentView(id);
    },


    onToggleNavigationSize: function () {
        this.setShowNavigation(!this.getShowNavigation());
    },

    setCurrentView: function (hashTag) {
        hashTag = (hashTag || '').toLowerCase();

        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCard,
            navigationTree = me.navigationTree,
            store = navigationTree.getStore(),
            node = store.findNode('routeId', hashTag) ||
                   store.findNode('viewType', hashTag),
            item = mainCard.child('component[routeId=' + hashTag + ']');

        if (!node) {
            Ext.log("Node not found for "+hashTag);
        } else {
            if (!item) {
                item = mainCard.add({
                    xtype: node.get('viewType'),
                    routeId: hashTag,
                    node: node
                });
            }
            
            mainCard.setActiveItem(item);
            
            navigationTree.setSelection(node);
        }

        //if (newView.isFocusable(true)) {
        //    newView.focus();
        //}
    },
    
    clearCaches: function() {
      var me=this;
      localforage.clear(function() {
        Ext.Msg.alert("","Cache cleared.");
        me.redirectTo("welcome");
      });
    },

    updateShowNavigation: function (showNavigation, oldValue) {
        // Ignore the first update since our initial state is managed specially. This
        // logic depends on view state that must be fully setup before we can toggle
        // things.
        //
        if (oldValue !== undefined) {
            var me = this,
                cls = me.collapsedCls,
                refs = me.getReferences(),
//                logo = refs.logo,
                navigation = me.nav,
                navigationTree = refs.navigationTree,
                rootEl = navigationTree.rootItem.el
                ;
                

            // TODO: should use css as admin-dashboard demo but this is just quick fix for now.                
            if (navigation.getWidth() < 100) {
                navigation.setWidth(200);
            } else {
                navigation.setWidth(75);
            }
                
/*
            navigation.toggleCls(cls);
 //           logo.toggleCls(cls);

            if (showNavigation) {
                // Restore the text and other decorations before we expand so that they
                // will be revealed properly. The forced width is still in force from
                // the collapse so the items won't wrap.
                navigationTree.setMicro(false);
            } else {
                // Ensure the right-side decorations (they get munged by the animation)
                // get clipped by propping up the width of the tree's root item while we
                // are collapsed.
                rootEl.setWidth(rootEl.getWidth());
            }

//            logo.element.on({
//                transitionend: function () {
//                    if (showNavigation) {
//                        // after expanding, we should remove the forced width
//                        rootEl.setWidth('');
//                    } else {
//                        navigationTree.setMicro(true);
//                    }
//                },
//               single: true
//            });

*/
        }
    }

});