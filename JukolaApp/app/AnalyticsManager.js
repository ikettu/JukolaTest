/* globals localforage */
Ext.define('JukolaApp.AnalyticsManager', {
    
    singleton: true,
    
//    analyticsURL: 'https://www.google-analytics.com/debug/collect',
    analyticsURL: 'https://www.google-analytics.com/collect',
    
    queueKey:'analytisQueue',
    cidKey:'analytisCid',
    
    tid:'UA-8420034-5',
    cid:undefined,

    sendTimer: undefined,
    
    constructor:function() {
        var me=this;

        // create installation specific unique id         
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
        
        var onlineFunc = function() {
          me.initSendTimer();    
        };
        
        window.addEventListener('online',  onlineFunc);
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
    
    isOnline: function() {
      return navigator.onLine;  
    },
    
    recordPagehit: function(pageName, title, newSession) {
        var me = this, now = new Date().getTime(),
            pageHit={
               t:'pageview',
               dp:'/'+pageName,
               dh:location.hostname,
               dt:title||pageName,
               date:now
            };
         
         if (newSession) {
            var size = Ext.Viewport.getSize();
            pageHit = Ext.apply({
                sc:'start',
                ul:'fi',  //TODO: dynamic
                vp:size.width+'x'+size.height
            }, pageHit);
         }   
            
         me.sendOrQueueMeasurement(pageHit);   
    },
    
    recordEvent: function(eventCategory, eventAction, label, value) {
        var me = this, now = new Date().getTime(),
            enventRecord={
               t:'event',         // Event hit type
               ec:eventCategory,
               ea:eventAction,       // Event Action. Required.
               date:now
            };
            
         if (label) {
            eventRecord.el = label;
            eventRecord.ev = value;
         }
            
         me.sendOrQueueMeasurement(enventRecord);   
    },

    
    sendOrQueueMeasurement: function(measurementRecord) {
        var me = this;
        if (me.isOnline()) {
            me.sendMeasurementNow(measurementRecord,undefined,function() {
                me.queueMeasurement(measurementRecord);
            });
        } else {
            me.queueMeasurement(measurementRecord);
        }
    },
    
    queueMeasurement: function(measurementRecord) {
        var me = this;
        localforage.getItem(me.queueKey, function(err, queue) {
            queue = queue||[];
            queue.push(measurementRecord);
            localforage.setItem(me.queueKey, queue, function(/*err, storedQueue*/){
                Ext.log("measurementRecord queued "+JSON.stringify(measurementRecord));
                me.initSendTimer();
            });
        });        
    },
    
    sendMeasurementNow: function(measurementRecord, success, failure) {
        var me = this, now=new Date().getTime(),
            params=Ext.apply({
                v:1,
                tid:me.tid,
                cid:me.cid,
                qt: now-measurementRecord.date,
                z: now
            },measurementRecord)
        ;
              
        Ext.Ajax.request({
            url: me.analyticsURL,
            method:'POST',
            params: params,
            useDefaultXhrHeader:false,
            cors:true,
            
            success: success,
            failure: failure
        });
    },
    
    sendMeasurementFromQueue: function() {
        var me = this, now = new Date().getTime();
        if (!me.isOnline()) {
            return;
        }
        localforage.getItem(me.queueKey, function(err, queue) {
            
            if (!queue) {
                me.clearSendTimer();
            } else {
                
                var measurementRecord = queue.shift();
                
                if (queue.length <= 0) {
                    me.clearSendTimer();
                }
                
                localforage.setItem(me.queueKey, queue, function(/*err,value*/){
                    
                    if ( measurementRecord && ( (now - measurementRecord.date) < (6 * 60 * 60 * 1000) ) ) {
                    
                        me.sendMeasurementNow(measurementRecord,
                          function() {
                             me.initSendTimer();
                          },
                          function() {
                            
                            measurementRecord.fails = (measurementRecord.fails||0)+1;
                            if (measurementRecord.fails < 10) {
                                me.queueMeasurement(measurementRecord);
                            }
                            me.initSendTimer();
                        });
                    } else {
                        me.initSendTimer();
                    }
                });
            }
        });        
    },
    
    initSendTimer: function() {
        var me =this;
        if (me.sendTimer) {
            me.clearSendTimer();
        }
        me.sendTimer = Ext.defer(me.sendMeasurementFromQueue, 1000, me);
    },
    
    clearSendTimer: function() {
        var me = this;
        if (me.sendTimer) {
            window.clearTimeout(me.sendTimer);
            delete me.sendTimer;
        }
    }

});