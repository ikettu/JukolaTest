Ext.define('Override.Ext.viewport.Default', {
    overrides: 'Ext.viewport.Default',
    
        onEdgeSwipeStart: function(e) {
            var me = this,
                side = me.sideForDirection(e.direction),
                menus = me.getMenus(),
                menu = menus[side],
                menuSide, checkMenu, size,
                after, viewportAfter,
                transformStyleName, setTransform;
 
            Ext.log('new EdgeSwipe');
 
            if (!menu || !menu.isHidden()) {
                return;
            }
 
            for (menuSide in menus) {
                checkMenu = menus[menuSide];
                if (checkMenu.isHidden() == false) {
                    return;
                }
            }
 
            me.$swiping = true;
 
            me.hideAllMenus(false);
 
            // show the menu first so we can calculate the size 
            if (menu.$reveal) {
                Ext.getBody().insertFirst(menu.element);
            } else {
                Ext.Viewport.add(menu);
            }
            menu.show();
 
            size = side & (LEFT | RIGHT) ? menu.element.getWidth() : menu.element.getHeight();
 
            after = {
                translateX: 0,
                translateY: 0
            };
 
            viewportAfter = {
                translateX: 0,
                translateY: 0
            };
 
            if (side ===LEFT) {
                after.translateX = -size;
            } else if (side === RIGHT) {
                after.translateX = size;
            } else if (side === TOP) {
                after.translateY = -size;
            } else if (side === 'BOTTOM') {
                after.translateY = size;
            }
 
            transformStyleName = 'webkitTransform' in document.createElement('div').style ? 'webkitTransform' : 'transform';
            setTransform = menu.element.dom.style[transformStyleName];
 
            if (setTransform) {
                menu.element.dom.style[transformStyleName] = '';
            }
 
            if (menu.$reveal) {
                if (Ext.browser.getPreferredTranslationMethod() != 'scrollposition') {
                    menu.translate(0, 0);
                }
            } else {
                menu.translate(after.translateX, after.translateY);
            }
 
            if (!menu.$cover) {
                if (setTransform) {
                    me.innerElement.dom.style[transformStyleName] = '';
                }
 
                me.translate(viewportAfter.translateX, viewportAfter.translateY);
            }
        }
    
});