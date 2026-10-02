const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";
const state={
  archive:[],editions:[],applications:[],products:[],
  filter:"all",
  view:localStorage.getItem("afcndxs-archive-view")||"grid",
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  carouselIndex:0,archiveExpanded:false,
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
    objectsNote:"Formatos y precios siguen en prueba mientras AFICIONADXS compara materiales, impresión y proveedores. Una solicitud no es un pago ni un pedido automático.",
    info1:"AFICIONADXS es un archivo fotográfico en curso. Algunas imágenes salen del archivo para convertirse en prints, postales, prendas y objetos.",
    info2:"Algunas piezas existen en stock. Otras se producen solo después de una solicitud. La fotografía sigue siendo siempre el punto de partida.",
    footerLine:"FOTOGRAFÍA → OBJETO",name:"NOMBRE",countryPostcode:"PAÍS / CÓDIGO POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR SOLICITUD POR WHATSAPP →",clearRequest:"VACIAR SOLICITUD",
    request:"SOLICITUD",emptyRequest:"NO HAY ARTÍCULOS EN LA SOLICITUD.",
    estimatedTotal:"TOTAL ESTIMADO",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTÍCULOS A CONFIRMAR",
    date:"FECHA",time:"HORA",region:"REGIÓN",coord:"COORD.",camera:"CÁMARA",lens:"LENTE",capture:"CAPTURA",address:"DIRECCIÓN",event:"EVENTO",architect:"ARQUITECTURA",temperature:"TEMPERATURA",
    relatedEditions:"EDICIONES RELACIONADAS",format:"SOPORTE",edition:"EDICIÓN",size:"TALLA / TAMAÑO",color:"COLOR",
    addRequest:"AÑADIR A SOLICITUD →",sourcePhoto:"FOTO ORIGINAL",place:"LUGAR",applications:"APLICACIONES",
    viewSource:"VER FOTO ORIGINAL →",editionNote:"La edición es la composición gráfica. El objeto físico se elige por separado.",
    remove:"QUITAR",requestConfirm:"Confírmame disponibilidad, precio final y envío.",
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
    objectsNote:"Els formats i els preus continuen en fase de prova mentre AFICIONADXS compara materials, impressió i proveïdors. Una sol·licitud no és un pagament ni una comanda automàtica.",
    info1:"AFICIONADXS és un arxiu fotogràfic en curs. Algunes imatges surten de l’arxiu per convertir-se en impressions, postals, peces de roba i objectes.",
    info2:"Algunes peces estan en estoc. D’altres només es produeixen després d’una sol·licitud. La fotografia continua sent sempre el punt de partida.",
    footerLine:"FOTOGRAFIA → OBJECTE",name:"NOM",countryPostcode:"PAÍS / CODI POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR SOL·LICITUD PER WHATSAPP →",clearRequest:"BUIDAR SOL·LICITUD",
    request:"SOL·LICITUD",emptyRequest:"NO HI HA CAP ARTICLE A LA SOL·LICITUD.",
    estimatedTotal:"TOTAL ESTIMAT",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTICLES A CONFIRMAR",
    date:"DATA",time:"HORA",region:"REGIÓ",coord:"COORD.",camera:"CÀMERA",lens:"OBJECTIU",capture:"CAPTURA",address:"ADREÇA",event:"ESDEVENIMENT",architect:"ARQUITECTURA",temperature:"TEMPERATURA",
    relatedEditions:"EDICIONS RELACIONADES",format:"SUPORT",edition:"EDICIÓ",size:"TALLA / MIDA",color:"COLOR",
    addRequest:"AFEGIR A LA SOL·LICITUD →",sourcePhoto:"FOTO ORIGINAL",place:"LLOC",applications:"APLICACIONS",
    viewSource:"VEURE FOTO ORIGINAL →",editionNote:"L’edició és la composició gràfica. L’objecte físic es tria per separat.",
    remove:"TREURE",requestConfirm:"Confirma’m la disponibilitat, el preu final i l’enviament.",
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
    objectsNote:"Formats and prices remain flexible while AFICIONADXS tests materials, print quality and suppliers. A request is not a payment or an automatic order.",
    info1:"AFICIONADXS is an ongoing photographic archive. Selected images move from the archive into physical form: prints, postcards, garments and objects.",
    info2:"Some pieces exist in stock. Others are produced only after a request. Every photograph remains the starting point.",
    footerLine:"PHOTOGRAPHY → OBJECT",name:"NAME",countryPostcode:"COUNTRY / POSTCODE",note:"NOTE",
    sendWhatsapp:"SEND REQUEST VIA WHATSAPP →",clearRequest:"CLEAR REQUEST",
    request:"REQUEST",emptyRequest:"NO ITEMS IN REQUEST.",
    estimatedTotal:"ESTIMATED TOTAL",toConfirm:"TO CONFIRM",itemsToConfirm:" + ITEMS TO CONFIRM",
    date:"DATE",time:"TIME",region:"REGION",coord:"COORD.",camera:"CAMERA",lens:"LENS",capture:"CAPTURE",address:"ADDRESS",event:"EVENT",architect:"ARCHITECTURE",temperature:"TEMPERATURE",
    relatedEditions:"RELATED EDITIONS",format:"FORMAT",edition:"EDITION",size:"SIZE",color:"COLOR",
    addRequest:"ADD TO REQUEST →",sourcePhoto:"SOURCE PHOTO",place:"PLACE",applications:"APPLICATIONS",
    viewSource:"VIEW SOURCE PHOTO →",editionNote:"The edition is the graphic composition. The physical object is chosen separately.",
    remove:"REMOVE",requestConfirm:"Please confirm availability, final price and shipping.",
    photograph:"PHOTOGRAPH",archiveEdition:"ARCHIVE EDITION",supportDesign:"SUPPORT DESIGN",white:"WHITE",black:"BLACK",designAvailable:"DESIGN AVAILABLE",showMore:"SHOW MORE",showLess:"SHOW LESS",
    models:"MODELS",model:"MODEL",noPhotographs:"NO PHOTOGRAPHS.",
    previewsPreparing:"APPROVED EDITION PREVIEWS ARE BEING PREPARED FROM THE ORIGINAL DESIGN FILES.",
    archiveLoadError:"ARCHIVE DATA COULD NOT BE LOADED.",seeAllArchive:"VIEW FULL ARCHIVE →",seeAllEditions:"VIEW ALL EDITIONS →"
  }
};
const t=k=>T[state.lang][k]||k;

const COUNTRY={
  ES:{es:"ESPAÑA",ca:"ESPANYA",en:"SPAIN"},FR:{es:"FRANCIA",ca:"FRANÇA",en:"FRANCE"},DE:{es:"ALEMANIA",ca:"ALEMANYA",en:"GERMANY"},
  CZ:{es:"CHEQUIA",ca:"TXÈQUIA",en:"CZECHIA"},IE:{es:"IRLANDA",ca:"IRLANDA",en:"IRELAND"},BE:{es:"BÉLGICA",ca:"BÈLGICA",en:"BELGIUM"},
  GR:{es:"GRECIA",ca:"GRÈCIA",en:"GREECE"},PT:{es:"PORTUGAL",ca:"PORTUGAL",en:"PORTUGAL"},US:{es:"ESTADOS UNIDOS",ca:"ESTATS UNITS",en:"UNITED STATES"}
};
const countryName=p=>(COUNTRY[p.countryCode]?.[state.lang]||p.country).toUpperCase();

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
  const[a,e,s,p]=await Promise.all([fetch("/data/archive.json?v=20261002-photos21"),fetch("/data/editions.json"),fetch("/data/support-designs.json"),fetch("/data/products.json")]);
  state.archive=await a.json();state.editions=await e.json();state.applications=await s.json();state.products=await p.json();
  bindStaticEvents();applyLanguage();renderAll();
  $("#footer-year").textContent=new Date().getFullYear();
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
    state.filter=b.dataset.filter;state.carouselIndex=0;
    $$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderArchive();
  }));
  $$(".view-toggle").forEach(b=>b.addEventListener("click",()=>{
    state.view=b.dataset.view;localStorage.setItem("afcndxs-archive-view",state.view);
    renderArchive();
  }));
  const more=$("#archive-more");if(more)more.onclick=()=>{state.archiveExpanded=!state.archiveExpanded;renderArchive()};
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
function renderArchive(){
  const full=filteredArchive(),grid=$("#archive-grid"),carousel=$("#archive-carousel");
  const list=state.archiveExpanded?full:full.slice(0,6);
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
  b.hidden=total<=6||state.view==="carousel";
  b.textContent=state.archiveExpanded?t("showLess"):t("showMore");
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
  const common='viewBox="0 0 80 80" aria-hidden="true" focusable="false"';
  const icons={
    print:'<svg '+common+'><circle cx="40" cy="7" r="1.5" fill="currentColor"/><path d="M40 9 31 16h18z" fill="none" stroke="currentColor"/><rect x="17" y="16" width="46" height="56" rx="1" fill="none" stroke="currentColor"/><rect x="23" y="22" width="34" height="42" fill="none" stroke="currentColor"/><circle cx="47" cy="32" r="3" fill="none" stroke="currentColor"/><path d="M25 58 34 47l7 7 5-6 9 10" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
    postcard:'<svg '+common+'><rect x="9" y="23" width="62" height="34" rx="1" fill="none" stroke="currentColor"/><path d="M14 51 27 39l9 7 7-8 23 13" fill="none" stroke="currentColor" stroke-linejoin="round"/><circle cx="55" cy="33" r="3" fill="none" stroke="currentColor"/></svg>',
    tshirt:'<svg '+common+'><path d="M25 18 12 28l8 10 7-5v29h26V33l7 5 8-10-13-10-8 4H33z" fill="none" stroke="currentColor" stroke-linejoin="round"/></svg>',
    sweatshirt:'<svg '+common+'><path d="M30 16 19 21 8 31 2 55l11 3 8-19 6-7v32h26V32l6 7 8 19 11-3-6-24-11-10-11-5-5 5H35z" fill="none" stroke="currentColor" stroke-linejoin="round"/><path d="M35 18c1 6 9 6 10 0" fill="none" stroke="currentColor"/><line x1="28" y1="58" x2="52" y2="58" stroke="currentColor"/><line x1="3" y1="53" x2="13" y2="56" stroke="currentColor"/><line x1="67" y1="56" x2="77" y2="53" stroke="currentColor"/></svg>',
    tote:'<svg '+common+'><path d="M17 37h46l-4 34H21z" fill="none" stroke="currentColor"/><path d="M27 38V23C27 10 32 4 40 4s13 6 13 19v15" fill="none" stroke="currentColor"/><path d="M32 38V23c0-9 3-14 8-14s8 5 8 14v15" fill="none" stroke="currentColor"/></svg>',
    notebook:'<svg '+common+'><rect x="23" y="12" width="38" height="56" rx="2" fill="none" stroke="currentColor"/><line x1="30" y1="12" x2="30" y2="68" stroke="currentColor"/><line x1="18" y1="20" x2="28" y2="20" stroke="currentColor"/><line x1="18" y1="29" x2="28" y2="29" stroke="currentColor"/><line x1="18" y1="38" x2="28" y2="38" stroke="currentColor"/><line x1="18" y1="47" x2="28" y2="47" stroke="currentColor"/><line x1="18" y1="56" x2="28" y2="56" stroke="currentColor"/></svg>'
  };
  return icons[type]||icons.print;
}

function renderObjects(){
  $("#object-list").innerHTML=state.products.map(p=>{
    const modelLabel=p.models?.length?'<span class="object-models">'+p.models.length+' '+t("models")+'</span>':"";
    return '<div class="object-row"><div class="object-thumb">'+objectIcon(p.thumbnailType||p.id)+'</div><span class="object-code">'+p.code+'</span><div><strong>'+prodName(p)+'</strong>'+modelLabel+'</div><span class="object-desc">'+prodDesc(p)+'</span><span class="object-price">'+prodPriceLabel(p)+'</span></div>';
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
  const displayPrice=m?.price!=null?money(m.price):prodPriceLabel(p);
  $("#config-area").innerHTML=modelBlock+detail+g(t("edition"),"edition",p.editions,true)+g(t("size"),"size",sizes)+g(t("color"),"color",colors)+'<div class="config-price">'+displayPrice+'</div><button class="primary-action" id="add-request">'+t("addRequest")+'</button>';
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
    return '<div class="cart-item"><div class="cart-item-top"><div><h3>['+i.photoId+'] '+i.title+'</h3><p>'+(p?prodName(p):(i.product||""))+(m?' · '+modelName(m):'')+'</p><p>'+[i.edition?localizeEdition(i.edition):null,i.color?displayOption(i.color):null,i.size?displayOption(i.size):null].filter(Boolean).join(" / ")+'</p><p>'+money(i.price)+'</p></div><button class="remove-item" data-key="'+i.key+'">'+t("remove")+'</button></div></div>';
  }).join(""):'<div class="empty-cart">'+t("emptyRequest")+'</div>';
  $$(".remove-item").forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.key);saveCart();renderCart()});
  const known=state.cart.filter(x=>x.price!=null).reduce((s,x)=>s+x.price,0),unknown=state.cart.some(x=>x.price==null);
  $("#cart-total").innerHTML=t("estimatedTotal")+'<br><strong>'+(known?money(known):t("toConfirm"))+(known&&unknown?t("itemsToConfirm"):"")+'</strong>';
}
function openCart(){$("#cart-drawer").classList.add("open");$("#drawer-backdrop").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){$("#cart-drawer").classList.remove("open");$("#drawer-backdrop").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true")}
function sendRequest(){
  if(!state.cart.length)return;
  const name=$("#request-name").value.trim(),loc=$("#request-location").value.trim(),note=$("#request-note").value.trim(),lines=["// AFICIONADXS "+t("request"),""];
  state.cart.forEach((i,n)=>{const p=state.products.find(x=>x.id===i.productId),m=p?.models?.find(x=>x.id===i.modelId);lines.push(String(n+1).padStart(2,"0")+" / ["+i.photoId+"] "+i.title);lines.push((p?prodName(p):(i.product||""))+(m?" · "+modelName(m):"")+" · "+[i.edition?localizeEdition(i.edition):null,i.color?displayOption(i.color):null,i.size?displayOption(i.size):null].filter(Boolean).join(" · "));lines.push(money(i.price));lines.push("")});
  if(name)lines.push(t("name")+" · "+name);if(loc)lines.push(t("countryPostcode")+" · "+loc);if(note)lines.push(t("note")+" · "+note);
  lines.push("");lines.push(t("requestConfirm"));
  const base=WHATSAPP_NUMBER?"https://wa.me/"+WHATSAPP_NUMBER:"https://wa.me/";
  window.open(base+"?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener,noreferrer");
}
init().catch(e=>{console.error(e);$("#archive-grid").innerHTML="<p>"+t("archiveLoadError")+"</p>"});
