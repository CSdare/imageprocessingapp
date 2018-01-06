const DEBUG = false;

const { assets } = global.serviceWorkerOption;

const CACHE_NAME = 'appCache';

let assetsToCache = [...assets, './'];

// get addresses of assets that need to be cached
assetsToCache = assetsToCache.map(path => {
  return new URL(path, global.location).toString();
});

// When the service worker is first downloaded: add core website files during installation
self.addEventListener('install', event => {
  if (DEBUG) console.log('SW install event');
  event.waitUntil(
    global.caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(assetsToCache)
      })
      .then(() => {
        if (DEBUG) console.log('Cached assets: main', assetsToCache);
      })
      .catch(err => {
        console.log(err);
      })
  );
});

// clean the caches - don't really understand how this works
self.addEventListener('activate', event => {
  if (DEBUG) console.log('SW Activate event');
  event.waitUntil(
    global.caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.indexOf(CACHE_NAME) === 0) return null;
          return global.caches.delete(cacheName);
        })
      );
    })
  );
});


// respond to fetch requests
self.addEventListener('fetch', event => {
  const request = event.request;
  // ignore non-GET request
  if (request.method !== 'GET') {
    if (DEBUG) console.log(`SW ignore non-GET request ${request.method}`);
    return;
  }
  const requestUrl = new URL(request.url);
  // ignore request from different origin
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) console.log(`SW Ignore different origin ${requestUrl.origin}`);
    return;
  }
  // Checks cache for a matching request. 
  const resource = global.caches.match(request).then(response => {
    // If found set response (aka resource) to the cached response.
    if (response) {
      if (DEBUG) console.log(`[SW] fetch URL ${requestUrl.href} from cache`);
      return response;
    }
    // If request is not found in cache relay the request and cache the response 
    return fetch(request)
      // responseNetwork is simply a posh word for response to a GET request
      .then(responseNetwork => {
        if (DEBUG) console.log('responseNetwork is ', responseNetwork);
        if (!responseNetwork || !responseNetwork.ok) {
          if (DEBUG) {
            console.log(`[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${responseNetwork.status} ${responseNetwork.type}`);
          }
          return responseNetwork;
        }
        if (DEBUG) console.log(`[SW] URL ${requestUrl.href} fetched`);
        const responseCache = responseNetwork.clone();
        global.caches.open(CACHE_NAME)
          .then(cache => {
            return cache.put(request, responseCache);
          })
          .then(() => {
            if (DEBUG) console.log(`[SW] Cache asset: ${requestUrl.href}`);
          });
        return responseNetwork;
      })
      .catch(() => {
        // User is landing on our page
        if (event.request.mode === 'navigate') return global.caches.match('/');
        return null;
      });
  });
  event.respondWith(resource);
});


/*
// adds files to cache once the service worker has been installed
// stored in cache with Request object as key and Response object as value
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      console.log(cache);
      return cache.addAll([
        '/../index.html',
        '/../src/components/App.js',
        '/../src/components/FileUpload.js',
        '/../src/components/Image.js',
        '/../src/components/ImageForm.js',
        '/../src/components/ImagesContainer.js',
        '/../build/bundle.js',
      ]);
    })
  );
});

// should retrieve files from cache if they can't be loaded normally
// have not tested this yet

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request)
  .then(function(response) {
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request)
      .then(function(response) {
        let responseClone = response.clone();
        caches.open('v1')
        .then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        return caches.match('index.html')
      });
    }
  }));
});

*/