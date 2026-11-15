window.MODS=[];
function M(o){MODS.push(o)}
function L(n,title,h,html,keys){return {n:n,title:title,h:h,html:html,keys:keys||[]}}
function Q(q,opts,a,why){return {q:q,opts:opts,a:a,why:why}}
function X(title,task,ans){return {title:title,task:task,ans:ans}}
function G(t,d){return {t:t,d:d}}
window.SCHED=[
['2026-11-10','10:00–17:00',[['zbut',8,0]]],
['2026-11-11','08:30–15:30',[['ikon',8,0]]],
['2026-11-12','08:30–15:30',[['delkom',4,4]]],
['2026-11-13','08:30–15:30',[['delkom',0,8]]],
['2026-11-16','08:30–15:30',[['gdpr',4,0],['ustoich',4,0]]],
['2026-11-17','08:30–15:30',[['pravo',4,0],['obikon',4,0]]],
['2026-11-18','08:30–15:30',[['menid',4,0],['mark',4,0]]],
['2026-11-19','08:30–15:30',[['fin',4,0],['schet',4,0]]],
['2026-11-20','08:30–15:30',[['schet',0,8]]],
['2026-11-23','08:30–15:30',[['schet',0,4],['stat',4,0]]],
['2026-11-24','08:30–15:30',[['stat',0,8]]],
['2026-11-25','08:30–15:30',[['stat',0,4],['ofis',4,0]]],
['2026-11-26','08:30–15:30',[['ofis',4,0],['sreshti',4,0]]],
['2026-11-27','08:30–15:30',[['sreshti',0,8]]],
['2026-11-30','08:30–15:30',[['sreshti',0,4],['dokum',4,0]]],
['2026-12-01','08:30–15:30',[['dokum',0,8]]],
['2026-12-02','08:30–15:30',[['dokum',0,4],['ikt',4,0]]],
['2026-12-03','08:30–15:30',[['ikt',4,4]]],
['2026-12-04','08:30–15:30',[['ikt',0,8]]],
['2026-12-07','08:30–15:30',[['ikt',0,8]]],
['2026-12-08','08:30–15:30',[['ikt',0,8]]],
['2026-12-09','08:30–15:30',[['ikt',0,8]]],
['2026-12-10','08:30–15:30',[['ikt',0,8]]],
['2026-12-11','08:30–15:30',[['ikt',0,4],['digi',4,0]]],
['2026-12-14','08:30–15:30',[['digi',8,0]]],
['2026-12-15','08:30–15:30',[['digi',4,4]]],
['2026-12-16','08:30–15:30',[['digi',0,8]]],
['2026-12-17','08:30–15:30',[['digi',0,8]]],
['2026-12-18','08:30–15:30',[['digi',0,8]]],
['2026-12-21','08:30–15:30',[['digi',0,8]]],
['2026-12-22','08:30–15:30',[['digi',0,8]]],
['2026-12-23','08:30–15:30',[['proizv',0,8]]],
['2027-01-04','08:30–15:30',[['proizv',0,8]]],
['2027-01-05','08:30–15:30',[['proizv',0,8]]],
['2027-01-06','08:30–15:30',[['proizv',0,8]]],
['2027-01-07','08:30–15:30',[['proizv',0,8]]],
['2027-01-08','08:30–13:50',[['proizv',0,6]]],
['2027-01-11','08:30–13:50',[['proizv',0,6]]],
['2027-01-12','10:30–15:15',[['izpit',0,0,'Подготовка и изпит – теория']]],
['2027-01-13','10:00–16:00',[['izpit',0,0,'Изпит – практика']]]
];
window.T_HASH='%%HASH%%';
window.SLIDES={};
function SL(mid,i,txt){(SLIDES[mid]=SLIDES[mid]||{})[i]=txt;}
function _m(id){for(var i=0;i<MODS.length;i++)if(MODS[i].id===id)return MODS[i];throw new Error('no module '+id);}
function TK(mid,arr){_m(mid).ex=arr;}
function PL(mid,arr){_m(mid).plan=arr;}
function C(title,prompt,cats,items,teach){return {type:'cat',title:title,prompt:prompt,cats:cats,items:items,teach:teach||''}}
function O(title,prompt,items,teach){return {type:'ord',title:title,prompt:prompt,items:items,teach:teach||''}}
function TF(title,prompt,items,teach){return {type:'tf',title:title,prompt:prompt,items:items,teach:teach||''}}
function K(title,prompt,qs,teach){return {type:'case',title:title,prompt:prompt,qs:qs,teach:teach||''}}
function P(title,prompt,pairs,teach){return {type:'pair',title:title,prompt:prompt,pairs:pairs,teach:teach||''}}
window.DECKS={};window.NOTES={};
function DECK(mid,i,foot,slides){slides.forEach(function(s){if(!s.f)s.f=foot;});(DECKS[mid]=DECKS[mid]||{})[i]=slides;}
function ST(kicker,title,sub,note){return {k:'title',kicker:kicker,title:title,sub:sub,n:note}}
function SS(kicker,title,sub,callout,note){return {k:'section',kicker:kicker,title:title,sub:sub,callout:callout,n:note}}
function SB(title,sub,note,foot){return {k:'big',title:title,sub:sub,n:note,f:foot}}
function SC(title,blocks,note,lead,foot){return {k:'content',title:title,blocks:blocks,n:note,lead:lead,f:foot}}
function CARDS(v){return {t:'cards',v:v}} function NUMS(v){return {t:'nums',v:v}} function LIST(v){return {t:'list',v:v}}
function TABLE(h,r){return {t:'table',h:h,r:r}} function EX(l,x){return {t:'ex',l:l,x:x}} function NOTE(x){return {t:'note',x:x}}
function SVG(n){return {t:'svg',n:n}} function IDX(x){return {t:'idx',x:x}} function MAIL(r){return {t:'mail',r:r}}
function NT(mid,i,goal,q,notes){(NOTES[mid]=NOTES[mid]||{})[i]={goal:goal,q:q,notes:notes};}
