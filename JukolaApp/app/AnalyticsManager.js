/* globals localforage */
Ext.define('JukolaApp.AnalyticsManager', {
    
    singleton: true,
    
    queueKey:'analytisQueue',
    cidKey:'analytisCid',
    
    tid:'UA-8420034-5',
    cid:undefined,
    
    constructor:function() {
        var me=this;
        
        if (!me.cid) {
            localforage.getItem(me.cidKey, function(err, value) {
                if (value) {
                    me.cid = value;
                } else {
                    me.cid = me.generateUUID();
                    localforage.setItem(me.cidKey, me.cid, function(/*err,value*/) {
                    });
                }
            });
        }
        
        me.callParent(arguments);  
    },
    
    generateUUID: function (){
        var d = new Date().getTime();
        if(window.performance && typeof window.performance.now === "function"){
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    },
    
    
    recordPagehit: function(pageName) {
        var me = this, now = new Date().getTime(),
            pageHit={
                pageName:pageName,
                date:now
            };
            
            me.queuePageHit(pageHit);
    },
    
    queuePageHit: function(pageHit) {
        var me = this;
        localforage.getItem(me.queueKey, function(err, value) {
            value = value||[];
            value.push(pageHit);
            localforage.setItem(me.queueKey, value, function(err,value){
                Ext.log("Pagehit queued "+JSON.stringify(value));
            });
        });        
    },
    
    sendSinglePageHitNow: function(pageHit, success, failure) {
        var me = this, now=new Date().getTime();
              
        Ext.Ajax.request({
            url: 'https://www.google-analytics.com/collect',
            method:'POST',
            params: {
               v:1,
               tid:me.tid,
               cid:me.cid,
               t:'pageview',
               dp:'/'+pageHit.pageName,
               qt: now-pageHit.date,
               z:now
            },
            useDefaultXhrHeader:false,
            cors:true,
            
            success: success,
            failure: failure
        });
    },
    
    sendPagehits: function() {
        var me = this, now = new Date();
        localforage.getItem(me.queueKey, function(err, value) {
            
            if (value) {
                
                var pageHit = value.pop();
                
                localforage.setItem(me.queueKey, value, function(err,value){
                    
                    me.sendSinglePageHitNow(pageHit, undefined, function() {
                        
                        pageHit.fails = (pageHit.fails||0)+1;
                        me.queuePageHit(pageHit);
                    });
                                        
                });
                
            }
        });        
    }
    
    
});