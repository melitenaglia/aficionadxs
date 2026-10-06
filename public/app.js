const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const ARCHIVE_INITIAL_ROWS=2;
const state={
  archive:[],editions:[],applications:[],products:[],
  filter:"all",
  view:localStorage.getItem("afcndxs-archive-view")||"grid",
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  carouselIndex:0,archiveVisibleRows:ARCHIVE_INITIAL_ROWS,
  activePhoto:null,activeEdition:null,selectedProduct:null,
  config:{model:null,edition:null,size:null,color:null},
  cart:JSON.parse(localStorage.getItem("afcndxs-request")||"[]")
};
const WHATSAPP_NUMBER="";

const T={
  es:{
    navArchive:"ARCHIVO",navEditions:"EDICIONES",navObjects:"OBJETOS",
    heroTitle:"FOTOGRAFÍAS<br>RECOGIDAS<br>EN EL CAMINO.",
    heroMeta:"ARCHIVO FOTOGRÁFICO EN CURSO",exploreArchive:"EXPLORAR ARCHIVO ↓",
    archiveHeading:"// ARCHIVO",editionsHeading:"// EDICIONES",objectsHeading:"// OBJETOS",
    all:"TODAS",view:"VISTA",grid:"GRID",carousel:"CARRUSEL",now:"AHORA",photoDesign:"FOTO → DISEÑO",
    editionsNote:"Cada edición está vinculada a su fotografía original. La aplicación sobre un objeto físico es una capa separada.",
    makePhysical:"LLEVAR EL ARCHIVO A LO FÍSICO",
    objectsNote:"Los objetos se producen a partir de fotografías y ediciones del archivo. Abre una fotografía para ver qué soportes están disponibles y preparar una consulta.",
    info1:"AFICIONADXS es un archivo fotográfico en curso. Algunas imágenes salen del archivo para convertirse en prints, postales, prendas y objetos.",
    info2:"Algunas piezas existen en stock. Otras se producen solo después de una solicitud. La fotografía sigue siendo siempre el punto de partida.",
    footerLine:"FOTOGRAFÍA → OBJETO",name:"NOMBRE",countryPostcode:"PAÍS / CÓDIGO POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR CONSULTA POR WHATSAPP →",clearRequest:"VACIAR CONSULTA",
    request:"CONSULTA",emptyRequest:"NO HAY PIEZAS EN LA CONSULTA.",
    estimatedTotal:"TOTAL ESTIMADO",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTÍCULOS A CONFIRMAR",
    date:"FECHA",time:"HORA",region:"REGIÓN",coord:"COORD.",camera:"CÁMARA",lens:"LENTE",capture:"CAPTURA",address:"DIRECCIÓN",event:"EVENTO",architect:"ARQUITECTURA",temperature:"TEMPERATURA",
    relatedEditions:"EDICIONES RELACIONADAS",format:"SOPORTE",edition:"EDICIÓN",size:"TALLA / TAMAÑO",color:"COLOR",
    addRequest:"AÑADIR A CONSULTA →",sourcePhoto:"FOTO ORIGINAL",place:"LUGAR",applications:"APLICACIONES",
    viewSource:"VER FOTO ORIGINAL →",editionNote:"La edición es la composición gráfica. El objeto físico se elige por separado.",
    remove:"QUITAR",requestConfirm:"Quisiera consultar disponibilidad, opciones de producción, precio y envío.",
    photograph:"FOTOGRAFÍA",archiveEdition:"EDICIÓN DE ARCHIVO",supportDesign:"DISEÑO DEL SOPORTE",white:"BLANCO",black:"NEGRO",designAvailable:"DISEÑO DISPONIBLE",showMore:"MOSTRAR MÁS",showLess:"MOSTRAR MENOS",
    models:"MODELOS",model:"MODELO",noPhotographs:"NO HAY FOTOGRAFÍAS.",
    previewsPreparing:"SE ESTÁN PREPARANDO LAS PREVISUALIZACIONES DE LAS EDICIONES APROBADAS A PARTIR DE LOS ARCHIVOS DE DISEÑO ORIGINALES.",
    archiveLoadError:"NO SE HAN PODIDO CARGAR LOS DATOS DEL ARCHIVO.",seeAllArchive:"VER TODO EL ARCHIVO →",seeAllEditions:"VER TODAS LAS EDICIONES →"
  },
  ca:{
    navArchive:"ARXIU",navEditions:"EDICIONS",navObjects:"OBJECTES",
    heroTitle:"FOTOGRAFIES<br>RECOLLIDES<br>PEL CAMÍ.",
    heroMeta:"ARXIU FOTOGRÀFIC EN CURS",exploreArchive:"EXPLORAR L’ARXIU ↓",
    archiveHeading:"// ARXIU",editionsHeading:"// EDICIONS",objectsHeading:"// OBJECTES",
    all:"TOTES",view:"VISTA",grid:"GRAELLA",carousel:"CARRUSEL",now:"ARA",photoDesign:"FOTO → DISSENY",
    editionsNote:"Cada edició està vinculada a la fotografia original. L’aplicació sobre un objecte físic és una capa separada.",
    makePhysical:"PORTAR L’ARXIU AL MÓN FÍSIC",
    objectsNote:"Els objectes es produeixen a partir de fotografies i edicions de l’arxiu. Obre una fotografia per veure quins suports estan disponibles i preparar una consulta.",
    info1:"AFICIONADXS és un arxiu fotogràfic en curs. Algunes imatges surten de l’arxiu per convertir-se en impressions, postals, peces de roba i objectes.",
    info2:"Algunes peces estan en estoc. D’altres només es produeixen després d’una sol·licitud. La fotografia continua sent sempre el punt de partida.",
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
    white:"BLANC",black:"NEGRE",designAvailable:"DISSENY DISPONIBLE",showMore:"MOSTRA’N MÉS",showLess:"MOSTRA’N MENYS",
    models:"MODELS",model:"MODEL",noPhotographs:"CAP FOTOGRAFIA.",
    previewsPreparing:"S’ESTAN PREPARANT LES PREVISUALITZACIONS DE LES EDICIONS APROVADES A PARTIR DELS ARXIUS DE DISSENY ORIGINALS.",
    archiveLoadError:"NO S’HAN POGUT CARREGAR LES DADES DE L’ARXIU.",seeAllArchive:"VEURE TOT L’ARXIU →",seeAllEditions:"VEURE TOTES LES EDICIONS →"
  },
  en:{
    navArchive:"ARCHIVE",navEditions:"EDITIONS",navObjects:"OBJECTS",
    heroTitle:"PHOTOGRAPHS<br>COLLECTED<br>ALONG THE WAY.",
    heroMeta:"ONGOING PHOTOGRAPHIC ARCHIVE",exploreArchive:"EXPLORE ARCHIVE ↓",
    archiveHeading:"// ARCHIVE",editionsHeading:"// EDITIONS",objectsHeading:"// OBJECTS",
    all:"ALL",view:"VIEW",grid:"GRID",carousel:"CAROUSEL",now:"NOW",photoDesign:"PHOTO → DESIGN",
    editionsNote:"Each edition is linked back to its source photograph. Product applications are separate from the design itself.",
    makePhysical:"MAKE THE ARCHIVE PHYSICAL",
    objectsNote:"Objects are produced from photographs and editions in the archive. Open a photograph to see the available formats and prepare an enquiry.",
    info1:"AFICIONADXS is an ongoing photographic archive. Selected images move from the archive into physical form: prints, postcards, garments and objects.",
    info2:"Some pieces exist in stock. Others are produced only after a request. Every photograph remains the starting point.",
    footerLine:"PHOTOGRAPHY → OBJECT",name:"NAME",countryPostcode:"COUNTRY / POSTCODE",note:"NOTE",
    sendWhatsapp:"SEND REQUEST VIA WHATSAPP →",clearRequest:"CLEAR ENQUIRY",
    request:"ENQUIRY",emptyRequest:"NO ITEMS IN REQUEST.",
    estimatedTotal:"ESTIMATED TOTAL",toConfirm:"TO CONFIRM",itemsToConfirm:" + ITEMS TO CONFIRM",
    date:"DATE",time:"TIME",region:"REGION",coord:"COORD.",camera:"CAMERA",lens:"LENS",capture:"CAPTURE",address:"ADDRESS",event:"EVENT",architect:"ARCHITECTURE",temperature:"TEMPERATURE",
    relatedEditions:"RELATED EDITIONS",format:"FORMAT",edition:"EDITION",size:"SIZE",color:"COLOR",
    addRequest:"ADD TO ENQUIRY →",sourcePhoto:"SOURCE PHOTO",place:"PLACE",applications:"APPLICATIONS",
    viewSource:"VIEW SOURCE PHOTO →",editionNote:"The edition is the graphic composition. The physical object is chosen separately.",
    remove:"REMOVE",requestConfirm:"I’d like to check availability, production options, price and shipping.",
    photograph:"PHOTOGRAPH",archiveEdition:"ARCHIVE EDITION",supportDesign:"SUPPORT DESIGN",white:"WHITE",black:"BLACK",designAvailable:"DESIGN AVAILABLE",showMore:"SHOW MORE",showLess:"SHOW LESS",
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
  IE:{es:"IRLANDA",ca:"IRLANDA",en:"IRELAND"},IT:{es:"ITALIA",ca:"ITÀLIA",en:"ITALY"},NL:{es:"PAÍSES BAJOS",ca:"PAÏSOS BAIXOS",en:"NETHERLANDS"},
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
const prodPriceLabel=p=>p["priceLabel_"+state.lang]||p.priceLabel_en||p.priceLabel||t("toConfirm");
const modelName=m=>m?m["name_"+state.lang]||m.name_en||m.name||m.id:"";
const modelDesc=m=>m?m["description_"+state.lang]||m.description_en||m.description||"":"";
const selectedModel=p=>p?.models?.find(m=>m.id===state.config.model)||p?.models?.[0]||null;
const money=v=>v==null?t("toConfirm"):v.toFixed(0)+" EUR";
const localizeEdition=v=>{
  let out=v||"";
  if(state.lang==="en")return out;
  return out
    .replaceAll("PHOTOGRAPH",t("photograph"))
    .replaceAll("ARCHIVE EDITION",t("archiveEdition"))
    .replaceAll("SUPPORT DESIGN",t("supportDesign"))
    .replaceAll("WHITE",t("white"))
    .replaceAll("BLACK",t("black"));
};
const displayOption=v=>{
  if(state.lang!=="ca")return v;
  const map={WHITE:"BLANC",BLACK:"NEGRE",ANTHRACITE:"ANTRACITA",NATURAL:"NATURAL","ONE SIZE":"TALLA ÚNICA",TBC:"A CONFIRMAR"};
  return map[v]||v;
};
const editionVariant=e=>localizeEdition(e.variant||"");

async function init(){
  const[a,e,s,p]=await Promise.all([fetch("/data/archive.json?v=20261003-photos59"),fetch("/data/editions.json"),fetch("/data/support-designs.json"),fetch("/data/products.json?v=20261003-compact01")]);
  state.archive=await a.json();state.editions=await e.json();state.applications=await s.json();state.products=await p.json();
  bindStaticEvents();applyLanguage();renderAll();
  $("#footer-year").textContent=new Date().getFullYear();
  let archiveResizeTimer=null;
  window.addEventListener("resize",()=>{
    clearTimeout(archiveResizeTimer);
    archiveResizeTimer=setTimeout(()=>{if(state.view==="grid")renderArchive()},120);
  });
  document.addEventListener("keydown",ev=>{
    if(state.view==="carousel"&&!$("#photo-dialog").open&&!$("#cart-drawer").classList.contains("open")){
      if(ev.key==="ArrowLeft")moveCarousel(-1);
      if(ev.key==="ArrowRight")moveCarousel(1);
    }
  });
}
function renderAll(){renderArchive();renderObjects();renderCart()}
function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  $$("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  $("#request-label").textContent=t("request");
  $("#request-heading").textContent="// "+t("request");
}
function setLanguage(lang){
  state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage();renderAll();
  if($("#photo-dialog").open&&state.activePhoto)renderPhotoDetail();
}
function bindStaticEvents(){
  $$(".lang-toggle").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
  $$(".filter").forEach(b=>b.addEventListener("click",()=>{
    state.filter=b.dataset.filter;state.carouselIndex=0;state.archiveVisibleRows=ARCHIVE_INITIAL_ROWS;
    $$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderArchive();
  }));
  $$(".view-toggle").forEach(b=>b.addEventListener("click",()=>{
    state.view=b.dataset.view;localStorage.setItem("afcndxs-archive-view",state.view);
    renderArchive();
  }));
  const more=$("#archive-more");if(more)more.onclick=()=>{const total=filteredArchive().length,cols=archiveColumns(),shown=Math.min(total,state.archiveVisibleRows*cols);state.archiveVisibleRows=shown>=total?ARCHIVE_INITIAL_ROWS:state.archiveVisibleRows+1;renderArchive()};
  $("#carousel-prev").onclick=()=>moveCarousel(-1);
  $("#carousel-next").onclick=()=>moveCarousel(1);
  $("#open-cart").onclick=openCart;$("#close-cart").onclick=closeCart;$("#drawer-backdrop").onclick=closeCart;
  $("#close-photo").onclick=()=>$("#photo-dialog").close();
  $("#photo-dialog").addEventListener("click",ev=>{if(ev.target===$("#photo-dialog"))$("#photo-dialog").close()});
  $("#clear-cart").onclick=()=>{state.cart=[];saveCart();renderCart()};
  $("#send-request").onclick=sendRequest;
  document.addEventListener("contextmenu",ev=>{if(ev.target.closest(".archive-image,.detail-visual"))ev.preventDefault()});
  document.addEventListener("dragstart",ev=>{if(ev.target.tagName==="IMG")ev.preventDefault()});
}
function filteredArchive(){const published=state.archive.filter(p=>p.published!==false);return state.filter==="all"?published:published.filter(p=>p.countryCode===state.filter)}
function photoEditions(photoId){return state.editions.filter(e=>e.archiveId===photoId&&e.approved&&e.publicPreview&&String(e.variant||"").toUpperCase()!=="BLACK")}
function photoHasEdition(photoId){return photoEditions(photoId).length>0}
function archiveColumns(){return window.matchMedia("(max-width:560px)").matches?2:window.matchMedia("(max-width:900px)").matches?3:4}
function renderArchive(){
  const full=filteredArchive(),grid=$("#archive-grid"),carousel=$("#archive-carousel"),cols=archiveColumns();
  const visibleCount=Math.min(full.length,state.archiveVisibleRows*cols),list=full.slice(0,visibleCount);
  $$(".view-toggle").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
  if(state.view==="carousel"){grid.hidden=true;carousel.hidden=false;renderCarousel(full);updateArchiveMore(full.length);return}
  grid.hidden=false;carousel.hidden=true;
  grid.innerHTML=list.map(p=>{
    const ribbon=photoHasEdition(p.id)?'<span class="design-ribbon">'+t("designAvailable")+'</span>':"";
    return '<article class="archive-card" data-id="'+p.id+'" tabindex="0" role="button"><div class="archive-image">'+ribbon+'<img src="'+p.image+'" alt="'+p.title+'" loading="lazy" draggable="false"></div><div class="archive-data"><span class="archive-id">['+p.id+']</span><span class="archive-title">'+p.title+'</span><span class="archive-place">'+p.city+' / '+countryName(p)+' · '+formatDate(p.date)+'</span></div></article>';
  }).join("");
  grid.onclick=ev=>{const card=ev.target.closest(".archive-card");if(card)openPhoto(card.dataset.id)};grid.onkeydown=ev=>{const card=ev.target.closest(".archive-card");if(card&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();openPhoto(card.dataset.id)}};
  updateArchiveMore(full.length);
}
function updateArchiveMore(total){
  const b=$("#archive-more");if(!b)return;
  const cols=archiveColumns(),shown=Math.min(total,state.archiveVisibleRows*cols);
  b.hidden=total<=cols*ARCHIVE_INITIAL_ROWS||state.view==="carousel";
  b.textContent=shown>=total?t("showLess"):t("showMore");
}
function renderCarousel(list=filteredArchive()){
  if(!list.length){$("#carousel-stage").innerHTML="<p>"+t("noPhotographs")+"</p>";return}
  if(state.carouselIndex>=list.length)state.carouselIndex=0;if(state.carouselIndex<0)state.carouselIndex=list.length-1;
  const p=list[state.carouselIndex],pos=String(state.carouselIndex+1).padStart(2,"0"),total=String(list.length).padStart(2,"0");
  const ribbon=photoHasEdition(p.id)?'<span class="design-ribbon carousel-ribbon">'+t("designAvailable")+'</span>':"";
  $("#carousel-stage").innerHTML='<div class="carousel-frame">'+ribbon+'<button type="button" class="carousel-photo" data-id="'+p.id+'"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"></button><div class="carousel-meta"><span>['+p.id+']</span><span>'+p.title+'<br>'+p.city+' / '+countryName(p)+'</span><span>'+pos+' / '+total+'</span></div></div>';
  $(".carousel-photo").onclick=()=>openPhoto(p.id);
}
function moveCarousel(delta){const list=filteredArchive();if(!list.length)return;state.carouselIndex=(state.carouselIndex+delta+list.length)%list.length;renderCarousel(list)}
function editionArtwork(e,source){
  const cls=(e.variant||"").includes("WHITE")?"edition-artwork light":"edition-artwork";
  return '<div class="'+cls+'"><div class="edition-artwork-head"><span class="edition-artwork-title">['+e.id+'] '+e.title+'</span><span class="edition-cross">+</span></div><div class="edition-artwork-photo"><img src="'+source.image+'" alt="'+source.title+'"></div><div class="edition-artwork-foot"><span>'+source.city+' · '+formatDate(source.date)+'</span><span>// AFICIONADXS</span></div></div>';
}
function renderEditions(){
  const approved=state.editions.filter(e=>e.approved&&e.publicPreview);
  if(!approved.length){
    $("#editions-grid").innerHTML='<p class="technical-note">'+t("previewsPreparing")+'</p>';
    return;
  }
  $("#editions-grid").innerHTML=approved.map(e=>{
    return '<article class="edition-card" data-id="'+e.id+'" tabindex="0" role="button"><div class="edition-image"><img src="'+e.publicPreview+'" alt="'+e.title+' '+e.variant+'" loading="lazy" draggable="false"></div><div class="edition-data"><span class="edition-id">['+e.id+']</span><strong>'+e.title+'</strong><span class="edition-variant">'+editionVariant(e)+'</span></div></article>';
  }).join("");
  $$(".edition-card").forEach(c=>{const o=()=>openEdition(c.dataset.id);c.onclick=o;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}});
}

function objectIcon(type){
  const common='viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';
  const icons={
    print:'<svg '+common+'><path d="M19 8h26v48H19z"/><path d="M23 13h18v34H23z"/><path d="m24 42 6-8 5 5 4-6 2 3"/><circle cx="36.5" cy="22.5" r="2.5"/><path d="M29 8V5h6v3"/></svg>',
    postcard:'<svg '+common+'><rect x="8" y="18" width="48" height="28" rx="1.5"/><path d="M35 21v22"/><path d="M40 25h10v8H40z"/><path d="M12 38h17M12 33h13M12 28h15"/></svg>',
    tshirt:'<svg '+common+'><path d="M24 13 15 17 7 25l7 8 6-5v24h24V28l6 5 7-8-8-8-9-4c-1 4-4 6-8 6s-7-2-8-6Z"/><path d="M24 13c1 2 4 4 8 4s7-2 8-4"/></svg>',
    sweatshirt:'<svg '+common+'><path d="M23 13 14 18 8 26 3 45l8 3 8-18 3-3v26h20V27l3 3 8 18 8-3-5-19-6-8-9-5c-2 4-5 6-9 6s-7-2-9-6Z"/><path d="M25 14c1 3 3 5 7 5s6-2 7-5"/><path d="M22 47h20"/><path d="m4 42 8 3m40 0 8-3"/></svg>',
    tote:'<svg '+common+'><path d="M15 24h34l-3 32H18z"/><path d="M23 25v-5c0-8 3-13 9-13s9 5 9 13v5"/><path d="M27 25v-5c0-5 2-8 5-8s5 3 5 8v5"/></svg>',
    notebook:'<svg '+common+'><rect x="20" y="8" width="30" height="48" rx="1.5"/><path d="M27 8v48"/><path d="M16 15h9M16 23h9M16 31h9M16 39h9M16 47h9"/><path d="M32 18h12M32 24h9"/></svg>'
  };
  return icons[type]||icons.print;
}

function renderObjects(){
  $("#object-list").innerHTML=state.products.map(p=>{
    const modelLabel=p.models?.length?'<span class="object-models">'+p.models.length+' '+t("models")+'</span>':"";
    const consultLabel=state.lang==="en"?"ON REQUEST":state.lang==="ca"?"SOTA CONSULTA":"BAJO CONSULTA";
    return '<article class="object-card"><div class="object-card-head"><span class="object-code">'+p.code+'</span><div class="object-thumb">'+objectIcon(p.thumbnailType||p.id)+'</div></div><div class="object-title"><strong>'+prodName(p)+'</strong>'+modelLabel+'</div><p class="object-desc">'+prodDesc(p)+'</p><div class="object-status"><span>'+consultLabel+'</span></div></article>';
  }).join("");
}
function dataRow(a,b){return b?'<div class="data-row"><span>'+a+'</span><span>'+b+'</span></div>':""}
function openPhoto(id){
  state.activePhoto=state.archive.find(p=>String(p.id)===String(id));state.selectedProduct=null;state.config={model:null,edition:null,size:null,color:null};
  renderPhotoDetail();$("#photo-dialog").showModal();
}
function renderPhotoDetail(){
  const p=state.activePhoto;if(!p)return;
  const avail=(p.available||[]).map(id=>state.products.find(x=>x.id===id)).filter(Boolean);
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
  $("#photo-detail").innerHTML='<div class="detail-shell"><div class="detail-visual photo-detail-visual"><img src="'+p.image+'" alt="'+p.title+'" draggable="false"></div><div class="detail-panel"><div class="detail-id">['+p.id+'] // AFICIONADXS ARCHIVE</div><h2>'+p.title+'</h2><div>'+[p.place,p.city+" / "+countryName(p)].filter(Boolean).join("<br>")+'</div><div class="data-table">'+meta+'</div><div class="physical-box"><h3>// '+t("makePhysical")+'</h3><div class="choice-group"><span class="choice-label">'+t("format")+'</span><div class="choice-buttons">'+avail.map(x=>'<button class="choice-button product-choice" data-product="'+x.id+'">'+prodName(x)+'</button>').join("")+'</div></div><div id="config-area"></div></div></div></div>';
  $$(".product-choice").forEach(b=>b.onclick=()=>{
    state.selectedProduct=state.products.find(x=>x.id===b.dataset.product);
    const q=state.selectedProduct,m=q.models?.[0]||null;
    state.config={model:m?.id||null,edition:q.editions?.[0]||null,size:(m?.sizes||q.sizes||[])[0]||null,color:(m?.colors||q.colors||[])[0]||null};
    $$(".product-choice").forEach(x=>x.classList.toggle("active",x===b));
    renderConfigurator();
  });
}
function openEdition(id){state.activeEdition=state.editions.find(e=>e.id===id);renderEditionDetail();if($("#photo-dialog").open)$("#photo-dialog").close();$("#edition-dialog").showModal()}
function renderEditionDetail(){
  const e=state.activeEdition,source=state.archive.find(p=>p.id===e.archiveId);
  const appRows=state.applications.filter(a=>a.archiveId===e.archiveId&&a.approved);
  const apps=appRows.map(a=>'<span class="application-tag">'+a.support.toUpperCase()+'</span>').join("");
  $("#edition-detail").innerHTML='<div class="detail-shell"><div class="detail-visual">'+editionArtwork(e,source)+'</div><div class="detail-panel"><div class="detail-id">['+e.id+'] // AFICIONADXS EDITION</div><h2>'+e.title+'</h2><div>'+editionVariant(e)+'</div><div class="data-table">'+dataRow(t("sourcePhoto"),"["+source.id+"] "+source.title)+dataRow(t("place"),source.city+" / "+countryName(source))+dataRow(t("date"),formatDate(source.date))+'</div><button class="source-link" id="view-source" type="button">'+t("viewSource")+'</button><div class="related-editions"><h3>'+t("applications")+'</h3><div class="application-list">'+apps+'</div></div><p class="technical-note">'+t("editionNote")+'</p></div></div>';
  $("#view-source").onclick=()=>{$("#edition-dialog").close();openPhoto(source.id)};
}
function renderConfigurator(){
  const p=state.selectedProduct;if(!p)return;
  const m=selectedModel(p);
  const translateEdition=v=>localizeEdition(v);
  const g=(label,field,vals,translate=false)=>!vals?.length?"":'<div class="choice-group"><span class="choice-label">'+label+'</span><div class="choice-buttons">'+vals.map(v=>'<button class="choice-button config-choice '+(state.config[field]===v?"active":"")+'" data-field="'+field+'" data-value="'+v+'">'+(translate?translateEdition(v):displayOption(v))+'</button>').join("")+'</div></div>';
  const modelBlock=!p.models?.length?"":'<div class="choice-group"><span class="choice-label">'+t("model")+'</span><div class="choice-buttons">'+p.models.map(x=>'<button class="choice-button model-choice '+(state.config.model===x.id?"active":"")+'" data-model="'+x.id+'">'+modelName(x)+'</button>').join("")+'</div></div>';
  const detail=m?'<div class="technical-note">'+modelDesc(m)+'</div>':"";
  const sizes=m?.sizes||p.sizes||[],colors=m?.colors||p.colors||[];
  $("#config-area").innerHTML=modelBlock+detail+g(t("edition"),"edition",p.editions,true)+g(t("size"),"size",sizes)+g(t("color"),"color",colors)+'<button class="primary-action" id="add-request">'+t("addRequest")+'</button>';
  $$(".model-choice").forEach(b=>b.onclick=()=>{
    state.config.model=b.dataset.model;
    const nm=selectedModel(p);
    state.config.size=(nm?.sizes||p.sizes||[])[0]||null;
    state.config.color=(nm?.colors||p.colors||[])[0]||null;
    renderConfigurator();
  });
  $$(".config-choice").forEach(b=>b.onclick=()=>{state.config[b.dataset.field]=b.dataset.value;renderConfigurator()});
  $("#add-request").onclick=addToRequest;
}
function addToRequest(){
  const a=state.activePhoto,p=state.selectedProduct;
  const m=selectedModel(p);
  state.cart.push({key:crypto.randomUUID(),photoId:a.id,title:a.title,productId:p.id,modelId:m?.id||null,edition:state.config.edition,size:state.config.size,color:state.config.color,price:m?.price??p.price});
  saveCart();renderCart();$("#photo-dialog").close();openCart();
}
function saveCart(){localStorage.setItem("afcndxs-request",JSON.stringify(state.cart))}
function renderCart(){
  $("#cart-count").textContent="["+String(state.cart.length).padStart(2,"0")+"]";
  $("#cart-items").innerHTML=state.cart.length?state.cart.map(i=>{
    const p=state.products.find(x=>x.id===i.productId);
    const m=p?.models?.find(x=>x.id===i.modelId);
    return '<div class="cart-item"><div class="cart-item-top"><div><h3>['+i.photoId+'] '+i.title+'</h3><p>'+(p?prodName(p):(i.product||""))+(m?' · '+modelName(m):'')+'</p><p>'+[i.edition?localizeEdition(i.edition):null,i.color?displayOption(i.color):null,i.size?displayOption(i.size):null].filter(Boolean).join(" / ")+'</p></div><button class="remove-item" data-key="'+i.key+'">'+t("remove")+'</button></div></div>';
  }).join(""):'<div class="empty-cart">'+t("emptyRequest")+'</div>';
  $$(".remove-item").forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.key);saveCart();renderCart()});
  const total=$("#cart-total");if(total){total.innerHTML="";total.hidden=true;}
}
function openCart(){$("#cart-drawer").classList.add("open");$("#drawer-backdrop").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){$("#cart-drawer").classList.remove("open");$("#drawer-backdrop").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true")}
function sendRequest(){
  if(!state.cart.length)return;
  const name=$("#request-name").value.trim(),loc=$("#request-location").value.trim(),note=$("#request-note").value.trim(),lines=["// AFICIONADXS "+t("request"),""];
  state.cart.forEach((i,n)=>{const p=state.products.find(x=>x.id===i.productId),m=p?.models?.find(x=>x.id===i.modelId);lines.push(String(n+1).padStart(2,"0")+" / ["+i.photoId+"] "+i.title);lines.push((p?prodName(p):(i.product||""))+(m?" · "+modelName(m):"")+" · "+[i.edition?localizeEdition(i.edition):null,i.color?displayOption(i.color):null,i.size?displayOption(i.size):null].filter(Boolean).join(" · "));lines.push("")});
  if(name)lines.push(t("name")+" · "+name);if(loc)lines.push(t("countryPostcode")+" · "+loc);if(note)lines.push(t("note")+" · "+note);
  lines.push("");lines.push(t("requestConfirm"));
  const base=WHATSAPP_NUMBER?"https://wa.me/"+WHATSAPP_NUMBER:"https://wa.me/";
  window.open(base+"?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener,noreferrer");
}
init().catch(e=>{console.error(e);$("#archive-grid").innerHTML="<p>"+t("archiveLoadError")+"</p>"});
