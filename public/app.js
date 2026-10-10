const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const ARCHIVE_INITIAL_ROWS=2;
const ARCHIVE_PAGE_SIZE=20;
const HOME_SELECTION=["001","011","016","031","036","046","061","071","076"];
const isArchivePage=()=>document.body?.dataset.page==="archive";
const pageFromUrl=()=>Math.max(1,parseInt(new URLSearchParams(location.search).get("page")||"1",10)||1);
const state={
  archive:[],products:[],
  filter:"all",
  view:localStorage.getItem("afcndxs-archive-view")||"grid",
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  carouselIndex:0,archivePage:pageFromUrl(),
  activePhoto:null
};
const PHOTO_LABELS={es:{previous:"FOTO ANTERIOR",next:"FOTO SIGUIENTE",link:"VER EN ARCHIVO ↗"},ca:{previous:"FOTO ANTERIOR",next:"FOTO SEGÜENT",link:"VEURE A L’ARXIU ↗"},en:{previous:"PREVIOUS PHOTO",next:"NEXT PHOTO",link:"VIEW IN ARCHIVE ↗"}};
const photoLabel=key=>(PHOTO_LABELS[state.lang]||PHOTO_LABELS.es)[key];

const T={
  es:{
    navArchive:"ARCHIVO",navEditions:"EDICIONES",navObjects:"OBJETOS",
    heroTitle:"FOTOGRAFÍAS<br>RECOGIDAS<br>EN EL CAMINO.",
    heroMeta:"ARCHIVO FOTOGRÁFICO EN CURSO",exploreArchive:"EXPLORAR ARCHIVO ↗",
    archiveHeading:"// ARCHIVO",archiveIntro:"FOTOGRAFÍAS RECOGIDAS EN EL CAMINO. UN ARCHIVO EN CURSO.",editionsHeading:"// EDICIONES",objectsHeading:"// OBJETOS",
    all:"TODAS",view:"VISTA",grid:"GRID",carousel:"CARRUSEL",now:"AHORA",photoDesign:"FOTO → DISEÑO",
    editionsNote:"Cada edición está vinculada a su fotografía original. La aplicación sobre un objeto físico es una capa separada.",
    makePhysical:"LLEVAR EL ARCHIVO A LO FÍSICO",
    objectsNote:"Los objetos nacen de fotografías del archivo. Materiales, técnicas y formatos se exploran por separado.",
    info1:"AFICIONADXS es un archivo fotográfico en curso. Algunas imágenes salen del archivo para convertirse en prints, postales, prendas y objetos.",
    info2:"El archivo crece con el tiempo. Algunas fotografías se transforman en objetos; otras permanecen como imágenes.",
    footerLine:"FOTOGRAFÍA → OBJETO",name:"NOMBRE",countryPostcode:"PAÍS / CÓDIGO POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR CONSULTA POR WHATSAPP →",clearRequest:"VACIAR CONSULTA",
    request:"CONSULTA",emptyRequest:"NO HAY PIEZAS EN LA CONSULTA.",
    estimatedTotal:"TOTAL ESTIMADO",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTÍCULOS A CONFIRMAR",
    date:"FECHA",time:"HORA",region:"REGIÓN",coord:"COORD.",camera:"CÁMARA",lens:"LENTE",capture:"CAPTURA",address:"DIRECCIÓN",event:"EVENTO",architect:"ARQUITECTURA",temperature:"TEMPERATURA",
    relatedEditions:"EDICIONES RELACIONADAS",format:"SOPORTE",edition:"EDICIÓN",size:"TALLA / TAMAÑO",color:"COLOR",
    addRequest:"AÑADIR A CONSULTA →",sourcePhoto:"FOTO ORIGINAL",place:"LUGAR",applications:"APLICACIONES",
    viewSource:"VER FOTO ORIGINAL →",editionNote:"La edición es la composición gráfica. El objeto físico se elige por separado.",
    remove:"QUITAR",requestConfirm:"Quisiera consultar disponibilidad, opciones de producción, precio y envío.",
    photograph:"FOTOGRAFÍA",archiveEdition:"EDICIÓN DE ARCHIVO",supportDesign:"DISEÑO DEL SOPORTE",white:"BLANCO",black:"NEGRO",designAvailable:"DISEÑO DISPONIBLE",previous:"ANTERIOR",next:"SIGUIENTE",showMore:"MOSTRAR MÁS",showLess:"MOSTRAR MENOS",
    models:"MODELOS",model:"MODELO",noPhotographs:"NO HAY FOTOGRAFÍAS.",
    previewsPreparing:"SE ESTÁN PREPARANDO LAS PREVISUALIZACIONES DE LAS EDICIONES APROBADAS A PARTIR DE LOS ARCHIVOS DE DISEÑO ORIGINALES.",
    archiveLoadError:"NO SE HAN PODIDO CARGAR LOS DATOS DEL ARCHIVO.",seeAllArchive:"VER TODO EL ARCHIVO →",seeAllEditions:"VER TODAS LAS EDICIONES →"
  },
  ca:{
    navArchive:"ARXIU",navEditions:"EDICIONS",navObjects:"OBJECTES",
    heroTitle:"FOTOGRAFIES<br>RECOLLIDES<br>PEL CAMÍ.",
    heroMeta:"ARXIU FOTOGRÀFIC EN CURS",exploreArchive:"EXPLORAR L’ARXIU ↗",
    archiveHeading:"// ARXIU",archiveIntro:"FOTOGRAFIES RECOLLIDES PEL CAMÍ. UN ARXIU EN CURS.",editionsHeading:"// EDICIONS",objectsHeading:"// OBJECTES",
    all:"TOTES",view:"VISTA",grid:"GRAELLA",carousel:"CARRUSEL",now:"ARA",photoDesign:"FOTO → DISSENY",
    editionsNote:"Cada edició està vinculada a la fotografia original. L’aplicació sobre un objecte físic és una capa separada.",
    makePhysical:"PORTAR L’ARXIU AL MÓN FÍSIC",
    objectsNote:"Els objectes neixen de fotografies de l’arxiu. Materials, tècniques i formats s’exploren per separat.",
    info1:"AFICIONADXS és un arxiu fotogràfic en curs. Algunes imatges surten de l’arxiu per convertir-se en impressions, postals, peces de roba i objectes.",
    info2:"L’arxiu creix amb el temps. Algunes fotografies es transformen en objectes; d’altres continuen sent imatges.",
    footerLine:"FOTOGRAFIA → OBJECTE",name:"NOM",countryPostcode:"PAÍS / CODI POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR CONSULTA PER WHATSAPP →",clearRequest:"BUIDAR CONSULTA",
    request:"CONSULTA",emptyRequest:"NO HI HA CAP PEÇA A LA CONSULTA.",
    estimatedTotal:"TOTAL ESTIMAT",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTICLES A CONFIRMAR",
    date:"DATA",time:"HORA",region:"REGIÓ",coord:"COORD.",camera:"CÀMERA",lens:"OBJECTIU",capture:"CAPTURA",address:"ADREÇA",event:"ESDEVENIMENT",architect:"ARQUITECTURA",temperature:"TEMPERATURA",
    relatedEditions:"EDICIONS RELACIONADES",format:"SUPORT",edition:"EDICIÓ",size:"TALLA / MIDA",color:"COLOR",
    addRequest:"AFEGIR A LA CONSULTA →",sourcePhoto:"FOTO ORIGINAL",place:"LLOC",applications:"APLICACIONS",
    viewSource:"VEURE FOTO ORIGINAL →",editionNote:"L’edició és la composició gràfica. L’objecte físic es tria per separat.",
    remove:"TREURE",requestConfirm:"Voldria consultar disponibilitat, opcions de producció, preu i enviament.",
    photograph:"FOTOGRAFIA",archiveEdition:"EDICIÓ D’ARXIU",supportDesign:"DISSENY DEL SUPORT",
    white:"BLANC",black:"NEGRE",designAvailable:"DISSENY DISPONIBLE",previous:"ANTERIOR",next:"SEGÜENT",showMore:"MOSTRA’N MÉS",showLess:"MOSTRA’N MENYS",
    models:"MODELS",model:"MODEL",noPhotographs:"CAP FOTOGRAFIA.",
    previewsPreparing:"S’ESTAN PREPARANT LES PREVISUALITZACIONS DE LES EDICIONS APROVADES A PARTIR DELS ARXIUS DE DISSENY ORIGINALS.",
    archiveLoadError:"NO S’HAN POGUT CARREGAR LES DADES DE L’ARXIU.",seeAllArchive:"VEURE TOT L’ARXIU →",seeAllEditions:"VEURE TOTES LES EDICIONS →"
  },
  en:{
    navArchive:"ARCHIVE",navEditions:"EDITIONS",navObjects:"OBJECTS",
    heroTitle:"PHOTOGRAPHS<br>COLLECTED<br>ALONG THE WAY.",
    heroMeta:"ONGOING PHOTOGRAPHIC ARCHIVE",exploreArchive:"EXPLORE ARCHIVE ↗",
    archiveHeading:"// ARCHIVE",archiveIntro:"PHOTOGRAPHS COLLECTED ALONG THE WAY. AN ONGOING ARCHIVE.",editionsHeading:"// EDITIONS",objectsHeading:"// OBJECTS",
    all:"ALL",view:"VIEW",grid:"GRID",carousel:"CAROUSEL",now:"NOW",photoDesign:"PHOTO → DESIGN",
    editionsNote:"Each edition is linked back to its source photograph. Product applications are separate from the design itself.",
    makePhysical:"MAKE THE ARCHIVE PHYSICAL",
    objectsNote:"Objects begin with photographs from the archive. Materials, techniques and formats are explored individually.",
    info1:"AFICIONADXS is an ongoing photographic archive. Selected images move from the archive into physical form: prints, postcards, garments and objects.",
    info2:"The archive keeps growing. Some photographs become objects; others remain images.",
    footerLine:"PHOTOGRAPHY → OBJECT",name:"NAME",countryPostcode:"COUNTRY / POSTCODE",note:"NOTE",
    sendWhatsapp:"SEND REQUEST VIA WHATSAPP →",clearRequest:"CLEAR ENQUIRY",
    request:"ENQUIRY",emptyRequest:"NO ITEMS IN REQUEST.",
    estimatedTotal:"ESTIMATED TOTAL",toConfirm:"TO CONFIRM",itemsToConfirm:" + ITEMS TO CONFIRM",
    date:"DATE",time:"TIME",region:"REGION",coord:"COORD.",camera:"CAMERA",lens:"LENS",capture:"CAPTURE",address:"ADDRESS",event:"EVENT",architect:"ARCHITECTURE",temperature:"TEMPERATURE",
    relatedEditions:"RELATED EDITIONS",format:"FORMAT",edition:"EDITION",size:"SIZE",color:"COLOR",
    addRequest:"ADD TO ENQUIRY →",sourcePhoto:"SOURCE PHOTO",place:"PLACE",applications:"APPLICATIONS",
    viewSource:"VIEW SOURCE PHOTO →",editionNote:"The edition is the graphic composition. The physical object is chosen separately.",
    remove:"REMOVE",requestConfirm:"I’d like to check availability, production options, price and shipping.",
    photograph:"PHOTOGRAPH",archiveEdition:"ARCHIVE EDITION",supportDesign:"SUPPORT DESIGN",white:"WHITE",black:"BLACK",designAvailable:"DESIGN AVAILABLE",previous:"PREVIOUS",next:"NEXT",showMore:"SHOW MORE",showLess:"SHOW LESS",
    models:"MODELS",model:"MODEL",noPhotographs:"NO PHOTOGRAPHS.",
    previewsPreparing:"APPROVED EDITION PREVIEWS ARE BEING PREPARED FROM THE ORIGINAL DESIGN FILES.",
    archiveLoadError:"ARCHIVE DATA COULD NOT BE LOADED.",seeAllArchive:"VIEW FULL ARCHIVE →",seeAllEditions:"VIEW ALL EDITIONS →"
  }
};
const t=k=>T[state.lang][k]||k;

const COUNTRY={
  AR:{es:"ARGENTINA",ca:"ARGENTINA",en:"ARGENTINA"},BE:{es:"BÉLGICA",ca:"BÈLGICA",en:"BELGIUM"},CH:{es:"SUIZA",ca:"SUÏSSA",en:"SWITZERLAND"},
  CZ:{es:"CHEQUIA",ca:"TXÈQUIA",en:"CZECHIA"},DE:{es:"ALEMANIA",ca:"ALEMANYA",en:"GERMANY"},DK:{es:"DINAMARCA",ca:"DINAMARCA",en:"DENMARK"},
  ES:{es:"ESPAÑA",ca:"ESPANYA",en:"SPAIN"},FR:{es:"FRANCIA",ca:"FRANÇA",en:"FRANCE"},GR:{es:"GRECIA",ca:"GRÈCIA",en:"GREECE"},
  IE:{es:"IRLANDA",ca:"IRLANDA",en:"IRELAND"},IT:{es:"ITALIA",ca:"ITÀLIA",en:"ITALY"},MA:{es:"MARRUECOS",ca:"MARROC",en:"MOROCCO"},NL:{es:"PAÍSES BAJOS",ca:"PAÏSOS BAIXOS",en:"NETHERLANDS"},
  PT:{es:"PORTUGAL",ca:"PORTUGAL",en:"PORTUGAL"},US:{es:"ESTADOS UNIDOS",ca:"ESTATS UNITS",en:"UNITED STATES"}
};
const isCatalunyaPhoto=p=>p?.countryCode==="ES"&&/catalunya/i.test(p?.region||"");
const countryName=p=>isCatalunyaPhoto(p)?"CATALUNYA":(COUNTRY[p.countryCode]?.[state.lang]||p.country).toUpperCase();

const formatDate=v=>{
  if(!v)return"—";
  if(/^\d{4}-\d{2}$/.test(v)){const[y,m]=v.split("-");return m+"."+y}
  const[y,m,d]=v.split("-");return[d,m,y].filter(Boolean).join(".");
};
const prodName=p=>p["name_"+state.lang]||p.name_en||p.name||p.id;
const prodDesc=p=>p["description_"+state.lang]||p.description_en||p.description||"";
async function init(){
  if(isArchivePage()){
    const response=await fetch("/data/archive.json?v=20261007-photos76");
    if(!response.ok)throw new Error("Archive data unavailable");
    state.archive=await response.json();
  }else{
    const response=await fetch("/data/products.json?v=20261009-products02");
    if(!response.ok)throw new Error("Objects data unavailable");
    state.products=await response.json();
  }
  bindStaticEvents();applyLanguage();renderAll();
  if(isArchivePage()){
    window.addEventListener("popstate",()=>{
      state.archivePage=pageFromUrl();
      renderArchive();
      const id=new URLSearchParams(location.search).get("photo");
      if(id)openPhoto(id,{updateUrl:false});
      else if($("#photo-dialog").open)$("#photo-dialog").close();
    });
    let resizeTimer=null;
    window.addEventListener("resize",()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(renderArchive,120);
    });
    document.addEventListener("keydown",ev=>{
      if($("#photo-dialog").open){
        if(ev.key==="ArrowLeft"){ev.preventDefault();movePhoto(-1)}
        if(ev.key==="ArrowRight"){ev.preventDefault();movePhoto(1)}
      }else if(state.view==="carousel"){
        if(ev.key==="ArrowLeft")moveCarousel(-1);
        if(ev.key==="ArrowRight")moveCarousel(1);
      }
    });
    const direct=new URLSearchParams(location.search).get("photo");
    if(direct)openPhoto(direct,{updateUrl:false});
  }else{
    restoreLandingAnchor();
  }
}
function restoreLandingAnchor(){
  const hash=location.hash.slice(1);
  if(!["objects","info"].includes(hash))return;
  const section=document.getElementById(hash);
  if(!section)return;
  requestAnimationFrame(()=>section.scrollIntoView({behavior:"instant",block:"start"}));
}
function renderAll(){if(isArchivePage())renderArchive();else renderObjects()}
function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  $$("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
}
function setLanguage(lang){
  state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage();renderAll();
  if(isArchivePage()&&$("#photo-dialog").open&&state.activePhoto)renderPhotoDetail();
}
function bindStaticEvents(){
  $$(".lang-toggle").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
  $$(".filter").forEach(b=>b.addEventListener("click",()=>{
    state.filter=b.dataset.filter;state.carouselIndex=0;state.archivePage=1;
    if(isArchivePage())replaceArchiveUrl(1);
    $$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderArchive();
  }));
  $$(".view-toggle").forEach(b=>b.addEventListener("click",()=>{
    const v=b.dataset.view;
    if(isArchivePage()&&v==="carousel")state.carouselIndex=(state.archivePage-1)*ARCHIVE_PAGE_SIZE;
    if(isArchivePage()&&v==="grid")state.archivePage=Math.floor(state.carouselIndex/ARCHIVE_PAGE_SIZE)+1;
    state.view=v;localStorage.setItem("afcndxs-archive-view",v);
    if(isArchivePage()&&v==="grid")replaceArchiveUrl(state.archivePage);
    renderArchive();
  }));
  const prev=$("#archive-prev"),next=$("#archive-next");
  if(prev)prev.onclick=()=>setArchivePage(state.archivePage-1);
  if(next)next.onclick=()=>setArchivePage(state.archivePage+1);
  if($("#carousel-prev"))$("#carousel-prev").onclick=()=>moveCarousel(-1);
  if($("#carousel-next"))$("#carousel-next").onclick=()=>moveCarousel(1);
  const dialog=$("#photo-dialog");
  if(dialog){
  $("#close-photo").onclick=()=>dialog.close();
  dialog.addEventListener("click",ev=>{if(ev.target===dialog)dialog.close()});
  dialog.addEventListener("close",()=>{
    state.activePhoto=null;
    if(isArchivePage()&&new URLSearchParams(location.search).has("photo")){
      const url=new URL(location.href);url.searchParams.delete("photo");
      history.replaceState({},"",url.pathname+url.search+url.hash);
    }
  });
  }
  document.addEventListener("contextmenu",ev=>{if(ev.target.closest(".archive-image,.detail-visual"))ev.preventDefault()});
  document.addEventListener("dragstart",ev=>{if(ev.target.tagName==="IMG")ev.preventDefault()});
}
function filteredArchive(){const published=state.archive.filter(p=>p.published!==false);return state.filter==="all"?published:published.filter(p=>p.countryCode===state.filter)}
function visibleArchive(){
 if(isArchivePage())return filteredArchive();
 return HOME_SELECTION.map(id=>state.archive.find(p=>p.id===id&&p.published!==false)).filter(Boolean);
}
function archiveColumns(){return window.matchMedia("(max-width:560px)").matches?2:window.matchMedia("(max-width:900px)").matches?3:4}
function archiveUrlForPage(page){
  const url=new URL(location.href);
  if(page<=1)url.searchParams.delete("page");else url.searchParams.set("page",String(page));
  return url.pathname+url.search+url.hash;
}
function replaceArchiveUrl(page){history.replaceState({},"",archiveUrlForPage(page))}
function pushArchiveUrl(page){history.pushState({},"",archiveUrlForPage(page))}
function setArchivePage(page){
  if(!isArchivePage())return;
  const total=filteredArchive().length,maxPage=Math.max(1,Math.ceil(total/ARCHIVE_PAGE_SIZE));
  const next=Math.min(Math.max(1,page),maxPage);
  if(next===state.archivePage)return;
  state.archivePage=next;pushArchiveUrl(next);renderArchive();
  $("#archive")?.scrollIntoView({behavior:"auto",block:"start"});
}
function renderArchive(){
  const full=visibleArchive(),grid=$("#archive-grid"),carousel=$("#archive-carousel");
  let list=full;
  if(isArchivePage()){
    const maxPage=Math.max(1,Math.ceil(full.length/ARCHIVE_PAGE_SIZE)),requested=state.archivePage;
    state.archivePage=Math.min(Math.max(1,state.archivePage),maxPage);
    if(state.archivePage!==requested)replaceArchiveUrl(state.archivePage);
    const start=(state.archivePage-1)*ARCHIVE_PAGE_SIZE;
    list=full.slice(start,start+ARCHIVE_PAGE_SIZE);
  }else{
    list=full.slice(0,archiveColumns()*ARCHIVE_INITIAL_ROWS);
  }
  $$(".view-toggle").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
  if(state.view==="carousel"){grid.hidden=true;carousel.hidden=false;renderCarousel(full);renderArchivePagination(full.length);return}
  grid.hidden=false;carousel.hidden=true;
  grid.innerHTML=list.map(p=>{
    const ribbon="";
    return '<article class="archive-card" data-id="'+p.id+'" tabindex="0" role="button"><div class="archive-image">'+ribbon+'<img src="'+p.image+'" alt="'+p.title+'" loading="lazy" draggable="false"></div><div class="archive-data"><span class="archive-id">['+p.id+']</span><span class="archive-title">'+p.title+'</span><span class="archive-place">'+p.city+' / '+countryName(p)+' · '+formatDate(p.date)+'</span></div></article>';
  }).join("");
  grid.onclick=ev=>{const card=ev.target.closest(".archive-card");if(card)openPhoto(card.dataset.id)};grid.onkeydown=ev=>{const card=ev.target.closest(".archive-card");if(card&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();openPhoto(card.dataset.id)}};
  renderArchivePagination(full.length);
}
function renderArchivePagination(total){
  const nav=$("#archive-pagination");if(!nav)return;
  if(state.view==="carousel"){nav.hidden=true;return}
  nav.hidden=false;
  const prev=$("#archive-prev"),next=$("#archive-next"),range=$("#archive-page-range");
  if(!total){
    range.textContent="0 / 0";prev.disabled=true;next.disabled=true;return;
  }
  const start=(state.archivePage-1)*ARCHIVE_PAGE_SIZE+1,end=Math.min(total,state.archivePage*ARCHIVE_PAGE_SIZE);
  range.textContent=start+"–"+end+" / "+total;
  prev.disabled=state.archivePage<=1;
  next.disabled=end>=total;
}
function renderCarousel(list=visibleArchive()){
  if(!list.length){$("#carousel-stage").innerHTML="<p>"+t("noPhotographs")+"</p>";return}
  if(state.carouselIndex>=list.length)state.carouselIndex=0;if(state.carouselIndex<0)state.carouselIndex=list.length-1;
  const p=list[state.carouselIndex],pos=String(state.carouselIndex+1).padStart(2,"0"),total=String(list.length).padStart(2,"0");
  const ribbon="";
  $("#carousel-stage").innerHTML='<div class="carousel-frame">'+ribbon+'<button type="button" class="carousel-photo" data-id="'+p.id+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"></button><div class="carousel-meta"><span>['+p.id+']</span><span>'+p.title+'<br>'+p.city+' / '+countryName(p)+'</span><span>'+pos+' / '+total+'</span></div></div>';
  $(".carousel-photo").onclick=()=>openPhoto(p.id);
}
function moveCarousel(delta){const list=visibleArchive();if(!list.length)return;state.carouselIndex=(state.carouselIndex+delta+list.length)%list.length;renderCarousel(list)}
function objectIcon(type){
  const common='viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';
  const icons={
    print:'<svg '+common+'><path d="M20 9h30v39H20z"/><path d="M14 15h30v40H14z"/><path d="M19 21h20v25H19z"/><path d="m20 42 5-7 5 4 4-6 5 7"/><circle cx="34" cy="28" r="2.4"/></svg>',
    postcard:'<svg '+common+'><rect x="8" y="18" width="48" height="28" rx="1.5"/><path d="M35 21v22"/><path d="M40 25h10v8H40z"/><path d="M12 38h17M12 33h13M12 28h15"/></svg>',
    tshirt:'<svg '+common+'><path d="M24 13 15 17 7 25l7 8 6-5v24h24V28l6 5 7-8-8-8-9-4c-1 4-4 6-8 6s-7-2-8-6Z"/><path d="M24 13c1 2 4 4 8 4s7-2 8-4"/></svg>',
    sweatshirt:'<svg '+common+'><path d="M23 13 14 18 8 26 3 45l8 3 8-18 3-3v26h20V27l3 3 8 18 8-3-5-19-6-8-9-5c-2 4-5 6-9 6s-7-2-9-6Z"/><path d="M25 14c1 3 3 5 7 5s6-2 7-5"/><path d="M22 47h20"/><path d="m4 42 8 3m40 0 8-3"/></svg>',
    tote:'<svg '+common+'><path d="M15 24h34l-3 32H18z"/><path d="M23 25v-5c0-8 3-13 9-13s9 5 9 13v5"/><path d="M27 25v-5c0-5 2-8 5-8s5 3 5 8v5"/></svg>',
    notebook:'<svg '+common+'><rect x="20" y="8" width="30" height="48" rx="1.5"/><path d="M27 8v48"/><path d="M16 15h9M16 23h9M16 31h9M16 39h9M16 47h9"/><path d="M32 18h12M32 24h9"/></svg>'
  };
  return icons[type]||icons.print;
}

function renderObjects(){
  const list=$("#object-list");if(!list)return;
  list.innerHTML=state.products.map(p=>{
    return '<article class="object-card"><div class="object-card-head"><span class="object-code">'+p.code+'</span><div class="object-thumb">'+objectIcon(p.thumbnailType||p.id)+'</div></div><div class="object-title"><strong>'+prodName(p)+'</strong></div><p class="object-desc">'+prodDesc(p)+'</p></article>';
  }).join("");
}
function dataRow(a,b){return b?'<div class="data-row"><span>'+a+'</span><span>'+b+'</span></div>':""}
function photoPermalink(id){return "/archive.html?photo="+encodeURIComponent(id)}
function syncPhotoUrl(id){
  if(!isArchivePage())return;
  const url=new URL(location.href);
  url.searchParams.set("photo",id);
  history.replaceState({},"",url.pathname+url.search+url.hash);
}
function openPhoto(id,{updateUrl=true}={}){
  const photo=state.archive.find(p=>String(p.id)===String(id)&&p.published!==false);
  if(!photo)return;
  state.activePhoto=photo;
  if(isArchivePage()){
    const idx=filteredArchive().findIndex(p=>p.id===photo.id);
    if(idx>=0){
      const targetPage=Math.floor(idx/ARCHIVE_PAGE_SIZE)+1;
      if(state.archivePage!==targetPage){state.archivePage=targetPage;renderArchive()}
    }
  }
  if(updateUrl)syncPhotoUrl(photo.id);
  renderPhotoDetail();
  if(!$("#photo-dialog").open)$("#photo-dialog").showModal();
}
function movePhoto(delta){
  if(!state.activePhoto)return;
  const list=visibleArchive(),idx=list.findIndex(p=>p.id===state.activePhoto.id);
  if(idx<0||!list.length)return;
  openPhoto(list[(idx+delta+list.length)%list.length].id);
}
function renderPhotoDetail(){
  const p=state.activePhoto;if(!p)return;
  const list=visibleArchive(),idx=list.findIndex(x=>x.id===p.id);
  const position=idx<0?"":(idx+1)+" / "+list.length;
  const meta=
    dataRow(t("date"),p.date?formatDate(p.date):null)+
    dataRow(t("time"),p.time)+
    dataRow(t("address"),p.address)+
    dataRow(t("region"),p.region)+
    dataRow(t("coord"),p.coordinates)+
    dataRow(t("camera"),p.camera)+
    dataRow(t("lens"),p.lens)+
    dataRow(t("capture"),p.capture)+
    dataRow(t("temperature"),p.temperature)+
    dataRow(t("architect"),p.architect)+
    dataRow(t("event"),p.event);
  $("#photo-detail").innerHTML='<div class="detail-shell"><div class="detail-visual photo-detail-visual"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"></div><div class="detail-panel"><div class="detail-id">['+p.id+'] // AFICIONADXS ARCHIVE</div><h2>'+p.title+'</h2><p class="photo-location">'+[p.place,p.city+" / "+countryName(p)].filter(Boolean).join("<br>")+'</p><div class="photo-detail-nav"><button id="photo-prev" type="button" aria-label="'+photoLabel("previous")+'">←</button><span>'+position+'</span><button id="photo-next" type="button" aria-label="'+photoLabel("next")+'">→</button></div><div class="data-table">'+meta+'</div><a class="photo-permalink" href="'+photoPermalink(p.id)+'">'+photoLabel("link")+'</a></div></div>';
  $("#photo-prev").onclick=()=>movePhoto(-1);
  $("#photo-next").onclick=()=>movePhoto(1);
}
init().catch(e=>{console.error(e);const container=$("#archive-grid")||$("#object-list");if(container)container.innerHTML="<p>"+t("archiveLoadError")+"</p>"});
