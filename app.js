/* =====================================================================
   APP.JS – hjálparföll, gögn, reglur og skjáir (heim, skráning lesin, dagatal, yfirsýn, gögn)
   Öll gögn vistast í localStorage í þessum síma. Ekkert er sent neitt.
   Skipulag: 1 Hjálparföll · 2 Gögn · 3 Reglur · 4 Skjáir · 5 Útflutningur og afrit
   Eyðublaðið (dálkarnir) og aðgerðir eru í form.js.
   ===================================================================== */

/* ---------- 1. HJÁLPARFÖLL ---------- */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,'0');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const arr = a => Array.isArray(a) ? a.map(String) : [];
const snip = (s,n=90) => s.length>n ? s.slice(0,n).trim()+'…' : s;

/* Tími er geymdur sem staðartími: "2026-10-10T20:17" */
const toLocalInput = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dateOnly = d => toLocalInput(d).slice(0,10);
const fmtTime = s => new Date(s).toLocaleString('is-IS',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const inDays = (e, days) => (Date.now() - new Date(e.time)) <= days*86400000;
function mondayOf(d){
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay()+6)%7));      // mánudagur
  return x;
}

const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
const fmtNum = n => n===null || n===undefined ? '–' : (Math.round(n*10)/10).toString().replace('.',',');   // 6,2

let toastTimer;
function toast(msg){
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* Gluggi í miðju skjásins. buttons = HTML fyrir hnappa. */
function modal(html, buttons){
  $('modal').innerHTML = `<div class="mbox">${html}<div class="mbtns">${buttons}</div></div>`;
  $('modal').hidden = false;
}
function closeModal(){ $('modal').hidden = true; $('modal').innerHTML = ''; }

/* Lárétt súla */
function bars(rows){
  const max = Math.max(1, ...rows.map(r=>r.v));
  return rows.map(r=>`
    <div class="bar" ${r.title?`title="${esc(r.title)}"`:''}>
      <div class="name">${esc(r.name)}</div>
      <div class="track"><div class="fill" style="width:${r.v/max*100}%;--c:${r.color||'var(--accent)'}"></div></div>
      <div class="n">${esc(r.label ?? r.v)}</div>
    </div>`).join('') || '<p class="muted">Ekki nóg af gögnum enn.</p>';
}

/* ---------- 2. GÖGN ----------
   Ein skráning (record):
   { id, time, situations:[{id,title,desc,tags:{tema,folk,stadur}}],
     emotions:[{w, s (1-10), s2 (1-10 eftir endurmat eða null)}],
     thoughts:[{id,text,belief1,errors:[],q1,q2,belief2}],   // belief = 0-100 eða null
     unlockShown, lokid, legacy }                                    // legacy = gömul svæði (hvað ég gerði o.fl.) */
const KEY      = 'hugsanaskra_v2';       // skráningarnar
const KEY_V1   = 'hugsanaskra_v1';       // gamla útgáfan (er ekki eytt)
const META     = 'hugsanaskra_meta';     // afrit, tilfinningaútlit, eigin merki
const DRAFT_V1 = 'hugsanaskra_draft';    // gamla ókláraða færslan

function readJSON(k, fallback){
  try{ const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; }
  catch(e){ return fallback; }
}
function writeJSON(k, v){
  try{ localStorage.setItem(k, JSON.stringify(v)); }
  catch(e){ toast('Tókst ekki að vista!'); }
}

/* Hreinsa skráningu svo hún brjóti ekki appið (notað við innlestur og flutning) */
function cleanRec(r){
  const n = v => (v===null||v===undefined||v==='') ? null : Math.min(10, Math.max(1, Math.round(+v||1)));
  const p = v => (v===null||v===undefined||v==='') ? null : Math.min(100, Math.max(0, Math.round(+v||0)));
  const lg = r.legacy;
  const o = {
    id: String(r.id || newId()),
    time: String(r.time || toLocalInput(new Date())),
    situations: (r.situations||[]).map(s=>({
      id:String(s.id||newId()), title:String(s.title||''), desc:String(s.desc||''),
      tags:{tema:arr(s.tags&&s.tags.tema), folk:arr(s.tags&&s.tags.folk), stadur:arr(s.tags&&s.tags.stadur)}
    })),
    emotions: (r.emotions||[]).map(x=>({w:String(x.w), s:n(x.s)||5, s2:n(x.s2)})),
    thoughts: (r.thoughts||[]).map(t=>({
      id:String(t.id||newId()), text:String(t.text||''), belief1:p(t.belief1), errors:arr(t.errors),
      q1:String(t.q1||''), q2:String(t.q2||''), belief2:p(t.belief2)
    })),
    unlockShown: !!r.unlockShown,
    legacy: lg ? {did:String(lg.did||''), helped:String(lg.helped||''), alt:String(lg.alt||'')} : null
  };
  /* lokið: nýja gerðin geymir það. Eldri skráningar teljast lokið ef trú fyrir og eftir var metin (gamla reglan). */
  const txt = o.thoughts.filter(t=>t.text.trim());
  o.lokid = r.lokid!==undefined ? !!r.lokid
    : o.situations.some(s=>s.title.trim()&&s.desc.trim()) && o.emotions.length>0 && txt.length>0
      && txt.every(t=>t.belief1!==null && t.belief2!==null);
  return o;
}

/* Flytja færslu úr gömlu útgáfunni (v1) yfir í nýju gerðina. Ekkert tapast:
   "Hvað ég gerði" og "Hjálpaði það?" varðveitast í legacy og sjást í opinni skráningu. */
function fromV1(e){
  const tg = e.tags || {};
  const places = arr(tg.stadur).concat(e.place ? [String(e.place)] : []);
  const before = String(e.before||'').trim();
  const hasSit = before || places.length || arr(tg.folk).length || arr(tg.gera).length;
  const thought = String(e.thought||'').trim();
  const alt = String(e.alt||'').trim();
  return cleanRec({
    id:e.id, time:e.time,
    situations: hasSit ? [{id:newId(), title: before ? snip(before,40) : (places[0]||'Aðstæður'), desc:before,
                           tags:{tema:arr(tg.gera), folk:arr(tg.folk), stadur:places}}] : [],
    emotions: (e.emotions||[]).map(x=>({w:x.w, s:x.s, s2:null})),
    thoughts: thought ? [{id:newId(), text:thought, belief1:null, errors:[], q1:'', q2:alt, belief2:null}] : [],
    legacy: {did:e.did||'', helped:e.helped||'', alt: thought ? '' : alt}
  });
}

let meta = readJSON(META, {});
const saveMeta = () => writeJSON(META, meta);
if(meta.customTags && meta.customTags.gera){              // gamla heitið "gera" er núna "tema"
  meta.customTags.tema = (meta.customTags.tema||[]).concat(meta.customTags.gera);
  delete meta.customTags.gera; saveMeta();
}

function loadEntries(){
  const list = readJSON(KEY, null);
  if(Array.isArray(list)) return list.map(cleanRec);
  /* Fyrsta ræsing á nýju útgáfunni: flytja gamlar færslur (v1) yfir. v1 er ekki eytt. */
  const old = readJSON(KEY_V1, []);
  const out = (Array.isArray(old) ? old : []).map(fromV1);
  const d = readJSON(DRAFT_V1, null);
  if(d && (d.before || d.thought || (d.emotions && d.emotions.length))) out.push(fromV1(d));
  writeJSON(KEY, out);
  return out;
}
let entries = loadEntries();
const saveEntries = () => writeJSON(KEY, entries);

/* Biðja símann um að eyða ekki gögnunum sjálfkrafa (virkar ekki alls staðar, skaðar ekki) */
if(navigator.storage && navigator.storage.persist) navigator.storage.persist();

/* ---------- 3. REGLUR ---------- */
/* Lágmark til að opna Endurmat: ein aðstæða (titill og lýsing), ein tilfinning, ein hugsun.
   Til að breyta lágmarkinu: breyttu missingList. */
function missingList(r){
  const m = [];
  if(!r.situations.some(s=>s.title.trim() && s.desc.trim())) m.push('Dálk 1 (Aðstæður: titil og lýsingu)');
  if(!r.emotions.length)                                      m.push('Dálk 2 (Tilfinning)');
  if(!r.thoughts.some(t=>t.text.trim()))                      m.push('Dálk 3 (Hugsun)');
  return m;
}
const hasMin   = r => !missingList(r).length;
const isDraft  = r => !hasMin(r);           // drög = lágmarki ekki náð
const hasContent = r => r.situations.some(s=>s.title.trim()||s.desc.trim()) || r.emotions.length || r.thoughts.some(t=>t.text.trim());
/* Staða skráningar: r = vantar 1–3 (rautt), y = endurmat eftir (gult), g = klárað (grænt).
   Skráning er klár þegar notandi ýtir á „Ljúka skráningu“. */
const reDone = r => hasMin(r) && r.lokid;      // lokið = notandi ýtti á „Ljúka skráningu“
const rateOpen = r => r.thoughts.some(t=>t.text.trim() && t.belief2!==null);   // „meta líðan aftur“ opnast þegar trú eftir er metin
const recStatus = r => !hasMin(r) ? 'r' : reDone(r) ? 'g' : 'y';
const STATUS_TXT = {r:'Klára 1–3', y:'Endurmat eftir', g:'Klárað'};
const stBadge = r => { const s = recStatus(r); return `<span class="st st-${s}">${STATUS_TXT[s]}</span>`; };
const thoughtWorked = t => t.belief1!==null || t.belief2!==null || t.errors.length || t.q1.trim() || t.q2.trim();
const sorted = () => entries.slice().sort((a,b)=> b.time.localeCompare(a.time));   // nýjast efst

function newRec(time){
  return {id:newId(), time: time || toLocalInput(new Date()), situations:[], emotions:[], thoughts:[], unlockShown:false, lokid:false, legacy:null};
}
/* Öll merki skráningar (sameinuð úr öllum aðstæðum) */
function recTags(r){
  const o = {tema:[], folk:[], stadur:[]};
  r.situations.forEach(s=>Object.keys(o).forEach(g=>s.tags[g].forEach(t=>{ if(!o[g].includes(t)) o[g].push(t); })));
  return o;
}
const dayEntries = key => entries.filter(e=>e.time.slice(0,10)===key);
/* Litur dags = blanda allra tilfinninga dagsins. Geirar eftir samanlögðum styrk hvers lits (þrír stærstu). */
function dayColor(key){
  const es = dayEntries(key); if(!es.length) return null;
  const w = {};
  es.forEach(e=>e.emotions.forEach(x=>{ const c = colorOf(x.w); w[c] = (w[c]||0) + x.s; }));
  const l = Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(!l.length) return FREE_COLOR;
  if(l.length===1) return l[0][0];
  const tot = l.reduce((a,x)=>a+x[1],0); let acc = 0;
  return 'conic-gradient(' + l.map(([c,v])=>{ const from = acc/tot*100; acc += v; return `${c} ${from.toFixed(1)}% ${(acc/tot*100).toFixed(1)}%`; }).join(',') + ')';
}

/* ---------- 4. SKJÁIR ---------- */
let view = 'home';          // home | detail | cal | stats | data | form
let current = null;         // id skráningar sem er opin (detail)
let statsDays = 30;         // tímabil í yfirsýn
let exFrom = '', exTo = ''; // tímabil fyrir útflutning
let calMonth = null, calSel = null;   // dagatal

function go(v, id){
  view = v; current = id ?? null;
  render();
  window.scrollTo(0,0);
}
function render(){
  if(view==='form') return renderForm();               // form.js
  $('form').hidden = true; $('sheet').hidden = true; $('app').hidden = false; $('nav').hidden = false;
  const f = {home:viewHome, detail:viewDetail, cal:viewCal, stats:viewStats, data:viewData}[view];
  $('app').innerHTML = f();
  document.querySelectorAll('#nav button').forEach(b=>{
    b.classList.toggle('on', b.dataset.v===view || (view==='detail' && b.dataset.v==='home'));
  });
}

/* ----- Heim ----- */
function backupBanner(){
  if(!entries.length) return '';
  const last = meta.lastBackup ? (Date.now()-new Date(meta.lastBackup))/86400000 : Infinity;
  if(last <= 30) return '';
  return `<div class="card"><b>Mundu eftir afriti</b><br><span class="muted">${meta.lastBackup?'Síðasta afrit er meira en mánaðargamalt.':'Þú hefur ekki tekið afrit enn.'}</span>
    <button class="big" data-a="nav" data-v="data">Taka afrit</button></div>`;
}
const WD = ['M','Þ','M','F','F','L','S'];       // vikudagar frá mánudegi
function viewHome(){
  const now = new Date(), today = dateOnly(now), mon = mondayOf(now), h = now.getHours();
  const when = h<6 ? 'í nótt' : h<12 ? 'í morgun' : h<18 ? 'í dag' : 'í kvöld';
  const days = WD.map((w,i)=>{
    const d = new Date(mon); d.setDate(mon.getDate()+i);
    const key = dateOnly(d), col = dayColor(key);
    return `<div class="d">${w}<button class="dayc${col?' has':''}${key===today?' today':''}${key>today?' future':''}"
      style="--c:${col||'transparent'}" data-a="day" data-d="${key}">${col?'':'+'}</button></div>`;
  }).join('');
  return `<h1>Hvernig líður þér ${when}?</h1>
    ${backupBanner()}
    ${reminderBanner()}
    <div class="week">${days}</div>
    <button class="plus" data-a="newRec" aria-label="Skrá hugsun">+</button>
    <div class="plusl">Skrá hugsun</div>
    ${recentList()}`;
}

/* Fyrri skráningar flokkaðar: óklárað eldra efst, svo í dag, í gær, í vikunni, síðustu viku. Eldra er falið. */
let showOld = false;
function recentList(){
  const list = sorted();
  if(!list.length) return '<h2>Fyrri skráningar</h2><p class="muted">Engar skráningar enn. Ýttu á plúsinn.</p>';
  const now = new Date(), today = dateOnly(now);
  const yd = new Date(now); yd.setDate(yd.getDate()-1); const yday = dateOnly(yd);
  const wk = mondayOf(now), wkKey = dateOnly(wk);
  const lw = new Date(wk); lw.setDate(lw.getDate()-7); const lwKey = dateOnly(lw);
  const groups = [['Í dag',[]],['Í gær',[]],['Í vikunni',[]],['Síðustu viku',[]]], old = [], pend = [];
  list.forEach(r=>{
    const k = r.time.slice(0,10);
    const g = k>=today ? 0 : k===yday ? 1 : k>=wkKey ? 2 : k>=lwKey ? 3 : -1;
    if(g>=0) groups[g][1].push(r);
    else if(recStatus(r)!=='g') pend.push(r);       // óklárað eldra sést alltaf
    else old.push(r);
  });
  let h = '';
  if(pend.length) h += `<h2>Óklárað frá fyrr</h2>` + pend.map(entryCard).join('');
  groups.forEach(([t,l])=>{ if(l.length) h += `<h2>${t}</h2>` + l.map(entryCard).join(''); });
  if(old.length) h += showOld
    ? `<h2>Eldra</h2>` + old.map(entryCard).join('') + `<button class="linkbtn" data-a="toggleOld">Fela eldra</button>`
    : `<button class="big" data-a="toggleOld">Sýna eldra (${old.length})</button>`;
  return h || '<p class="muted">Engar nýlegar skráningar.</p>';
}

/* ----- Áminning um endurmat (aðeins í appinu, engar tilkynningar) ----- */
const reHours = () => meta.reHours===undefined ? 24 : meta.reHours;     // 0 = aldrei
const ageHours = r => (Date.now() - new Date(r.time)) / 3600000;
const ageTxt = r => { const h = ageHours(r); return h<1 ? 'núna' : h<48 ? `fyrir ${Math.floor(h)} klst` : `fyrir ${Math.floor(h/24)} d`; };
const isLate = r => recStatus(r)==='y' && reHours()>0 && ageHours(r) > reHours();
function reminderBanner(){
  const late = entries.filter(isLate).sort((a,b)=>a.time.localeCompare(b.time));
  if(!late.length) return '';
  return `<div class="card remind"><b>${late.length===1?'1 skráning bíður':late.length+' skráningar bíða'} endurmats</b><br>
    <span class="muted">Eldri en ${reHours()} klst. Gott er að endurmeta sem fyrst.</span>
    <button class="big" data-a="open" data-id="${esc(late[0].id)}">Opna elstu</button></div>`;
}

/* Spjald í lista (heim og dagatal). Drög eru merkt. */
function entryCard(r){
  const titles = r.situations.map(s=>s.title).filter(Boolean).join(' · ');
  const emo = r.emotions.map(x=>`${esc(x.w)} ${x.s}${x.s2!==null?' → '+x.s2:''}`).join(', ');
  const th = (r.thoughts.find(t=>t.text.trim()) || {}).text || '';
  return `<div class="card entry st-${recStatus(r)}" data-a="open" data-id="${esc(r.id)}">
    <div class="when">${esc(fmtTime(r.time))} ${stBadge(r)}${recStatus(r)!=='g'?` <span class="${isLate(r)?'late':''}">· ${ageTxt(r)}</span>`:''}</div>
    ${titles?`<div><b>${esc(titles)}</b></div>`:''}
    ${emo?`<div class="small">${emo}</div>`:''}
    ${th?`<div class="snip muted">${esc(snip(th,110))}</div>`:''}
  </div>`;
}

/* ----- Opin skráning (lesa): þétt, í röð dálkanna ----- */
function viewDetail(){
  const r = entries.find(x=>x.id===current);
  if(!r) return '<p>Skráning fannst ekki.</p>';
  const tg = recTags(r);
  const ctx = [['Þema',tg.tema],['Fólk',tg.folk],['Staður',tg.stadur]].filter(x=>x[1].length)
    .map(x=>`<b>${x[0]}</b> <span>${esc(x[1].join(', '))}</span>`).join(' · ');
  const row = (label, html) => html ? `<div class="dr"><b>${label}</b>${html}</div>` : '';
  const sits = r.situations.map(s=>row('Aðstæður', `<strong>${esc(s.title)}</strong>${s.desc?' – '+esc(s.desc):''}`)).join('');
  const emo = r.emotions.length ? row('Tilfinning', r.emotions.map(x=>
    `<span class="ec" style="--c:${colorOf(x.w)}">${esc(x.w)} <i>${x.s}${x.s2!==null?' → '+x.s2:''}</i></span>`).join('')) : '';
  const ths = r.thoughts.map(t=>{
    const parts = [];
    if(t.belief1!==null) parts.push(`Trú ${t.belief1}%${t.belief2!==null?' → '+t.belief2+'%':''}`);
    if(t.errors.length)  parts.push(esc(t.errors.join(', ')));
    return row('Hugsun', esc(t.text)
      + (parts.length ? `<div class="sub">${parts.join(' · ')}</div>` : '')
      + (t.q1.trim() ? `<div class="sub"><b>Efi:</b>${esc(t.q1)}</div>` : '')
      + (t.q2.trim() ? `<div class="sub"><b>Annað ljós:</b>${esc(t.q2)}</div>` : ''));
  }).join('');
  const lg = r.legacy ? [
    r.legacy.alt ? row('Annað sjónarhorn', esc(r.legacy.alt)) : '',
    r.legacy.did ? row('Ég gerði', esc(r.legacy.did) + (r.legacy.helped ? ` <span class="badge">· Hjálpaði: ${esc(r.legacy.helped)}</span>` : '')) : ''
  ].join('') : '';
  const miss = missingList(r), stt = recStatus(r);
  return `<h1 class="dh">${esc(fmtTime(r.time))} ${stBadge(r)}</h1>
    ${ctx?`<p class="dctx">${ctx}</p>`:''}
    <div class="dbox">${sits}${emo}${ths}${lg}</div>
    ${miss.length?`<p class="dctx" style="margin:12px 0 0">Vantar: <span>${esc(miss.join(', '))}</span></p>`:''}
    <div class="dact">
      <button class="${stt!=='g'?'primary':''}" data-a="editRec" data-id="${esc(r.id)}">${stt!=='g'?'Halda áfram':'Breyta'}</button>
      <button class="danger" data-a="delRec" data-id="${esc(r.id)}">Eyða</button>
    </div>`;
}

/* ----- Dagatal ----- */
const MONTHS = ['janúar','febrúar','mars','apríl','maí','júní','júlí','ágúst','september','október','nóvember','desember'];
function viewCal(){
  const now = new Date(), today = dateOnly(now);
  if(!calMonth) calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const offset = (new Date(y,m,1).getDay()+6)%7, n = new Date(y,m+1,0).getDate();
  let cells = '<span></span>'.repeat(offset);
  for(let d=1; d<=n; d++){
    const key = `${y}-${pad(m+1)}-${pad(d)}`, col = dayColor(key);
    cells += `<button class="${col?'has':''}${key===today?' today':''}${key===calSel?' sel':''}" style="--c:${col||'transparent'}" data-a="calDay" data-d="${key}">${d}</button>`;
  }
  let below = '';
  if(calSel){
    const es = dayEntries(calSel).sort((a,b)=>b.time.localeCompare(a.time));
    const title = new Date(calSel+'T12:00').toLocaleDateString('is-IS',{weekday:'long',day:'numeric',month:'long'});
    below = `<h2>${esc(title)}</h2>` + (es.length ? es.map(entryCard).join('') : '<p class="muted">Engar skráningar þennan dag.</p>') +
      (calSel<=today ? `<button class="big" data-a="day" data-d="${calSel}" data-new="1">+ Skrá færslu þennan dag</button>` : '');
  }
  return `<h1>Dagatal</h1>
    <div class="calhead"><button data-a="calNav" data-d="-1">‹</button><b>${MONTHS[m]} ${y}</b><button data-a="calNav" data-d="1">›</button></div>
    <div class="cal">${WD.map(w=>`<div class="wd">${w}</div>`).join('')}${cells}</div>${below}`;
}

/* ----- Yfirsýn (mynstur) ----- */
const MIN_STATS = 5;     // fjöldi skráninga sem þarf áður en mynstrin birtast
function viewStats(){
  if(entries.length < MIN_STATS){
    return `<h1>Yfirsýn</h1><div class="card"><b>Fleiri skráningar þarf</b>
      <p class="muted" style="margin:6px 0 0">Mynstrin birtast þegar þú átt ${MIN_STATS} skráningar eða fleiri. Þú átt ${entries.length}.</p></div>`;
  }
  /* Færslur á viku: síðustu 8 vikur */
  const thisMon = mondayOf(new Date()), weeks = [];
  for(let i=7;i>=0;i--){ const m = new Date(thisMon); m.setDate(m.getDate()-7*i); weeks.push({m, key:dateOnly(m), n:0}); }
  entries.forEach(e=>{ const w = weeks.find(x=>x.key===dateOnly(mondayOf(new Date(e.time)))); if(w) w.n++; });

  const list = statsDays===0 ? entries : entries.filter(e=>inDays(e,statsDays));
  const all = a => a.flatMap(e=>e.emotions.map(x=>x.s));

  /* Tilfinningar: fjöldi og meðalstyrkur */
  const emo = {};
  list.forEach(r=>r.emotions.forEach(x=>{ (emo[x.w] = emo[x.w] || {n:0,sum:0}); emo[x.w].n++; emo[x.w].sum += x.s; }));
  const emoRows = Object.entries(emo).sort((a,b)=>b[1].n-a[1].n).slice(0,8).map(([w,o])=>({
    name:w, v:o.n, color:colorOf(w), label:`${o.n}× · ø ${fmtNum(o.sum/o.n)}`}));

  /* Hugsunarvillur: í hve mörgum skráningum hver kemur fyrir */
  const er = {};
  list.forEach(r=>{ const set = new Set(); r.thoughts.forEach(t=>t.errors.forEach(x=>set.add(x))); set.forEach(x=>er[x]=(er[x]||0)+1); });
  const errRows = Object.entries(er).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([n,c])=>({
    name:n, v:c, label:`${c} af ${list.length} skráningum`}));

  /* Merki: meðalstyrkur tilfinninga þegar merkið er á skráningu (a.m.k. 2 skráningar) */
  const tg = {};
  list.forEach(r=>{
    const a = avg(r.emotions.map(x=>x.s)); if(a===null) return;
    const t = recTags(r);
    [['Þema',t.tema],['Fólk',t.folk],['Staður',t.stadur]].forEach(([g,l])=>l.forEach(tag=>{
      const k = g+': '+tag; (tg[k] = tg[k] || {n:0,s:0}); tg[k].n++; tg[k].s += a; }));
  });
  const tagRows = Object.entries(tg).filter(([,o])=>o.n>=2).sort((a,b)=>b[1].s/b[1].n - a[1].s/a[1].n).slice(0,6)
    .map(([k,o])=>({name:k, v:o.s/o.n, label:`ø ${fmtNum(o.s/o.n)} · ${o.n} skráningar`}));
  const tagTop = tagRows.length ? `<p style="margin:0 0 6px">Tilfinningar eru sterkastar þegar <b>${esc(tagRows[0].name)}</b>.</p>` : '';

  /* Líðan eftir endurmat */
  const re = {};
  list.forEach(r=>r.emotions.forEach(x=>{ if(x.s2!==null){ (re[x.w] = re[x.w] || {n:0,a:0,b:0}); re[x.w].n++; re[x.w].a += x.s; re[x.w].b += x.s2; } }));
  const reLines = Object.entries(re).sort((a,b)=>b[1].n-a[1].n).slice(0,6).map(([w,o])=>
    `<div class="line"><b>${esc(w)}</b> fór að meðaltali úr ${fmtNum(o.a/o.n)} í ${fmtNum(o.b/o.n)} <span class="muted">(${o.n} ${o.n===1?'skráning':'skráningar'})</span></div>`).join('');
  const bl = list.flatMap(r=>r.thoughts).filter(t=>t.belief1!==null && t.belief2!==null);
  const beliefLine = bl.length ? `<div class="line">Trú á hugsanir fór að meðaltali úr <b>${fmtNum(avg(bl.map(t=>t.belief1)))}%</b> í <b>${fmtNum(avg(bl.map(t=>t.belief2)))}%</b> <span class="muted">(${bl.length} hugsanir)</span></div>` : '';

  return `<h1>Yfirsýn</h1>
    <select data-change="statsDays">
      ${[[7,'Síðustu 7 dagar'],[30,'Síðustu 30 dagar'],[90,'Síðustu 90 dagar'],[0,'Allt']].map(([v,t])=>
        `<option value="${v}"${statsDays===v?' selected':''}>${t}</option>`).join('')}
    </select>
    <div class="card"><div class="kpis">
      <div><b>${list.length}</b><span>skráningar</span></div>
      <div><b>${fmtNum(avg(all(list)))}</b><span>meðalstyrkur (1–10)</span></div>
    </div></div>

    <h2>Skráningar á viku</h2>
    <div class="card">${bars(weeks.map(w=>({name:`${w.m.getDate()}.${w.m.getMonth()+1}.`, v:w.n, label:w.n, title:'Vika frá '+w.key})))}</div>

    <h2>Algengustu tilfinningar</h2>
    <div class="card">${bars(emoRows)}</div>

    <h2>Hugsunarvillur</h2>
    <div class="card">${errRows.length ? bars(errRows) : '<p class="muted">Merktu hugsunarvillur í Endurmati til að sjá þetta.</p>'}</div>

    <h2>Hvenær er tilfinning sterkust</h2>
    <div class="card">${tagRows.length ? tagTop + bars(tagRows) : '<p class="muted">Merktu aðstæður (Þema, Fólk, Staður) í a.m.k. tveimur skráningum til að sjá þetta.</p>'}</div>

    <h2>Líðan eftir endurmat</h2>
    <div class="card">${reLines || beliefLine ? reLines + beliefLine : '<p class="muted">Metin líðan eða trú aftur í Endurmati til að sjá þetta.</p>'}</div>`;
}

/* ----- Gögn ----- */
function viewData(){
  if(!exTo){ const d=new Date(); exTo=dateOnly(d); d.setDate(d.getDate()-14); exFrom=dateOnly(d); }
  return `<h1>Gögn</h1>
    <h2>Flytja út skráningar (fyrir sálfræðing)</h2>
    <div class="card">
      <div class="row">
        <div><label for="ex_from" style="margin-top:0">Frá</label><input type="date" id="ex_from" value="${exFrom}"></div>
        <div><label for="ex_to" style="margin-top:0">Til</label><input type="date" id="ex_to" value="${exTo}"></div>
      </div>
      <button class="big" data-a="exportTxt">Textaskjal</button>
      <p class="muted" style="font-size:14px;margin:0">Á símanum opnast deilingarvalmynd.</p>
    </div>

    <h2>Áminning um endurmat</h2>
    <div class="card">
      <label for="rehours" style="margin-top:0">Minna á endurmat eftir</label>
      <select id="rehours" data-change="reHours">
        ${[[12,'12 klst'],[24,'24 klst'],[48,'48 klst'],[0,'Aldrei']].map(([v,t])=>`<option value="${v}"${reHours()===v?' selected':''}>${t}</option>`).join('')}
      </select>
      <p class="muted" style="font-size:14px;margin:8px 0 0">Tímamörkin eru stillanleg. Spurðu sálfræðinginn hvað hentar.</p>
    </div>

    <h2>Afrit og innflutningur</h2>
    <div class="card">
      <p style="margin-top:0">${entries.length} skráningar í símanum.<br>
      <span class="muted">Síðasta afrit: ${meta.lastBackup?esc(fmtTime(meta.lastBackup)):'aldrei'}</span></p>
      <button class="big" data-a="backup">Taka afrit (JSON)</button>
      <button class="big" data-a="importPick">Lesa inn afrit</button>
      <p class="muted" style="font-size:14px">Innlestur bætir við skráningum sem vantar. Núverandi skráningum er ekki eytt. Afrit úr gömlu útgáfunni lesast líka inn.</p>
    </div>`;
}

/* ---------- 5. ÚTFLUTNINGUR OG AFRIT ---------- */
/* Deila skrá (deilingarvalmynd á síma) eða sækja hana (tölva) */
async function shareOrDownload(name, mime, text){
  const file = new File([text], name, {type:mime});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({files:[file], title:name}); return; }
    catch(e){ if(e.name==='AbortError') return; }      // hætt við -> gera ekkert
  }
  const url = URL.createObjectURL(new Blob([text],{type:mime}));
  const a = document.createElement('a'); a.href=url; a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

/* Skráningar á völdu tímabili, elsta fyrst (hentar vel í lestri) */
function rangeEntries(){
  exFrom = $('ex_from').value; exTo = $('ex_to').value;
  return entries.filter(e=>{ const d=e.time.slice(0,10); return d>=exFrom && d<=exTo; })
                .sort((a,b)=>a.time.localeCompare(b.time));
}
function exportTxt(){
  const list = rangeEntries();
  if(!list.length) return toast('Engar skráningar á þessu tímabili');
  let t = `HUGSANASKRÁ\nTímabil: ${exFrom} – ${exTo}\nFjöldi skráninga: ${list.length}\n`;
  list.forEach(r=>{
    t += `\n=== ${fmtTime(r.time)}${isDraft(r)?' (drög)':''} ===\n`;
    r.situations.forEach(s=>{
      t += `Aðstæður: ${s.title}${s.desc?' – '+s.desc:''}\n`;
      const tg = [['Þema',s.tags.tema],['Fólk',s.tags.folk],['Staður',s.tags.stadur]].filter(x=>x[1].length)
        .map(x=>`${x[0]}: ${x[1].join(', ')}`).join('; ');
      if(tg) t += `  (${tg})\n`;
    });
    if(r.emotions.length) t += `Tilfinningar (1-10): ${r.emotions.map(x=>`${x.w} ${x.s}${x.s2!==null?' → '+x.s2:''}`).join(', ')}\n`;
    r.thoughts.forEach((th,i)=>{
      t += `Hugsun ${i+1}: ${th.text}\n`;
      if(th.belief1!==null) t += `  Trú á hugsunina: ${th.belief1}%${th.belief2!==null?' → '+th.belief2+'%':''}\n`;
      if(th.errors.length)  t += `  Hugsunarvillur: ${th.errors.join(', ')}\n`;
      if(th.q1.trim())      t += `  Að draga í efa: ${th.q1}\n`;
      if(th.q2.trim())      t += `  Annað ljós: ${th.q2}\n`;
    });
    if(r.legacy){
      if(r.legacy.alt) t += `Annað sjónarhorn: ${r.legacy.alt}\n`;
      if(r.legacy.did) t += `Hvað ég gerði: ${r.legacy.did}${r.legacy.helped?' (hjálpaði: '+r.legacy.helped+')':''}\n`;
    }
  });
  shareOrDownload(`hugsanaskra_${exFrom}_${exTo}.txt`, 'text/plain', t);
}
function backup(){
  const data = {app:'hugsanaskra', version:2, exported:new Date().toISOString(), records:entries, customTags:meta.customTags||{}, hiddenTags:meta.hiddenTags||{}};
  meta.lastBackup = new Date().toISOString(); saveMeta();
  shareOrDownload(`hugsanaskra_afrit_${dateOnly(new Date())}.json`, 'application/json', JSON.stringify(data,null,2));
  setTimeout(render, 300);
}
/* Innlestur: tekur við nýju afriti (records) og afriti úr gömlu útgáfunni (entries) */
function importData(file){
  const r = new FileReader();
  r.onload = () => {
    try{
      const d = JSON.parse(r.result);
      let incoming;
      if(d && Array.isArray(d.records))      incoming = d.records.map(cleanRec);
      else if(d && Array.isArray(d.entries)) incoming = d.entries.map(fromV1);
      else throw new Error();
      const have = new Set(entries.map(e=>e.id));
      const add = incoming.filter(e=>!have.has(e.id));
      if(!confirm(`Bæta við ${add.length} skráningum? (${incoming.length-add.length} eru þegar til)`)) return;
      entries = entries.concat(add); saveEntries();
      if(d.customTags){                                     // sameina eigin merki
        meta.customTags = meta.customTags || {};
        Object.keys(d.customTags).forEach(g0=>{
          const g = g0==='gera' ? 'tema' : g0;
          meta.customTags[g] = Array.from(new Set((meta.customTags[g]||[]).concat(arr(d.customTags[g0]))));
        });
        saveMeta();
      }
      if(d.hiddenTags){                                     // falin merki
        meta.hiddenTags = meta.hiddenTags || {};
        Object.keys(d.hiddenTags).forEach(g=>{ meta.hiddenTags[g] = Array.from(new Set((meta.hiddenTags[g]||[]).concat(arr(d.hiddenTags[g])))); });
        saveMeta();
      }
      toast('Innlestri lokið'); render();
    }catch(e){ toast('Skráin er ekki gilt afrit'); }
  };
  r.readAsText(file);
}
