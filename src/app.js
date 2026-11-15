(function(){
'use strict';
var KEY='aod26', TKEY='aod26_teacher';
var BYID={}; MODS.forEach(function(m,i){m.idx=i;BYID[m.id]=m;m.days=[];});
SCHED.forEach(function(d){d[2].forEach(function(x){var m=BYID[x[0]];if(m&&m.days.indexOf(d[0])<0)m.days.push(d[0]);});});
var SECS=[['А1','Обща професионална подготовка'],['А2','Отраслова професионална подготовка'],['А3','Специфична професионална подготовка'],['Б','Разширена подготовка (избираема)'],['Пр','Производствена практика'],['Из','Изпит']];
var WD=['неделя','понеделник','вторник','сряда','четвъртък','петък','събота'];
var MON=['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];

/* ---------- storage ---------- */
var S={name:'',read:{},quiz:{},ex:{},tnotes:{},roster:''};
try{var raw=localStorage.getItem(KEY); if(raw){var o=JSON.parse(raw); for(var k in o) S[k]=o[k];}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
var teacher=false; try{teacher=localStorage.getItem(TKEY)==='1';}catch(e){}
function setTeacher(v){teacher=v; try{v?localStorage.setItem(TKEY,'1'):localStorage.removeItem(TKEY);}catch(e){} document.body.classList.toggle('teacher',v); route();}
document.body.classList.toggle('teacher',teacher);

/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function $(s){return document.querySelector(s)}
function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmt(s,long){var d=pd(s);return long? WD[d.getDay()]+', '+d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()+' г.' : String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear();}
function shortD(s){var d=pd(s);return d.getDate()+' '+MON[d.getMonth()].slice(0,3)+'.';}
function todayISO(){return iso(new Date());}
function hours(m){var a=[];if(m.t)a.push(m.t+' ч теория');if(m.p)a.push(m.p+' ч практика');return a.join(' · ')||'изпит';}
function modProgress(m){
  var tot=m.lessons.length+(m.quiz.length?1:0)+m.ex.length, done=0;
  m.lessons.forEach(function(_,i){if(S.read[m.id+':'+i])done++;});
  if(m.quiz.length&&S.quiz[m.id]&&S.quiz[m.id].best>=Math.ceil(m.quiz.length*0.6))done++;
  m.ex.forEach(function(_,i){var e=S.ex[m.id+':'+i];if(e&&e.done)done++;});
  return tot?Math.round(done/tot*100):0;
}
function totalProgress(){var s=0;MODS.forEach(function(m){s+=modProgress(m);});return Math.round(s/MODS.length);}
function dayStatus(d){var t=todayISO();return d<t?'past':d===t?'now':'next';}
function nextDay(){var t=todayISO();for(var i=0;i<SCHED.length;i++){if(SCHED[i][0]>=t)return i;}return -1;}

/* ---------- sidebar ---------- */
function renderSide(cur){
  var h='<a class="brand" href="#home"><small>041501 · I СПК · КУРС № 3/2026</small><b>Административни и офис дейности</b><span class="muted" style="font-size:.82rem">Учебник за курса · с. Чепинци</span></a><nav class="nav">';
  h+='<a href="#home" class="'+(cur==='home'?'on':'')+'"><span class="code">⌂</span>Начало</a>';
  h+='<a href="#schedule" class="'+(cur==='schedule'?'on':'')+'"><span class="code">▦</span>Учебен график</a>';
  h+='<a href="#glossary" class="'+(cur==='glossary'?'on':'')+'"><span class="code">Аа</span>Речник на понятията</a>';
  h+='<a href="#exam" class="'+(cur==='exam'?'on':'')+'"><span class="code">✓</span>Пробен изпит</a>';
  if(teacher) h+='<a href="#teacher" class="'+(cur==='teacher'?'on':'')+'"><span class="code" style="color:var(--stamp)">★</span>Инструменти за учителя</a>';
  SECS.forEach(function(s){
    var ms=MODS.filter(function(m){return m.sec===s[0];}); if(!ms.length)return;
    h+='<div class="nav-sec">'+s[0]+' · '+s[1]+'</div>';
    ms.forEach(function(m){var p=modProgress(m);
      h+='<a href="#m-'+m.id+'" class="'+(cur===m.id?'on':'')+'"><span class="code">'+m.code+'</span><span>'+esc(m.short)+'</span><span class="ring" style="--p:'+p+'" title="'+p+'% завършено"></span></a>';});
  });
  h+='</nav>';
  $('#side').innerHTML=h;
}

/* ---------- views ---------- */
function vHome(){
  var ni=nextDay(), t=todayISO(), card='';
  if(ni<0){card='<div class="card today"><div class="date">Курсът приключи</div><h2>Поздравления за завършването!</h2></div>';}
  else{var d=SCHED[ni], isToday=d[0]===t;
    card='<div class="card today stack" style="gap:10px"><div class="date">'+(isToday?'ДНЕС':'СЛЕДВАЩО ЗАНЯТИЕ')+' · '+fmt(d[0],true)+' · '+d[1]+'</div>';
    d[2].forEach(function(x){var m=BYID[x[0]];
      card+='<a class="li" href="#m-'+m.id+'" style="padding:6px 0;border:0"><span class="regidx">'+m.code+'</span><span class="t"><b>'+esc(x[3]||m.title)+'</b><br><span class="muted" style="font-size:.86rem">'+(x[1]?x[1]+' ч теория ':'')+(x[2]?x[2]+' ч практика':'')+'</span></span><span>→</span></a>';});
    card+='</div>';}
  var name=S.name?', '+esc(S.name):'';
  var tp=totalProgress();
  var h='<div class="stack">';
  h+='<div><h1>Добре дошли'+name+'!</h1><p class="muted" style="margin:.3em 0 0">Квалификационен курс по професия „Административни и офис дейности“, първа степен. Тук са уроците, упражненията и тестовете по учебната програма.</p></div>';
  h+='<div class="hero">'+card+'<div class="card stack" style="gap:12px"><h3>Моят напредък</h3><div class="stat"><b>'+tp+'%</b><span>от курса</span></div><div class="bar"><i style="width:'+tp+'%"></i></div><p class="muted" style="font-size:.85rem;margin:0">Напредъкът се пази само в този браузър. '+(S.name?'':'<a href="#" data-act="settings">Въведете името си</a>.')+'</p></div></div>';
  if(!standalone)h+='<div class="card row" style="justify-content:space-between"><div><b>Инсталирайте учебника на телефона</b><br><span class="muted" style="font-size:.88rem">Отваря се с едно докосване от началния екран.</span></div><button class="btn primary" data-act="settings">Как да инсталирам</button></div>';
  h+='<div class="card"><div class="stats"><div class="stat"><b>300</b><span>учебни часа</span></div><div class="stat"><b>96</b><span>часа теория</span></div><div class="stat"><b>204</b><span>часа практика</span></div></div><p class="muted" style="margin:12px 0 0;font-size:.88rem">Период: 09.11.2026 – 13.01.2027 · Място: с. Чепинци, общ. Рудозем · Завършване: държавен изпит и свидетелство за професионална квалификация</p></div>';
  SECS.forEach(function(s){var ms=MODS.filter(function(m){return m.sec===s[0];});
    h+='<div class="stack" style="gap:10px"><h2 style="font-size:1.15rem">'+s[0]+' · '+s[1]+'</h2><div class="grid">';
    ms.forEach(function(m){var p=modProgress(m),st=dayStatus(m.days[m.days.length-1]),sd=dayStatus(m.days[0]);
      var pill=st==='past'?'<span class="pill mute">Минал</span>':(sd!=='next'?'<span class="pill stamp">Сега</span>':'<span class="pill">от '+shortD(m.days[0])+'</span>');
      h+='<a class="card mod-card" href="#m-'+m.id+'"><div class="row" style="justify-content:space-between"><span class="regidx">'+m.code+'</span>'+pill+'</div><h3>'+esc(m.title)+'</h3><span class="muted" style="font-size:.84rem">'+hours(m)+' · '+m.lessons.length+' урока</span><div class="bar"><i style="width:'+p+'%"></i></div></a>';});
    h+='</div></div>';});
  h+='</div>';
  return h;
}

function vSchedule(){
  var h='<div class="stack"><div><h1>Учебен график</h1><p class="muted" style="margin:.3em 0 0">Курс № 3/2026 · Почивки: 10:00–10:10, обяд 11:40–12:20, 13:50–14:00</p></div><div class="card tbl-wrap"><table><thead><tr><th>№</th><th>Дата</th><th>Час</th><th>Модул / предмет</th><th>Т</th><th>П</th></tr></thead><tbody>';
  var tt=0,tp=0;
  SCHED.forEach(function(d,i){var st=dayStatus(d[0]);
    var subj=d[2].map(function(x){var m=BYID[x[0]];return '<a href="#m-'+m.id+'">'+esc(x[3]||m.title)+'</a>'+(x[2]&&!x[1]&&m.t?' – практика':'');}).join('<br>');
    var t=0,p=0;d[2].forEach(function(x){t+=x[1];p+=x[2];});tt+=t;tp+=p;
    h+='<tr class="'+st+'"><td class="num">'+(i+1)+'</td><td style="white-space:nowrap">'+fmt(d[0])+'<br><span class="muted" style="font-size:.8rem">'+WD[pd(d[0]).getDay()]+'</span></td><td style="white-space:nowrap">'+d[1]+'</td><td>'+subj+(st==='now'?' <span class="pill stamp">днес</span>':'')+'</td><td class="num">'+(t||'')+'</td><td class="num">'+(p||'')+'</td></tr>';});
  h+='</tbody><tfoot><tr><th colspan="4">Общо</th><th class="num">'+tt+'</th><th class="num">'+tp+'</th></tr></tfoot></table></div></div>';
  return h;
}

function tabs(m,cur){
  var t=[['','Уроци ('+m.lessons.length+')'],['ex','Задачи ('+m.ex.length+')']];
  if(m.quiz.length)t.push(['quiz','Тест ('+m.quiz.length+')']);
  if(m.gl.length)t.push(['gl','Понятия ('+m.gl.length+')']);
  return '<div class="tabs">'+t.map(function(x){return '<a href="#m-'+m.id+(x[0]?'-'+x[0]:'')+'" class="'+(cur===x[0]?'on':'')+'">'+x[1]+'</a>';}).join('')+'</div>';
}
function modHead(m){
  var days=m.days.map(function(d){return '<span class="pill '+(dayStatus(d)==='now'?'stamp':dayStatus(d)==='past'?'mute':'')+'">'+shortD(d)+'</span>';}).join(' ');
  return '<div class="stack" style="gap:8px"><span class="regidx">Рег. индекс '+m.code+'</span><h1>'+esc(m.title)+'</h1><p class="muted" style="margin:0">'+esc(m.intro)+'</p><div class="row"><span class="pill ok">'+hours(m)+'</span>'+days+'</div></div>';
}
function teacherPanel(m){
  var h='<div class="tpanel teacher-only stack" style="gap:10px"><h3>За учителя · план на занятията</h3><ol>'+m.plan.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')+'</ol>';
  if(m.notes)h+='<p style="margin:0"><b>Бележки:</b> '+esc(m.notes)+'</p>';
  h+='<label class="field" for="tn-'+m.id+'"><b>Мои бележки към модула</b> (пазят се в този браузър)<textarea id="tn-'+m.id+'" data-tnote="'+m.id+'">'+esc(S.tnotes[m.id]||'')+'</textarea></label></div>';
  return h;
}
function vModule(m,tab){
  var h='<div class="stack">'+modHead(m)+tabs(m,tab||'');
  if(!tab){
    h+=teacherPanel(m)+'<div class="card list">';
    m.lessons.forEach(function(l,i){var done=S.read[m.id+':'+i];
      h+='<a class="li" href="#l-'+m.id+'-'+i+'"><span class="check '+(done?'done':'')+'">'+(done?'✓':'')+'</span><span class="n">'+esc(l.n)+'</span><span class="t">'+esc(l.title)+'</span>'+(l.h?'<span class="pill mute">'+l.h+' ч</span>':'')+'</a>';});
    h+='</div>';
  }else if(tab==='ex'){h+=vExercises(m);}
  else if(tab==='quiz'){h+=vQuiz(m.quiz,'q-'+m.id,m.id);}
  else if(tab==='gl'){h+='<div class="card"><dl class="gl">'+m.gl.map(function(g){return '<dt>'+esc(g.t)+'</dt><dd>'+esc(g.d)+'</dd>';}).join('')+'</dl></div>';}
  return h+'</div>';
}
/* ---------- slides ---------- */
function inl(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');}
function dayNo(m){for(var i=0;i<SCHED.length;i++)if(SCHED[i][0]===m.days[0])return i+1;return '';}
function parseSL(src){var out=[],cur=null,run=null;
  function flush(){if(!run)return;var v=run.v,re=/^\*\*(.+?)\*\*\s*[–-]\s*(.+)$/;
    if(v.length>=2&&v.length<=5&&v.every(function(x){return re.test(x);}))cur.blocks.push(CARDS(v.map(function(x){var m=x.match(re);return [m[1],m[2]];})));
    else if(v.every(function(x){return /^\d+\.\s/.test(x);}))cur.blocks.push(NUMS(v.map(function(x){return x.replace(/^\d+\.\s/,'');})));
    else cur.blocks.push(LIST(v));
    run=null;}
  src.split('\n').forEach(function(line){line=line.trim();if(!line)return;var c=line.charAt(0),t=line.slice(2);
    if(c==='#'){flush();cur=SC(t,[],'');out.push(cur);return;}
    if(!cur){cur=SC('',[],'');out.push(cur);}
    if(c==='-'){if(!run)run={v:[]};run.v.push(t);return;}
    flush();
    if(c==='!')cur.blocks.push(EX('Пример:',t));else if(c==='=')cur.blocks.push(IDX(t));else if(c==='>'){if(!cur.lead&&!cur.blocks.length)cur.lead=t;else cur.blocks.push(EX('Запомнете:',t));}else cur.blocks.push(NOTE(line));});
  flush();return out;}
function buildDeck(m,i){
  var l=m.lessons[i]; if(DECKS[m.id]&&DECKS[m.id][i])return DECKS[m.id][i];
  var nt=(NOTES[m.id]||{})[i]||{notes:[]}, dn=dayNo(m), foot='Ден '+dn+' · '+m.short+' · Тема '+l.n, out=[];
  if(i===0){
    out.push(ST('Административни и офис дейности · I СПК',m.title,'Ден '+dn+' · '+fmt(m.days[0])+' · с. Чепинци','Поздравете групата и кажете темата. '+m.intro));
    out.push(SC('План за темата',[TABLE(['Тема','Урок'],m.lessons.map(function(x){return [x.n,x.title];}))],'Прочетете плана. Кажете кога са почивките и че в края има задачи и кратък тест на телефона.'));
    var pm=MODS[m.idx-1];
    if(pm&&pm.quiz.length){var qs=pm.quiz.slice(0,5);out.push(SC('Да си припомним: '+pm.short,[NUMS(qs.map(function(q){return q.q;}))],'Отговори: '+qs.map(function(q,k){return (k+1)+') '+q.opts[q.a];}).join('; ')+'. Питайте различни хора.'));}
  }
  var raw=(SLIDES[m.id]||{})[i]||'', parsed=parseSL(raw), notes=nt.notes.slice();
  if(notes.length===parsed.length)notes.unshift('');
  out.push(SS('Тема '+l.n+(l.h?' · '+l.h+' уч. ч':''),l.title,nt.goal||'',null,notes[0]||('Прочетете целта на глас'+(nt.goal?': „'+nt.goal.replace(/^Цел:\s*/,'')+'“':'')+'. Попитайте какво вече знаят по темата.')));
  if(nt.q)out.push(SB(nt.q[0],nt.q[1]||'',nt.q[2]||''));
  parsed.forEach(function(s,k){if(!s.title)s.title=l.title;s.n=notes[k+1]||'';out.push(s);});
  if(l.keys.length)out.push(SC('Запомнете',[NUMS(l.keys)],'Помолете един участник да повтори основното със свои думи. После минете към следващия урок или към задачите.'));
  if(i===m.lessons.length-1)out.push(SB('Край на темата',m.title,'Обобщете темата в три изречения. Напомнете задачите и теста в учебника и какво предстои в следващото занятие.','Ден '+dn));
  out.forEach(function(s){if(!s.f)s.f=foot;});
  return out;}
var SVGS={
flow:'<svg viewBox="0 0 640 260" class="dia" role="img" aria-label="Домакинства, фирми и държава"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#1f2a35"/></marker></defs><rect x="20" y="30" width="170" height="54" rx="8" fill="#2b6a8a"/><text x="105" y="63" text-anchor="middle" fill="#fff" font-weight="700" font-size="17">Домакинства</text><rect x="450" y="30" width="170" height="54" rx="8" fill="#b5501f"/><text x="535" y="63" text-anchor="middle" fill="#fff" font-weight="700" font-size="17">Фирми</text><rect x="235" y="180" width="170" height="54" rx="8" fill="#1f2a35"/><text x="320" y="213" text-anchor="middle" fill="#fff" font-weight="700" font-size="17">Държава</text><line x1="195" y1="46" x2="444" y2="46" stroke="#1f2a35" stroke-width="2" marker-end="url(#ar)"/><text x="320" y="38" text-anchor="middle" font-size="12" fill="#1f2a35">труд, пари за покупки</text><line x1="445" y1="70" x2="196" y2="70" stroke="#1f2a35" stroke-width="2" marker-end="url(#ar)"/><text x="320" y="88" text-anchor="middle" font-size="12" fill="#1f2a35">заплати, стоки и услуги</text><line x1="120" y1="90" x2="250" y2="176" stroke="#1f2a35" stroke-width="2" marker-end="url(#ar)"/><line x1="520" y1="90" x2="392" y2="176" stroke="#1f2a35" stroke-width="2" marker-end="url(#ar)"/><text x="320" y="150" text-anchor="middle" font-size="12" fill="#1f2a35">данъци ↓ · пенсии, обезщетения, пътища, училища ↑</text></svg>',
sd:'<div class="sd"><svg viewBox="0 0 300 220" class="dia" role="img" aria-label="Графика на търсене и предлагане"><line x1="30" y1="10" x2="30" y2="195" stroke="#1f2a35" stroke-width="1.5"/><line x1="30" y1="195" x2="290" y2="195" stroke="#1f2a35" stroke-width="1.5"/><text x="8" y="16" font-size="10" fill="#1f2a35">Цена</text><text x="215" y="212" font-size="10" fill="#1f2a35">Количество</text><line x1="45" y1="30" x2="270" y2="180" stroke="#2b6a8a" stroke-width="2.5"/><line x1="45" y1="180" x2="270" y2="30" stroke="#b5501f" stroke-width="2.5"/><line x1="30" y1="105" x2="157" y2="105" stroke="#1f2a35" stroke-dasharray="4 3"/><circle cx="157.5" cy="105" r="5" fill="#1f2a35"/><text x="34" y="100" font-size="9" fill="#1f2a35">Равновесна цена</text><text x="236" y="26" font-size="10" fill="#b5501f" font-weight="700">Предлагане</text><text x="232" y="176" font-size="10" fill="#2b6a8a" font-weight="700">Търсене</text></svg><div class="sd-t"><p>Купувачите искат толкова, колкото продавачите предлагат.</p><p><b>Цената е висока</b> → стоката остава → продавачът я намалява.</p><p><b>Цената е ниска</b> → стоката свършва → цената се качва.</p></div></div>'};
function blockHTML(b){
  if(b.t==='cards')return '<div class="s-cards c'+b.v.length+'">'+b.v.map(function(c){return '<div class="s-card"><h4>'+inl(c[0])+'</h4><p>'+inl(c[1])+'</p></div>';}).join('')+'</div>';
  if(b.t==='nums')return '<ol class="s-nums">'+b.v.map(function(x,k){return '<li><span>'+(k+1)+'</span><div>'+inl(x)+'</div></li>';}).join('')+'</ol>';
  if(b.t==='list')return '<ul class="s-list">'+b.v.map(function(x){return '<li>'+inl(x)+'</li>';}).join('')+'</ul>';
  if(b.t==='table')return '<div class="s-tw"><table class="s-tbl"><thead><tr>'+b.h.map(function(x){return '<th>'+inl(x)+'</th>';}).join('')+'</tr></thead><tbody>'+b.r.map(function(r){return '<tr>'+r.map(function(x){return '<td>'+inl(x)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  if(b.t==='ex')return '<div class="s-ex"><b>'+inl(b.l)+'</b> '+inl(b.x)+'</div>';
  if(b.t==='note')return '<p class="s-note">'+inl(b.x)+'</p>';
  if(b.t==='idx')return '<div class="s-idx">'+inl(b.x)+'</div>';
  if(b.t==='svg')return SVGS[b.n]||'';
  if(b.t==='mail')return '<div class="s-mail">'+b.r.map(function(r){return '<p><b>'+inl(r[0])+':</b> '+inl(r[1])+'</p>';}).join('')+'</div>';
  return '';}
function slideHTML(s){
  var h='';
  if(s.k==='title')h='<div class="s-bar"></div><div class="s-kick">'+inl(s.kicker)+'</div><h2>'+inl(s.title)+'</h2><div class="s-sub">'+inl(s.sub)+'</div>';
  else if(s.k==='section')h='<div class="s-kick">'+inl(s.kicker)+'</div><h2>'+inl(s.title)+'</h2>'+(s.sub?'<div class="s-sub">'+inl(s.sub)+'</div>':'')+(s.callout?'<div class="s-call">'+inl(s.callout)+'</div>':'');
  else if(s.k==='big')h='<h2>'+inl(s.title)+'</h2>'+(s.sub?'<div class="s-sub">'+inl(s.sub)+'</div>':'');
  else h='<h2>'+inl(s.title)+'</h2>'+(s.lead?'<p class="s-lead">'+inl(s.lead)+'</p>':'')+s.blocks.map(blockHTML).join('');
  return '<div class="s-in">'+h+'</div>'+(s.k!=='title'&&s.k!=='section'&&s.f?'<div class="s-foot">'+esc(s.f)+'</div>':'');
}
var SV={m:null,i:0,s:0,list:[]};
function renderSlide(){
  var box=$('#slide'); if(!box)return;
  var n=SV.list.length, sl=SV.list[SV.s];
  box.className='slide s-'+sl.k; box.innerHTML=slideHTML(sl);
  $('#scount').textContent=(SV.s+1)+' / '+n;
  $('#sprev').disabled=SV.s===0&&SV.i===0; var nx=$('#snext'); nx.textContent=SV.s===n-1?'Следващ урок →':'Напред →';
  var dots='';for(var d=0;d<n;d++)dots+='<i class="'+(d===SV.s?'on':'')+'"></i>';$('#sdots').innerHTML=dots;
  var nb=$('#snote'); if(nb)nb.innerHTML='<b>Бележка към слайд '+(SV.s+1)+':</b> '+(sl.n?inl(sl.n):'<span class="muted">няма</span>');
  if(SV.s===n-1){var k=SV.m.id+':'+SV.i;if(!S.read[k]){S.read[k]=1;save();renderSide(SV.m.id);var rb=$('#readBtn');if(rb){rb.textContent='✓ Урокът е прочетен';rb.classList.remove('primary');}}}
}
var pendingLast=false;
function slideGo(d){var n=SV.list.length,t=SV.s+d,m=SV.m,i=SV.i;
  if(t<0){if(i>0){pendingLast=true;go('#l-'+m.id+'-'+(i-1));}return;}
  if(t>=n){if(i<m.lessons.length-1)go('#l-'+m.id+'-'+(i+1)); else go('#m-'+m.id+(m.ex.length?'-ex':''));return;}
  SV.s=t;renderSlide();}
function vLesson(m,i){
  var l=m.lessons[i]; if(!l)return vModule(m);
  SV={m:m,i:i,s:0,list:buildDeck(m,i)};
  if(pendingLast){SV.s=SV.list.length-1;pendingLast=false;}
  var done=S.read[m.id+':'+i];
  var mode=teacher&&lessonMode==='text'?'text':'slides';
  var h='<div class="stack"><div class="row no-proj" style="justify-content:space-between"><span class="regidx">'+m.code+' · '+esc(l.n)+' · '+esc(l.title)+'</span>'+(l.h?'<span class="pill mute">'+l.h+' уч. ч</span>':'')+'</div>';
  if(teacher)h+='<div class="row no-proj"><div class="seg"><button class="'+(mode==='slides'?'on':'')+'" data-act="lmode" data-v="slides">Слайдове с бележки</button><button class="'+(mode==='text'?'on':'')+'" data-act="lmode" data-v="text">Пълен текст</button></div><button class="btn stamp" data-act="proj">Прожектирай</button></div>';
  if(mode==='text'){
    h+='<article class="lesson stack"><h1>'+esc(l.title)+'</h1><div class="prose">'+l.html+'</div>';
    if(l.keys.length)h+='<div class="keys"><h3>Запомнете</h3><ul>'+l.keys.map(function(k){return '<li>'+esc(k)+'</li>';}).join('')+'</ul></div>';
    h+='</article>';
  }
  h+='<div class="deck'+(mode==='text'?' deck-hidden':'')+'" id="deck"><div class="stage"><div class="slide" id="slide"></div></div><div class="s-ctl"><button class="btn big" id="sprev" data-act="sprev">←</button><div class="s-mid"><div class="s-dots" id="sdots"></div><span id="scount" class="muted"></span></div><button class="btn big primary" id="snext" data-act="snext">Напред →</button></div>'+(teacher?'<div class="snote no-proj" id="snote"></div>':'')+'</div>';
  var nextL=i<m.lessons.length-1?'<a class="btn" href="#l-'+m.id+'-'+(i+1)+'">Следващ урок: '+esc(m.lessons[i+1].n)+' →</a>':(m.ex.length?'<a class="btn" href="#m-'+m.id+'-ex">Към задачите →</a>':'');
  h+='<div class="row no-proj" style="justify-content:space-between"><button class="btn '+(done?'':'primary')+'" id="readBtn" data-act="read" data-k="'+m.id+':'+i+'">'+(done?'✓ Урокът е прочетен':'Отбележи като прочетен')+'</button>'+nextL+'</div></div>';
  return h;
}
/* ---------- tasks ---------- */
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function chips(name,opts){return '<div class="chips" data-name="'+name+'">'+opts.map(function(o,j){return '<button type="button" class="chip" data-v="'+j+'">'+esc(o)+'</button>';}).join('')+'</div>';}
function taskBody(x,k){
  var h='';
  if(x.type==='cat'){shuffle(x.items.map(function(it,i){return i;})).forEach(function(i){h+='<div class="titem" data-i="'+i+'"><div class="tt">'+esc(x.items[i][0])+'</div>'+chips('c',x.cats)+'</div>';});}
  else if(x.type==='tf'){shuffle(x.items.map(function(it,i){return i;})).forEach(function(i){h+='<div class="titem" data-i="'+i+'"><div class="tt">'+esc(x.items[i][0])+'</div>'+chips('tf',['Вярно','Невярно'])+'</div>';});}
  else if(x.type==='case'){x.qs.forEach(function(q,i){h+='<div class="titem" data-i="'+i+'"><div class="tt"><b>'+esc(q[0])+'</b></div>'+chips('k',q[1]).replace('class="chips"','class="chips col"')+'<div class="why" hidden>'+esc(q[3])+'</div></div>';});}
  else if(x.type==='pair'){var rights=shuffle(x.pairs.map(function(p,i){return i;}));
    shuffle(x.pairs.map(function(p,i){return i;})).forEach(function(i){h+='<div class="titem" data-i="'+i+'"><div class="tt"><b>'+esc(x.pairs[i][0])+'</b></div><select class="psel" aria-label="Изберете"><option value="">Изберете…</option>'+rights.map(function(r){return '<option value="'+r+'">'+esc(x.pairs[r][1])+'</option>';}).join('')+'</select></div>';});}
  else if(x.type==='ord'){h+='<div class="ord-ans" data-ans></div><p class="muted" style="margin:4px 0;font-size:.85rem">Докоснете в правилния ред. Докоснете подредена стъпка, за да я върнете.</p><div class="ord-pool" data-pool>'+shuffle(x.items.map(function(it,i){return i;})).map(function(i){return '<button type="button" class="chip" data-oi="'+i+'">'+esc(x.items[i])+'</button>';}).join('')+'</div>';}
  return h;
}
function taskKey(x){
  var h='';
  if(x.type==='cat')h=x.items.map(function(it){return esc(it[0])+' → <b>'+esc(x.cats[it[1]])+'</b>';}).join('<br>');
  else if(x.type==='tf')h=x.items.map(function(it){return esc(it[0])+' → <b>'+(it[1]?'Вярно':'Невярно')+'</b>';}).join('<br>');
  else if(x.type==='case')h=x.qs.map(function(q){return esc(q[0])+' → <b>'+esc(q[1][q[2]])+'</b>';}).join('<br>');
  else if(x.type==='pair')h=x.pairs.map(function(p){return esc(p[0])+' → <b>'+esc(p[1])+'</b>';}).join('<br>');
  else if(x.type==='ord')h=x.items.map(function(it,i){return (i+1)+'. '+esc(it);}).join('<br>');
  return h;
}
var TT={cat:'Разпределете',tf:'Вярно / невярно',case:'Казус',pair:'Свържете',ord:'Подредете'};
function vExercises(m){
  if(!m.ex.length)return '<p class="muted">Няма задачи.</p>';
  var h='<p class="muted" style="margin:0">Всеки решава задачите сам на своя телефон. Докосвайте отговорите и натиснете „Провери“. Резултатът се пази в този телефон.</p>';
  m.ex.forEach(function(x,i){var k=m.id+':'+i, e=S.ex[k]||{};
    h+='<div class="card task" data-task="'+k+'"><div class="row" style="justify-content:space-between"><span class="pill mute">'+(i+1)+' · '+TT[x.type]+'</span>'+(e.done?'<span class="pill ok">✓ Решена</span>':(e.tries?'<span class="pill warn">Опитай пак</span>':''))+'</div><h3>'+esc(x.title)+'</h3><p style="margin:0">'+esc(x.prompt)+'</p><div class="tbody">'+taskBody(x,k)+'</div><div class="row"><button class="btn primary" data-act="tcheck">Провери</button><button class="btn" data-act="treset">Отначало</button><span class="tres"></span></div>';
    h+='<div class="answer teacher-only"><b>Ключ:</b><br>'+taskKey(x)+(x.teach?'<br><br><b>В час:</b> '+esc(x.teach):'')+'</div></div>';});
  return h;
}
function checkTask(card){
  var k=card.dataset.task, p=k.split(':'), m=BYID[p[0]], x=m.ex[+p[1]], ok=0, tot=0;
  if(x.type==='ord'){tot=x.items.length;var a=[].map.call(card.querySelectorAll('[data-ans] .chip'),function(b){return +b.dataset.oi;});
    card.querySelectorAll('[data-ans] .chip').forEach(function(b,pos){var r=+b.dataset.oi===pos;b.classList.toggle('right',r);b.classList.toggle('wrong',!r);if(r)ok++;});}
  else card.querySelectorAll('.titem').forEach(function(it){var i=+it.dataset.i, corr, val;tot++;
    if(x.type==='cat')corr=x.items[i][1];else if(x.type==='tf')corr=x.items[i][1]?0:1;else if(x.type==='case')corr=x.qs[i][2];else corr=i;
    if(x.type==='pair'){var s=it.querySelector('select');val=s.value===''?-1:+s.value;s.classList.toggle('right',val===corr);s.classList.toggle('wrong',val!==corr);}
    else{var sel=it.querySelector('.chip.sel');val=sel?+sel.dataset.v:-1;
      it.querySelectorAll('.chip').forEach(function(c){c.classList.remove('right','wrong');if(+c.dataset.v===corr&&val===corr)c.classList.add('right');else if(c.classList.contains('sel'))c.classList.add('wrong');});}
    var w=it.querySelector('.why');if(w&&val>=0)w.hidden=false;
    if(val===corr)ok++;});
  var e=S.ex[k]||{};e.tries=(e.tries||0)+1;if(ok===tot)e.done=true;e.best=Math.max(e.best||0,ok);S.ex[k]=e;save();renderSide(m.id);
  card.querySelector('.tres').innerHTML=ok===tot?'<span class="pill ok">Браво! '+ok+' от '+tot+'</span>':'<span class="pill warn">'+ok+' от '+tot+' верни – поправете червените</span>';
}
function vQuiz(qs,qid,mid){
  var h='<form class="stack" id="'+qid+'" data-mid="'+(mid||'')+'">';
  if(mid&&S.quiz[mid])h+='<p class="muted" style="margin:0">Най-добър резултат: <b>'+S.quiz[mid].best+' от '+qs.length+'</b></p>';
  qs.forEach(function(q,i){
    h+='<fieldset class="card q" style="margin:0"><legend class="qt" style="padding:0 4px">'+(i+1)+'. '+esc(q.q)+'</legend>';
    q.opts.forEach(function(o,j){h+='<label class="opt'+(teacher&&j===q.a?' right':'')+'"><input type="radio" name="'+qid+'-'+i+'" value="'+j+'"><span>'+esc(o)+'</span></label>';});
    h+='<div class="why" data-why="'+i+'"'+(teacher?'':' hidden')+'>'+esc(q.why)+'</div></fieldset>';});
  h+='<div class="row"><button class="btn primary" type="submit">Провери отговорите</button><button class="btn" type="reset">Изчисти</button><span class="score" data-score></span></div></form>';
  return h;
}
function checkQuiz(form,qs){
  var ok=0;
  qs.forEach(function(q,i){var sel=form.querySelector('input[name="'+form.id+'-'+i+'"]:checked');
    var labels=form.querySelectorAll('input[name="'+form.id+'-'+i+'"]');
    labels.forEach(function(inp){var lb=inp.parentNode;lb.classList.remove('right','wrong');
      if(+inp.value===q.a)lb.classList.add('right'); else if(inp.checked)lb.classList.add('wrong');});
    form.querySelector('[data-why="'+i+'"]').hidden=false;
    if(sel&&+sel.value===q.a)ok++;});
  var pct=Math.round(ok/qs.length*100);
  form.querySelector('[data-score]').innerHTML=ok+' от '+qs.length+' ('+pct+'%) '+(pct>=60?'<span class="pill ok">Успешно</span>':'<span class="pill stamp">Прегледайте урока отново</span>');
  var mid=form.dataset.mid;
  if(mid){var r=S.quiz[mid]||{best:0};r.last=ok;r.best=Math.max(r.best||0,ok);S.quiz[mid]=r;save();renderSide(mid);}
  else{var e=S.quiz.__exam||{best:0};e.best=Math.max(e.best||0,pct);S.quiz.__exam=e;save();}
}
var examQs=null;
function newExam(){var all=[];MODS.forEach(function(m){m.quiz.forEach(function(q){all.push(Object.assign({mod:m.code},q));});});
  for(var i=all.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=all[i];all[i]=all[j];all[j]=t;}
  examQs=all.slice(0,20);}
function vExam(){
  if(!examQs)newExam();
  var b=S.quiz.__exam?'<span class="pill ok">Най-добър резултат: '+S.quiz.__exam.best+'%</span>':'';
  return '<div class="stack"><div><h1>Пробен изпит по теория</h1><p class="muted" style="margin:.3em 0 0">20 случайни въпроса от всички модули. За успешен резултат са нужни поне 60% верни отговори.</p></div><div class="row"><button class="btn" data-act="newexam">Нови 20 въпроса</button>'+b+'</div>'+vQuiz(examQs,'exam','')+'</div>';
}
function vGlossary(){
  var all=[];MODS.forEach(function(m){m.gl.forEach(function(g){all.push({t:g.t,d:g.d,m:m});});});
  all.sort(function(a,b){return a.t.localeCompare(b.t,'bg');});
  var h='<div class="stack"><div><h1>Речник на понятията</h1><p class="muted" style="margin:.3em 0 0">'+all.length+' понятия от всички модули.</p></div><label for="gls" class="muted" style="font-size:.85rem">Търсене</label><input id="gls" class="search" type="search" placeholder="Напишете дума, напр. „протокол“" style="margin-top:-12px"><div class="card"><dl class="gl" id="gll">';
  all.forEach(function(g){h+='<dt data-s="'+esc((g.t+' '+g.d).toLowerCase())+'">'+esc(g.t)+'</dt><dd data-s="'+esc((g.t+' '+g.d).toLowerCase())+'">'+esc(g.d)+' <a class="pill mute" href="#m-'+g.m.id+'">'+g.m.code+'</a></dd>';});
  h+='</dl></div><div class="card stack" style="gap:6px"><h3>Полезни официални сайтове</h3><ul style="margin:0;padding-left:1.2em">'+
  [['https://www.nap.bg','НАП – Национална агенция за приходите'],['https://www.noi.bg','НОИ – Национален осигурителен институт'],['https://www.cpdp.bg','КЗЛД – Комисия за защита на личните данни'],['https://www.nsi.bg','НСИ – Национален статистически институт'],['https://egov.bg','Портал за електронни административни услуги'],['https://portal.registryagency.bg','Агенция по вписванията – Търговски регистър'],['https://www.lex.bg','Lex.bg – закони и наредби'],['https://www.rudozem.bg','Община Рудозем']].map(function(x){return '<li><a href="'+x[0]+'" target="_blank" rel="noopener">'+x[1]+'</a> <span class="muted">('+x[0].replace('https://','')+')</span></li>';}).join('')+'</ul></div></div>';
  return h;
}
var tmr={left:0,total:0,id:null};
function vTeacher(){
  if(!teacher)return '<div class="card"><h2>Достъпът е само за учителя</h2><p>Влезте от „Настройки“ → „Режим учител“.</p></div>';
  var h='<div class="stack"><div><h1>Инструменти за учителя</h1><p class="muted" style="margin:.3em 0 0">Таймер за дейности, случаен избор на участник и бърз достъп до плановете за деня.</p></div><div class="hero">';
  h+='<div class="card stack" style="gap:12px"><h3>Таймер</h3><div class="timer" id="tm">'+mmss(tmr.left)+'</div><div class="row" style="justify-content:center">'+[5,10,15,20,45].map(function(n){return '<button class="btn" data-tm="'+n+'">'+n+' мин</button>';}).join('')+'</div><div class="row" style="justify-content:center"><button class="btn primary" data-act="tmgo">Старт / пауза</button><button class="btn" data-act="tmreset">Нулирай</button></div></div>';
  h+='<div class="card stack" style="gap:10px"><h3>Кой отговаря?</h3><div class="picked" id="picked">—</div><button class="btn primary" data-act="pick">Избери случаен участник</button><label class="field" for="roster">Списък на групата (по едно име на ред)<textarea id="roster" style="min-height:110px;border:1px solid var(--line);border-radius:8px;padding:8px;background:var(--paper)">'+esc(S.roster)+'</textarea></label></div></div>';
  var ni=nextDay();
  if(ni>=0){var d=SCHED[ni];h+='<div class="stack" style="gap:10px"><h2 style="font-size:1.15rem">План за '+fmt(d[0],true)+'</h2>';d[2].forEach(function(x){var m=BYID[x[0]];h+='<div class="card stack" style="gap:8px"><a href="#m-'+m.id+'"><b>'+m.code+' · '+esc(m.title)+'</b></a>'+teacherPanel(m).replace('teacher-only','')+'</div>';});h+='</div>';}
  return h+'</div>';
}
function mmss(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}

/* ---------- install & wake lock ---------- */
var deferredInstall=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;showInstallBar();});
window.addEventListener('appinstalled',function(){deferredInstall=null;var b=document.getElementById('installbar');if(b)b.remove();});
function showInstallBar(iosHelp){
  if(document.getElementById('installbar')||document.querySelector('.chromebar'))return;
  try{if(sessionStorage.getItem('aod26_installlater')==='1')return;}catch(e){}
  var bar=document.createElement('div');bar.id='installbar';bar.className='chromebar installbar';bar.setAttribute('role','dialog');
  bar.innerHTML='<div><b>Инсталирайте учебника на телефона.</b> '+(iosHelp?'Натиснете бутона „Сподели“ (квадрат със стрелка) и изберете „Добави към начален екран“.':'Ще се отваря с едно докосване от началния екран и ще работи без интернет.')+'</div><div class="row">'+(iosHelp?'':'<button class="btn primary" type="button" data-inst>Инсталирай</button>')+'<button class="btn ghost" type="button" data-later>По-късно</button></div>';
  document.body.insertBefore(bar,document.body.firstChild);
  var ib=bar.querySelector('[data-inst]');
  if(ib)ib.addEventListener('click',function(){if(!deferredInstall)return;deferredInstall.prompt();deferredInstall.userChoice.then(function(c){deferredInstall=null;if(c&&c.outcome==='accepted')bar.remove();else ib.remove();},function(){});});
  bar.querySelector('[data-later]').addEventListener('click',function(){try{sessionStorage.setItem('aod26_installlater','1');}catch(e){}bar.remove();});
}
var inFrame=false;try{inFrame=window.self!==window.top;}catch(e){inFrame=true;}
var standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function installHTML(){
  if(standalone)return '<p style="margin:0">Приложението е инсталирано на този телефон.</p>';
  var h='';
  if(deferredInstall)h+='<button class="btn primary big" data-act="install">Инсталирай приложението</button>';
  h+='<div class="steps"><p style="margin:0"><b>Android (Chrome):</b> отворете учебника в Chrome → меню ⋮ → „Инсталиране на приложението“ или „Добавяне към началния екран“.</p><p style="margin:0"><b>iPhone (Safari):</b> отворете учебника в Safari → бутон „Сподели“ → „Добави към начален екран“.</p>';
  if(inFrame)h+='<p class="muted" style="margin:0;font-size:.85rem">Ако го гледате в приложението Claude, първо изберете „Отвори в браузъра“.</p>';
  return h+'</div>';
}
var wake=null, wakeWanted=false;
function wakeSupported(){return 'wakeLock' in navigator;}
function setWake(on){
  wakeWanted=on;
  if(!on){if(wake){wake.release().catch(function(){});wake=null;}updWake();return Promise.resolve(true);}
  if(!wakeSupported()){updWake('Телефонът или браузърът не поддържа тази функция.');return Promise.resolve(false);}
  return navigator.wakeLock.request('screen').then(function(l){wake=l;l.addEventListener('release',function(){wake=null;updWake();});updWake();return true;},
    function(){wakeWanted=false;updWake(inFrame?'Тук не е разрешено. Отворете учебника в браузъра или инсталирайте приложението.':'Не успях да включа функцията.');return false;});
}
function updWake(msg){var b=$('#wakeBtn');if(b){b.classList.toggle('on',!!wake);b.setAttribute('aria-pressed',wake?'true':'false');b.title=wake?'Екранът остава включен':'Екранът може да изгасне';}
  var t=$('#wakeState');if(t)t.textContent=msg||(wake?'Включено – екранът няма да изгасва.':'Изключено.');
  var c=$('#wakeChk');if(c)c.checked=!!wake;}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&wakeWanted&&!wake)setWake(true);});

/* ---------- settings / login ---------- */
/* ---------- settings / login ---------- */
function openModal(html){$('#modalBox').innerHTML=html;var md=$('#modal');md.classList.add('open');md.scrollTop=0;document.documentElement.classList.add('modalopen');}
function closeModal(){$('#modal').classList.remove('open');document.documentElement.classList.remove('modalopen');}
function settings(){
  var h='<div class="row" style="justify-content:space-between"><h2>Настройки</h2><button class="btn ghost" data-act="close" aria-label="Затвори" style="font-size:1.3rem">✕</button></div><label class="field" for="nm">Вашето име<input id="nm" value="'+esc(S.name)+'" autocomplete="name"></label><div class="row"><button class="btn primary" data-act="savename">Запази</button></div><hr style="border:0;border-top:1px solid var(--line);width:100%">';
  if(teacher)h+='<p style="margin:0">Влезли сте в <b>режим учител</b>.</p><div class="row"><button class="btn stamp" data-act="logout">Изход от режим учител</button></div>';
  else h+='<h3>Режим учител</h3><form id="login" class="stack" style="gap:10px"><label class="field" for="lu">Потребител<input id="lu" autocomplete="username"></label><label class="field" for="lp">Парола<input id="lp" type="password" autocomplete="current-password"></label><div class="err" id="lerr"></div><button class="btn stamp" type="submit">Вход</button></form>';
  h+='<hr style="border:0;border-top:1px solid var(--line);width:100%"><h3>Екранът да остане включен</h3><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" id="wakeChk" style="margin-top:5px;width:20px;height:20px;flex:none"'+(wake?' checked':'')+'> Не изгасвай екрана, докато учебникът е отворен</label><div class="muted" id="wakeState" style="font-size:.85rem"></div>';
  h+='<hr style="border:0;border-top:1px solid var(--line);width:100%"><h3>Инсталиране на телефона</h3>'+installHTML();
  h+='<hr style="border:0;border-top:1px solid var(--line);width:100%"><div class="row" style="justify-content:space-between"><button class="btn" data-act="reset">Изтрий моя напредък</button><button class="btn ghost" data-act="close">Затвори</button></div>';
  openModal(h);updWake();
}
function sha(s){
  if(!(window.crypto&&crypto.subtle))return Promise.reject();
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');});
}


/* ---------- препоръка за Chrome ---------- */
(function(){
  var ua=navigator.userAgent||'', K='aod26_nochrome';
  var isAndroid=/Android/i.test(ua), isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var inApp=/FBAN|FBAV|FB_IAB|Instagram|Viber|Line\/|MicroMessenger|; wv\)|GSA\//i.test(ua);
  var other=/Edg|EdgA|EdgiOS|OPR|OPiOS|Opera|SamsungBrowser|YaBrowser|UCBrowser|Vivaldi|DuckDuckGo|Firefox|FxiOS|MiuiBrowser|HuaweiBrowser|HeyTap|Brave/i.test(ua);
  var isChrome=isIOS?/CriOS/i.test(ua):(/Chrome\/\d+/i.test(ua)&&!other&&!inApp);
  var inFr=false;try{inFr=window.self!==window.top;}catch(e){inFr=true;}
  var installed=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(isChrome||inFr||installed||!/^https?:$/.test(location.protocol))return;
  var dismissed=false;try{dismissed=localStorage.getItem(K)==='1';}catch(e){}
  var url=location.href, noProto=url.replace(/^https?:\/\//,'');
  var chromeLink=null;
  if(isAndroid)chromeLink='intent://'+noProto.replace(/#.*$/,'')+'#Intent;scheme='+location.protocol.replace(':','')+';package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(url)+';end';
  else if(isIOS)chromeLink=(location.protocol==='https:'?'googlechromes://':'googlechrome://')+noProto;
  // автоматично отваряне в Chrome на Android – само веднъж в сесията
  var tried=false;try{tried=sessionStorage.getItem('aod26_chrometry')==='1';sessionStorage.setItem('aod26_chrometry','1');}catch(e){tried=true;}
  if(isAndroid&&chromeLink&&!tried&&!dismissed){setTimeout(function(){location.href=chromeLink;},300);}
  if(dismissed)return;
  var bar=document.createElement('div');bar.className='chromebar';bar.setAttribute('role','alert');
  bar.innerHTML='<div><b>Отворете учебника в Google Chrome.</b> В Chrome се инсталира като приложение, работи без интернет и пази напредъка ви.'+(inApp?' Сега сте във вграден браузър на друго приложение.':'')+'</div><div class="row">'+
    (chromeLink?'<a class="btn primary" href="'+chromeLink.replace(/"/g,'&quot;')+'">Отвори в Chrome</a>':'')+
    '<button class="btn" type="button" data-copyurl>Копирай адреса</button><button class="btn ghost" type="button" data-stay>Продължи тук</button></div>'+
    (isAndroid||isIOS?'':'<div class="muted" style="font-size:.85rem">Ако нямате Chrome, изтеглете го от google.com/chrome.</div>');
  document.body.insertBefore(bar,document.body.firstChild);
  bar.querySelector('[data-stay]').addEventListener('click',function(){try{localStorage.setItem(K,'1');}catch(e){}bar.remove();});
  bar.querySelector('[data-copyurl]').addEventListener('click',function(){var b=this;var done=function(){b.textContent='Адресът е копиран – поставете го в Chrome';};
    try{navigator.clipboard.writeText(location.href.replace(/#.*$/,'')).then(done,function(){b.textContent=location.href.replace(/#.*$/,'');});}catch(e){b.textContent=location.href.replace(/#.*$/,'');}});
})();

/* ---------- router & back ---------- */
var lessonMode='slides', NAV=[], goingBack=false;
function go(h){if(location.hash===h)route();else location.hash=h;}
function goBack(){
  if(NAV.length>1){var before=location.hash,prev=NAV[NAV.length-2];
    try{history.back();}catch(e){}
    setTimeout(function(){if(location.hash===before){goingBack=true;try{location.replace(prev);}catch(e){location.hash=prev;}}},350);}
  else go(parentOf(location.hash));}
function parentOf(h){var m;h=h||'#home';
  if((m=h.match(/^#l-([a-z]+)-\d+$/)))return '#m-'+m[1];
  if((m=h.match(/^#m-([a-z]+)-/)))return '#m-'+m[1];
  return '#home';}
function route(){
  var hh=location.hash||'#home';
  if(goingBack){NAV.pop();goingBack=false;}
  else if(NAV.length>1&&NAV[NAV.length-2]===hh)NAV.pop();
  else if(NAV[NAV.length-1]!==hh)NAV.push(hh);
  if(NAV.length>60)NAV.splice(0,NAV.length-60);
  var h=hh.slice(1), v=$('#view'), cur='home', html, crumbs='Начало';
  var m;
  if(h==='schedule'){html=vSchedule();cur='schedule';crumbs='Учебен график';}
  else if(h==='glossary'){html=vGlossary();cur='glossary';crumbs='Речник';}
  else if(h==='exam'){html=vExam();cur='exam';crumbs='Пробен изпит';}
  else if(h==='teacher'){html=vTeacher();cur='teacher';crumbs='Инструменти за учителя';}
  else if((m=h.match(/^m-([a-z]+)(?:-(ex|quiz|gl))?$/))&&BYID[m[1]]){var md=BYID[m[1]];html=vModule(md,m[2]);cur=md.id;crumbs=md.code+' · '+md.short;}
  else if((m=h.match(/^l-([a-z]+)-(\d+)$/))&&BYID[m[1]]){var ml=BYID[m[1]];html=vLesson(ml,+m[2]);cur=ml.id;crumbs=ml.code+' · '+ml.short+' › '+(ml.lessons[+m[2]]||{}).n;}
  else html=vHome();
  v.innerHTML=html; renderSide(cur); $('#crumbs').textContent=crumbs;
  if($('#slide'))renderSlide();
  var bb=$('#backBtn'); bb.hidden=(hh==='#home'&&NAV.length<=1);
  document.body.classList.remove('navopen');
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-act],[data-tm]'); if(!t)return;
  var a=t.dataset.act;
  if(t.dataset.tm){tmr.total=tmr.left=+t.dataset.tm*60;var el=$('#tm');if(el){el.textContent=mmss(tmr.left);el.classList.remove('end');}return;}
  if(a==='settings'){e.preventDefault();settings();}
  else if(a==='sprev')slideGo(-1);
  else if(a==='snext')slideGo(1);
  else if(a==='lmode'){lessonMode=t.dataset.v;route();}
  else if(a==='tcheck')checkTask(t.closest('.task'));
  else if(a==='treset'){var cd=t.closest('.task'),kk=cd.dataset.task.split(':');cd.querySelector('.tbody').innerHTML=taskBody(BYID[kk[0]].ex[+kk[1]]);cd.querySelector('.tres').innerHTML='';}
  else if(a==='install'){if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(function(){deferredInstall=null;closeModal();});}}
  else if(a==='wake'){setWake(!wake);}
  else if(a==='close')closeModal();
  else if(a==='savename'){S.name=$('#nm').value.trim();save();closeModal();route();}
  else if(a==='logout'){closeModal();setTeacher(false);}
  else if(a==='reset'){openModal('<h2>Изтриване на напредъка</h2><p>Ще се изтрият отбелязаните уроци, резултатите от тестовете и записаните решения в този браузър.</p><div class="row"><button class="btn stamp" data-act="resetyes">Изтрий</button><button class="btn" data-act="close">Отказ</button></div>');}
  else if(a==='resetyes'){S.read={};S.quiz={};S.ex={};save();closeModal();route();}
  else if(a==='read'){var k=t.dataset.k;if(S.read[k])delete S.read[k];else S.read[k]=1;save();route();}
  else if(a==='newexam'){newExam();route();}
  else if(a==='proj'){document.body.classList.add('proj');renderSlide();try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(function(){});}catch(_){}}
  else if(a==='pick'){var names=S.roster.split('\n').map(function(s){return s.trim();}).filter(Boolean);$('#picked').textContent=names.length?names[Math.floor(Math.random()*names.length)]:'Добавете имена в списъка';}
  else if(a==='tmgo'){if(tmr.id){clearInterval(tmr.id);tmr.id=null;}else if(tmr.left>0){tmr.id=setInterval(function(){tmr.left--;var el=$('#tm');if(el)el.textContent=mmss(tmr.left);if(tmr.left<=0){clearInterval(tmr.id);tmr.id=null;if(el){el.textContent='Времето изтече';el.classList.add('end');}}},1000);}}
  else if(a==='tmreset'){if(tmr.id)clearInterval(tmr.id);tmr.id=null;tmr.left=tmr.total;var el2=$('#tm');if(el2){el2.textContent=mmss(tmr.left);el2.classList.remove('end');}}
});
function exitProj(){document.body.classList.remove('proj');try{if(document.fullscreenElement)document.exitFullscreen();}catch(_){}}
$('#projExit').addEventListener('click',exitProj);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){exitProj();closeModal();}
  if($('#slide')&&!/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||''))){if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();slideGo(1);}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();slideGo(-1);}}});
/* chips & order taps */
document.addEventListener('click',function(e){
  var c=e.target.closest('.chip'); if(!c)return;
  var task=c.closest('.task'); if(!task)return;
  if(c.dataset.oi!=null){var ans=task.querySelector('[data-ans]'),pool=task.querySelector('[data-pool]');c.classList.remove('right','wrong');(c.parentNode===pool?ans:pool).appendChild(c);return;}
  var grp=c.parentNode; grp.querySelectorAll('.chip').forEach(function(x){x.classList.remove('sel','right','wrong');}); c.classList.add('sel');
});
/* swipe */
var tx=null,ty=null;
document.addEventListener('touchstart',function(e){if(!e.target.closest('#deck'))return;tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)slideGo(dx<0?1:-1);},{passive:true});
$('#backBtn').addEventListener('click',goBack);
$('#wakeBtn').addEventListener('click',function(){setWake(!wake);});
document.addEventListener('fullscreenchange',function(){if(!document.fullscreenElement)document.body.classList.remove('proj');});
$('#settingsBtn').addEventListener('click',settings);
$('#menuBtn').addEventListener('click',function(){document.body.classList.toggle('navopen');});
$('#navback').addEventListener('click',function(){document.body.classList.remove('navopen');});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('navopen');});
(function(){var sx=null;var side=$('#side');side.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});side.addEventListener('touchend',function(e){if(sx!==null&&e.changedTouches[0].clientX-sx<-60)document.body.classList.remove('navopen');sx=null;},{passive:true});})();
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')closeModal();});
document.addEventListener('submit',function(e){
  var f=e.target; e.preventDefault();
  if(f.id==='login'){
    var u=$('#lu').value.trim(), p=$('#lp').value;
    sha(u+':'+p).then(function(hx){if(hx===T_HASH){closeModal();setTeacher(true);}else{$('#lerr').textContent='Грешно потребителско име или парола.';}},function(){$('#lerr').textContent='Браузърът не поддържа проверката. Опитайте с друг браузър.';});
    return;}
  if(f.id==='exam'){checkQuiz(f,examQs);return;}
  var mid=f.dataset.mid; if(mid&&BYID[mid])checkQuiz(f,BYID[mid].quiz);
});
document.addEventListener('reset',function(e){var f=e.target;setTimeout(function(){f.querySelectorAll('.opt').forEach(function(l){l.classList.remove('right','wrong');});f.querySelectorAll('[data-why]').forEach(function(w){w.hidden=!teacher;});if(teacher){route();return;}var sc=f.querySelector('[data-score]');if(sc)sc.textContent='';},0);});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.dataset.tnote){S.tnotes[t.dataset.tnote]=t.value;save();}
  else if(t.id==='roster'){S.roster=t.value;save();}
  else if(t.id==='gls'){var q=t.value.trim().toLowerCase();document.querySelectorAll('#gll [data-s]').forEach(function(x){x.style.display=!q||x.dataset.s.indexOf(q)>=0?'':'none';});}
});
document.addEventListener('change',function(e){var t=e.target;if(t.id==='wakeChk')setWake(t.checked);else if(t.classList.contains('psel'))t.classList.remove('right','wrong');});
if('serviceWorker' in navigator&&!inFrame&&(location.protocol==='https:'||location.hostname==='localhost')&&document.querySelector('link[rel=manifest]')){
  var firstSW=!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(function(reg){
    navigator.serviceWorker.ready.then(function(){if(firstSW)toast('Учебникът е записан на телефона и вече работи и без интернет.');});
    reg.addEventListener('updatefound',function(){var w=reg.installing;if(!w||firstSW)return;w.addEventListener('statechange',function(){if(w.state==='activated')toast('Има нова версия на учебника. Ще се зареди при следващото отваряне.');});});
  }).catch(function(){});}
function toast(t){var d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove();},6000);}
function netState(){document.body.classList.toggle('offline',navigator.onLine===false);}
window.addEventListener('online',netState);window.addEventListener('offline',netState);
route();netState();
(function(){var ua=navigator.userAgent||'';var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(ios&&!standalone&&!inFrame&&/^https:$/.test(location.protocol))setTimeout(function(){showInstallBar(true);},1500);})();
})();
