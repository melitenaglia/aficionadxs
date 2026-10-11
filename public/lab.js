const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const COLOR_CACHE_KEY="afcndxs-lab-colors-v2";
const THEMES={"nature":["001","002","008","013","014","015","025","029","036","039","053","054","055","058","059","061","072","073","074"],"architecture":["003","004","005","007","010","012","016","017","018","020","021","022","024","025","026","028","030","031","032","033","034","035","038","040","041","042","043","044","045","047","048","049","051","052","056","057","060","063","064","067","069","070","071","074","075","076"],"objects":["006","009","011","019","027","037","046","050","054","062","065","068"]};

const T={
es:{navArchive:"ARCHIVO",navObjects:"OBJETOS",labTitle:"MAKE<br>YOUR GRID.",labIntro:"EMPIEZA CON UNA BASE Y HAZLA TUYA.",labHint:"TOCA CADA FOTO PARA ELEGIR OTRA DEL ARCHIVO.",gridSize:"FORMATO",selection:"BASE",byColor:"POR COLOR",bySubject:"POR TEMA",random:"RANDOM",green:"VERDE",orange:"NARANJA",whitegray:"BLANCO/GRIS",blue:"AZUL/CELESTE",nature:"NATURALEZA",architecture:"ARQUITECTURA",objects:"OBJETOS",suggestBase:"BASE SUGERIDA ↻",export:"EXPORTAR WEB ↗",exportNote:"EXPORTACIÓN WEB · MÁX. 720 PX · NO APTO PARA IMPRESIÓN",labNote:"LA BASE ES SOLO UN PUNTO DE PARTIDA. PUEDES ELEGIR CADA FOTOGRAFÍA Y CONSTRUIR TU PROPIA COMPOSICIÓN.",now:"AHORA",photos:"FOTOS",analyzing:"LEYENDO COLOR DEL ARCHIVO",exporting:"GENERANDO VERSIÓN WEB",shared:"VERSIÓN WEB PREPARADA",exportError:"NO SE PUDO EXPORTAR ESTA COMPOSICIÓN.",choosePhoto:"ELIGE UNA FOTOGRAFÍA",search:"BUSCAR",country:"PAÍS",allCountries:"TODOS",shown:"FOTOS"},
ca:{navArchive:"ARXIU",navObjects:"OBJECTES",labTitle:"MAKE<br>YOUR GRID.",labIntro:"COMENÇA AMB UNA BASE I FES-LA TEVA.",labHint:"TOCA CADA FOTO PER TRIAR-NE UNA ALTRA DE L’ARXIU.",gridSize:"FORMAT",selection:"BASE",byColor:"PER COLOR",bySubject:"PER TEMA",random:"RANDOM",green:"VERD",orange:"TARONJA",whitegray:"BLANC/GRIS",blue:"BLAU/CELEST",nature:"NATURA",architecture:"ARQUITECTURA",objects:"OBJECTES",suggestBase:"BASE SUGGERIDA ↻",export:"EXPORTAR WEB ↗",exportNote:"EXPORTACIÓ WEB · MÀX. 720 PX · NO APTE PER IMPRIMIR",labNote:"LA BASE ÉS NOMÉS UN PUNT DE PARTIDA. POTS TRIAR CADA FOTOGRAFIA I CONSTRUIR LA TEVA PRÒPIA COMPOSICIÓ.",now:"ARA",photos:"FOTOS",analyzing:"LLEGINT EL COLOR DE L’ARXIU",exporting:"GENERANT VERSIÓ WEB",shared:"VERSIÓ WEB PREPARADA",exportError:"NO S’HA POGUT EXPORTAR AQUESTA COMPOSICIÓ.",choosePhoto:"TRIA UNA FOTOGRAFIA",search:"CERCAR",country:"PAÍS",allCountries:"TOTS",shown:"FOTOS"},
en:{navArchive:"ARCHIVE",navObjects:"OBJECTS",labTitle:"MAKE<br>YOUR GRID.",labIntro:"START WITH A BASE AND MAKE IT YOURS.",labHint:"TAP EACH PHOTO TO CHOOSE ANOTHER FROM THE ARCHIVE.",gridSize:"FORMAT",selection:"BASE",byColor:"BY COLOR",bySubject:"BY SUBJECT",random:"RANDOM",green:"GREEN",orange:"ORANGE",whitegray:"WHITE/GRAY",blue:"BLUE/CYAN",nature:"NATURE",architecture:"ARCHITECTURE",objects:"OBJECTS",suggestBase:"SUGGESTED BASE ↻",export:"EXPORT WEB ↗",exportNote:"WEB EXPORT · MAX. 720 PX · NOT FOR PRINT",labNote:"THE BASE IS ONLY A STARTING POINT. CHOOSE EACH PHOTOGRAPH AND BUILD YOUR OWN COMPOSITION.",now:"NOW",photos:"PHOTOS",analyzing:"READING ARCHIVE COLOR",exporting:"GENERATING WEB VERSION",shared:"WEB VERSION READY",exportError:"THIS COMPOSITION COULD NOT BE EXPORTED.",choosePhoto:"CHOOSE A PHOTOGRAPH",search:"SEARCH",country:"COUNTRY",allCountries:"ALL",shown:"PHOTOS"}};

const state={lang:localStorage.getItem("afcndxs-lang")||defaultLang,archive:[],layout:"4x3",mode:"random",selected:[],colorData:{},busy:false,pickerIndex:null};
const tr=k=>(T[state.lang]||T.es)[k]||k;
const dims=()=>{const [cols,rows]=state.layout.split("x").map(Number);return{cols,rows,count:cols*rows}};
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const setStatus=text=>{$("#lab-status").textContent=text||""};

function applyLanguage(){document.documentElement.lang=state.lang;$$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));$$("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));$$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));populateCountries();renderPicker();renderMeta()}
function setLanguage(lang){state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage()}
function loadCachedColors(){try{const x=JSON.parse(localStorage.getItem(COLOR_CACHE_KEY)||"{}");if(x&&typeof x==="object")state.colorData=x}catch(_){state.colorData={}}}
function saveColorCache(){try{localStorage.setItem(COLOR_CACHE_KEY,JSON.stringify(state.colorData))}catch(_){}}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("image"));img.src=src})}
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:max===0?0:d/max,v:max}}
async function analyzePhoto(photo){
  if(state.colorData[photo.id])return state.colorData[photo.id];
  const img=await loadImage(photo.image),canvas=document.createElement("canvas");canvas.width=32;canvas.height=32;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);
  const px=ctx.getImageData(0,0,32,32).data;let valid=0,green=0,orange=0,blue=0,whitegray=0;
  for(let i=0;i<px.length;i+=4){if(px[i+3]<180)continue;const hsv=rgbToHsv(px[i],px[i+1],px[i+2]);if(hsv.v<.12)continue;valid++;if(hsv.s<.18&&hsv.v>.42)whitegray++;if(hsv.s>.22&&hsv.h>=65&&hsv.h<=170)green++;if(hsv.s>.28&&((hsv.h>=8&&hsv.h<=55)||hsv.h>=350))orange++;if(hsv.s>.20&&hsv.h>=170&&hsv.h<=245)blue++}
  valid=Math.max(valid,1);const out={green:green/valid,orange:orange/valid,blue:blue/valid,whitegray:whitegray/valid};state.colorData[photo.id]=out;return out;
}
async function ensureColorData(){
  const missing=state.archive.filter(p=>!state.colorData[p.id]);if(!missing.length)return;
  setBusy(true);let done=state.archive.length-missing.length;const queue=[...missing];
  const workers=Array.from({length:4},async()=>{while(queue.length){const p=queue.shift();try{await analyzePhoto(p)}catch(_){}done++;setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);await new Promise(r=>setTimeout(r,0))}});
  await Promise.all(workers);saveColorCache();setBusy(false);setStatus("");
}
function setBusy(v){state.busy=v;$("#shuffle-grid").disabled=v;$("#export-grid").disabled=v;$$(".lab-choice").forEach(b=>b.disabled=v)}
async function poolForMode(){
  if(state.mode==="random")return state.archive;
  if(THEMES[state.mode]){const ids=new Set(THEMES[state.mode]);return state.archive.filter(p=>ids.has(p.id))}
  if(["green","orange","blue","whitegray"].includes(state.mode)){await ensureColorData();const ranked=state.archive.filter(p=>state.colorData[p.id]).sort((a,b)=>state.colorData[b.id][state.mode]-state.colorData[a.id][state.mode]);return ranked.slice(0,Math.min(ranked.length,Math.max(dims().count*3,24)))}
  return state.archive;
}
function chooseUnique(pool,count){const source=shuffle(pool),out=[];while(out.length<count&&source.length)out.push(source.shift());if(out.length<count){for(const p of shuffle(state.archive)){if(!out.some(x=>x.id===p.id))out.push(p);if(out.length===count)break}}return out}
async function buildGrid(){if(state.busy)return;const pool=await poolForMode();state.selected=chooseUnique(pool,dims().count);renderGrid()}
function openPicker(index){state.pickerIndex=index;$("#picker-search").value="";$("#picker-country").value="all";renderPicker();$("#photo-picker").showModal()}
function closePicker(){if($("#photo-picker").open)$("#photo-picker").close()}
function pickerPhotos(){const q=$("#picker-search").value.trim().toLowerCase(),country=$("#picker-country").value;return state.archive.filter(p=>{if(country!=="all"&&p.countryCode!==country)return false;if(!q)return true;return[p.id,p.title,p.place,p.city,p.country,p.region].filter(Boolean).join(" ").toLowerCase().includes(q)})}
function renderPicker(){
  const grid=$("#picker-grid");if(!grid||!state.archive.length)return;
  const list=pickerPhotos(),selected=state.selected[state.pickerIndex],used=new Set(state.selected.map(p=>p?.id));
  grid.innerHTML=list.map(p=>'<button class="lab-picker-photo '+(selected?.id===p.id?"selected ":"")+(used.has(p.id)?"used":"")+'" type="button" data-id="'+p.id+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"><span>['+p.id+']</span></button>').join("");
  $$(".lab-picker-photo",grid).forEach(b=>b.onclick=()=>{const p=state.archive.find(x=>x.id===b.dataset.id);if(!p||state.pickerIndex==null)return;const other=state.selected.findIndex((x,i)=>i!==state.pickerIndex&&x?.id===p.id);if(other>=0){const current=state.selected[state.pickerIndex];state.selected[other]=current}state.selected[state.pickerIndex]=p;renderGrid();closePicker()});
  $("#picker-meta").textContent=list.length+" "+tr("shown");
}
function populateCountries(){const select=$("#picker-country");if(!select||!state.archive.length)return;const current=select.value||"all",countries=[...new Map(state.archive.map(p=>[p.countryCode,p.country])).entries()].sort((a,b)=>String(a[1]).localeCompare(String(b[1])));select.innerHTML='<option value="all">'+tr("allCountries")+'</option>'+countries.map(([code,name])=>'<option value="'+code+'">'+code+' · '+name+'</option>').join("");select.value=countries.some(([code])=>code===current)?current:"all"}
function renderGrid(){const grid=$("#lab-grid"),d=dims();grid.dataset.layout=state.layout;grid.style.setProperty("--cols",d.cols);grid.innerHTML=state.selected.map((p,i)=>'<button class="lab-cell" type="button" data-index="'+i+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"><span class="lab-cell-change" aria-hidden="true">＋</span><span class="lab-cell-index">['+p.id+']</span></button>').join("");$$(".lab-cell",grid).forEach(b=>b.onclick=()=>openPicker(Number(b.dataset.index)));renderMeta()}
function renderMeta(){$("#grid-count").textContent=String(dims().count).padStart(2,"0")+" "+tr("photos");$("#selection-mode").textContent="// "+tr(state.mode).toUpperCase();$("#selection-ids").textContent=state.selected.map(p=>"["+p.id+"]").join(" ")}
function coverRect(img,x,y,w,h){const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;return{dx:x+(w-dw)/2,dy:y+(h-dh)/2,dw,dh}}
async function exportGrid(){
  if(state.busy||!state.selected.length)return;setBusy(true);setStatus(tr("exporting"));
  try{const d=dims(),long=720,width=long,height=Math.round(long*d.rows/d.cols),gap=10,pad=12;const cell=Math.min((width-pad*2-gap*(d.cols-1))/d.cols,(height-pad*2-gap*(d.rows-1))/d.rows);const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d");ctx.fillStyle="#f1efe9";ctx.fillRect(0,0,width,height);const images=await Promise.all(state.selected.map(p=>loadImage(p.image)));images.forEach((img,i)=>{const col=i%d.cols,row=Math.floor(i/d.cols),x=pad+col*(cell+gap),y=pad+row*(cell+gap);ctx.save();ctx.beginPath();ctx.rect(x,y,cell,cell);ctx.clip();const r=coverRect(img,x,y,cell,cell);ctx.drawImage(img,r.dx,r.dy,r.dw,r.dh);ctx.restore()});const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));if(!blob)throw new Error("blob");const file=new File([blob],"aficionadxs-grid-web-"+state.layout+".jpg",{type:"image/jpeg"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:"AFICIONADXS GRID"});else{const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}setStatus(tr("shared"))}catch(err){if(err?.name!=="AbortError")setStatus(tr("exportError"));else setStatus("")}finally{setBusy(false)}
}
function setMode(button){state.mode=button.dataset.mode;$$("#color-controls .lab-choice, #theme-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===button));buildGrid()}
function bind(){$$(".lang-toggle").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));$$("#size-controls .lab-choice").forEach(b=>b.onclick=()=>{state.layout=b.dataset.layout;$$("#size-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));buildGrid()});$$("#color-controls .lab-choice, #theme-controls .lab-choice").forEach(b=>b.onclick=()=>setMode(b));$("#shuffle-grid").onclick=buildGrid;$("#export-grid").onclick=exportGrid;$("#picker-close").onclick=closePicker;$("#photo-picker").onclick=ev=>{if(ev.target===$("#photo-picker"))closePicker()};$("#picker-search").oninput=renderPicker;$("#picker-country").onchange=renderPicker}
async function init(){loadCachedColors();const response=await fetch("/data/archive.json?v=20261007-photos76");if(!response.ok)throw new Error("archive");state.archive=(await response.json()).filter(p=>p.published!==false);bind();applyLanguage();await buildGrid()}
init().catch(err=>{console.error(err);setStatus("ARCHIVE ERROR")});