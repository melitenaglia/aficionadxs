const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={archive:[],products:[],filter:"all",activePhoto:null,selectedProduct:null,config:{edition:null,size:null,color:null},cart:JSON.parse(localStorage.getItem("afcndxs-request")||"[]")};
const WHATSAPP_NUMBER=""; // Add international number without + when ready.
const formatDate=v=>{if(!v)return"—";if(/^\d{4}-\d{2}$/.test(v)){const[y,m]=v.split("-");return`${m}.${y}`}const[y,m,d]=v.split("-");return[d,m,y].filter(Boolean).join(".")};
const money=v=>v==null?"PRICE ON REQUEST":`${v.toFixed(0)} EUR`;

async function init(){
  const[a,p]=await Promise.all([fetch("/data/archive.json"),fetch("/data/products.json")]);
  state.archive=await a.json(); state.products=await p.json();
  renderArchive(); renderObjects(); renderCart(); bindStaticEvents(); $("#footer-year").textContent=new Date().getFullYear();
}
function bindStaticEvents(){
  $$(".filter").forEach(b=>b.addEventListener("click",()=>{state.filter=b.dataset.filter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderArchive()}));
  $("#open-cart").onclick=openCart; $("#close-cart").onclick=closeCart; $("#drawer-backdrop").onclick=closeCart;
  $("#close-photo").onclick=()=>$("#photo-dialog").close();
  $("#photo-dialog").addEventListener("click",e=>{if(e.target===$("#photo-dialog"))$("#photo-dialog").close()});
  $("#clear-cart").onclick=()=>{state.cart=[];saveCart();renderCart()};
  $("#send-request").onclick=sendRequest;
}
function renderArchive(){
  const list=state.filter==="all"?state.archive:state.archive.filter(p=>p.countryCode===state.filter);
  $("#archive-grid").innerHTML=list.map(p=>`<article class="archive-card" data-id="${p.id}" tabindex="0" role="button">
    <div class="archive-image"><img src="${p.image}" alt="${p.title}" loading="lazy"></div>
    <div class="archive-data"><span class="archive-id">[${p.id}]</span><span class="archive-title">${p.title}</span><span class="archive-place">${p.city} / ${p.country.toUpperCase()} · ${formatDate(p.date)}</span></div>
  </article>`).join("");
  $$(".archive-card").forEach(c=>{const o=()=>openPhoto(c.dataset.id);c.onclick=o;c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();o()}}});
}
function renderObjects(){
  $("#object-list").innerHTML=state.products.map(p=>`<div class="object-row"><span>${p.code}</span><strong>${p.name}</strong><span>${p.description}</span><span class="object-price">${p.priceLabel}</span></div>`).join("");
}
function dataRow(a,b){return`<div class="data-row"><span>${a}</span><span>${b||"—"}</span></div>`}
function openPhoto(id){state.activePhoto=state.archive.find(p=>p.id===id);state.selectedProduct=null;state.config={edition:null,size:null,color:null};renderPhotoDetail();$("#photo-dialog").showModal()}
function renderPhotoDetail(){
  const p=state.activePhoto, avail=p.available.map(id=>state.products.find(x=>x.id===id)).filter(Boolean);
  $("#photo-detail").innerHTML=`<div class="detail-shell">
    <div class="detail-visual"><img src="${p.image}" alt="${p.title}"></div>
    <div class="detail-panel"><div class="detail-id">[${p.id}] // AFCNDXS ARCHIVE</div><h2>${p.title}</h2>
    <div>${p.place}<br>${p.city} / ${p.country.toUpperCase()}</div>
    <div class="data-table">${dataRow("DATE",formatDate(p.date))}${dataRow("TIME",p.time)}${dataRow("REGION",p.region)}${dataRow("COORD.",p.coordinates)}${dataRow("CAMERA",p.camera)}${dataRow("LENS",p.lens)}${dataRow("CAPTURE",p.capture)}</div>
    <div class="physical-box"><h3>// MAKE IT PHYSICAL</h3><div class="choice-group"><span class="choice-label">FORMAT</span>
    <div class="choice-buttons">${avail.map(x=>`<button class="choice-button product-choice" data-product="${x.id}">${x.name}</button>`).join("")}</div></div><div id="config-area"></div></div>
    </div></div>`;
  $$(".product-choice").forEach(b=>b.onclick=()=>{state.selectedProduct=state.products.find(x=>x.id===b.dataset.product);const q=state.selectedProduct;state.config={edition:q.editions[0]||null,size:q.sizes[0]||null,color:q.colors[0]||null};$$(".product-choice").forEach(x=>x.classList.toggle("active",x===b));renderConfigurator()});
}
function renderConfigurator(){
  const p=state.selectedProduct;if(!p)return;
  const g=(label,field,vals)=>!vals?.length?"":`<div class="choice-group"><span class="choice-label">${label}</span><div class="choice-buttons">${vals.map(v=>`<button class="choice-button config-choice ${state.config[field]===v?"active":""}" data-field="${field}" data-value="${v}">${v}</button>`).join("")}</div></div>`;
  $("#config-area").innerHTML=`${g("EDITION","edition",p.editions)}${g("SIZE","size",p.sizes)}${g("COLOR","color",p.colors)}<div class="config-price">${p.priceLabel}</div><button class="primary-action" id="add-request">ADD TO REQUEST →</button>`;
  $$(".config-choice").forEach(b=>b.onclick=()=>{state.config[b.dataset.field]=b.dataset.value;renderConfigurator()}); $("#add-request").onclick=addToRequest;
}
function addToRequest(){
  const a=state.activePhoto,p=state.selectedProduct;
  state.cart.push({key:crypto.randomUUID(),photoId:a.id,title:a.title,product:p.name,edition:state.config.edition,size:state.config.size,color:state.config.color,price:p.price});
  saveCart();renderCart();$("#photo-dialog").close();openCart();
}
function saveCart(){localStorage.setItem("afcndxs-request",JSON.stringify(state.cart))}
function renderCart(){
  $("#cart-count").textContent=`[${String(state.cart.length).padStart(2,"0")}]`;
  $("#cart-items").innerHTML=state.cart.length?state.cart.map(i=>`<div class="cart-item"><div class="cart-item-top"><div><h3>[${i.photoId}] ${i.title}</h3><p>${i.product}</p><p>${[i.edition,i.color,i.size].filter(Boolean).join(" / ")}</p><p>${money(i.price)}</p></div><button class="remove-item" data-key="${i.key}">REMOVE</button></div></div>`).join(""):'<div class="empty-cart">NO ITEMS IN REQUEST.</div>';
  $$(".remove-item").forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.key);saveCart();renderCart()});
  const known=state.cart.filter(x=>x.price!=null).reduce((s,x)=>s+x.price,0),unknown=state.cart.some(x=>x.price==null);
  $("#cart-total").innerHTML=`ESTIMATED TOTAL<br><strong>${known?money(known):"TO CONFIRM"}${known&&unknown?" + ITEMS TO CONFIRM":""}</strong>`;
}
function openCart(){$("#cart-drawer").classList.add("open");$("#drawer-backdrop").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){$("#cart-drawer").classList.remove("open");$("#drawer-backdrop").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true")}
function sendRequest(){
  if(!state.cart.length)return;
  const name=$("#request-name").value.trim(),loc=$("#request-location").value.trim(),note=$("#request-note").value.trim();
  const lines=["// AFCNDXS REQUEST","",...state.cart.flatMap((i,n)=>[`${String(n+1).padStart(2,"0")} / [${i.photoId}] ${i.title}`,`${i.product} · ${[i.edition,i.color,i.size].filter(Boolean).join(" · ")}`,money(i.price),""]),name?`NAME · ${name}`:"",loc?`LOCATION · ${loc}`:"",note?`NOTE · ${note}`:"","","Please confirm availability, final price and shipping."];
  const base=WHATSAPP_NUMBER?`https://wa.me/${WHATSAPP_NUMBER}`:"https://wa.me/";
  window.open(`${base}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank","noopener,noreferrer");
}
init().catch(e=>{console.error(e);$("#archive-grid").innerHTML="<p>ARCHIVE DATA COULD NOT BE LOADED.</p>"});
