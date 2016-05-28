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
            iframe = me.iframe || me.element.createChild({tag:'iframe',style:frameStyle});
         
        iframe.dom.setAttribute('src',newSrc);
    },
    
    resetSrc: function() {
        this.updateSrc(this.getSrc()); 
    }
});