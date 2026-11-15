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
open('pwa/sw.js','w').write("""const C='aod-v3';const F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
""")
for f in ('icon-192.png','icon-512.png'): shutil.copy(f,'pwa/'+f)
print('pwa ok')
