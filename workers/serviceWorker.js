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