// Учебник АОД – работа без интернет
const C='aod-v8';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const FONTS='https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(CORE);try{const r=await fetch(FONTS,{mode:'cors'});if(r.ok)await c.put(FONTS,r);}catch(_){}}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  const isPage=req.mode==='navigate';
  const isFont=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(url.origin!==location.origin&&!isFont)return;
  e.respondWith((async()=>{
    const c=await caches.open(C);
    const key=isPage?'./index.html':req;
    const cached=await c.match(key,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(key,r.clone());return r;}).catch(()=>null);
    if(cached){e.waitUntil(net);return cached;}
    const r=await net; if(r)return r;
    return (await c.match('./index.html'))||new Response('Няма интернет.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })());
});
