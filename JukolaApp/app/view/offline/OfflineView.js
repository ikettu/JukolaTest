/* globals localforage, Ext */
Ext.define('JukolaApp.view.offline.OfflineView', {
    extend: 'Ext.Container',

    requires: ['Ext.LoadMask','Ext.plugin.Responsive'],

    xtype: 'offline',

    config: {
        // hashtag
        routeId: undefined,

        // instance of MenuModel
        node:undefined
    },

    storeKeyPrefix:'offline_',
    storeVersionKeyPrefix:'offline_vrs_',

    selectSemaphor: false,

    getKey:function(key) {
        return this.storeKeyPrefix+key;
    },

    getVersionKey:function(key) {
        return this.storeVersionKeyPrefix+key;
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
                version = node.get('version'),
                tocSelector = node.get('tocSelector') || 'h2',
                key=me.getKey(url),
                versionKey=me.getVersionKey(url)
            ;

            Ext.log("key1:"+key);

            XTMPme = me;

            if (me.isVisible()) {
                me.setMasked({
                    xtype:'loadmask'
                });
            }

            var getFromCacheFunc = function() {
                 localforage.getItem(key, function(err, value) {
                     Ext.log("Found1:"+key);
     //                Ext.log('value1:'+value);
                     Ext.log("err1:"+JSON.stringify(err));
                     if (value) {
                         Ext.log("1");
                         me.showHtml.apply(me, [value, tocSelector]);
                     } else if (fetch) {
                         Ext.log("2");
                         me.updateCache.apply(me, [node, true]);
                         Ext.log("4");
                     }
                 });
             };
             
             if (version === -1) {
                 // forced upgrade
                 me.updateCache.apply(me, [node, true]);
             } else if (version) {
                 localforage.getItem(versionKey, function(err,cachedVersion) {
                     if (!cachedVersion || cachedVersion < version) {
                         me.updateCache.apply(me, [node, true]);
                     } else {
                         getFromCacheFunc();
                     }
                 });
             } else {
                 getFromCacheFunc();
             }
 

    },

    showHtml:function(html, tocSelector) {
       var me=this, content=me.down('#content');
       content.setHtml(html);
       var cDom = content.el.dom, toc = me.tocForDoc(cDom,tocSelector||'h2');
       if (!toc) {
         var tocElem = me.down('#toc');
         if (tocElem) {
            me.remove(tocElem,true);
         }
       } else {
         me.down('#toc').removeAll(true,true);
         Xtoc = me.down('#toc').add(toc);
       }

       me.imagesToOffline(cDom);

       me.setMasked(false);
    },

    stripAttributes: function(dom, tagName, attributePrefix) {
        var tags = dom.getElementsByTagName(tagName||'*');
        var i = tags.length,j;
        while (i--) {
          var tag = tags[i], attrs=tag.attributes, toDelete=[];
          for(j=0; j<attrs.length; j++) {
            var attr=attrs[j];
            if (attributePrefix && !attr.name.startsWith(attributePrefix)) {
                continue;
            }
            toDelete.push(attr.name);
          }
          for(j=0; j<toDelete.length; j++) {
            tag.removeAttribute(toDelete[j]);
          }
        }
        return dom;
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

    imageFetchURL:function(src) {
        return 'https://crossorigin.me/'+src;
    },
    
    imagesToOffline: function(dom) {
       var me=this,
          onePixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          imgs = dom.getElementsByTagName('img'),
          revokeFunc = function() {
            window.URL.revokeObjectURL(this.src);
          },

          offliner = function(img) {
            var src=img.src, key=me.getKey(src);

            Ext.log(src+" 1");
            img.src = onePixel;
            img.srcset = '';
            img.sizes = '';


            localforage.getItem(key, function(err, value) {
              Ext.log(src+" 2");
                if (value) {
                    img.src = URL.createObjectURL(value);
                    img.onload = revokeFunc;
                } else {
                    var req = new XMLHttpRequest();
                    req.open('GET', me.imageFetchURL(src), true);
                    req.responseType='blob';

                    req.addEventListener('load',function()  {
                        Ext.log(src+" 3");
                        var blob = req.response;
                        img.src = URL.createObjectURL(blob);
                        img.onload = revokeFunc;
                        localforage.setItem(key, blob, function(err2, value2) {
                            Ext.log('saved '+value2);
                        });
                    });

                    req.send(null);
                }
            });
          },

          i=0;

       for(i=0; i<imgs.length; i++) {
          offliner(imgs[i]);
       }
    },

    processResponse: function(response, selector) {
        var me=this,
        body = selector ? response.querySelector(selector) : response.getElementsByTagName('body')[0];

        me.stripTags(body,'button');
        me.stripTags(body,'script');
        me.stripTags(body,'link');
        me.stripTags(body,'iframe');
        me.stripTagsLeaveContent(body,'a');
        me.stripAttributes(body, '*','on');
        return body;
    },

    tocForDoc: function(document, selector) {
        var me=this, routeId = me.getRouteId(), elems = document.querySelectorAll(selector),
            myId = me.down('#content').el.down('div').id, toc = []
        ;

        if (elems) {
            var index = 0;
            for( index=0; index < elems.length; index++ ) {
                var elem = elems[index], tocId = "toc_"+routeId+'_'+index;
                elem.id = tocId;
                if (elem.classList) {
                    elem.classList.add('xtoc');
                } else {
                    elem.className += ' xtoc';
                }
                toc.push({
                    tocId : tocId,
                    text:  elem.textContent
                });
            }
        }

        if (toc.length < 2) {
            return null;
        }


        me.down('#content').getScrollable().on({
            scroll: function(/* z,x,y */) {

                if (me.selectSemaphor) {
                    return;
                }

                var index = 0, scrollerElem = Ext.get(myId), tocView = me.down('#toc').down('list');
                if (tocView) {
                  for( index=0; index < elems.length; index++ ) {
                      var elem = elems[index], tocElem = Ext.get(elem),
                          offsets = tocElem.getOffsetsTo(scrollerElem);
                      if (offsets[1]>=0) {
                          var selections = tocView.getSelections();
                          if (selections[0] && selections[0].get('tocId') === elem.id) {
                              return;
                          }
                          Ext.log(elem.id);
                          tocView.select(index, false, true);
                          if (tocView.isVisible(true) && tocView.getSelections()) {
                              tocView.scrollToRecord(tocView.getSelections()[0]);
                          }
                          return;
                      }
                  }

                }
            }
        });


        var tocList = {
            xtype:'list',
            itemId: 'toc',
            width:'100%',
            height:'100%',
            data:toc,
            tpl:'{text}',
            listeners:{
                select: function( list, record ) {
                    var tocId = record.get('tocId');
                    Ext.log(tocId+" "+myId);
                    var tocElem = Ext.get(tocId), scrollerElem = Ext.get(myId),
                    offsets = tocElem.getOffsetsTo(scrollerElem),
                    scroller = me.down('#content').getScrollable()
                    ;
                    Ext.log(tocElem.getY()+" "+offsets[1]);

                    me.selectSemaphor = true;
                    scroller.scrollTo(0, scroller.getPosition().y+offsets[1]);
                    me.selectSemaphor = false;
                }
            }
        };

        return tocList;
    },

    updateCache:function(node,show) {
        var me=this,
            req = new XMLHttpRequest(),
            url = node.get('url'),
            version = node.get('version'),
            selector = node.get('selector'),
            tocSelector = node.get('tocSelector') || 'h2',
            key=me.getKey(url)
            ;

        Ext.log("3");

        req.open('GET',url,true);
        req.responseType='document';

        req.addEventListener('load',function()  {
            var responseDom = me.processResponse(req.response, selector),
                response = responseDom.innerHTML;

            Ext.log("key2:"+key);

            localforage.setItem(key, response, function(err, value) {
                // Ext.log('value2:'+value);
                Ext.log("err2:"+JSON.stringify(err));

                if (show && value) {
                    me.showHtml.apply(me, [value, tocSelector]);
                }

                if (version) {
                    localforage.setItem(me.getVersionKey(url), version, function(/*err,value*/) {
                    });
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
        }, {
            xtype:'container',
            layout:'fit',
            itemId:'toc',
            plugins: 'responsive',
            hidden: true,
            responsiveConfig: {
                'width <= 600 || tall': {
                    hidden: true,
                    shadow: false
                },
                'width > 600 && width <= 960 && wide': {
                    hidden: false,
                    docked:'left',
                    width:'20%',
                    height:'100%',
                    margin: '2 8 0 0',
                    shadow: false
                },
                'width > 960 && wide': {
                    hidden: false,
                    docked:'left',
                    width:'20%',
                    height:'98%',
                    margin: '8 16 8 8',
                    shadow: true
                }

            }
        }
    ]

});
