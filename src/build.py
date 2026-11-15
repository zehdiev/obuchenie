import glob,hashlib
h=hashlib.sha256('uchitel:uchitel1995Rahim'.encode()).hexdigest()
data=open('prelude.js').read().replace('%%HASH%%',h)
for f in sorted(glob.glob('content/*.js')): data+='\n'+open(f).read()
shell=open('shell.html').read()
out=shell.replace('/*DATA*/',data).replace('/*APP*/',open('app.js').read())
open('index.html','w').write(out)
print(len(out))

# PWA вариант за самостоятелен хостинг
import os, json, shutil
os.makedirs('pwa',exist_ok=True)
pwa=out.replace('<!--MANIFEST-->','<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">')
open('pwa/index.html','w').write(pwa)
json.dump({"name":"Учебник – Административни и офис дейности","short_name":"Учебник АОД","start_url":"./index.html","scope":"./","display":"standalone","background_color":"#f6f7f5","theme_color":"#1f5e78","lang":"bg","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open('pwa/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
open('pwa/sw.js','w').write(r"""// Учебник АОД – работа без интернет
const C='aod-v6';
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
""")
for f in ('icon-192.png','icon-512.png'): shutil.copy(f,'pwa/'+f)
print('pwa ok')
