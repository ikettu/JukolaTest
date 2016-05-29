Ext.define('JukolaApp.widget.IFrame', {
    extend: 'Ext.Component',
    
    xtype: 'iframe',
    
    config: {
        src:'http://www.jukola.com/2017'
    },
    

    applySrc: function (src) {
        return src && Ext.resolveResource(src);
    },

    
    updateSrc: function(newSrc) {
        var me=this,
            frameStyle = 'width:100%;height:100%;border:none',
            // http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
            sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms',
            iframe = me.iframe || me.element.createChild({tag:'iframe',style:frameStyle, sandbox:sandbox});
         
        iframe.dom.setAttribute('src',newSrc);
    },
    
    resetSrc: function() {
        this.updateSrc(this.getSrc()); 
    }
});