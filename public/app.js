const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const defaultLang=(navigator.language||"").toLowerCase().startsWith("es")?"es":"en";
const state={
  archive:[],editions:[],products:[],
  filter:"all",
  view:localStorage.getItem("afcndxs-archive-view")||"grid",
  lang:localStorage.getItem("afcndxs-lang")||defaultLang,
  carouselIndex:0,
  activePhoto:null,activeEdition:null,selectedProduct:null,
  config:{edition:null,size:null,color:null},
  cart:JSON.parse(localStorage.getItem("afcndxs-request")||"[]")
};
const WHATSAPP_NUMBER="";

const T={
  es:{
    navArchive:"ARCHIVO",navEditions:"EDICIONES",navObjects:"OBJETOS",
    heroTitle:"FOTOGRAFÍAS<br>RECOGIDAS<br>EN EL CAMINO.",
    heroMeta:"ARCHIVO FOTOGRÁFICO EN CURSO",exploreArchive:"EXPLORAR ARCHIVO ↓",
    archiveHeading:"// ARCHIVO",editionsHeading:"// EDICIONES",objectsHeading:"// OBJETOS",
    all:"TODAS",view:"VISTA",photoDesign:"FOTO → DISEÑO",
    editionsNote:"Cada edición está vinculada a su fotografía original. La aplicación sobre un objeto físico es una capa separada.",
    makePhysical:"LLEVAR EL ARCHIVO A LO FÍSICO",
    objectsNote:"Formatos y precios siguen en prueba mientras AFICIONADXS compara materiales, impresión y proveedores. Una solicitud no es un pago ni un pedido automático.",
    info1:"AFICIONADXS es un archivo fotográfico en curso. Algunas imágenes salen del archivo para convertirse en prints, postales, prendas y objetos.",
    info2:"Algunas piezas existen en stock. Otras se producen solo después de una solicitud. La fotografía sigue siendo siempre el punto de partida.",
    footerLine:"FOTOGRAFÍA → OBJETO",name:"NOMBRE",countryPostcode:"PAÍS / CÓDIGO POSTAL",note:"NOTA",
    sendWhatsapp:"ENVIAR SOLICITUD POR WHATSAPP →",clearRequest:"VACIAR SOLICITUD",
    request:"SOLICITUD",emptyRequest:"NO HAY ARTÍCULOS EN LA SOLICITUD.",
    estimatedTotal:"TOTAL ESTIMADO",toConfirm:"A CONFIRMAR",itemsToConfirm:" + ARTÍCULOS A CONFIRMAR",
    date:"FECHA",time:"HORA",region:"REGIÓN",coord:"COORD.",camera:"CÁMARA",lens:"LENTE",capture:"CAPTURA",
    relatedEditions:"EDICIONES RELACIONADAS",format:"SOPORTE",edition:"EDICIÓN",size:"TALLA / TAMAÑO",color:"COLOR",
    addRequest:"AÑADIR A SOLICITUD →",sourcePhoto:"FOTO ORIGINAL",place:"LUGAR",applications:"APLICACIONES",
    viewSource:"VER FOTO ORIGINAL →",editionNote:"La edición es la composición gráfica. El objeto físico se elige por separado.",
    remove:"QUITAR",requestConfirm:"Confírmame disponibilidad, precio final y envío.",
    photograph:"FOTOGRAFÍA",archiveEdition:"EDICIÓN DE ARCHIVO",white:"BLANCO",black:"NEGRO"
  },
  en:{
    navArchive:"ARCHIVE",navEditions:"EDITIONS",navObjects:"OBJECTS",
    heroTitle:"PHOTOGRAPHS<br>COLLECTED<br>ALONG THE WAY.",
    heroMeta:"ONGOING PHOTOGRAPHIC ARCHIVE",exploreArchive:"EXPLORE ARCHIVE ↓",
    archiveHeading:"// ARCHIVE",editionsHeading:"// EDITIONS",objectsHeading:"// OBJECTS",
    all:"ALL",view:"VIEW",photoDesign:"PHOTO → DESIGN",
    editionsNote:"Each edition is linked back to its source photograph. Product applications are separate from the design itself.",
    makePhysical:"MAKE THE ARCHIVE PHYSICAL",
    objectsNote:"Formats and prices remain flexible while AFICIONADXS tests materials, print quality and suppliers. A request is not a payment or an automatic order.",
    info1:"AFICIONADXS is an ongoing photographic archive. Selected images move from the archive into physical form: prints, postcards, garments and objects.",
    info2:"Some pieces exist in stock. Others are produced only after a request. Every photograph remains the starting point.",
    footerLine:"PHOTOGRAPHY → OBJECT",name:"NAME",countryPostcode:"COUNTRY / POSTCODE",note:"NOTE",
    sendWhatsapp:"SEND REQUEST VIA WHATSAPP →",clearRequest:"CLEAR REQUEST",
    request:"REQUEST",emptyRequest:"NO ITEMS IN REQUEST.",
    estimatedTotal:"ESTIMATED TOTAL",toConfirm:"TO CONFIRM",itemsToConfirm:" + ITEMS TO CONFIRM",
    date:"DATE",time:"TIME",region:"REGION",coord:"COORD.",camera:"CAMERA",lens:"LENS",capture:"CAPTURE",
    relatedEditions:"RELATED EDITIONS",format:"FORMAT",edition:"EDITION",size:"SIZE",color:"COLOR",
    addRequest:"ADD TO REQUEST →",sourcePhoto:"SOURCE PHOTO",place:"PLACE",applications:"APPLICATIONS",
    viewSource:"VIEW SOURCE PHOTO →",editionNote:"The edition is the graphic composition. The physical object is chosen separately.",
    remove:"REMOVE",requestConfirm:"Please confirm availability, final price and shipping.",
    photograph:"PHOTOGRAPH",archiveEdition:"ARCHIVE EDITION",white:"WHITE",black:"BLACK"
  }
};
const t=k=>T[state.lang][k]||k;

const COUNTRY={
  ES:{es:"ESPAÑA",en:"SPAIN"},FR:{es:"FRANCIA",en:"FRANCE"},DE:{es:"ALEMANIA",en:"GERMANY"},
  CZ:{es:"CHEQUIA",en:"CZECHIA"},IE:{es:"IRLANDA",en:"IRELAND"},BE:{es:"BÉLGICA",en:"BELGIUM"}
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
const money=v=>v==null?t("toConfirm"):v.toFixed(0)+" EUR";
const editionVariant=e=>{
  let v=e.variant||"";
  if(state.lang==="es") return v.replaceAll("ARCHIVE EDITION",t("archiveEdition")).replaceAll("WHITE",t("white")).replaceAll("BLACK",t("black"));
  return v;
};

async function init(){
  const[a,e,p]=await Promise.all([fetch("/data/archive.json"),fetch("/data/editions.json"),fetch("/data/products.json")]);
  state.archive=await a.json();state.editions=await e.json();state.products=await p.json();
  bindStaticEvents();applyLanguage();renderAll();
  $("#footer-year").textContent=new Date().getFullYear();
  document.addEventListener("keydown",ev=>{
    if(state.view==="carousel"&&!$("#photo-dialog").open&&!$("#edition-dialog").open&&!$("#cart-drawer").classList.contains("open")){
      if(ev.key==="ArrowLeft")moveCarousel(-1);
      if(ev.key==="ArrowRight")moveCarousel(1);
    }
  });
}
function renderAll(){renderArchive();renderEditions();renderObjects();renderCart()}
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
  if($("#edition-dialog").open&&state.activeEdition)renderEditionDetail();
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
  $("#carousel-prev").onclick=()=>moveCarousel(-1);
  $("#carousel-next").onclick=()=>moveCarousel(1);
  $("#open-cart").onclick=openCart;$("#close-cart").onclick=closeCart;$("#drawer-backdrop").onclick=closeCart;
  $("#close-photo").onclick=()=>$("#photo-dialog").close();$("#close-edition").onclick=()=>$("#edition-dialog").close();
  $("#photo-dialog").addEventListener("click",ev=>{if(ev.target===$("#photo-dialog"))$("#photo-dialog").close()});
  $("#edition-dialog").addEventListener("click",ev=>{if(ev.target===$("#edition-dialog"))$("#edition-dialog").close()});
  $("#clear-cart").onclick=()=>{state.cart=[];saveCart();renderCart()};
  $("#send-request").onclick=sendRequest;
}
function filteredArchive(){const published=state.archive.filter(p=>p.published!==false);return state.filter==="all"?published:published.filter(p=>p.countryCode===state.filter)}
function renderArchive(){
  const list=filteredArchive(),grid=$("#archive-grid"),carousel=$("#archive-carousel");
  $$(".view-toggle").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
  if(state.view==="carousel"){grid.hidden=true;carousel.hidden=false;renderCarousel(list);return}
  grid.hidden=false;carousel.hidden=true;
  grid.innerHTML=list.map(p=>'<article class="archive-card" data-id="'+p.id+'" tabindex="0" role="button"><div class="archive-image"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"></div><div class="archive-data"><span class="archive-id">['+p.id+']</span><span class="archive-title">'+p.title+'</span><span class="archive-place">'+p.city+' / '+countryName(p)+' · '+formatDate(p.date)+'</span></div></article>').join("");
  $$(".archive-card",grid).forEach(c=>{const o=()=>openPhoto(c.dataset.id);c.onclick=o;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}});
}
function renderCarousel(list=filteredArchive()){
  if(!list.length){$("#carousel-stage").innerHTML="<p>NO PHOTOGRAPHS.</p>";return}
  if(state.carouselIndex>=list.length)state.carouselIndex=0;if(state.carouselIndex<0)state.carouselIndex=list.length-1;
  const p=list[state.carouselIndex],pos=String(state.carouselIndex+1).padStart(2,"0"),total=String(list.length).padStart(2,"0");
  $("#carousel-stage").innerHTML='<div class="carousel-frame"><button type="button" class="carousel-photo" data-id="'+p.id+'"><img src="'+p.image+'" alt="'+p.title+'"></button><div class="carousel-meta"><span>['+p.id+']</span><span>'+p.title+'<br>'+p.city+' / '+countryName(p)+'</span><span>'+pos+' / '+total+'</span></div></div>';
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
    $("#editions-grid").innerHTML='<p class="technical-note">APPROVED EDITION PREVIEWS ARE BEING PREPARED FROM THE ORIGINAL DESIGN FILES.</p>';
    return;
  }
  $("#editions-grid").innerHTML=approved.map(e=>{
    return '<article class="edition-card" data-id="'+e.id+'" tabindex="0" role="button"><div class="edition-image"><img src="'+e.publicPreview+'" alt="'+e.title+' '+e.variant+'" loading="lazy"></div><div class="edition-data"><span class="edition-id">['+e.id+']</span><strong>'+e.title+'</strong><span class="edition-variant">'+editionVariant(e)+'</span></div></article>';
  }).join("");
  $(".edition-card").forEach(c=>{const o=()=>openEdition(c.dataset.id);c.onclick=o;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}});
}
function renderObjects(){
  $("#object-list").innerHTML=state.products.map(p=>'<div class="object-row"><span>'+p.code+'</span><strong>'+prodName(p)+'</strong><span>'+prodDesc(p)+'</span><span class="object-price">'+prodPriceLabel(p)+'</span></div>').join("");
}
function dataRow(a,b){return'<div class="data-row"><span>'+a+'</span><span>'+(b||"—")+'</span></div>'}
function openPhoto(id){
  state.activePhoto=state.archive.find(p=>p.id===id);state.selectedProduct=null;state.config={edition:null,size:null,color:null};
  renderPhotoDetail();if($("#edition-dialog").open)$("#edition-dialog").close();$("#photo-dialog").showModal();
}
function renderPhotoDetail(){
  const p=state.activePhoto,avail=p.available.map(id=>state.products.find(x=>x.id===id)).filter(Boolean),related=state.editions.filter(e=>e.archiveId===p.id);
  const relatedHtml=related.length?'<div class="related-editions"><h3>'+t("relatedEditions")+'</h3><div class="related-edition-list">'+related.map(e=>'<button class="choice-button related-edition" data-edition="'+e.id+'">['+e.id+'] '+editionVariant(e)+'</button>').join("")+'</div></div>':"";
  $("#photo-detail").innerHTML='<div class="detail-shell"><div class="detail-visual"><img src="'+p.image+'" alt="'+p.title+'"></div><div class="detail-panel"><div class="detail-id">['+p.id+'] // AFICIONADXS ARCHIVE</div><h2>'+p.title+'</h2><div>'+p.place+'<br>'+p.city+' / '+countryName(p)+'</div><div class="data-table">'+dataRow(t("date"),formatDate(p.date))+dataRow(t("time"),p.time)+dataRow(t("region"),p.region)+dataRow(t("coord"),p.coordinates)+dataRow(t("camera"),p.camera)+dataRow(t("lens"),p.lens)+dataRow(t("capture"),p.capture)+'</div>'+relatedHtml+'<div class="physical-box"><h3>// '+t("makePhysical")+'</h3><div class="choice-group"><span class="choice-label">'+t("format")+'</span><div class="choice-buttons">'+avail.map(x=>'<button class="choice-button product-choice" data-product="'+x.id+'">'+prodName(x)+'</button>').join("")+'</div></div><div id="config-area"></div></div></div></div>';
  $$(".related-edition").forEach(b=>b.onclick=()=>openEdition(b.dataset.edition));
  $$(".product-choice").forEach(b=>b.onclick=()=>{state.selectedProduct=state.products.find(x=>x.id===b.dataset.product);const q=state.selectedProduct;state.config={edition:q.editions[0]||null,size:q.sizes[0]||null,color:q.colors[0]||null};$$(".product-choice").forEach(x=>x.classList.toggle("active",x===b));renderConfigurator()});
}
function openEdition(id){state.activeEdition=state.editions.find(e=>e.id===id);renderEditionDetail();if($("#photo-dialog").open)$("#photo-dialog").close();$("#edition-dialog").showModal()}
function renderEditionDetail(){
  const e=state.activeEdition,source=state.archive.find(p=>p.id===e.archiveId),apps=e.applications.map(a=>'<span class="application-tag">'+a+'</span>').join("");
  $("#edition-detail").innerHTML='<div class="detail-shell"><div class="detail-visual">'+editionArtwork(e,source)+'</div><div class="detail-panel"><div class="detail-id">['+e.id+'] // AFICIONADXS EDITION</div><h2>'+e.title+'</h2><div>'+editionVariant(e)+'</div><div class="data-table">'+dataRow(t("sourcePhoto"),"["+source.id+"] "+source.title)+dataRow(t("place"),source.city+" / "+countryName(source))+dataRow(t("date"),formatDate(source.date))+'</div><button class="source-link" id="view-source" type="button">'+t("viewSource")+'</button><div class="related-editions"><h3>'+t("applications")+'</h3><div class="application-list">'+apps+'</div></div><p class="technical-note">'+t("editionNote")+'</p></div></div>';
  $("#view-source").onclick=()=>{$("#edition-dialog").close();openPhoto(source.id)};
}
function renderConfigurator(){
  const p=state.selectedProduct;if(!p)return;
  const translateEdition=v=>state.lang==="es"?v.replace("PHOTOGRAPH",t("photograph")).replace("ARCHIVE EDITION",t("archiveEdition")):v;
  const g=(label,field,vals,translate=false)=>!vals?.length?"":'<div class="choice-group"><span class="choice-label">'+label+'</span><div class="choice-buttons">'+vals.map(v=>'<button class="choice-button config-choice '+(state.config[field]===v?"active":"")+'" data-field="'+field+'" data-value="'+v+'">'+(translate?translateEdition(v):v)+'</button>').join("")+'</div></div>';
  $("#config-area").innerHTML=g(t("edition"),"edition",p.editions,true)+g(t("size"),"size",p.sizes)+g(t("color"),"color",p.colors)+'<div class="config-price">'+prodPriceLabel(p)+'</div><button class="primary-action" id="add-request">'+t("addRequest")+'</button>';
  $$(".config-choice").forEach(b=>b.onclick=()=>{state.config[b.dataset.field]=b.dataset.value;renderConfigurator()});$("#add-request").onclick=addToRequest;
}
function addToRequest(){
  const a=state.activePhoto,p=state.selectedProduct;
  state.cart.push({key:crypto.randomUUID(),photoId:a.id,title:a.title,productId:p.id,edition:state.config.edition,size:state.config.size,color:state.config.color,price:p.price});
  saveCart();renderCart();$("#photo-dialog").close();openCart();
}
function saveCart(){localStorage.setItem("afcndxs-request",JSON.stringify(state.cart))}
function renderCart(){
  $("#cart-count").textContent="["+String(state.cart.length).padStart(2,"0")+"]";
  $("#cart-items").innerHTML=state.cart.length?state.cart.map(i=>{
    const p=state.products.find(x=>x.id===i.productId);
    return '<div class="cart-item"><div class="cart-item-top"><div><h3>['+i.photoId+'] '+i.title+'</h3><p>'+(p?prodName(p):(i.product||""))+'</p><p>'+[i.edition,i.color,i.size].filter(Boolean).join(" / ")+'</p><p>'+money(i.price)+'</p></div><button class="remove-item" data-key="'+i.key+'">'+t("remove")+'</button></div></div>';
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
  state.cart.forEach((i,n)=>{const p=state.products.find(x=>x.id===i.productId);lines.push(String(n+1).padStart(2,"0")+" / ["+i.photoId+"] "+i.title);lines.push((p?prodName(p):(i.product||""))+" · "+[i.edition,i.color,i.size].filter(Boolean).join(" · "));lines.push(money(i.price));lines.push("")});
  if(name)lines.push(t("name")+" · "+name);if(loc)lines.push(t("countryPostcode")+" · "+loc);if(note)lines.push(t("note")+" · "+note);
  lines.push("");lines.push(t("requestConfirm"));
  const base=WHATSAPP_NUMBER?"https://wa.me/"+WHATSAPP_NUMBER:"https://wa.me/";
  window.open(base+"?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener,noreferrer");
}
init().catch(e=>{console.error(e);$("#archive-grid").innerHTML="<p>ARCHIVE DATA COULD NOT BE LOADED.</p>"});
