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
            
            // me.setLoading(true);

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
       // me.setLoading(false);
    },

    stripTags: function(dom, tagName) {
        var tags = dom.getElementsByTagName(tagName);
        var i = tags.length;
        while (i--) {
          tags[i].parentNode.removeChild(tags[i]);
        }
        return dom;   
    },
    
    stripTagsLeaveContent: function(dom, tagName) {
        var tags = dom.getElementsByTagName(tagName);
        var i = tags.length;
        while (i--) {
          var tag=tags[i], j = tag.childNodes.length;
          while(j--) {
            tag.parentNode.appendChild(tag.childNodes[j]);
          }
          tag.parentNode.removeChild(tags[i]);
        }
        return dom;   
    },


    processResponse: function(response, selector) {
        var me=this,
        body = selector ? response.querySelector(selector) : response.getElementsByTagName('body')[0];
        
        me.stripTags(body,'button');
        me.stripTags(body,'script');
        me.stripTagsLeaveContent(body,'a');
        return body;
    },
    
    updateCache:function(node,show) {
        var me=this,
            req = new XMLHttpRequest(),
            url = node.get('url'),
            selector = node.get('selector'),
            key=me.getKey(url)
            ;

        Ext.log("3");
        
        req.open('GET',url,true);
        req.responseType='document';
        
        req.addEventListener('load',function()  {
            var response = me.processResponse(req.response, selector).innerHTML;
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
