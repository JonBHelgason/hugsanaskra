/* =====================================================================
   FORM.JS – skráningin (4 dálkar), gluggar, tilfinningahringur, aðgerðir og ræsing
   Skipulag: 1 Staða · 2 Skráning (yfirlit og dálkar) · 3 Gluggar · 4 Merki · 5 Tilfinningar
             6 Aðgerðir og atburðir · 7 Ræsing
   ===================================================================== */

/* ---------- 1. STAÐA ---------- */
const COLS = ['Aðstæður','Tilfinning','Hugsun','Endurmat'];
let rec = null;            // skráningin sem er í vinnslu (sama hlut og í entries)
let fmode = 'overview';    // overview | pager
let colIdx = 0;            // opinn dálkur
let sheets = [];           // staflinn af gluggum: {type:'sit'|'emo'|'thought'|'card'|'errors'|'rate', i}
let tagEdit = false;       // merki: eyða eigin merkjum
let searchQ = '';          // leit í tilfinningaorðum
let wmode = 'wheel';       // wheel | quad
let wBase = null, wMid = null;   // hringur: valin grunntilfinning og undirflokkur
let openQuad = null;       // skap-mælir: opinn reitur
let fromDetail = false;    // komum úr opinni skráningu
let rateTouched = false;

/* Vista sjálfkrafa. Tóm skráning er ekki geymd. */
function touch(){
  if(hasContent(rec)){ if(!entries.includes(rec)) entries.push(rec); }
  else { const i = entries.indexOf(rec); if(i>=0) entries.splice(i,1); }
  saveEntries();
}

/* ---------- 2. SKRÁNING ---------- */
function startForm(r, detail){
  rec = r; fmode = 'overview'; colIdx = 0; sheets = []; fromDetail = !!detail;
  tagEdit = false; searchQ = ''; wBase = wMid = openQuad = null;
  go('form');
}
function leaveForm(){
  if(rec && !hasContent(rec)){ const i = entries.indexOf(rec); if(i>=0) entries.splice(i,1); saveEntries(); }
  else if(rec && isDraft(rec)) toast('Vistað sem drög');
  sheets = [];
  const keep = rec && entries.includes(rec);
  const id = rec && rec.id; rec = null;
  if(fromDetail && keep) go('detail', id); else go('home');
}
function renderForm(){
  $('app').hidden = true; $('nav').hidden = true; $('form').hidden = false;
  if(fmode==='overview'){
    $('form').innerHTML = overviewHTML();
  } else {
    $('form').innerHTML = `
      <div class="fbar"><button data-a="toOverview" aria-label="Til baka">‹</button><b id="ptitle">${COLS[colIdx]}</b></div>
      <div id="pager"></div>
      <div class="dots" id="dots"></div>`;
    fillPager();
  }
  renderSheet();
}

function colSummary(i){
  if(i===0){ const t = rec.situations.map(s=>s.title).filter(Boolean).join(' · '); return t || 'Ekkert skráð enn'; }
  if(i===1) return rec.emotions.length ? rec.emotions.map(x=>`${x.w} ${x.s}`).join(', ') : 'Ekkert skráð enn';
  if(i===2){ const t = rec.thoughts.filter(t=>t.text.trim()); return t.length ? snip(t[0].text,50)+(t.length>1?` (+${t.length-1})`:'') : 'Ekkert skráð enn'; }
  if(!hasMin(rec)) return 'Læst – vantar lágmark';
  const n = rec.thoughts.filter(t=>t.text.trim()&&thoughtWorked(t)).length;
  return n ? `${n} hugsun${n===1?'':'ir'} unnin${n===1?'':'ar'}` : 'Veldu hugsun til að vinna með';
}
function overviewHTML(){
  const lock = !hasMin(rec);
  return `<div class="fbar"><button data-a="formBack" aria-label="Til baka">‹</button><b>${entries.includes(rec)?'Skráning':'Ný skráning'}</b></div>
    <div class="sbody">
      ${isDraft(rec) ? '<p class="muted" style="margin:4px 0 6px">Drög. Vistast sjálfkrafa. Endurmat opnast þegar lágmarki er náð.</p>' : ''}
      ${COLS.map((c,i)=>`<button class="card ocard${i===3&&lock?' locked':''}" data-a="openCol" data-i="${i}">
        <span class="num">${i===3&&lock?'🔒':i+1}</span>
        <span class="otxt"><b>${c}</b><span class="small">${esc(colSummary(i))}</span></span></button>`).join('')}
      <label for="rtime">Dagsetning og tími</label>
      <input type="datetime-local" id="rtime" data-k="time" value="${esc(rec.time)}">
      <button class="big danger" data-a="delForm" style="margin-top:20px">Eyða skráningu</button>
    </div>`;
}

/* ----- dálkarnir (strjúka á milli) ----- */
function fillPager(){
  const p = $('pager');
  p.innerHTML = COLS.map(()=>'<div class="col"></div>').join('');
  renderAllCols();
  p.scrollLeft = colIdx * p.clientWidth;
  p.addEventListener('scroll', onPagerScroll);
  setDots();
}
function renderCol(i){ const p = $('pager'); if(p && p.children[i]) p.children[i].innerHTML = [colSit,colEmo,colTh,colRe][i](); }
function renderAllCols(){ if(fmode==='pager' && $('pager')){ for(let i=0;i<4;i++) renderCol(i); setDots(); } }
function setDots(){
  const d = $('dots'); if(!d) return;
  d.innerHTML = COLS.map((c,i)=>`<button data-a="dot" data-i="${i}" aria-label="${c}" class="${i===colIdx?'on':''}${i===3&&!hasMin(rec)?' lk':''}"></button>`).join('');
  const t = $('ptitle'); if(t) t.textContent = COLS[colIdx];
}
function scrollToCol(i, smooth){
  const p = $('pager'); if(p) p.scrollTo({left:i*p.clientWidth, behavior: smooth?'smooth':'auto'});
}
let pagerTimer;
function onPagerScroll(){
  clearTimeout(pagerTimer);
  pagerTimer = setTimeout(()=>{
    const p = $('pager'); if(!p) return;
    const i = Math.round(p.scrollLeft / p.clientWidth);
    if(i===3 && !hasMin(rec)){ colIdx = 2; scrollToCol(2, true); setDots(); lockMsg(); return; }
    colIdx = i; setDots();
  }, 120);
}
function lockMsg(){
  modal(`<h3>Endurmat er læst</h3><p style="margin:0">Til að opna Endurmat vantar:</p>
    <ul>${missingList(rec).map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`,
    '<button class="big primary" data-a="closeModal">Í lagi</button>');
}
function openCol(i){
  if(i===3 && !hasMin(rec)) return lockMsg();
  fmode = 'pager'; colIdx = i; renderForm();
}

const tagLine = s => ['tema','folk','stadur'].flatMap(g=>s.tags[g]).join(', ');
function colSit(){
  return `<p class="expl">${TXT.col1}</p>
    ${rec.situations.map((s,i)=>`<div class="card tap" data-a="editSit" data-i="${i}">
      <b>${esc(s.title||'(án titils)')}</b>${s.desc?`<div class="muted">${esc(snip(s.desc,120))}</div>`:''}
      ${tagLine(s)?`<div class="small">${esc(tagLine(s))}</div>`:''}</div>`).join('')}
    <button class="plusbtn" data-a="addSit" aria-label="Bæta við aðstæðum">+</button>`;
}
function colEmo(){
  return `<p class="expl">${TXT.col2}</p>
    ${rec.emotions.map((x,i)=>`<div class="sel tap" style="--c:${colorOf(x.w)}" data-a="editEmo"><div class="row"><b>${esc(x.w)}</b><span class="val">${x.s}</span></div></div>`).join('')}
    <button class="plusbtn" data-a="editEmo" aria-label="Bæta við tilfinningu">+</button>`;
}
function colTh(){
  return `<p class="expl">${TXT.col3}</p>
    ${rec.thoughts.map((t,i)=>`<div class="card tap" data-a="editTh" data-i="${i}">${t.text.trim()?esc(snip(t.text,140)):'<span class="muted">(tóm hugsun)</span>'}</div>`).join('')}
    <button class="plusbtn" data-a="addTh" aria-label="Bæta við hugsun">+</button>`;
}
function colRe(){
  if(!hasMin(rec)) return `<div class="lockbox"><div style="font-size:40px">🔒</div><p>Endurmat opnast þegar þú hefur fyllt út:</p>
    <ul>${missingList(rec).map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>`;
  const rate = rec.emotions.length ? `<div class="card tap" data-a="openRate"><b>Meta líðan aftur</b><div class="small">${
    rec.emotions.map(x=>`${esc(x.w)}: ${x.s}${x.s2!==null?' → '+x.s2:''}`).join(' · ')}</div></div>` : '';
  const cards = rec.thoughts.map((t,i)=>{
    if(!t.text.trim()) return '';
    const sub = [t.belief1!==null?`Trú ${t.belief1}%${t.belief2!==null?' → '+t.belief2+'%':''}`:'', t.errors.length?`${t.errors.length} hugsunarvillur`:''].filter(Boolean).join(' · ');
    return `<div class="card tap" data-a="editCard" data-i="${i}"><b>${esc(snip(t.text,120))}</b>${sub?`<div class="small">${sub}</div>`:''}</div>`;
  }).join('');
  return `<p class="expl">${TXT.col4}</p>${cards}${rate}`;
}

/* ---------- 3. GLUGGAR (ofan á skráningu) ---------- */
function openSheet(o){ sheets.push(o); renderSheet(false); }
function closeSheet(){
  const o = sheets.pop();
  if(o){
    if(o.type==='sit'){
      const s = rec.situations[o.i];
      if(s && !s.title.trim() && !s.desc.trim() && !tagLine(s)) rec.situations.splice(o.i,1);
    }
    if(o.type==='thought'){
      const t = rec.thoughts[o.i];
      if(t && !t.text.trim()) rec.thoughts.splice(o.i,1);
    }
    if(o.type==='rate' && rateTouched){ rec.emotions.forEach(x=>{ if(x.s2===null) x.s2 = x.s; }); }
    touch();
  }
  renderSheet(false);
  if(!sheets.length){ renderAllCols(); checkUnlock(); }
}
function checkUnlock(){
  if(fmode==='pager' && hasMin(rec) && !rec.unlockShown){
    rec.unlockShown = true; touch();
    modal('<h3>Endurmat er núna aðgengilegt</h3><p style="margin:0">Þú hefur náð lágmarkinu. Þú getur haldið áfram hér eða farið í Endurmat.</p>',
      '<button class="big primary" data-a="goRe">Fara í Endurmat</button><button class="big" data-a="closeModal">Halda áfram hér</button>');
    setDots();
  }
}
const foot = (extra) => `<div class="sfoot">${extra||''}<button class="big primary" data-a="closeSheet">Lokið</button></div>`;
const fbar = title => `<div class="fbar"><button data-a="closeSheet" aria-label="Til baka">‹</button><b>${title}</b></div>`;

function renderSheet(keepScroll){
  const el = $('sheet');
  if(!sheets.length || !rec){ el.hidden = true; el.innerHTML = ''; return; }
  const old = el.querySelector('.sbody'), st = (keepScroll && old) ? old.scrollTop : 0;
  const o = sheets[sheets.length-1];
  el.innerHTML = {sit:sheetSit, emo:sheetEmo, thought:sheetThought, card:sheetCard, errors:sheetErrors, rate:sheetRate}[o.type](o);
  el.hidden = false;
  const nb = el.querySelector('.sbody'); if(nb) nb.scrollTop = st;
  if(o.type==='emo' && wmode==='wheel') drawStage();
}

function sheetSit(o){
  const s = rec.situations[o.i];
  return `${fbar('Aðstæður')}<div class="sbody">
    <label for="stitle">Titill</label><input type="text" id="stitle" data-k="sit-title" data-i="${o.i}" value="${esc(s.title)}" placeholder="t.d. Fundur í vinnunni">
    <label for="sdesc">Lýsing</label><textarea id="sdesc" data-k="sit-desc" data-i="${o.i}" placeholder="Hvar varstu, hvenær og hvað gerðist?">${esc(s.desc)}</textarea>
    ${tagBoxHTML(s)}
  </div>${foot(`<button class="big danger" data-a="delSit">Eyða aðstæðum</button>`)}`;
}
function sheetThought(o){
  const t = rec.thoughts[o.i];
  return `${fbar('Hugsun')}<div class="sbody">
    <label for="ttext">Hvað hugsaðir þú?</label>
    <textarea id="ttext" data-k="th-text" data-i="${o.i}" style="min-height:140px">${esc(t.text)}</textarea>
  </div>${foot(`<button class="big danger" data-a="delTh">Eyða hugsun</button>`)}`;
}
const beliefRow = (k,i,v) => `<div class="beliefrow"><input type="range" min="0" max="100" step="5" value="${v===null?50:v}" data-k="${k}" data-i="${i}"><span class="val" id="${k}v">${v===null?'–':v+'%'}</span></div>`;
function sheetCard(o){
  const t = rec.thoughts[o.i];
  return `${fbar('Endurmat')}<div class="sbody">
    <div class="card"><b>${esc(t.text)}</b></div>
    <label>Hversu mikið trúir þú þessari hugsun? <small>(0–100%)</small></label>${beliefRow('b1',o.i,t.belief1)}
    <label>Hugsunarvillur</label>
    ${t.errors.length?`<div class="chips" style="margin-bottom:8px">${t.errors.map(e=>`<span class="chip on" style="--c:var(--accent)">${esc(e)}</span>`).join('')}</div>`:''}
    <button class="big" data-a="openErr">${t.errors.length?'Breyta hugsunarvillum':'Velja hugsunarvillur'}</button>
    <label for="q1">${TXT.q1}</label><textarea id="q1" data-k="q1" data-i="${o.i}">${esc(t.q1)}</textarea>
    <label for="q2">${TXT.q2}</label><textarea id="q2" data-k="q2" data-i="${o.i}">${esc(t.q2)}</textarea>
    <label>Hversu mikið trúir þú hugsuninni núna? <small>(0–100%)</small></label>${beliefRow('b2',o.i,t.belief2)}
  </div>${foot()}`;
}
function sheetErrors(){
  const t = rec.thoughts[sheets[sheets.length-2].i];
  return `${fbar('Hugsunarvillur')}<div class="sbody">
    <p class="expl">Veldu þær hugsunarvillur sem eiga við.</p>
    ${ERRORS.map(e=>`<button class="erow${t.errors.includes(e.n)?' on':''}" data-a="toggleErr" data-n="${esc(e.n)}">
      <span class="ck"></span><span><span class="t"><b>${esc(e.n)}</b></span><span class="d">${esc(e.d)}</span><span class="ex">${e.e}</span></span></button>`).join('')}
  </div><div class="sfoot"><button class="big primary" data-a="closeSheet">Velja</button></div>`;
}
function sheetRate(){
  return `${fbar('Meta líðan aftur')}<div class="sbody">
    <p class="expl">Hversu sterk er hver tilfinning núna? (1–10)</p>
    ${rec.emotions.map((x,i)=>{ const v = x.s2===null ? x.s : x.s2;
      return `<div class="sel" style="--c:${colorOf(x.w)}"><div class="row"><b>${esc(x.w)}</b><span class="small">var ${x.s}</span><span class="val" id="rv${i}">${v}</span></div>
      <input type="range" min="1" max="10" step="1" value="${v}" data-k="rate" data-i="${i}"></div>`; }).join('')}
  </div>${foot()}`;
}

/* ---------- 4. MERKI ---------- */
const allTags = g => {
  const base = TAG_GROUPS.find(x=>x.id===g).items;
  return base.concat(((meta.customTags||{})[g]||[]).filter(t=>!base.includes(t)));
};
function tagBoxHTML(s){
  return TAG_GROUPS.map(g=>`<label>${g.title}</label><div class="chips">
    ${allTags(g.id).map(t=>{
      const custom = !g.items.includes(t), on = s.tags[g.id].includes(t);
      return tagEdit && custom
        ? `<button class="chip" style="--c:var(--danger)" data-a="tagDel" data-g="${g.id}" data-t="${esc(t)}">${esc(t)} ✕</button>`
        : `<button class="chip${on?' on':''}" style="--c:var(--accent)" data-a="tag" data-g="${g.id}" data-t="${esc(t)}">${esc(t)}</button>`;
    }).join('')}
    <button class="chip" style="--c:var(--muted)" data-a="tagAdd" data-g="${g.id}" aria-label="Nýtt merki">+</button></div>`).join('')
    + `<button class="linkbtn" data-a="tagEdit">${tagEdit?'Búið':'Eyða eigin merkjum'}</button>`;
}

/* ---------- 5. TILFINNINGAR ---------- */
const norm = s => String(s).toLowerCase().replace(/ð/g,'d').replace(/þ/g,'th').replace(/æ/g,'ae')
  .normalize('NFD').replace(/[̀-ͯ]/g,'');
const ALL_WORDS = (()=>{ const set = new Set();
  WHEEL.forEach(b=>{ set.add(b.name); b.mids.forEach(m=>{ set.add(m.name); m.words.forEach(w=>set.add(w)); }); });
  QUADS.forEach(q=>q.words.forEach(w=>set.add(w)));
  return Array.from(set).sort((a,b)=>a.localeCompare(b,'is')); })();
const picked = w => rec.emotions.some(x=>x.w===w);
function togglePick(w){
  const i = rec.emotions.findIndex(x=>x.w===w);
  if(i>=0) rec.emotions.splice(i,1); else rec.emotions.push({w, s:5, s2:null});
  touch(); renderSheet(true);
}
const wordChip = w => `<button class="chip${picked(w)?' on':''}" style="--c:${colorOf(w)}" data-a="pick" data-w="${esc(w)}">${esc(w)}</button>`;
function searchHTML(){
  const q = norm(searchQ.trim());
  if(!q) return '';
  const res = ALL_WORDS.filter(w=>norm(w).includes(q)).slice(0,24);
  return res.length ? res.map(wordChip).join('') : '<span class="muted">Ekkert fannst. Notaðu „Eigið orð“.</span>';
}
function sheetEmo(){
  const sel = rec.emotions.map((x,i)=>`<div class="sel" style="--c:${colorOf(x.w)}"><div class="row"><b>${esc(x.w)}</b>
    <span class="val" id="ev${i}">${x.s}</span><button data-a="rmEmo" data-i="${i}" aria-label="Fjarlægja">✕</button></div>
    <input type="range" min="1" max="10" step="1" value="${x.s}" data-k="emo" data-i="${i}"></div>`).join('');
  return `${fbar('Tilfinning')}<div class="sbody">
    ${sel ? `<h2 style="margin-top:6px">Valið (styrkur 1–10)</h2>${sel}` : '<p class="expl">Veldu tilfinningu og metið styrk hennar.</p>'}
    <div class="seg wmode" style="margin-top:14px">
      <button class="${wmode==='wheel'?'on':''}" data-a="wmode" data-m="wheel">Hringur</button>
      <button class="${wmode==='quad'?'on':''}" data-a="wmode" data-m="quad">Skap-mælir</button></div>
    <input type="text" class="search" id="searchbox" data-k="search" placeholder="Leita að orði" value="${esc(searchQ)}">
    <div class="words" id="sres">${searchHTML()}</div>
    ${wmode==='wheel' ? '<div id="stage"></div>' : quadsHTML()}
    <div class="free"><input type="text" id="fw" placeholder="Eigið orð"><button data-a="addFree">Bæta við</button></div>
  </div>${foot()}`;
}
function quadsHTML(){
  const q = QUADS.find(x=>x.id===openQuad);
  return `<div class="quads">${QUADS.map(x=>`<button class="quad${x.id===openQuad?' open':''}" style="--c:${x.color}" data-a="quad" data-id="${x.id}">${x.title}<small>${x.sub}</small></button>`).join('')}</div>
    ${q ? `<div class="words">${q.words.map(wordChip).join('')}</div>` : '<p class="muted">Veldu reit.</p>'}`;
}

/* Hringurinn: grunntilfinning > undirflokkur > orð. Hnútar eru ýttir í sundur svo þeir skarist ekki. */
function stageData(){
  if(!wBase) return {hub:{t:'Veldu hóp'}, items:WHEEL.map(b=>({t:b.name,c:b.color,cls:'base',a:'wBase',v:b.name}))};
  const b = WHEEL.find(x=>x.name===wBase);
  if(!wMid) return {hub:{t:'‹ Til baka',c:b.color,a:'wBack'},
    items:[{t:b.name,c:b.color,cls:'base',a:'pick',v:b.name,on:picked(b.name)}]
      .concat(b.mids.map(m=>({t:m.name,c:b.color,cls:'mid',a:'wMid',v:m.name,on:picked(m.name)})))};
  const m = b.mids.find(x=>x.name===wMid);
  return {hub:{t:'‹ '+b.name,c:b.color,a:'wBack'},
    items:[{t:m.name,c:b.color,cls:'mid',a:'pick',v:m.name,on:picked(m.name)}]
      .concat(m.words.map(w=>({t:w,c:b.color,cls:'',a:'pick',v:w,on:picked(w)})))};
}
function drawStage(){
  const st = $('stage'); if(!st) return;
  const d = stageData(), n = d.items.length;
  const W = st.clientWidth || 340, H = n<=7 ? 340 : 340 + (n-7)*36;
  st.style.height = H+'px';
  st.innerHTML = '<svg width="'+W+'" height="'+H+'"></svg>'
    + (d.hub.a ? `<button class="hub" style="left:${W/2}px;top:${H/2}px;--c:${d.hub.c}" data-a="${d.hub.a}">${esc(d.hub.t)}</button>`
               : `<div class="hub hint" style="left:${W/2}px;top:${H/2}px">${esc(d.hub.t)}</div>`)
    + d.items.map(it=>`<button class="node ${it.cls}${it.on?' on':''}" style="--c:${it.c};left:${W/2}px;top:${H/2}px" data-a="${it.a}" data-w="${esc(it.v||'')}" data-v="${esc(it.v||'')}">${esc(it.t)}</button>`).join('');
  const nodes = Array.from(st.querySelectorAll('.node'));
  const pts = nodes.map((nd,k)=>{
    const a = -Math.PI/2 + 2*Math.PI*k/n;
    return {w:nd.offsetWidth, x:W/2 + (W/2-70)*Math.cos(a), y:H/2 + (H/2-40)*Math.sin(a)};
  });
  const hubBox = {x:W/2, y:H/2, w:96};
  for(let it=0; it<80; it++){
    for(let i=0;i<n;i++){
      for(let j=i+1;j<n;j++){
        const dx = pts[j].x-pts[i].x, dy = pts[j].y-pts[i].y;
        const ox = (pts[i].w+pts[j].w)/2 + 8 - Math.abs(dx), oy = 54 - Math.abs(dy);
        if(ox>0 && oy>0){
          if(oy<=ox){ const s = (dy>=0?1:-1)*oy/2; pts[i].y -= s; pts[j].y += s; }
          else      { const s = (dx>=0?1:-1)*ox/2; pts[i].x -= s; pts[j].x += s; }
        }
      }
      const dx = pts[i].x-hubBox.x, dy = pts[i].y-hubBox.y;
      const ox = (pts[i].w+hubBox.w)/2 + 4 - Math.abs(dx), oy = 66 - Math.abs(dy);
      if(ox>0 && oy>0){ if(oy<=ox) pts[i].y += (dy>=0?1:-1)*oy; else pts[i].x += (dx>=0?1:-1)*ox; }
    }
    pts.forEach(p=>{ p.x = Math.min(W-p.w/2-4, Math.max(p.w/2+4, p.x)); p.y = Math.min(H-28, Math.max(28, p.y)); });
  }
  const svg = st.querySelector('svg');
  svg.innerHTML = pts.map((p,k)=>`<line x1="${W/2}" y1="${H/2}" x2="${p.x}" y2="${p.y}" stroke="${d.items[k].c||'#888'}"/>`).join('');
  nodes.forEach((nd,k)=>{ nd.style.left = pts[k].x+'px'; nd.style.top = pts[k].y+'px'; });
  requestAnimationFrame(()=>requestAnimationFrame(()=>nodes.forEach(nd=>nd.classList.add('show'))));
}

/* ---------- 6. AÐGERÐIR OG ATBURÐIR ---------- */
const newSit = () => ({id:newId(), title:'', desc:'', tags:{tema:[], folk:[], stadur:[]}});
const nowFor = key => key===dateOnly(new Date()) ? toLocalInput(new Date()) : key+'T12:00';

const actions = {
  /* leiðsögn og forsíða */
  nav: el => go(el.dataset.v),
  open: el => go('detail', el.dataset.id),
  newRec: () => startForm(newRec()),
  editRec: el => startForm(entries.find(x=>x.id===el.dataset.id), true),
  delRec: el => { if(confirm('Eyða þessari skráningu?')){ entries = entries.filter(x=>x.id!==el.dataset.id); saveEntries(); go('home'); } },
  day: el => {
    const key = el.dataset.d;
    if(key > dateOnly(new Date())) return toast('Þessi dagur er ekki kominn');
    const es = dayEntries(key);
    if(el.dataset.new || !es.length) return startForm(newRec(nowFor(key)));
    if(es.length===1) return go('detail', es[0].id);
    calMonth = new Date(+key.slice(0,4), +key.slice(5,7)-1, 1); calSel = key; go('cal');
  },
  calDay: el => { calSel = calSel===el.dataset.d ? null : el.dataset.d; render(); },
  calNav: el => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth()+(+el.dataset.d), 1); calSel = null; render(); },
  exportTxt, backup,
  importPick: () => $('importFile').click(),
  closeModal,

  /* skráning */
  formBack: leaveForm,
  toOverview: () => { fmode = 'overview'; sheets = []; renderForm(); },
  openCol: el => openCol(+el.dataset.i),
  goRe: () => { closeModal(); colIdx = 3; renderForm(); },
  dot: el => { const i = +el.dataset.i; if(i===3 && !hasMin(rec)) return lockMsg(); colIdx = i; scrollToCol(i,true); setDots(); },
  delForm: () => { if(confirm('Eyða þessari skráningu?')){ const i = entries.indexOf(rec); if(i>=0) entries.splice(i,1); saveEntries(); rec = null; fromDetail = false; go('home'); } },

  /* gluggar */
  closeSheet,
  addSit: () => { rec.situations.push(newSit()); openSheet({type:'sit', i:rec.situations.length-1}); },
  editSit: el => openSheet({type:'sit', i:+el.dataset.i}),
  delSit: () => { const o = sheets.pop(); rec.situations.splice(o.i,1); touch(); renderSheet(false); renderAllCols(); },
  addTh: () => { rec.thoughts.push({id:newId(), text:'', belief1:null, errors:[], q1:'', q2:'', belief2:null}); openSheet({type:'thought', i:rec.thoughts.length-1}); },
  editTh: el => openSheet({type:'thought', i:+el.dataset.i}),
  delTh: () => { const o = sheets.pop(); rec.thoughts.splice(o.i,1); touch(); renderSheet(false); renderAllCols(); },
  editEmo: () => openSheet({type:'emo'}),
  editCard: el => openSheet({type:'card', i:+el.dataset.i}),
  openErr: () => openSheet({type:'errors'}),
  toggleErr: el => {
    const t = rec.thoughts[sheets[sheets.length-2].i], n = el.dataset.n, k = t.errors.indexOf(n);
    if(k>=0) t.errors.splice(k,1); else t.errors.push(n);
    touch(); renderSheet(true);
  },
  openRate: () => { rateTouched = false; openSheet({type:'rate'}); },

  /* merki */
  tag: el => {
    const s = rec.situations[sheets[sheets.length-1].i], a = s.tags[el.dataset.g], k = a.indexOf(el.dataset.t);
    if(k>=0) a.splice(k,1); else a.push(el.dataset.t);
    touch(); renderSheet(true);
  },
  tagAdd: el => {
    const t = (prompt('Nýtt merki:')||'').trim(); if(!t) return;
    const g = el.dataset.g; meta.customTags = meta.customTags || {};
    meta.customTags[g] = meta.customTags[g] || [];
    if(!allTags(g).includes(t)) meta.customTags[g].push(t);
    const a = rec.situations[sheets[sheets.length-1].i].tags[g]; if(!a.includes(t)) a.push(t);
    saveMeta(); touch(); renderSheet(true);
  },
  tagDel: el => {
    const g = el.dataset.g, t = el.dataset.t;
    if(!confirm(`Eyða merkinu „${t}“?`)) return;
    meta.customTags[g] = (meta.customTags[g]||[]).filter(x=>x!==t); saveMeta();
    rec.situations.forEach(s=>{ s.tags[g] = s.tags[g].filter(x=>x!==t); });
    touch(); renderSheet(true);
  },
  tagEdit: () => { tagEdit = !tagEdit; renderSheet(true); },

  /* tilfinningar */
  pick: el => togglePick(el.dataset.w),
  rmEmo: el => { rec.emotions.splice(+el.dataset.i,1); touch(); renderSheet(true); },
  addFree: () => { const w = $('fw').value.trim(); if(w && !picked(w)){ rec.emotions.push({w, s:5, s2:null}); touch(); renderSheet(true); } },
  wmode: el => { wmode = el.dataset.m; renderSheet(true); },
  quad: el => { openQuad = openQuad===el.dataset.id ? null : el.dataset.id; renderSheet(true); },
  wBase: el => { wBase = el.dataset.v; wMid = null; drawStage(); },
  wMid: el => { wMid = el.dataset.v; drawStage(); },
  wBack: () => { if(wMid) wMid = null; else wBase = null; drawStage(); }
};

document.addEventListener('click', e=>{
  const el = e.target.closest('[data-a]'); if(!el) return;
  const f = actions[el.dataset.a]; if(f) f(el);
});

document.addEventListener('input', e=>{
  const el = e.target, k = el.dataset.k; if(!k || !rec && k!=='search') return;
  const i = +el.dataset.i, v = el.value;
  if(k==='sit-title'){ rec.situations[i].title = v; touch(); }
  else if(k==='sit-desc'){ rec.situations[i].desc = v; touch(); }
  else if(k==='th-text'){ rec.thoughts[i].text = v; touch(); }
  else if(k==='q1'){ rec.thoughts[i].q1 = v; touch(); }
  else if(k==='q2'){ rec.thoughts[i].q2 = v; touch(); }
  else if(k==='b1' || k==='b2'){ rec.thoughts[i][k==='b1'?'belief1':'belief2'] = +v; $(k+'v').textContent = v+'%'; touch(); }
  else if(k==='emo'){ rec.emotions[i].s = +v; $('ev'+i).textContent = v; touch(); }
  else if(k==='rate'){ rec.emotions[i].s2 = +v; rateTouched = true; $('rv'+i).textContent = v; touch(); }
  else if(k==='search'){ searchQ = v; $('sres').innerHTML = searchHTML(); }
});
/* Sleði sem er ekki búinn að fá gildi: snerting án hreyfingar setur gildið (50) */
document.addEventListener('pointerup', e=>{
  const el = e.target, k = el.dataset && el.dataset.k;
  if(rec && (k==='b1'||k==='b2')){
    const t = rec.thoughts[+el.dataset.i], f = k==='b1'?'belief1':'belief2';
    if(t[f]===null){ t[f] = +el.value; $(k+'v').textContent = el.value+'%'; touch(); }
  }
});
document.addEventListener('change', e=>{
  const el = e.target;
  if(el.dataset.k==='time' && rec && el.value){ rec.time = el.value; touch(); }
  if(el.dataset.change==='statsDays'){ statsDays = +el.value; render(); }
});
$('importFile').addEventListener('change', e=>{
  const f = e.target.files[0]; if(f) importData(f); e.target.value = '';
});
window.addEventListener('resize', ()=>{
  const o = sheets[sheets.length-1];
  if(o && o.type==='emo' && wmode==='wheel') drawStage();
  if(fmode==='pager' && view==='form' && $('pager')) $('pager').scrollLeft = colIdx*$('pager').clientWidth;
});

/* ---------- 7. RÆSING ---------- */
render();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
