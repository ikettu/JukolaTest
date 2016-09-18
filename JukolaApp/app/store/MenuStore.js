Ext.define('JukolaApp.store.MenuStore', {
    extend: 'Ext.data.TreeStore',
//    requires: ['JukolaApp.model.MenuModel', 'JukolaApp.store.CleanProxy'],

    alias: 'store.menustore',

//    model: 'JukolaApp.model.MenuModel',
    
    root: {
        expanded: true
    },
/*    
    autload:false,
    
    proxy: {
        type:'clean',
        noCache:false,
        url:'resources/menu_default.json',
        reader: {
            type:'json'
        }
    }
    */
});
