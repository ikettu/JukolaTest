Ext.define('JukolaApp.store.CleanProxy', {
    extend:'Ext.data.proxy.Ajax',

    alias : 'proxy.clean',
        buildRequest: function(operation) {
            var req = this.callParent([operation]);
            req.setParams({});
            return req;
        }
    
});
