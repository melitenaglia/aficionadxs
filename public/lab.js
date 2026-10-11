const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const COLOR_CACHE_KEY="afcndxs-lab-colors-v3";

const LAYOUTS={
  "3x4":{cols:3,rows:4},
  "2x3":{cols:2,rows:3},
  "3x3":{cols:3,rows:3},
  "2x2":{cols:2,rows:2}
};

const THEME_TAGS={
  nature:["001","002","008","013","015","025","027","029","036","038","039","041","053","054","055","058","059","060","061","072","073","074"],
  architecture:["003","004","007","010","012","016","017","018","020","022","024","025","026","027","028","030","031","032","033","034","035","038","040","041","042","043","044","047","049","051","052","056","060","063","064","067","069","070","071","074","075","076"],
  objects:["005","006","009","011","019","023","024","026","037","045","046","050","054","062","065","068"]
};

const T={
  es:{
    navArchive:"ARCHIVO",navObjects:"OBJETOS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"EMPIEZA CON UNA BASE Y HAZLA TUYA.",labHint:"TOCA CADA FOTO PARA ELEGIR OTRA DEL ARCHIVO.",desktopOnlyTitle:"MAKE YOUR GRID FUNCIONA EN DESKTOP.",desktopOnlyText:"PARA COMPONER Y ELEGIR FOTOGRAFÍAS CON PRECISIÓN, ABRE ESTE EXPERIMENTO EN UNA PANTALLA MÁS GRANDE.",
    gridSize:"FORMATO",selection:"BASE",byColor:"POR COLOR",bySubject:"POR TEMA",random:"RANDOM",green:"VERDE",orange:"NARANJA",neutral:"BLANCO / GRIS",blue:"AZUL / CELESTE",
    nature:"NATURALEZA",architecture:"ARQUITECTURA",objects:"OBJETOS",
    suggestBase:"BASE SUGERIDA ↻",export:"EXPORTAR WEB ↗",
    exportNote:"EXPORTACIÓN WEB · MÁX. 720 PX · NO APTO PARA IMPRESIÓN",
    labNote:"LA BASE ES SOLO UN PUNTO DE PARTIDA. PUEDES ELEGIR CADA FOTOGRAFÍA Y CONSTRUIR TU PROPIA COMPOSICIÓN.",
    now:"AHORA",photos:"FOTOS",analyzing:"LEYENDO COLORES DEL ARCHIVO",exporting:"GENERANDO VERSIÓN WEB",
    shared:"VERSIÓN WEB PREPARADA",exportError:"NO SE PUDO EXPORTAR ESTA COMPOSICIÓN.",
    choosePhoto:"ELIGE UNA FOTOGRAFÍA",search:"BUSCAR",country:"PAÍS",allCountries:"TODOS",shown:"FOTOS"
  },
  ca:{
    navArchive:"ARXIU",navObjects:"OBJECTES",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"COMENÇA AMB UNA BASE I FES-LA TEVA.",labHint:"TOCA CADA FOTO PER TRIAR-NE UNA ALTRA DE L’ARXIU.",desktopOnlyTitle:"MAKE YOUR GRID FUNCIONA EN DESKTOP.",desktopOnlyText:"PER COMPONDRE I TRIAR FOTOGRAFIES AMB PRECISIÓ, OBRE AQUEST EXPERIMENT EN UNA PANTALLA MÉS GRAN.",
    gridSize:"FORMAT",selection:"BASE",byColor:"PER COLOR",bySubject:"PER TEMA",random:"RANDOM",green:"VERD",orange:"TARONJA",neutral:"BLANC / GRIS",blue:"BLAU / CEL",
    nature:"NATURA",architecture:"ARQUITECTURA",objects:"OBJECTES",
    suggestBase:"BASE SUGGERIDA ↻",export:"EXPORTAR WEB ↗",
    exportNote:"EXPORTACIÓ WEB · MÀX. 720 PX · NO APTE PER IMPRIMIR",
    labNote:"LA BASE ÉS NOMÉS UN PUNT DE PARTIDA. POTS TRIAR CADA FOTOGRAFIA I CONSTRUIR LA TEVA PRÒPIA COMPOSICIÓ.",
    now:"ARA",photos:"FOTOS",analyzing:"LLEGINT COLORS DE L’ARXIU",exporting:"GENERANT VERSIÓ WEB",
    shared:"VERSIÓ WEB PREPARADA",exportError:"NO S’HA POGUT EXPORTAR AQUESTA COMPOSICIÓ.",
    choosePhoto:"TRIA UNA FOTOGRAFIA",search:"CERCAR",country:"PAÍS",allCountries:"TOTS",shown:"FOTOS"
  },
  en:{
    navArchive:"ARCHIVE",navObjects:"OBJECTS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"START WITH A BASE AND MAKE IT YOURS.",labHint:"TAP EACH PHOTO TO CHOOSE ANOTHER FROM THE ARCHIVE.",desktopOnlyTitle:"MAKE YOUR GRID IS DESKTOP ONLY.",desktopOnlyText:"FOR PRECISE COMPOSITION AND PHOTO SELECTION, OPEN THIS EXPERIMENT ON A LARGER SCREEN.",
    gridSize:"FORMAT",selection:"BASE",byColor:"BY COLOR",bySubject:"BY SUBJECT",random:"RANDOM",green:"GREEN",orange:"ORANGE",neutral:"WHITE / GREY",blue:"BLUE / CYAN",
    nature:"NATURE",architecture:"ARCHITECTURE",objects:"OBJECTS",
    suggestBase:"SUGGESTED BASE ↻",export:"EXPORT WEB ↗",
    exportNote:"WEB EXPORT · MAX. 720 PX · NOT FOR PRINT",
    labNote:"THE BASE IS ONLY A STARTING POINT. CHOOSE EACH PHOTOGRAPH AND BUILD YOUR OWN COMPOSITION.",
    now:"NOW",photos:"PHOTOS",analyzing:"READING ARCHIVE COLORS",exporting:"GENERATING WEB VERSION",
    shared:"WEB VERSION READY",exportError:"THIS COMPOSITION COULD NOT BE EXPORTED.",
    choosePhoto:"CHOOSE A PHOTOGRAPH",search:"SEARCH",country:"COUNTRY",allCountries:"ALL",shown:"PHOTOS"
  }
};

const state={lang:localStorage.getItem("afcndxs-lang")||defaultLang,archive:[],layout:"3x4",mode:"random",selected:[],colorData:{},busy:false,pickerIndex:null};
const tr=k=>(T[state.lang]||T.es)[k]||k;
const layout=()=>LAYOUTS[state.layout]||LAYOUTS["3x4"];
const cellCount=()=>layout().cols*layout().rows;
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const setStatus=x=>{$("#lab-status").textContent=x||""};

function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $$("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  populateCountries();renderPicker();renderMeta();
}
function setLanguage(lang){state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage()}
function loadCachedColors(){try{const p=JSON.parse(localStorage.getItem(COLOR_CACHE_KEY)||"{}");if(p&&typeof p==="object")state.colorData=p}catch(_){}}
function saveColorCache(){try{localStorage.setItem(COLOR_CACHE_KEY,JSON.stringify(state.colorData))}catch(_){}}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("image"));img.src=src})}
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
  let h=0,s=0;
  if(d){
    s=d/(1-Math.abs(2*l-1));
    if(max===r)h=60*(((g-b)/d)%6);
    else if(max===g)h=60*((b-r)/d+2);
    else h=60*((r-g)/d+4);
    if(h<0)h+=360;
  }
  return {h,s,l};
}
async function analyzePhoto(photo){
  if(state.colorData[photo.id])return state.colorData[photo.id];
  const img=await loadImage(photo.image),canvas=document.createElement("canvas");
  canvas.width=36;canvas.height=36;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(img,0,0,36,36);
  const px=ctx.getImageData(0,0,36,36).data;
  const counts={green:0,orange:0,neutral:0,blue:0,other:0};
  let total=0;
  for(let i=0;i<px.length;i+=4){
    if(px[i+3]<180)continue;
    const {h,s,l}=rgbToHsl(px[i],px[i+1],px[i+2]);
    if(l<.08||l>.98)continue;
    total++;
    if(s<.16)counts.neutral++;
    else if(h>=72&&h<=168)counts.green++;
    else if(h>=14&&h<=52)counts.orange++;
    else if(h>=176&&h<=238)counts.blue++;
    else counts.other++;
  }
  total=Math.max(1,total);
  const shares=Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/total]));
  const dominant=Object.entries(shares).sort((a,b)=>b[1]-a[1])[0][0];
  const result={...shares,dominant};
  state.colorData[photo.id]=result;
  return result;
}
async function ensureColorData(){
  const missing=state.archive.filter(p=>!state.colorData[p.id]);if(!missing.length)return;
  setBusy(true);let done=state.archive.length-missing.length;const queue=[...missing];setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);
  const workers=Array.from({length:4},async()=>{while(queue.length){const p=queue.shift();try{await analyzePhoto(p)}catch(_){}done++;setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);await new Promise(r=>setTimeout(r,0))}});
  await Promise.all(workers);saveColorCache();setBusy(false);setStatus("");
}
function setBusy(v){state.busy=v;$("#shuffle-grid").disabled=v;$("#export-grid").disabled=v;$$(".lab-choice").forEach(b=>b.disabled=v)}
async function poolForMode(){
  const all=state.archive;
  if(THEME_TAGS[state.mode])return THEME_TAGS[state.mode].map(id=>all.find(p=>p.id===id)).filter(Boolean);
  if(["green","orange","neutral","blue"].includes(state.mode)){
    await ensureColorData();
    return [...all]
      .filter(p=>state.colorData[p.id]?.dominant===state.mode)
      .sort((a,b)=>(state.colorData[b.id][state.mode]||0)-(state.colorData[a.id][state.mode]||0));
  }
  return all;
}
function chooseUnique(pool,count){
  const source=shuffle(pool),out=[],used=new Set();
  for(const p of source){if(out.length>=count)break;if(!used.has(p.id)){out.push(p);used.add(p.id)}}
  return out;
}
async function buildGrid(){
  if(state.busy)return;let pool=await poolForMode();if(!pool.length)pool=state.archive;
  state.selected=chooseUnique(pool,cellCount());renderGrid();
}
function openPicker(index){state.pickerIndex=index;$("#picker-search").value="";$("#picker-country").value="all";renderPicker();$("#photo-picker").showModal()}
function closePicker(){if($("#photo-picker").open)$("#photo-picker").close()}
function pickerPhotos(){
  const q=$("#picker-search").value.trim().toLowerCase(),country=$("#picker-country").value;
  return state.archive.filter(p=>(country==="all"||p.countryCode===country)&&(!q||[p.id,p.title,p.place,p.city,p.country,p.region].filter(Boolean).join(" ").toLowerCase().includes(q)));
}
function renderPicker(){
  const grid=$("#picker-grid");if(!grid||!state.archive.length)return;const list=pickerPhotos(),selected=state.selected[state.pickerIndex],used=new Set(state.selected.map(p=>p?.id));
  grid.innerHTML=list.map(p=>'<button class="lab-picker-photo '+(selected?.id===p.id?"selected ":"")+(used.has(p.id)?"used":"")+'" type="button" data-id="'+p.id+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"><span>['+p.id+']</span></button>').join("");
  $$(".lab-picker-photo",grid).forEach(b=>b.addEventListener("click",()=>{const p=state.archive.find(x=>x.id===b.dataset.id);if(!p||state.pickerIndex==null)return;const other=state.selected.findIndex((x,i)=>i!==state.pickerIndex&&x?.id===p.id);if(other>=0)state.selected[other]=state.selected[state.pickerIndex];state.selected[state.pickerIndex]=p;renderGrid();closePicker()}));
  $("#picker-meta").textContent=list.length+" "+tr("shown");
}
function populateCountries(){
  const select=$("#picker-country");if(!select||!state.archive.length)return;const current=select.value||"all";
  const countries=[...new Map(state.archive.map(p=>[p.countryCode,p.country])).entries()].sort((a,b)=>String(a[1]).localeCompare(String(b[1])));
  select.innerHTML='<option value="all">'+tr("allCountries")+'</option>'+countries.map(([code,name])=>'<option value="'+code+'">'+code+' · '+name+'</option>').join("");select.value=countries.some(([code])=>code===current)?current:"all";
}
function renderGrid(){
  const grid=$("#lab-grid"),l=layout();grid.style.setProperty("--grid-cols",l.cols);grid.parentElement.style.setProperty("--grid-ratio",l.cols/l.rows);
  grid.innerHTML=state.selected.map((p,i)=>'<button class="lab-cell" type="button" data-index="'+i+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"><span class="lab-cell-change" aria-hidden="true">＋</span><span class="lab-cell-index">['+p.id+']</span></button>').join("");
  $$(".lab-cell",grid).forEach(b=>b.addEventListener("click",()=>openPicker(Number(b.dataset.index))));renderMeta();
}
function renderMeta(){
  $("#grid-count").textContent=state.layout+" · "+String(cellCount()).padStart(2,"0")+" "+tr("photos");
  $("#selection-mode").textContent="// "+tr(state.mode).toUpperCase();$("#selection-ids").textContent=state.selected.map(p=>"["+p.id+"]").join(" ");
}
function coverRect(img,x,y,w,h){const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;return{dx:x+(w-dw)/2,dy:y+(h-dh)/2,dw,dh}}
async function exportGrid(){
  if(state.busy||!state.selected.length)return;setBusy(true);setStatus(tr("exporting"));
  try{
    const l=layout(),max=720,ratio=l.cols/l.rows,w=ratio>=1?max:Math.round(max*ratio),h=ratio>=1?Math.round(max/ratio):max;
    const pad=12,gap=10,cell=Math.min((w-pad*2-gap*(l.cols-1))/l.cols,(h-pad*2-gap*(l.rows-1))/l.rows);
    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");ctx.fillStyle="#f1efe9";ctx.fillRect(0,0,w,h);
    const usedW=cell*l.cols+gap*(l.cols-1),usedH=cell*l.rows+gap*(l.rows-1),ox=(w-usedW)/2,oy=(h-usedH)/2;
    const images=await Promise.all(state.selected.map(p=>loadImage(p.image)));
    images.forEach((img,i)=>{const col=i%l.cols,row=Math.floor(i/l.cols),x=ox+col*(cell+gap),y=oy+row*(cell+gap);ctx.save();ctx.beginPath();ctx.rect(x,y,cell,cell);ctx.clip();const r=coverRect(img,x,y,cell,cell);ctx.drawImage(img,r.dx,r.dy,r.dw,r.dh);ctx.restore()});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));if(!blob)throw new Error("blob");
    const file=new File([blob],"aficionadxs-grid-web-"+state.layout+".jpg",{type:"image/jpeg"});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:"AFICIONADXS GRID"});
    else{const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
    setStatus(tr("shared"));
  }catch(err){if(err?.name!=="AbortError")setStatus(tr("exportError"));else setStatus("")}finally{setBusy(false)}
}
function bind(){
  $$(".lang-toggle").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang)));
  $$("#size-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{state.layout=b.dataset.layout;$$("#size-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));await buildGrid()}));
  $$("#mode-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{state.mode=b.dataset.mode;$$("#mode-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));await buildGrid()}));
  $("#shuffle-grid").addEventListener("click",buildGrid);$("#export-grid").addEventListener("click",exportGrid);$("#picker-close").addEventListener("click",closePicker);
  $("#photo-picker").addEventListener("click",ev=>{if(ev.target===$("#photo-picker"))closePicker()});$("#picker-search").addEventListener("input",renderPicker);$("#picker-country").addEventListener("change",renderPicker);
}
async function init(){loadCachedColors();const response=await fetch("/data/archive.json?v=20261007-photos76");if(!response.ok)throw new Error("archive");state.archive=(await response.json()).filter(p=>p.published!==false);bind();applyLanguage();await buildGrid()}
init().catch(err=>{console.error(err);setStatus("ARCHIVE ERROR")});
