/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 */
/* globals localforage, Ext */
Ext.define('JukolaApp.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    requires:[
        'JukolaApp.store.MenuStore',
        'JukolaApp.view.welcome.WelcomeView',
        'JukolaApp.view.online.OnlineView',
        'JukolaApp.view.offline.OfflineView',
        'JukolaApp.view.offlinemap.OfflineMapView',
        'JukolaApp.view.offlinemap.OfflineImageView',
        'JukolaApp.view.weather.WeatherView',
        'Ext.util.Format'
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
        'locale/:locale': 'changeLocale',
        ':node': 'onRouteChange'
    },

    config: {
    },

    collapsedCls: 'main-nav-collapsed',

    menuDataReady: false,
    
    menuCover: true,
    
    allowedLocales : ['fi','en'],
    defaultLocale : 'fi',

    init: function (view) {
        var me = this;

        me.callParent([view]);

        me.createMainMenu();
        
        // fetch trough locale
        localforage.getItem('locale', function(err, value) {
            var locale = value;
            if (!locale) {
                locale = me.toAllowedLocale(me.browserLanguage());
                localforage.setItem('locale',locale, function() {
                    Ext.log('save browser locale '+locale+' as default');
                }); 
            }
            me.loadMenu('resources/menu'+(me.defaultLocale == locale ? '' : '_'+locale)+'.json');
        });
  
 //       me.loadMenu();
        
        
        window.addEventListener('online',  me.checkOnOffline.bind(me));
        window.addEventListener('offline', me.checkOnOffline.bind(me));
        
        X = me;
    },

    
    checkOnOffline: function() {
       var me=this, online=navigator.onLine,
            navigationTree = me.navigationTree,
            store = navigationTree.getStore();
            
       Ext.log('online: '+online);

       store.each(function(rec) {
            var type = rec.get('viewType');
            
            if ("online"===type) {
                var txt = Ext.util.Format.stripTags(rec.get('text'));
                if (online) {
                   rec.set('text',txt);
                } else {
                    rec.set('text','<strike><i>'+txt+'</i></strike>');
                }
            }
        
        }, me, {filtered:true, collapsed:true});
       
    },
    
    createMainMenu: function() {
        var me = this,
            menu = Ext.create('Ext.Menu', {
                scrollable: true,
                items: [{
                   xtype:'img',
                   src:'resources/Asikainen-640.jpg',
                   mode:'img',
                   width:'100%',
                   listeners: {
                      tap: function() {
                        Ext.Viewport.hideMenu('left');
                      }
                   }
                },{
                    xtype: 'treelist',
                    reference: 'navigationTree',
                    ui: 'navigation',
                    store: 'MenuStore',
                    expanderFirst: false,
                    expanderOnly: false,
                    listeners: {
                        itemclick: {
                            fn: me.onNavigationItemClick,
                            scope: me
                        },
                        selectionchange: {
                            fn: me.onNavigationTreeSelectionChange,
                            scope: me
                        }
                    }
                },{
                    xtype:'spacer'
                },{
                    xtype:'button',
                    text:'Reload',
                    iconCls:'x-fa fa-refresh',
                    handler: function() {
                        me.clearCaches(true);
                    }
                },{
                    xtype:'button',
                    text:'About',
                    iconCls:'x-fa fa-info-circle',
                    handler: function() {
                        Ext.Msg.show({
                           title:'About',
                           // iconCls:'x-fa fa-info-circle',
                           message :'<div><b>&copy; 2016-2017 @ikettu &amp; @kontza</b></div><div><i>https://github.com/ikettu/JukolaTest</i></div>' 
                        });
                    }
                },{
                    xtype:'component',
                    width:'100%',
                    height:'30px',
                    data:me.allowedLocales,
                    tpl:'<div><tpl for="."><span style="font-size:larger; margin-left: 2em;" onclick="JukolaApp.app.redirectTo(\'locale\/{.}\');">&nbsp;{.}&nbsp;</span></tpl></div>'
                }]
            }),
            innerItems = menu.getInnerItems();

        if (innerItems.length > 1) {
            me.navigationTree = innerItems[1];
        } else {
            me.navigationTree = {};
        }
        Ext.Viewport.setMenu(menu, {
            side: 'left',
            cover: me.menuCover,
            reveal: !me.menuCover
        });
        
        me.on({
            edgeswipe: function(x) { Ext.log('x'+x);},
            swipe: function(y) { Ext.log('y'+y);}
        });
    },

    browserLanguage: function() {
      return navigator.language;  
    },
    
    toAllowedLocale: function(newLocale) {
      return  this.allowedLocales.indexOf(newLocale) < 0 ? this.defaultLocale : newLocale;  
    },
    
    changeLocale: function(newLocale) {
        
      var me=this, locale = me.toAllowedLocale(newLocale); 
        
      localforage.setItem('locale',locale, function() {
        me.redirectTo('');
        Ext.defer(function() {location.reload(false);},500);
      }); 
    },
    
    loadMenu: function(purl)  {
      var me = this, url=purl||'resources/menu.json'
      ;
      Ext.Ajax.request({
        url:url,
        timeout: 5000, // short timeout to use cached value
        success: function(resp/*,opts*/) {
            Ext.log("Loaded menu from "+url);
            var menuTxt=resp.responseText,menuData = Ext.decode(menuTxt);
            me.navigationTree.getStore().setRoot(menuData);
            me.menuDataReady = true;

            localforage.setItem('menu.json', menuTxt, function(/*err , value*/) {
                Ext.log("Menu data cached");
            });

            me.checkOnOffline();

        },
        failure: function(resp/*,opts*/) {
            Ext.log("Failed to load menu "+resp);

            localforage.getItem('menu.json', function(err, value) {
                var menuData = Ext.decode(value);
                Ext.log("Menu data loaded from cache ");
                me.navigationTree.getStore().setRoot(menuData);
                me.menuDataReady = true;

                me.checkOnOffline();
            });
        }
      });

    },

    onNavigationItemClick: function () {
        // The phone profile's controller uses this event to slide out the navigation
        // tree. We don't need to do anything but must be present since we always have
        // the listener on the view...
    },

    onNavigationTreeSelectionChange: function (tree, node) {
        var to = node && (node.get('routeId') || node.get('viewType')),
            me = this;

        if (to) {
            me.redirectTo(to);
        }
    },

    onRouteChange: function (id) {

        var me = this
        ;

        // retry if we are not yet ready
        if (!me.menuDataReady) {
            me.getReferences().mainCard.setMasked({
                xtype:'loadmask'
            });
            Ext.defer(me.onRouteChange, 1000, me, [id]);
            return;
        }

        if (me.menuCover || Ext.os.is.Phone) {
            Ext.Viewport.hideMenu('left');
        }

        me.setCurrentView(id);
    },

    onToggleMenu: function () {
        var me = this;
        if (!Ext.Viewport.getMenus().left) {
            me.createMainMenu();
        }
        Ext.Viewport.toggleMenu('left');
    },

 /*
  * Trying to precache uninitialized data but mainCard.add shows cards too eagerly
  * TODO  to find some other way to at least fill caches eagerly
  *
    initViews: function() {
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCard,
            navigationTree = me.navigationTree,
            store = navigationTree.getStore()
        ;

        Ext.log("View bg init. "+store.getCount());

        store.getRoot().eachChild(function(topNode) {
          topNode.eachChild(function(node) {
            var viewType = node.get('viewType'),hashTag = node.get('routeId') || viewType,
                item = mainCard.child('component[routeId=' + hashTag + ']');

            Ext.log("Eager bg init view "+hashTag);

            if (!item) {
                Ext.log("Eager bg init add view "+hashTag);

                // TODO would be nice to add these to mainCard but mainCard would show all added.
                mainCard.add({
                    xtype: node.get('viewType'),
                    routeId: hashTag,
                    node: node
                });
            }

          });

        });
    },
*/
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

        mainCard.setMasked(false);

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
            refs.titlebar.setTitle(node.get('text'));
        }

        JukolaApp.AnalyticsManager.recordPagehit(hashTag);

        //if (newView.isFocusable(true)) {
        //    newView.focus();
        //}
    },

    clearCaches: function(codeCache) {
      var me=this;
      localforage.clear(function() {

        if (codeCache) {
            localStorage.clear();
        }

        Ext.Msg.alert("-","Cache cleared.");
        me.redirectTo("welcome");
      });
    }
});
