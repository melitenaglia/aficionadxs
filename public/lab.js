const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const COLOR_CACHE_KEY="afcndxs-lab-colors-v1";

const T={
  es:{
    navArchive:"ARCHIVO",navObjects:"OBJETOS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"MEZCLA EL ARCHIVO. NO HAY UNA COMBINACIÓN CORRECTA.",
    labHint:"TOCA UNA FOTO PARA CAMBIAR SOLO ESA PIEZA.",
    gridSize:"TAMAÑO",selection:"SELECCIÓN",random:"RANDOM",warm:"CÁLIDO",cool:"FRÍO",
    light:"CLARO",dark:"OSCURO",portrait:"VERTICAL",landscape:"HORIZONTAL",
    shuffle:"MEZCLAR ↻",export:"EXPORTAR PNG ↗",
    labNote:"ESTA COMPOSICIÓN NO CAMBIA EL ARCHIVO: SOLO PROPONE OTRA MANERA DE RECORRERLO.",
    now:"AHORA",photos:"FOTOS",analyzing:"ANALIZANDO COLOR DEL ARCHIVO",ready:"LISTO",
    changing:"CAMBIANDO FOTO",exporting:"GENERANDO PNG",shared:"COMPOSICIÓN PREPARADA",
    exportError:"NO SE PUDO EXPORTAR ESTA COMPOSICIÓN.",landscapeLimit:"HORIZONTAL TIENE POCAS FOTOS: CAMBIO A 2×2."
  },
  ca:{
    navArchive:"ARXIU",navObjects:"OBJECTES",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"BARREJA L’ARXIU. NO HI HA UNA COMBINACIÓ CORRECTA.",
    labHint:"TOCA UNA FOTO PER CANVIAR NOMÉS AQUELLA PEÇA.",
    gridSize:"MIDA",selection:"SELECCIÓ",random:"RANDOM",warm:"CÀLID",cool:"FRED",
    light:"CLAR",dark:"FOSC",portrait:"VERTICAL",landscape:"HORITZONTAL",
    shuffle:"BARREJAR ↻",export:"EXPORTAR PNG ↗",
    labNote:"AQUESTA COMPOSICIÓ NO CANVIA L’ARXIU: NOMÉS PROPOSA UNA ALTRA MANERA DE RECÓRRER-LO.",
    now:"ARA",photos:"FOTOS",analyzing:"ANALITZANT EL COLOR DE L’ARXIU",ready:"FET",
    changing:"CANVIANT FOTO",exporting:"GENERANT PNG",shared:"COMPOSICIÓ PREPARADA",
    exportError:"NO S’HA POGUT EXPORTAR AQUESTA COMPOSICIÓ.",landscapeLimit:"HORITZONTAL TÉ POQUES FOTOS: CANVIO A 2×2."
  },
  en:{
    navArchive:"ARCHIVE",navObjects:"OBJECTS",labTitle:"MAKE<br>YOUR GRID.",
    labIntro:"MIX THE ARCHIVE. THERE IS NO RIGHT COMBINATION.",
    labHint:"TAP A PHOTO TO CHANGE ONLY THAT PIECE.",
    gridSize:"SIZE",selection:"SELECTION",random:"RANDOM",warm:"WARM",cool:"COOL",
    light:"LIGHT",dark:"DARK",portrait:"PORTRAIT",landscape:"LANDSCAPE",
    shuffle:"SHUFFLE ↻",export:"EXPORT PNG ↗",
    labNote:"THIS COMPOSITION DOES NOT CHANGE THE ARCHIVE: IT ONLY SUGGESTS ANOTHER WAY THROUGH IT.",
    now:"NOW",photos:"PHOTOS",analyzing:"ANALYZING ARCHIVE COLOR",ready:"READY",
    changing:"CHANGING PHOTO",exporting:"GENERATING PNG",shared:"COMPOSITION READY",
    exportError:"THIS COMPOSITION COULD NOT BE EXPORTED.",landscapeLimit:"LANDSCAPE HAS FEWER PHOTOS: SWITCHING TO 2×2."
  }
};

const state={
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  archive:[],size:3,mode:"random",selected:[],colorData:{},busy:false
};

const tr=k=>(T[state.lang]||T.es)[k]||k;
const shuffle=a=>{
  const out=[...a];
  for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out;
};
const setStatus=text=>{$("#lab-status").textContent=text||""};
const modeLabel=()=>tr(state.mode);
const cellCount=()=>state.size*state.size;

function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $$("[data-i18n-html]").forEach(el=>el.innerHTML=tr(el.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  renderMeta();
}
function setLanguage(lang){
  state.lang=lang;
  localStorage.setItem("afcndxs-lang",lang);
  applyLanguage();
}
function loadCachedColors(){
  try{
    const parsed=JSON.parse(localStorage.getItem(COLOR_CACHE_KEY)||"{}");
    if(parsed&&typeof parsed==="object")state.colorData=parsed;
  }catch(_){state.colorData={}}
}
function saveColorCache(){
  try{localStorage.setItem(COLOR_CACHE_KEY,JSON.stringify(state.colorData))}catch(_){}
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error("image"));
    img.src=src;
  });
}
async function analyzePhoto(photo){
  if(state.colorData[photo.id])return state.colorData[photo.id];
  const img=await loadImage(photo.image);
  const canvas=document.createElement("canvas");
  canvas.width=24;canvas.height=24;
  const ctx=canvas.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(img,0,0,24,24);
  const pixels=ctx.getImageData(0,0,24,24).data;
  let r=0,g=0,b=0,n=0;
  for(let i=0;i<pixels.length;i+=4){
    if(pixels[i+3]<180)continue;
    const rr=pixels[i],gg=pixels[i+1],bb=pixels[i+2];
    const max=Math.max(rr,gg,bb),min=Math.min(rr,gg,bb);
    if(max>248&&min>248)continue;
    r+=rr;g+=gg;b+=bb;n++;
  }
  n=Math.max(1,n);r/=n;g/=n;b/=n;
  const luminance=.2126*r+.7152*g+.0722*b;
  const warmth=(r-b)+.22*(r-g);
  const saturation=Math.max(r,g,b)-Math.min(r,g,b);
  const out={r:Math.round(r),g:Math.round(g),b:Math.round(b),luminance:+luminance.toFixed(2),warmth:+warmth.toFixed(2),saturation:+saturation.toFixed(2)};
  state.colorData[photo.id]=out;
  return out;
}
async function ensureColorData(){
  const missing=state.archive.filter(p=>!state.colorData[p.id]);
  if(!missing.length)return;
  setBusy(true);
  let done=state.archive.length-missing.length;
  setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);
  const queue=[...missing];
  const workers=Array.from({length:4},async()=>{
    while(queue.length){
      const photo=queue.shift();
      try{await analyzePhoto(photo)}catch(_){}
      done++;
      setStatus(tr("analyzing")+" · "+done+"/"+state.archive.length);
      await new Promise(r=>setTimeout(r,0));
    }
  });
  await Promise.all(workers);
  saveColorCache();
  setStatus(tr("ready")+" · "+state.archive.length+"/"+state.archive.length);
  setBusy(false);
}
function setBusy(v){
  state.busy=v;
  $("#shuffle-grid").disabled=v;
  $("#export-grid").disabled=v;
  $$(".lab-choice").forEach(b=>b.disabled=v);
}
async function poolForMode(){
  const all=state.archive.filter(p=>p.published!==false);
  if(state.mode==="portrait")return all.filter(p=>p.orientation==="portrait");
  if(state.mode==="landscape")return all.filter(p=>p.orientation==="landscape");
  if(["warm","cool","light","dark"].includes(state.mode)){
    await ensureColorData();
    const scored=all.filter(p=>state.colorData[p.id]);
    if(state.mode==="warm")scored.sort((a,b)=>state.colorData[b.id].warmth-state.colorData[a.id].warmth);
    if(state.mode==="cool")scored.sort((a,b)=>state.colorData[a.id].warmth-state.colorData[b.id].warmth);
    if(state.mode==="light")scored.sort((a,b)=>state.colorData[b.id].luminance-state.colorData[a.id].luminance);
    if(state.mode==="dark")scored.sort((a,b)=>state.colorData[a.id].luminance-state.colorData[b.id].luminance);
    return scored.slice(0,Math.min(scored.length,Math.max(cellCount()*3,24)));
  }
  return all;
}
function chooseUnique(pool,count,excluding=[]){
  const banned=new Set(excluding);
  const first=shuffle(pool.filter(p=>!banned.has(p.id)));
  const fallback=shuffle(pool);
  const out=[];
  while(out.length<count&&first.length)out.push(first.shift());
  let i=0;
  while(out.length<count&&fallback.length){out.push(fallback[i%fallback.length]);i++}
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
  if(!pool.length)pool=state.archive;
  state.selected=chooseUnique(pool,cellCount());
  renderGrid();
}
async function replaceCell(index){
  if(state.busy)return;
  const cell=$$('.lab-cell')[index];
  if(cell)cell.classList.add("is-changing");
  setStatus(tr("changing")+" · "+String(index+1).padStart(2,"0"));
  let pool=await poolForMode();
  const used=state.selected.map(p=>p.id);
  let options=pool.filter(p=>!used.includes(p.id));
  if(!options.length)options=pool;
  const next=options[Math.floor(Math.random()*options.length)];
  if(next)state.selected[index]=next;
  renderGrid();
  setStatus("");
}
function renderGrid(){
  const grid=$("#lab-grid");
  grid.dataset.size=String(state.size);
  grid.innerHTML=state.selected.map((p,i)=>
    '<button class="lab-cell" type="button" data-index="'+i+'" aria-label="['+p.id+'] '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"><span class="lab-cell-change" aria-hidden="true">↻</span><span class="lab-cell-index">['+p.id+']</span></button>'
  ).join("");
  $$(".lab-cell").forEach(b=>b.addEventListener("click",()=>replaceCell(Number(b.dataset.index))));
  renderMeta();
}
function renderMeta(){
  $("#grid-count").textContent=String(cellCount()).padStart(2,"0")+" "+tr("photos");
  $("#selection-mode").textContent="// "+modeLabel().toUpperCase();
  $("#selection-ids").textContent=state.selected.map(p=>"["+p.id+"]").join(" ");
}
function coverRect(img,x,y,w,h){
  const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;
  return {dx:x+(w-dw)/2,dy:y+(h-dh)/2,dw,dh};
}
async function exportGrid(){
  if(state.busy||!state.selected.length)return;
  setBusy(true);setStatus(tr("exporting"));
  try{
    const size=1440,gap=6,n=state.size,cell=(size-gap*(n-1))/n;
    const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext("2d");ctx.fillStyle="#111311";ctx.fillRect(0,0,size,size);
    const images=await Promise.all(state.selected.map(p=>loadImage(p.image)));
    images.forEach((img,i)=>{
      const col=i%n,row=Math.floor(i/n),x=col*(cell+gap),y=row*(cell+gap);
      ctx.save();ctx.beginPath();ctx.rect(x,y,cell,cell);ctx.clip();
      const r=coverRect(img,x,y,cell,cell);ctx.drawImage(img,r.dx,r.dy,r.dw,r.dh);ctx.restore();
    });
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",.95));
    if(!blob)throw new Error("blob");
    const file=new File([blob],"aficionadxs-grid-"+n+"x"+n+".png",{type:"image/png"});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:"AFICIONADXS GRID"});
    }else{
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    }
    setStatus(tr("shared"));
  }catch(err){
    if(err?.name!=="AbortError")setStatus(tr("exportError"));else setStatus("");
  }finally{setBusy(false)}
}
function bind(){
  $$(".lang-toggle").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang)));
  $$("#size-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{
    const size=Number(b.dataset.size);
    state.size=size;
    $$("#size-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));
    await buildGrid();
  }));
  $$("#mode-controls .lab-choice").forEach(b=>b.addEventListener("click",async()=>{
    state.mode=b.dataset.mode;
    $$("#mode-controls .lab-choice").forEach(x=>x.classList.toggle("active",x===b));
    await buildGrid();
  }));
  $("#shuffle-grid").addEventListener("click",buildGrid);
  $("#export-grid").addEventListener("click",exportGrid);
}
async function init(){
  loadCachedColors();
  const response=await fetch("/data/archive.json?v=20261007-photos76");
  if(!response.ok)throw new Error("archive");
  state.archive=(await response.json()).filter(p=>p.published!==false);
  bind();applyLanguage();await buildGrid();
}
init().catch(err=>{console.error(err);setStatus("ARCHIVE ERROR")});
