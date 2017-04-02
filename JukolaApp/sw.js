(global => {
  'use strict';

  const VERSION=1;
  
  // Load the sw-toolbox library.
  importScripts('resources/libs/sw-toolbox-170203/sw-toolbox.js');
 
  global.toolbox.options.debug = true;
  
  self.toolbox.router.get('index.html', self.toolbox.networkFirst);
  self.toolbox.router.get('resources/menu(.*).json', self.toolbox.networkFirst);

  self.toolbox.router.get('resources/(.*)', self.toolbox.cacheFirst, {  
    cache: {
      name: 'resources-libs-cache-v'+VERSION,
      maxEntries: 50
    }
  });
  
  // Ensure that our service worker takes control of the page as soon as possible.
  global.addEventListener('install', event => event.waitUntil(global.skipWaiting()));
  global.addEventListener('activate', event => event.waitUntil(global.clients.claim()));
})(self);