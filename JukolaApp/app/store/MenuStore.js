Ext.define('JukolaApp.store.MenuStore', {
    extend: 'Ext.data.TreeStore',
    requires: ['JukolaApp.model.MenuModel'],

    alias: 'store.menustore',

    model: 'JukolaApp.model.MenuModel',
    
    root: {
        expanded: true
    },
    
    autload:true,
    
    proxy: {
        type:'ajax',
        noCache:false,
        url:'resources/menu.json',
        reader: {
            type:'json'
        }
    }
});
