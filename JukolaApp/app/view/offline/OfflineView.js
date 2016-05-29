Ext.define('JukolaApp.view.offline.OfflineView', {
    extend: 'Ext.Container',
    
    requires: ['JukolaApp.model.MenuModel'],
    
    xtype: 'offline',

    config: {
        // hashtag    
        routeId: undefined,
    
        // instance of MenuModel
        node:undefined,
    },

    storeKeyPrefix:'offline_',

    getKey:function(key) {
        return this.storeKeyPrefix+key;
    },
    
    updateNode: function(newNode) {
        var me=this;
        if (newNode) {
            me.showContentFromCache(newNode, true);
        }
    },
    
    showContentFromCache:function(node, fetch) {
            var me=this,
                url = node.get('url'),
                key=me.getKey(url)
            ;
            
            Ext.log("key1:"+key);
            
            localforage.getItem(key, function(err, value) {
                Ext.log("Found1:"+key);
                Ext.log('value1:'+value);
                Ext.log("err1:"+JSON.stringify(err));
                if (value) {
                    Ext.log("1");
                    me.showHtml.apply(me, [value]);
                } else if (fetch) {
                    Ext.log("2");
                    me.updateCache.apply(me, [node, true]);
                    Ext.log("4");
                }
            });
            
    },
    
    showHtml:function(html) {
       var me=this;
       me.down('#content').setHtml(html); 
    },

    stripTags: function(dom, tagName) {
        var tags = dom.getElementsByTagName(tagName);
        var i = tags.length;
        while (i--) {
          tags[i].parentNode.removeChild(tags[i]);
        }
        return dom;   
    },
    
    processResponse: function(response) {
        var me=this,
        body = response.getElementsByTagName('body')[0];
        
        me.stripTags(body,'button');
        me.stripTags(body,'script');
        me.stripTags(body,'a');
        return body;
    },
    
    updateCache:function(node,show) {
        var me=this,
            req = new XMLHttpRequest(),
            url = node.get('url'),
            key=me.getKey(url)
            ;

        Ext.log("3");
        
        req.open('GET',url,true);
        req.responseType='document';
        
        req.addEventListener('load',function()  {
            var response = me.processResponse(req.response).innerHTML;
            Ext.log("key2:"+key);
            
            localforage.setItem(key, response, function(err, value) {
                Ext.log('value2:'+value);
                Ext.log("err2:"+JSON.stringify(err));

                if (show && value) {
                    me.showHtml.apply(me, [value]);
                }
            });
            
        });
        
        req.send(null);        
        
        
    },
    
    items: [
        {
            itemId:'content',
            html:'',
            width:'100%',
            height:'100%',
            scrollable: true
        }
    ]
        
    
});