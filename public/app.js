const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={archive:[],editions:[],products:[],filter:"all",view:localStorage.getItem("afcndxs-archive-view")||"grid",carouselIndex:0,activePhoto:null,activeEdition:null,selectedProduct:null,config:{edition:null,size:null,color:null},cart:JSON.parse(localStorage.getItem("afcndxs-request")||"[]")};
const WHATSAPP_NUMBER="";
const formatDate=v=>{if(!v)return"—";if(/^\d{4}-\d{2}$/.test(v)){const[y,m]=v.split("-");return m+"."+y}const[y,m,d]=v.split("-");return[d,m,y].filter(Boolean).join(".")};
const money=v=>v==null?"PRICE ON REQUEST":v.toFixed(0)+" EUR";

async function init(){
  const[a,e,p]=await Promise.all([fetch("/data/archive.json"),fetch("/data/editions.json"),fetch("/data/products.json")]);
  state.archive=await a.json(); state.editions=await e.json(); state.products=await p.json();
  renderArchive(); renderEditions(); renderObjects(); renderCart(); bindStaticEvents();
  $("#footer-year").textContent=new Date().getFullYear();
  document.addEventListener("keydown",ev=>{
    if(state.view==="carousel"&&!$("#photo-dialog").open&&!$("#edition-dialog").open&&!$("#cart-drawer").classList.contains("open")){
      if(ev.key==="ArrowLeft")moveCarousel(-1);
      if(ev.key==="ArrowRight")moveCarousel(1);
    }
  });
}
function bindStaticEvents(){
  $$(".filter").forEach(b=>b.addEventListener("click",()=>{
    state.filter=b.dataset.filter; state.carouselIndex=0;
    $$(".filter").forEach(x=>x.classList.toggle("active",x===b)); renderArchive();
  }));
  $$(".view-toggle").forEach(b=>b.addEventListener("click",()=>{
    state.view=b.dataset.view; localStorage.setItem("afcndxs-archive-view",state.view);
    $$(".view-toggle").forEach(x=>x.classList.toggle("active",x===b)); renderArchive();
  }));
  $("#carousel-prev").onclick=()=>moveCarousel(-1);
  $("#carousel-next").onclick=()=>moveCarousel(1);
  $("#open-cart").onclick=openCart; $("#close-cart").onclick=closeCart; $("#drawer-backdrop").onclick=closeCart;
  $("#close-photo").onclick=()=>$("#photo-dialog").close();
  $("#close-edition").onclick=()=>$("#edition-dialog").close();
  $("#photo-dialog").addEventListener("click",ev=>{if(ev.target===$("#photo-dialog"))$("#photo-dialog").close()});
  $("#edition-dialog").addEventListener("click",ev=>{if(ev.target===$("#edition-dialog"))$("#edition-dialog").close()});
  $("#clear-cart").onclick=()=>{state.cart=[];saveCart();renderCart()};
  $("#send-request").onclick=sendRequest;
}
function filteredArchive(){return state.filter==="all"?state.archive:state.archive.filter(p=>p.countryCode===state.filter)}
function renderArchive(){
  const list=filteredArchive(),grid=$("#archive-grid"),carousel=$("#archive-carousel");
  $$(".view-toggle").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
  if(state.view==="carousel"){grid.hidden=true;carousel.hidden=false;renderCarousel(list);return}
  grid.hidden=false;carousel.hidden=true;
  grid.innerHTML=list.map(p=>'<article class="archive-card" data-id="'+p.id+'" tabindex="0" role="button"><div class="archive-image"><img src="'+p.image+'" alt="'+p.title+'" loading="lazy"></div><div class="archive-data"><span class="archive-id">['+p.id+']</span><span class="archive-title">'+p.title+'</span><span class="archive-place">'+p.city+' / '+p.country.toUpperCase()+' · '+formatDate(p.date)+'</span></div></article>').join("");
  $$(".archive-card",grid).forEach(c=>{const o=()=>openPhoto(c.dataset.id);c.onclick=o;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}});
}
function renderCarousel(list=filteredArchive()){
  if(!list.length){$("#carousel-stage").innerHTML="<p>NO PHOTOGRAPHS.</p>";return}
  if(state.carouselIndex>=list.length)state.carouselIndex=0;
  if(state.carouselIndex<0)state.carouselIndex=list.length-1;
  const p=list[state.carouselIndex],pos=String(state.carouselIndex+1).padStart(2,"0"),total=String(list.length).padStart(2,"0");
  $("#carousel-stage").innerHTML='<div class="carousel-frame"><button type="button" class="carousel-photo" data-id="'+p.id+'" aria-label="Open '+p.title+'"><img src="'+p.image+'" alt="'+p.title+'"></button><div class="carousel-meta"><span>['+p.id+']</span><span>'+p.title+'<br>'+p.city+' / '+p.country.toUpperCase()+'</span><span>'+pos+' / '+total+'</span></div></div>';
  $(".carousel-photo").onclick=()=>openPhoto(p.id);
}
function moveCarousel(delta){
  const list=filteredArchive(); if(!list.length)return;
  state.carouselIndex=(state.carouselIndex+delta+list.length)%list.length; renderCarousel(list);
}
function renderEditions(){
  $("#editions-grid").innerHTML=state.editions.map(e=>'<article class="edition-card" data-id="'+e.id+'" tabindex="0" role="button"><div class="edition-image"><img src="'+e.image+'" alt="'+e.title+' '+e.variant+'" loading="lazy"></div><div class="edition-data"><span class="edition-id">['+e.id+']</span><strong>'+e.title+'</strong><span class="edition-variant">'+e.variant+'</span></div></article>').join("");
  $$(".edition-card").forEach(c=>{const o=()=>openEdition(c.dataset.id);c.onclick=o;c.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();o()}}});
}
function renderObjects(){
  $("#object-list").innerHTML=state.products.map(p=>'<div class="object-row"><span>'+p.code+'</span><strong>'+p.name+'</strong><span>'+p.description+'</span><span class="object-price">'+p.priceLabel+'</span></div>').join("");
}
function dataRow(a,b){return'<div class="data-row"><span>'+a+'</span><span>'+(b||"—")+'</span></div>'}
function openPhoto(id){
  state.activePhoto=state.archive.find(p=>p.id===id); state.selectedProduct=null;
  state.config={edition:null,size:null,color:null}; renderPhotoDetail();
  if($("#edition-dialog").open)$("#edition-dialog").close();
  $("#photo-dialog").showModal();
}
function renderPhotoDetail(){
  const p=state.activePhoto,avail=p.available.map(id=>state.products.find(x=>x.id===id)).filter(Boolean);
  const related=state.editions.filter(e=>e.archiveId===p.id);
  const relatedHtml=related.length?'<div class="related-editions"><h3>RELATED EDITIONS</h3><div class="related-edition-list">'+related.map(e=>'<button class="choice-button related-edition" data-edition="'+e.id+'">['+e.id+'] '+e.variant+'</button>').join("")+'</div></div>':"";
  $("#photo-detail").innerHTML='<div class="detail-shell"><div class="detail-visual"><img src="'+p.image+'" alt="'+p.title+'"></div><div class="detail-panel"><div class="detail-id">['+p.id+'] // AFCNDXS ARCHIVE</div><h2>'+p.title+'</h2><div>'+p.place+'<br>'+p.city+' / '+p.country.toUpperCase()+'</div><div class="data-table">'+dataRow("DATE",formatDate(p.date))+dataRow("TIME",p.time)+dataRow("REGION",p.region)+dataRow("COORD.",p.coordinates)+dataRow("CAMERA",p.camera)+dataRow("LENS",p.lens)+dataRow("CAPTURE",p.capture)+'</div>'+relatedHtml+'<div class="physical-box"><h3>// MAKE IT PHYSICAL</h3><div class="choice-group"><span class="choice-label">FORMAT</span><div class="choice-buttons">'+avail.map(x=>'<button class="choice-button product-choice" data-product="'+x.id+'">'+x.name+'</button>').join("")+'</div></div><div id="config-area"></div></div></div></div>';
  $$(".related-edition").forEach(b=>b.onclick=()=>openEdition(b.dataset.edition));
  $$(".product-choice").forEach(b=>b.onclick=()=>{state.selectedProduct=state.products.find(x=>x.id===b.dataset.product);const q=state.selectedProduct;state.config={edition:q.editions[0]||null,size:q.sizes[0]||null,color:q.colors[0]||null};$$(".product-choice").forEach(x=>x.classList.toggle("active",x===b));renderConfigurator()});
}
function openEdition(id){
  state.activeEdition=state.editions.find(e=>e.id===id);
  const e=state.activeEdition;
  const source=state.archive.find(p=>p.id===e.archiveId);
  const apps=e.applications.map(a=>'<span class="application-tag">'+a+'</span>').join("");
  $("#edition-detail").innerHTML='<div class="detail-shell"><div class="detail-visual"><img src="'+e.image+'" alt="'+e.title+' '+e.variant+'"></div><div class="detail-panel"><div class="detail-id">['+e.id+'] // AFCNDXS EDITION</div><h2>'+e.title+'</h2><div>'+e.variant+'</div><div class="data-table">'+dataRow("SOURCE PHOTO","["+source.id+"] "+source.title)+dataRow("PLACE",source.city+" / "+source.country.toUpperCase())+dataRow("DATE",formatDate(source.date))+'</div><button class="source-link" id="view-source" type="button">VIEW SOURCE PHOTO →</button><div class="related-editions"><h3>APPLICATIONS</h3><div class="application-list">'+apps+'</div></div><p class="technical-note">The edition is the graphic composition. The physical object is chosen separately.</p></div></div>';
  $("#view-source").onclick=()=>{ $("#edition-dialog").close(); openPhoto(source.id); };
  if($("#photo-dialog").open)$("#photo-dialog").close();
  $("#edition-dialog").showModal();
}
function renderConfigurator(){
  const p=state.selectedProduct;if(!p)return;
  const g=(label,field,vals)=>!vals?.length?"":'<div class="choice-group"><span class="choice-label">'+label+'</span><div class="choice-buttons">'+vals.map(v=>'<button class="choice-button config-choice '+(state.config[field]===v?"active":"")+'" data-field="'+field+'" data-value="'+v+'">'+v+'</button>').join("")+'</div></div>';
  $("#config-area").innerHTML=g("EDITION","edition",p.editions)+g("SIZE","size",p.sizes)+g("COLOR","color",p.colors)+'<div class="config-price">'+p.priceLabel+'</div><button class="primary-action" id="add-request">ADD TO REQUEST →</button>';
  $$(".config-choice").forEach(b=>b.onclick=()=>{state.config[b.dataset.field]=b.dataset.value;renderConfigurator()}); $("#add-request").onclick=addToRequest;
}
function addToRequest(){
  const a=state.activePhoto,p=state.selectedProduct;
  state.cart.push({key:crypto.randomUUID(),photoId:a.id,title:a.title,product:p.name,edition:state.config.edition,size:state.config.size,color:state.config.color,price:p.price});
  saveCart();renderCart();$("#photo-dialog").close();openCart();
}
function saveCart(){localStorage.setItem("afcndxs-request",JSON.stringify(state.cart))}
function renderCart(){
  $("#cart-count").textContent="["+String(state.cart.length).padStart(2,"0")+"]";
  $("#cart-items").innerHTML=state.cart.length?state.cart.map(i=>'<div class="cart-item"><div class="cart-item-top"><div><h3>['+i.photoId+'] '+i.title+'</h3><p>'+i.product+'</p><p>'+[i.edition,i.color,i.size].filter(Boolean).join(" / ")+'</p><p>'+money(i.price)+'</p></div><button class="remove-item" data-key="'+i.key+'">REMOVE</button></div></div>').join(""):'<div class="empty-cart">NO ITEMS IN REQUEST.</div>';
  $$(".remove-item").forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.key);saveCart();renderCart()});
  const known=state.cart.filter(x=>x.price!=null).reduce((s,x)=>s+x.price,0),unknown=state.cart.some(x=>x.price==null);
  $("#cart-total").innerHTML="ESTIMATED TOTAL<br><strong>"+(known?money(known):"TO CONFIRM")+(known&&unknown?" + ITEMS TO CONFIRM":"")+"</strong>";
}
function openCart(){$("#cart-drawer").classList.add("open");$("#drawer-backdrop").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){$("#cart-drawer").classList.remove("open");$("#drawer-backdrop").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true")}
function sendRequest(){
  if(!state.cart.length)return;
  const name=$("#request-name").value.trim(),loc=$("#request-location").value.trim(),note=$("#request-note").value.trim();
  const lines=["// AFCNDXS REQUEST",""];
  state.cart.forEach((i,n)=>{lines.push(String(n+1).padStart(2,"0")+" / ["+i.photoId+"] "+i.title);lines.push(i.product+" · "+[i.edition,i.color,i.size].filter(Boolean).join(" · "));lines.push(money(i.price));lines.push("")});
  if(name)lines.push("NAME · "+name); if(loc)lines.push("LOCATION · "+loc); if(note)lines.push("NOTE · "+note);
  lines.push(""); lines.push("Please confirm availability, final price and shipping.");
  const base=WHATSAPP_NUMBER?"https://wa.me/"+WHATSAPP_NUMBER:"https://wa.me/";
  window.open(base+"?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener,noreferrer");
}
init().catch(e=>{console.error(e);$("#archive-grid").innerHTML="<p>ARCHIVE DATA COULD NOT BE LOADED.</p>"});
