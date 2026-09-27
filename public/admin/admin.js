const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={archive:[],editions:[],applications:[],products:[],costing:null,tab:"queue"};
async function init(){
  const [a,e,s,p,c]=await Promise.all([
    fetch("/data/archive.json").then(r=>r.json()),
    fetch("/data/editions.json").then(r=>r.json()),
    fetch("/data/support-designs.json").then(r=>r.json()),
    fetch("/data/products.json").then(r=>r.json()),
    fetch("/data/costing.json").then(r=>r.json())
  ]);
  state.archive=a;state.editions=e;state.applications=s;state.products=p;state.costing=c;
  bind();renderSummary();render();
}
function bind(){
  $$(".tab").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;$$(".tab").forEach(x=>x.classList.toggle("active",x===b));render()});
}
function renderSummary(){
  const missingSource=[...new Set(state.editions.filter(e=>!state.archive.some(p=>p.id===e.archiveId)).map(e=>e.archiveId))];
  $("#summary").innerHTML=[
    ["REGISTERED PHOTOS",state.archive.length],
    ["APPAREL EDITIONS",state.editions.length],
    ["APPLICATIONS",state.applications.length],
    ["PHYSICAL FORMATS",state.products.length],
    ["MISSING SOURCES",missingSource.length]
  ].map(([k,v])=>'<div class="metric"><span>'+k+'</span><strong>'+String(v).padStart(2,"0")+'</strong></div>').join("");
}
function title(h,p=""){return '<div class="section-title"><h2>// '+h+'</h2><p>'+p+'</p></div>'}
function status(label,type="ok"){return '<span class="status '+type+'">'+label+'</span>'}
function render(){
  if(state.tab==="photos")return renderPhotos();
  if(state.tab==="editions")return renderEditions();
  if(state.tab==="applications")return renderApplications();
  if(state.tab==="physicals")return renderPhysicals();
  if(state.tab==="costing")return renderCosting();
  renderQueue();
}
function renderQueue(){
  const missing=[...new Set(state.editions.filter(e=>!state.archive.some(p=>p.id===e.archiveId)).map(e=>e.archiveId))];
  const noPreview=state.editions.filter(e=>!e.publicPreview).length;
  const noAppPreview=state.applications.filter(e=>!e.publicPreview).length;
  const issues=[];
  if(missing.length)issues.push(['bad','SOURCE PHOTOS TO REGISTER','IDs '+missing.join(", ")+' have apparel designs but are not yet present in archive.json. Validate the original-photo mapping before publication.']);
  else issues.push(['ok','SOURCE PHOTO LINKS','All apparel editions currently point to registered source photos.']);
  const pendingPhotos=state.archive.filter(p=>p.reviewStatus==="USER_APPROVAL_PENDING").map(p=>p.id);
  if(pendingPhotos.length)issues.push(['warn','PHOTO APPROVAL PENDING','Review photos '+pendingPhotos.join(", ")+' in PHOTOS.']);
  else issues.push(['ok','PHOTO VALIDATION COMPLETE','Archive metadata 001–011 is structurally registered. Draft photos 006–011 remain unpublished only because their public web image assets are still pending.']);
  const pendingEditions=state.editions.filter(e=>e.reviewStatus==="USER_APPROVAL_PENDING").length;
  if(pendingEditions)issues.push(['warn','NEXT · APPAREL EDITIONS',pendingEditions+' apparel designs are waiting for visual approval against the exact PROPUESTAS files.']);
  else issues.push(['ok','APPAREL EDITIONS APPROVED','All current apparel editions 001–011 are approved as source designs. Production readiness will be validated later per Printful template.']);
  const pendingApps=state.applications.filter(a=>a.reviewStatus==="USER_APPROVAL_PENDING").length;
  if(pendingApps)issues.push(['warn','NEXT · SUPPORT APPLICATIONS',pendingApps+' postcard / notebook / tote designs are waiting for visual approval.']);
  else issues.push(['ok','SUPPORT APPLICATIONS APPROVED','Current postcard, notebook and tote applications are approved as source designs.']);
  issues.push(['warn','NEXT · COSTING','Printful product costs and shipping proxies are now separated in COSTING. Final Barcelona checkout validation is still required before publishing PVP.']);
  if(noPreview)issues.push(['warn','APPAREL PREVIEWS TO IMPORT',noPreview+' approved design records still need a web preview generated from the exact files in PROPUESTAS.zip.']);
  if(noAppPreview)issues.push(['warn','APPLICATION PREVIEWS TO IMPORT',noAppPreview+' postcard / notebook / tote records still need web previews from their exact source files.']);
  issues.push(['ok','CLASSIFICATION RULE','Untagged proposal files = apparel. pc = postcard · nb = notebook · tote = tote application.']);
  $("#panel").innerHTML=title("VALIDATION QUEUE","Resolver de arriba hacia abajo antes de ampliar catálogo.")+'<div class="queue">'+issues.map(i=>'<article class="issue '+i[0]+'"><h3>'+i[1]+'</h3><p>'+i[2]+'</p></article>').join("")+'</div>';
}
function renderPhotos(){
  $("#panel").innerHTML=title("PHOTOS","Primera validación: ID, foto original y metadatos.")+'<div class="table"><div class="row head"><span>ID</span><span>PHOTO</span><span>PLACE / DATE</span><span>TECHNICAL DATA</span><span>STATUS</span></div>'+state.archive.map(p=>'<div class="row"><span>['+p.id+']</span><strong>'+p.title+'</strong><div class="small">'+p.place+'<br>'+p.city+' · '+p.country+'<br>'+p.date+' '+(p.time||"")+'</div><div class="small">'+[p.camera,p.lens,p.capture,p.coordinates,p.event,p.sourceFile&&("SOURCE · "+p.sourceFile)].filter(Boolean).join("<br>")+'</div>'+(p.reviewStatus==="USER_APPROVAL_PENDING"?status("APPROVAL PENDING","warn"):(p.published===false?status("REVIEW DRAFT","warn"):status("PUBLISHED","ok")))+'</div>').join("")+'</div>';
}
function renderEditions(){
  $("#panel").innerHTML=title("APPAREL EDITIONS","Archivos sin prefijo pc / nb / tote. Uso previsto: camiseta + sudadera.")+'<div class="table"><div class="row head"><span>ID</span><span>DESIGN</span><span>SOURCE</span><span>FILE</span><span>STATUS</span></div>'+state.editions.map(e=>{const source=state.archive.find(p=>p.id===e.archiveId);return '<div class="row"><span>['+e.id+']</span><div><strong>'+e.title+'</strong><div class="small">'+e.variant+'</div></div><div class="small">'+(source?'['+source.id+'] '+source.title:'['+e.archiveId+'] SOURCE NOT REGISTERED')+'</div><div class="small">'+e.sourceFilename+'<br>'+((e.supportedObjects||[]).join(" · "))+'</div>'+(source?(e.reviewStatus==="USER_APPROVAL_PENDING"?status("MATCH VERIFIED · APPROVAL PENDING","warn"):status("STRUCTURE OK","ok")):status("NEEDS SOURCE","bad"))+'</div>'}).join("")+'</div>';
}
function renderApplications(){
  $("#panel").innerHTML=title("APPLICATIONS","Diseños específicos adaptados a un soporte físico.")+'<div class="table"><div class="row head"><span>ID</span><span>DESIGN</span><span>SUPPORT</span><span>FILE</span><span>STATUS</span></div>'+state.applications.map(e=>'<div class="row"><span>['+e.id+']</span><div><strong>'+e.title+'</strong><div class="small">'+e.variant+'</div></div><div class="small">'+e.support.toUpperCase()+'<br>SOURCE PHOTO ['+e.archiveId+']</div><div class="small">'+e.sourceFilename+'</div>'+status(e.publicPreview?"PREVIEW READY":"PREVIEW PENDING",e.publicPreview?"ok":"warn")+'</div>').join("")+'</div>';
}

function pct(v){return Math.round(v*10)/10}
function renderCosting(){
  const c=state.costing;
  const rows=c.items.map(i=>{
    const pvps=(i.pvpScenarios||[]).map(p=>{
      if(i.productCost==null)return '<span class="tag">'+p+' € · COST PENDING</span>';
      const gm=pct((p-i.productCost)/p*100);
      const fm=i.shippingProxy==null?null:pct((p-i.productCost-i.shippingProxy)/p*100);
      return '<span class="tag">'+p+' € · M '+gm+'%'+(fm!=null?' · M+SHIP '+fm+'%':'')+'</span>';
    }).join("");
    return '<article class="object-card"><div class="small">'+i.status+'</div><h3>'+i.label+'</h3><p>PRODUCTO · '+(i.productCost==null?'PENDIENTE':i.productCost.toFixed(2)+' €')+'<br>ENVÍO REF · '+(i.shippingProxy==null?'PENDIENTE':i.shippingProxy.toFixed(2)+' €')+'<br>PUESTO EN MANO REF · '+(i.landedSingleProxy==null?'PENDIENTE':i.landedSingleProxy.toFixed(2)+' €')+'</p>'+(i.ratioNote?'<p class="small">'+i.ratioNote+'</p>':'')+'<div class="small">PVP ESCENARIOS · ENVÍO COBRADO APARTE</div><div class="tags">'+pvps+'</div></article>';
  }).join("");
  $("#panel").innerHTML=title("COSTING","Destino base: "+c.destination+" · "+c.asOf+". M = margen sobre coste de producto. M+SHIP = margen si AFCNDXS absorbiera el envío de referencia. No son PVP aprobados.")+'<div class="queue"><article class="issue warn"><h3>POLÍTICA INICIAL DE ENVÍO</h3><p>'+c.shippingPolicy+'</p></article><article class="issue warn"><h3>PEDIDOS MIXTOS</h3><p>Prints y notebooks pueden enviarse por separado; un pedido mixto puede generar más de un cargo de envío.</p></article></div><div class="object-grid" style="margin-top:12px">'+rows+'</div>';
}

function renderPhysicals(){
  $("#panel").innerHTML=title("PHYSICALS","Estructura UX propuesta: formato genérico primero; modelo y calidad se eligen después. Costes, envío y PVP todavía no están aprobados.")+'<div class="object-grid">'+state.products.map(p=>{
    const models=(p.models||[]).map(m=>{
      const ref=m.referenceLandedSingle!=null?' · REF '+m.referenceLandedSingle.toFixed(2)+' €':(m.shippingSingleRefNumeric!=null?' · ENVÍO REF '+m.shippingSingleRefNumeric.toFixed(2)+' €':'');
      return '<div class="tag">'+(m.name_es||m.name_en||m.id)+ref+'</div>';
    }).join("");
    const sizes=p.models?.length?[...new Set(p.models.flatMap(m=>m.sizes||[]))]:(p.sizes||[]);
    const baseRef=p.referenceLandedSingle!=null?'<p class="small">COSTE REF 1 UD · '+p.referenceLandedSingle.toFixed(2)+' € (producto + envío ref.)</p>':"";
    return '<article class="object-card"><div class="small">'+p.code+'</div><h3>'+(p.name_es||p.name_en||p.name||p.id)+'</h3><p>'+(p.description_es||p.description_en||p.description||"")+'</p>'+baseRef+(models?'<div class="small">MODELOS</div><div class="tags">'+models+'</div>':'')+'<div class="small" style="margin-top:12px">TALLAS / TAMAÑOS</div><div class="tags">'+sizes.map(v=>'<span class="tag">'+v+'</span>').join("")+'</div><p>PRECIO · '+(p.priceLabel_es||p.priceLabel_en||"PENDIENTE")+'</p><p class="small">REFERENCIA PROVISIONAL · validar checkout Barcelona antes de fijar PVP.</p></article>';
  }).join("")+'</div>';
}
init().catch(err=>{$("#panel").innerHTML='<p>ADMIN DATA COULD NOT BE LOADED.</p>';console.error(err)});
