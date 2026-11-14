'use strict';
const KEY='marpet-druck-readings-v1';
const $=s=>document.querySelector(s);
let screen=$('#screen');
const homeScreen=$('#screen'),sheet=$('#sheet'),sheetContent=$('#sheet-content'),sheetHandle=$('#sheet-handle');
let page='home', days=30;
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(validRecord).sort((a,b)=>b.time-a.time):[]}catch{return []}}
function validRecord(r){return r&&Number.isFinite(r.time)&&Number.isInteger(r.sys)&&r.sys>=60&&r.sys<=260&&Number.isInteger(r.dia)&&r.dia>=30&&r.dia<=160&&Number.isInteger(r.pulse)&&r.pulse>=30&&r.pulse<=220&&typeof r.sport==='boolean'&&typeof r.note==='string'}
function persist(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch{alert('Speichern fehlgeschlagen. Bitte freien Speicher prüfen und ein Backup anlegen.');return false}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmt(t){return new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short'}).format(t)}
function tile(color,title,value,detail,action,full=false){return `<button class="tile ${color} ${full?'full':'half'}" data-go="${action}"><span class="heading">${title}</span><span class="number ${full?'':'small-number'}">${value}</span><span class="detail">${detail}</span></button>`}
function closeSheet(){
  page='home';sheet.classList.add('hidden');sheet.style.transform='';sheet.style.transition='';
  homeScreen.removeAttribute('aria-hidden');homeScreen.inert=false;
  document.body.classList.remove('sheet-open');screen=homeScreen;
  renderHome();bindNavigation();
}
function bindNavigation(){screen.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>go(el.dataset.go))}
function go(next){
  if(next==='home'){closeSheet();return}
  page=next;screen=sheetContent;sheetContent.scrollTop=0;
  const bottom=$('header').getBoundingClientRect().bottom;
  sheet.style.top=`${Math.ceil(bottom+6)}px`;
  sheet.style.transform='';sheet.style.transition='';
  sheet.classList.remove('hidden');homeScreen.setAttribute('aria-hidden','true');homeScreen.inert=true;
  document.body.classList.add('sheet-open');render();
}
function render(){
  $('#top-action').onclick=()=>go('new');$('#logo').onclick=()=>closeSheet();
  $('#top-action').classList.remove('hidden');$('#back').classList.add('hidden');
  if(page==='home'){screen=homeScreen;renderHome()}
  if(page==='new')renderNew();if(page==='history')renderHistory();
  if(page==='list')renderList();if(page==='settings')renderSettings();
  bindNavigation();
}
let startY=null,dragging=false,suppressClick=false;
sheetHandle.addEventListener('pointerdown',e=>{startY=e.clientY;dragging=true;sheetHandle.setPointerCapture(e.pointerId);sheet.style.transition='none'});
sheetHandle.addEventListener('pointermove',e=>{if(!dragging)return;const d=Math.max(0,e.clientY-startY);sheet.style.transform=`translateY(${d}px)`});
sheetHandle.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const d=e.clientY-startY;if(d>85){suppressClick=true;closeSheet()}else if(d>12){suppressClick=true;sheet.style.transition='transform .2s ease';sheet.style.transform='translateY(0)'}});
sheetHandle.addEventListener('pointercancel',()=>{dragging=false;sheet.style.transform='translateY(0)'});
sheetHandle.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return}if(!dragging)closeSheet()});
sheetHandle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeSheet()}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&page!=='home')closeSheet()});
window.addEventListener('resize',()=>{if(page!=='home')sheet.style.top=`${Math.ceil($('header').getBoundingClientRect().bottom+6)}px`});
function renderHome(){const a=read(),cut=Date.now()-30*86400000,r=a.filter(x=>x.time>=cut),last=a[0],avg=k=>Math.round(r.reduce((s,x)=>s+x[k],0)/r.length);screen.innerHTML=`<div class="grid">${tile('rust','30-TAGE-DURCHSCHNITT',r.length?`${avg('sys')} / ${avg('dia')}`:'– / –',`mmHg · ${r.length} Messungen`,'history',true)}${tile('teal','LETZTE MESSUNG',last?`${last.sys}/${last.dia}`:'– / –',last?fmt(last.time):'Noch keine Messung','list')}${tile('turquoise','PULS',last?String(last.pulse):'–',last?'bpm · letzte Messung':'Noch kein Wert','list')}${tile('clay','VERLAUF','↗','7 · 30 · 90 Tage','history')}${tile('forest','ALLE MESSUNGEN',String(a.length),'Einträge ansehen','list')}</div><div style="margin-top:16px"><button class="secondary" data-go="settings" style="width:100%">⚙ BACKUP & EINSTELLUNGEN</button></div>`}
function renderNew(){screen.innerHTML=`<h1 class="page-title">NEUE MESSUNG</h1><form id="measure" class="panel form"><div class="photo-capture"><label class="photo-button" for="photo-input">📷 FOTO VOM MESSGERÄT</label><input id="photo-input" type="file" accept="image/*" capture="environment" aria-label="Blutdruckmessgerät fotografieren"><p class="hint">Display möglichst gerade und ohne Spiegelung fotografieren. Erkennung benötigt beim ersten Mal Internet.</p><p id="photo-status" class="photo-status" role="status" aria-live="polite"></p><details id="photo-details" class="hidden"><summary>Erkannten Text ansehen</summary><pre id="photo-text"></pre></details></div><div class="field"><label for="sys">Systolisch (mmHg)</label><input id="sys" type="number" inputmode="numeric" min="60" max="260" required></div><div class="field"><label for="dia">Diastolisch (mmHg)</label><input id="dia" type="number" inputmode="numeric" min="30" max="160" required></div><div class="field"><label for="pulse">Puls (bpm)</label><input id="pulse" type="number" inputmode="numeric" min="30" max="220" required></div><label class="row"><span>Heute Sport gemacht?</span><input id="sport" type="checkbox" style="width:22px;height:22px"></label><div class="field"><label for="note">Notiz (optional)</label><textarea id="note" rows="3" maxlength="1000"></textarea></div><button class="primary" type="submit">MESSUNG SPEICHERN</button></form>`;$('#photo-input').addEventListener('change',handlePhoto);$('#measure').onsubmit=e=>{e.preventDefault();const r={time:Date.now(),sys:Number($('#sys').value),dia:Number($('#dia').value),pulse:Number($('#pulse').value),sport:$('#sport').checked,note:$('#note').value};if(!validRecord(r)){alert('Bitte gültige Werte eingeben.');return}if(persist([r,...read()]))go('home')}}
function renderList(){const a=read();screen.innerHTML=`<h1 class="page-title">ALLE MESSUNGEN</h1>${a.length?a.map((r,i)=>`<div class="panel entry"><div><div class="muted">${fmt(r.time)}</div><strong>${r.sys}/${r.dia} mmHg</strong><div>Puls ${r.pulse} bpm</div>${r.sport?'<div class="muted">Sport am Messtag</div>':''}${r.note?`<p>${escapeHtml(r.note)}</p>`:''}</div><button class="danger" data-delete="${i}">Löschen</button></div>`).join(''):'<div class="empty">Noch keine Messungen gespeichert.</div>'}`;screen.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.delete);if(confirm('Diese Messung wirklich löschen?')){const copy=read();copy.splice(i,1);if(persist(copy))renderList()}})}
function renderHistory(){const a=read().filter(r=>r.time>=Date.now()-days*86400000).reverse();screen.innerHTML=`<h1 class="page-title">VERLAUF</h1><div class="chips">${[7,30,90].map(d=>`<button class="chip ${days===d?'selected':''}" data-days="${d}">${d} Tage</button>`).join('')}</div>${chartPanel('SYSTOLISCH',a,'sys',135,100,170,'rust')}${chartPanel('DIASTOLISCH',a,'dia',85,55,110,'teal')}<p class="hint">Die Referenzlinien (135/85 mmHg) beziehen sich auf den durchschnittlichen Heimblutdruck und dienen nicht zur Bewertung einzelner Messungen.</p>`;screen.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>{days=Number(b.dataset.days);renderHistory()});drawChart('sys',a,135,100,170);drawChart('dia',a,85,55,110)}
function chartPanel(title,a,key,threshold,min,max,color){return `<section class="tile ${color}" style="margin-bottom:14px"><div class="heading">${title}</div><canvas class="chart" id="chart-${key}" aria-label="Diagramm ${title}"></canvas><div class="detail">Referenzlinie: ${threshold} mmHg · ${a.length} Messungen</div></section>`}
function drawChart(key,a,threshold,min,max){const canvas=$('#chart-'+key),width=canvas.clientWidth,height=185,dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const c=canvas.getContext('2d');c.scale(dpr,dpr);const pad=12,y=v=>height-pad-(Math.max(min,Math.min(max,v))-min)/(max-min)*(height-2*pad);c.strokeStyle='#ffb0a0';c.lineWidth=2;c.beginPath();c.moveTo(pad,y(threshold));c.lineTo(width-pad,y(threshold));c.stroke();if(!a.length){c.fillStyle='#fff8e7';c.font='13px sans-serif';c.fillText('Noch keine Messungen',18,35);return}c.strokeStyle='#fff8e7';c.fillStyle='#fff8e7';c.lineWidth=3;c.beginPath();a.forEach((r,i)=>{const x=a.length===1?width/2:pad+i*(width-2*pad)/(a.length-1);if(i===0)c.moveTo(x,y(r[key]));else c.lineTo(x,y(r[key]))});c.stroke();a.forEach((r,i)=>{const x=a.length===1?width/2:pad+i*(width-2*pad)/(a.length-1);c.beginPath();c.arc(x,y(r[key]),3,0,Math.PI*2);c.fill()})}
function renderSettings(){screen.innerHTML=`<h1 class="page-title">BACKUP</h1><div class="panel backup"><p class="hint">Deine Werte bleiben ausschließlich in diesem Browser auf diesem Gerät. Löscht du Browserdaten oder wechselst du das Gerät, können sie verloren gehen. Sichere sie deshalb regelmäßig.</p><button class="primary" id="export">JSON-BACKUP HERUNTERLADEN</button><div class="field"><label for="import">JSON-BACKUP WIEDERHERSTELLEN</label><input id="import" type="file" accept=".json,application/json"></div><p class="muted">Import ersetzt alle aktuell gespeicherten Messungen. Bitte vorher ein Backup exportieren.</p></div>`;$('#export').onclick=()=>{const data=JSON.stringify({app:'druck.',version:1,exportedAt:new Date().toISOString(),readings:read()},null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='druck-backup-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(obj.app!=='druck.'||obj.version!==1||!Array.isArray(obj.readings)||!obj.readings.every(validRecord))throw Error('invalid');if(confirm(`Alle aktuellen Messungen durch ${obj.readings.length} Backup-Einträge ersetzen?`)){if(persist(obj.readings))go('home')}}catch{alert('Ungültige oder nicht unterstützte Backup-Datei.')}}}

// Foto-OCR: Bild wird lokal im Browser ausgewertet; keine Übermittlung an einen OCR-Dienst.
// Die Tesseract-Bibliothek und Sprachdatei werden beim ersten Einsatz aus dem Netz geladen.
let ocrLoader=null;
function loadOCR(){
  if(window.Tesseract)return Promise.resolve();
  if(ocrLoader)return ocrLoader;
  ocrLoader=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    script.onload=()=>window.Tesseract?resolve():reject(new Error('OCR-Bibliothek nicht verfügbar'));
    script.onerror=()=>reject(new Error('OCR-Bibliothek konnte nicht geladen werden'));
    document.head.appendChild(script);
  }).catch(err=>{ocrLoader=null;throw err});
  return ocrLoader;
}
function extractBP(text){
  const lines=text.toUpperCase().replace(/[|]/g,'1').split(/\n/).map(x=>x.trim()).filter(Boolean);
  const numbers=lines.flatMap(line=>(line.match(/\b\d{2,3}\b/g)||[]).map(Number));
  const pick=(rx,lo,hi)=>{
    for(let i=0;i<lines.length;i++){
      if(!rx.test(lines[i]))continue;
      const here=(lines[i].match(/\b\d{2,3}\b/g)||[]).map(Number).find(n=>n>=lo&&n<=hi);
      if(here!==undefined)return here;
      if(i+1<lines.length){const next=(lines[i+1].match(/\b\d{2,3}\b/g)||[]).map(Number).find(n=>n>=lo&&n<=hi);if(next!==undefined)return next;}
    }
    return null;
  };
  let sys=pick(/\bSYS\b|SYSTOL/,60,260),dia=pick(/\bDIA\b|DIASTOL/,30,160),pulse=pick(/\bPUL\b|PULSE|\bPR\b|\bBPM\b|♥|❤/,30,220);
  // Ohne eindeutige Beschriftung nur bei exakt drei plausiblen Zahlen in Display-Reihenfolge übernehmen.
  if(sys===null&&dia===null&&pulse===null&&numbers.length===3){
    const [a,b,c]=numbers;
    if(a>=60&&a<=260&&b>=30&&b<=160&&c>=30&&c<=220&&a>b){sys=a;dia=b;pulse=c;}
  }
  if(sys!==null&&dia!==null&&sys<=dia){sys=null;dia=null;}
  return {sys,dia,pulse};
}
async function handlePhoto(event){
  const file=event.target.files?.[0];if(!file)return;
  const status=$('#photo-status'),details=$('#photo-details');
  if(!status)return;
  status.textContent='Foto wird ausgewertet …';details.classList.add('hidden');
  let worker;
  try{
    await loadOCR();
    status.textContent='Texterkennung läuft … (beim ersten Mal kann es länger dauern)';
    worker=await window.Tesseract.createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text'&&document.contains(status))status.textContent=`Texterkennung: ${Math.round((m.progress||0)*100)} %`;}});
    const result=await worker.recognize(file);
    if(!document.contains(status))return;
    const raw=result.data.text||'';
    $('#photo-text').textContent=raw||'(kein Text erkannt)';details.classList.remove('hidden');
    const values=extractBP(raw);let filled=0;
    for(const key of ['sys','dia','pulse'])if(values[key]!==null){$('#'+key).value=String(values[key]);filled++;}
    status.textContent=filled===3?'3 Werte erkannt. Bitte alle Zahlen am Gerät vergleichen und erst dann speichern.':`${filled} von 3 Werten erkannt. Bitte fehlende oder falsche Zahlen selbst eintragen und alle Werte prüfen.`;
  }catch(err){if(document.contains(status))status.textContent='Fotoerkennung nicht verfügbar. Bitte Internetverbindung prüfen oder Werte manuell eingeben.';console.warn('OCR:',err);}
  finally{if(worker)await worker.terminate().catch(()=>{});event.target.value='';}
}

render();if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
