const CACHE_NAME = "ledger-cache-v5";
const CORE_FILES = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];
const CDN_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
];

self.addEventListener("install", (e)=>{
  e.waitUntil((async ()=>{
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_FILES);
    // Best-effort: don't let a CDN hiccup block install of the core app
    await Promise.all(CDN_FILES.map(async (url)=>{
      try{
        const res = await fetch(url, {mode:"cors"});
        if(res.ok) await cache.put(url, res);
      }catch(err){ /* ignore, will just need network first time */ }
    }));
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then((keys)=>
      Promise.all(keys.filter((k)=> k !== CACHE_NAME).map((k)=> caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e)=>{
  e.respondWith(
    caches.match(e.request).then((cached)=> cached || fetch(e.request))
  );
});
