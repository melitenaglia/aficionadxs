const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const COLOR_CACHE_KEY="afcndxs-lab-colors-v1";

const T={
  es:{
    navArchive:"ARCHIVO",navObjects:"OBJETOS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"EMPIEZA CON UNA BASE Y HAZLA TUYA.",
    labHint:"TOCA CADA FOTO PARA ELEGIR OTRA DEL ARCHIVO.",
    gridSize:"TAMAÑO",selection:"BASE",random:"RANDOM",warm:"CÁLIDO",cool:"FRÍO",
    light:"CLARO",dark:"OSCURO",portrait:"VERTICAL",landscape:"HORIZONTAL",
    suggestBase:"BASE SUGERIDA ↻",export:"EXPORTAR WEB ↗",
    exportNote:"EXPORTACIÓN WEB · 720 × 720 PX · NO APTO PARA IMPRESIÓN",
    labNote:"LA BASE ES SOLO UN PUNTO DE PARTIDA. PUEDES ELEGIR CADA FOTOGRAFÍA Y CONSTRUIR TU PROPIA COMPOSICIÓN.",
    now:"AHORA",photos:"FOTOS",analyzing:"ANALIZANDO COLOR DEL ARCHIVO",ready:"LISTO",
    exporting:"GENERANDO VERSIÓN WEB",shared:"VERSIÓN WEB PREPARADA",exportError:"NO SE PUDO EXPORTAR ESTA COMPOSICIÓN.",
    landscapeLimit:"HORIZONTAL TIENE POCAS FOTOS: CAMBIO A 2×2.",choosePhoto:"ELIGE UNA FOTOGRAFÍA",
    search:"BUSCAR",country:"PAÍS",allCountries:"TODOS",shown:"FOTOS"
  },
  ca:{
    navArchive:"ARXIU",navObjects:"OBJECTES",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"COMENÇA AMB UNA BASE I FES-LA TEVA.",
    labHint:"TOCA CADA FOTO PER TRIAR-NE UNA ALTRA DE L’ARXIU.",
    gridSize:"MIDA",selection:"BASE",random:"RANDOM",warm:"CÀLID",cool:"FRED",
    light:"CLAR",dark:"FOSC",portrait:"VERTICAL",landscape:"HORITZONTAL",
    suggestBase:"BASE SUGGERIDA ↻",export:"EXPORTAR WEB ↗",
    exportNote:"EXPORTACIÓ WEB · 720 × 720 PX · NO APTE PER IMPRIMIR",
    labNote:"LA BASE ÉS NOMÉS UN PUNT DE PARTIDA. POTS TRIAR CADA FOTOGRAFIA I CONSTRUIR LA TEVA PRÒPIA COMPOSICIÓ.",
    now:"ARA",photos:"FOTOS",analyzing:"ANALITZANT EL COLOR DE L’ARXIU",ready:"FET",
    exporting:"GENERANT VERSIÓ WEB",shared:"VERSIÓ WEB PREPARADA",exportError:"NO S’HA POGUT EXPORTAR AQUESTA COMPOSICIÓ.",
    landscapeLimit:"HORITZONTAL TÉ POQUES FOTOS: CANVIO A 2×2.",choosePhoto:"TRIA UNA FOTOGRAFIA",
    search:"CERCAR",country:"PAÍS",allCountries:"TOTS",shown:"FOTOS"
  },
  en:{
    navArchive:"ARCHIVE",navObjects:"OBJECTS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"START WITH A BASE AND MAKE IT YOURS.",
    labHint:"TAP EACH PHOTO TO CHOOSE ANOTHER FROM THE ARCHIVE.",
    gridSize:"SIZE",selection:"BASE",random:"RANDOM",warm:"WARM",cool:"COOL",
    light:"LIGHT",dark:"DARK",portrait:"PORTRAIT",landscape:"LANDSCAPE",
    suggestBase:"SUGGESTED BASE ↻",export:"EXPORT WEB ↗",
    exportNote:"WEB EXPORT · 720 × 720 PX · NOT FOR PRINT",
    labNote:"THE BASE IS ONLY A STARTING POINT. CHOOSE EACH PHOTOGRAPH AND BUILD YOUR OWN COMPOSITION.",
    now:"NOW",photos:"PHOTOS",analyzing:"ANALYZING ARCHIVE COLOR",ready:"READY",
    exporting:"GENERATING WEB VERSION",shared:"WEB VERSION READY",exportError:"THIS COMPOSITION COULD NOT BE EXPORTED.",
    landscapeLimit:"LANDSCAPE HAS FEWER PHOTOS: SWITCHING TO 2×2.",choosePhoto:"CHOOSE A PHOTOGRAPH",
    search:"SEARCH",country:"COUNTRY",allCountries:"ALL",shown:"PHOTOS"
  }
};

const state={
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  archive:[],size:3,mode:"random",selected:[],colorData:{},busy:false,pickerIndex:null
};

const tr=k=>(T[state.lang]||T.es)[k]||k;
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const setStatus=text=>{$("#lab-status").textContent=text||""};
const modeLabel=()=>tr(state.mode);
const cellCount=()=>state.size*state.size;

function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $$("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  populateCountries();
  renderPicker();
  renderMeta();
}
function setLanguage(lang){
  state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage();
}
function loadCachedColors(){
  try{const parsed=JSON.parse(localStorage.getItem(COLOR_CACHE_KEY)||"{}");if(parsed&&typeof parsed==="object")state.colorData=parsed}catch(_){state.colorData={}}
}
function saveColorCache(){try{localStorage.setItem(COLOR_CACHE_KEY,JSON.stringify(state.colorData))}catch(_){}}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("image"));img.src=src})}
async function analyzePhoto(photo){
  if(state.colorData[photo.id])return state.colorData[photo.id];
  const img=await loadImage(photo.image),canvas=document.createElement("canvas");
  canvas.width=24;canvas.height=24;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0,24,24);
  const pixels=ctx.getImageData(0,0,24,24).data;
  let r=0,g=0,b=0,n=0;
  for(let i=0;i<pixels.length;i+=4){
    if(pixels[i+3]<180)continue;
    const rr=pixels[i],gg=pixels[i+1],bb=pixels[i+2],max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb);
    if(max>248&&min>248)continue;
    r+=rr;g+=gg;b+=bb;n++;
  }
  n=Math.max(1,n);r/=n;g/=n;b/=n;
  const result={luminance:.2126*r+.7152*g+.0722*b,warmth:(r-b)+.22*(r-g)};
  state.colorData[photo.id]=result;return result;
}
async function ensureColorData(){
  const missing=state.archive.filter(p=>!state.colorData[p.id]);if(!missing.length)return;
  setBusy(true);let done=state.archive.length-missing.length;const queue=[...missing];
  setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);
  const workers=Array.from({length:4},async()=>{while(queue.length){const p=queue.shift();try{await analyzePhoto(p)}catch(_){}done++;setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);await new Promise(r=>setTimeout(r,0))}});
  await Promise.all(workers);saveColorCache();setBusy(false);setStatus("");
}
function setBusy(v){
  state.busy=v;$("#shuffle-grid").disabled=v;$("#export-grid").disabled=v;
  $$(".lab-choice").forEach(b=>b.disabled=v);
}
async function poolForMode(){
  const all=state.archive;
  if(state.mode==="portrait")return all.filter(p=>p.orientation==="portrait");
  if(state.mode==="landscape")return all.filter(p=>p.orientation==="landscape");
  if(["warm","cool","light","dark"].includes(state.mode)){
    await ensureColorData();const scored=all.filter(p=>state.colorData[p.id]);
    if(state.mode==="warm")scored.sort((a,b)=>state.colorData[b.id].warmth-state.colorData[a.id].warmth);
    if(state.mode==="cool")scored.sort((a,b)=>state.colorData[a.id].warmth-state.colorData[b.id].warmth);
    if(state.mode==="light")scored.sort((a,b)=>state.colorData[b.id].luminance-state.colorData[a.id].luminance);
    if(state.mode==="dark")scored.sort((a,b)=>state.colorData[a.id].luminance-state.colorData[b.id].luminance);
    return scored.slice(0,Math.min(scored.length,Math.max(cellCount()*3,24)));
  }
  return all;
}
function chooseUnique(pool,count){
  const source=shuffle(pool),out=[];
  while(out.length<count&&source.length)out.push(source.shift());
  return out;
}
async function buildGrid(){
  if(state.busy)return;
  let pool=await poolForMode();
  if(state.mode==="landscape"&&state.size>2){
    state.size=2;
    $$("#size-controls .lab-choice").forEach(b=>b.classList.toggle("active",Number(b.dataset.size)===2));
    setStatus(tr("landscapeLimit"));
  }
  if(pool.length<cellCount())pool=state.archive;
  state.selected=chooseUnique(pool,cellCount());
  renderGrid();
}
function openPicker(index){
  state.pickerIndex=index;
  $("#picker-search").value="";
  $("#picker-country").value="all";
  renderPicker();
  $("#photo-picker").showModal();
}
function closePicker(){if($("#photo-picker").open)$("#photo-picker").close()}
function pickerPhotos(){
  const q=$("#picker-search").value.trim().toLowerCase(),country=$("#picker-country").value;
  return state.archive.filter(p=>{
    if(country!=="all"&&p.countryCode!==country)return false;
    if(!q)return true;
    const hay=[p.id,p.title,p.place,p.city,p.country,p.region].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
}
function renderPicker(){
  const grid=$("#picker-grid");if(!grid||!state.archive.length)return;
  const list=pickerPhotos(),selected=state.selected[state.pickerIndex],used=new Set(state.selected.map(p=>p?.id));
  grid.innerHTML=list.map(p=>
    '<button class="lab-picker-photo '+(selected?.id===p.id?"selected ":"")+(used.has(p.id)?"used":"")+'" type="button" data-id="'+p.id+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"><span>['+p.id+']</span></button>'
  ).join("");
  $$(".lab-picker-photo",grid).forEach(b=>b.addEventListener("click",()=>{
    const p=state.archive.find(x=>x.id===b.dataset.id);
    if(!p||state.pickerIndex==null)return;
    const otherIndex=state.selected.findIndex((x,i)=>i!==state.pickerIndex&&x?.id===p.id);
    if(otherIndex>=0){
      const current=state.selected[state.pickerIndex];
      state.selected[otherIndex]=current;
    }
    state.selected[state.pickerIndex]=p;
    renderGrid();closePicker();
  }));
  $("#picker-meta").textContent=list.length+" "+tr("shown");
}
function populateCountries(){
  const select=$("#picker-country");if(!select||!state.archive.length)return;
  const current=select.value||"all";
  const countries=[...new Map(state.archive.map(p=>[p.countryCode,p.country])).entries()].sort((a,b)=>String(a[1]).localeCompare(String(b[1])));
  select.innerHTML='<option value="all">'+tr("allCountries")+'</option>'+countries.map(([code,name])=>'<option value="'+code+'">'+code+' · '+name+'</option>').join("");
  select.value=countries.some(([code])=>code===current)?current:"all";
}
function renderGrid(){
  const grid=$("#lab-grid");grid.dataset.size=String(state.size);
  grid.innerHTML=state.selected.map((p,i)=>
    '<button class="lab-cell" type="button" data-index="'+i+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"><span class="lab-cell-change" aria-hidden="true">＋</span><span class="lab-cell-index">['+p.id+']</span></button>'
  ).join("");
  $$(".lab-cell",grid).forEach(b=>b.addEventListener("click",()=>openPicker(Number(b.dataset.index))));
  renderMeta();
}
function renderMeta(){
  $("#grid-count").textContent=String(cellCount()).padStart(2,"0")+" "+tr("photos");
  $("#selection-mode").textContent="// "+modeLabel().toUpperCase();
  $("#selection-ids").textContent=state.selected.map(p=>"["+p.id+"]").join(" ");
}
function coverRect(img,x,y,w,h){
  const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;
  return {dx:x+(w-dw)/2,dy:y+(h-dh)/2,dw,dh};
}
async function exportGrid(){
  if(state.busy||!state.selected.length)return;
  setBusy(true);setStatus(tr("exporting"));
  try{
    const size=720,n=state.size,gap=n===4?8:n===3?10:12,pad=12;
    const available=size-pad*2-gap*(n-1),cell=available/n;
    const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext("2d");ctx.fillStyle="#f1efe9";ctx.fillRect(0,0,size,size);
    const images=await Promise.all(state.selected.map(p=>loadImage(p.image)));
    images.forEach((img,i)=>{
      const col=i%n,row=Math.floor(i/n),x=pad+col*(cell+gap),y=pad+row*(cell+gap);
      ctx.save();ctx.beginPath();ctx.rect(x,y,cell,cell);ctx.clip();
      const r=coverRect(img,x,y,cell,cell);ctx.drawImage(img,r.dx,r.dy,r.dw,r.dh);ctx.restore();
    });
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.84));
    if(!blob)throw new Error("blob");
    const file=new File([blob],"aficionadxs-grid-web-"+n+"x"+n+".jpg",{type:"image/jpeg"});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:"AFICIONADXS GRID"});
    }else{
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    }
    setStatus(tr("shared"));
  }catch(err){
    if(err?.name!=="AbortError")setStatus(tr("exportError"));else setStatus("");
  }finally{setBusy(false)}
}
function bind(){
  $$(".lang-toggle").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang)));
  $$("#size-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{
    state.size=Number(b.dataset.size);$$("#size-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));await buildGrid();
  }));
  $$("#mode-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{
    state.mode=b.dataset.mode;$$("#mode-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));await buildGrid();
  }));
  $("#shuffle-grid").addEventListener("click",buildGrid);
  $("#export-grid").addEventListener("click",exportGrid);
  $("#picker-close").addEventListener("click",closePicker);
  $("#photo-picker").addEventListener("click",ev=>{if(ev.target===$("#photo-picker"))closePicker()});
  $("#picker-search").addEventListener("input",renderPicker);
  $("#picker-country").addEventListener("change",renderPicker);
}
async function init(){
  loadCachedColors();
  const response=await fetch("/data/archive.json?v=20261007-photos76");
  if(!response.ok)throw new Error("archive");
  state.archive=(await response.json()).filter(p=>p.published!==false);
  bind();applyLanguage();await buildGrid();
}
init().catch(err=>{console.error(err);setStatus("ARCHIVE ERROR")});
