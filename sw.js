/* Chạy offline khi mở qua http(s). Ưu tiên bản mới từ mạng, mất mạng thì dùng bản đã lưu. */
const TIEN_TO = 'tro-ly-ptn-';
const CACHE = `${TIEN_TO}v10`;
const TAP_TIN = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'js/cau-hinh.js', 'js/logic.js', 'js/store.js', 'js/dong-bo.js', 'js/ui.js', 'js/app.js',
  'js/trang-tro-ly.js', 'js/trang-quan-ly.js', 'js/trang-admin.js', 'js/trang-tap-huan.js',
  'js/trang-don.js', 'js/trang-viec.js', 'js/trang-cuoi-ky.js', 'js/trang-tai-lieu.js', 'js/trang-ngan-hang.js', 'js/noi-dung-tap-huan.js', 'js/trang-tong-quan.js',
  'vendor/xlsx.full.min.js',
  'assets/logo-vien.png', 'assets/tro-ly-ptn-F0402-icon-nho.svg',
  'assets/tro-ly-ptn-F0402-icon-app-192.png', 'assets/tro-ly-ptn-F0402-icon-app-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(TAP_TIN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ds) => Promise.all(ds.filter((k) => k.startsWith(TIEN_TO) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((tra) => {
        const banSao = tra.clone();
        caches.open(CACHE).then((c) => c.put(e.request, banSao));
        return tra;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
