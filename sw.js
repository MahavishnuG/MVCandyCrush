const CACHE = 'candypop-v1';
const ASSETS = [
  '.','/index.html','/style.css','/app.js','/manifest.json',
  '/assets/sounds/bg_loop.wav',
  '/assets/sounds/snd_0.wav','/assets/sounds/snd_1.wav','/assets/sounds/snd_2.wav','/assets/sounds/snd_3.wav','/assets/sounds/snd_4.wav',
  '/assets/candies/candy_0.svg','/assets/candies/candy_1.svg','/assets/candies/candy_2.svg','/assets/candies/candy_3.svg','/assets/candies/candy_4.svg',
  '/assets/icons/icon-192.png','/assets/icons/icon-512.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).catch(()=>{})));
});
