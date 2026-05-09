const CACHE_NAME = 'ns-dash-cache-v1';
// キャッシュする静的アセット（HTML自体とアイコンなど）
const urlsToCache = [
  './',
  './dashboard.html',
  './manifest.json'
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時の動作
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Nightscout APIへのリクエストはキャッシュせず常にネットワークへ取りに行く
  if (requestUrl.pathname.startsWith('/api/v1/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // それ以外のファイル（HTML等）は、キャッシュにあればそれを返し、なければネットワークへ
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // キャッシュヒット
        }
        return fetch(event.request);
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});