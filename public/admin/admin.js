import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL="https://psuhxbvsyhyiipaqijkp.supabase.co";
const SUPABASE_KEY="sb_publishable_4BYHLxgRiykemrZo9RLIbA_G4KGx8ll";
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const state={profile:null,photos:[],editions:[],applications:[],physicals:[],production:[],settings:[],costing:null,tab:"queue",busy:false};
const PHOTO_STATUSES=["DRAFT","USER_APPROVAL_PENDING","APPROVED","NEEDS_CHANGES","REJECTED"];
const PROD_STATUSES=["DRAFT","TEMPLATE_REQUIRED","EXPORT_REQUIRED","RELAYOUT_REQUIRED","REVIEW","PRODUCTION_READY","HOLD"];

function status(label,type="ok"){return '<span class="status '+type+'">'+esc(label)+'</span>'}
function statusType(s){return s==="APPROVED"||s==="PRODUCTION_READY"?"ok":s==="REJECTED"||s==="HOLD"?"bad":"warn"}
function title(h,p=""){return '<div class="section-title"><h2>// '+esc(h)+'</h2><p>'+esc(p)+'</p></div>'}
function setBusy(v){state.busy=v;document.body.classList.toggle("is-busy",v)}
function notify(msg,type="ok"){let n=$("#admin-toast");if(!n){n=document.createElement("div");n.id="admin-toast";n.className="admin-toast";document.body.appendChild(n)}n.className="admin-toast "+type;n.textContent=msg;n.hidden=false;clearTimeout(window.__toast);window.__toast=setTimeout(()=>n.hidden=true,2600)}

async function boot(){
  $("#sign-out").onclick=async()=>{await supabase.auth.signOut();location.reload()};
  $$(".tab").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;$$(".tab").forEach(x=>x.classList.toggle("active",x===b));render()});
  supabase.auth.onAuthStateChange((_event,session)=>handleSession(session));
  const {data:{session}}=await supabase.auth.getSession();
  await handleSession(session);
}
async function handleSession(session){
  const gate=$("#auth-gate"),app=$("#admin-app"),signOut=$("#sign-out"),authStatus=$("#auth-status");
  if(!session){
    state.profile=null;app.hidden=true;signOut.hidden=true;authStatus.textContent="";gate.hidden=false;
    gate.innerHTML='<div class="auth-card"><div class="eyebrow">PRIVATE ADMIN</div><h2>ACCESS.</h2><p>Acceso privado con email y contraseña.</p><form id="login-form"><label>EMAIL<input type="email" name="email" required autocomplete="email"></label><label>PASSWORD<input type="password" name="password" required autocomplete="current-password"></label><button class="primary-admin" type="submit">SIGN IN →</button><p id="login-msg" class="small"></p></form></div>';
    $("#login-form").onsubmit=signInWithPassword;return;
  }
  authStatus.textContent=session.user.email||"SIGNED IN";signOut.hidden=false;
  const {data:profile,error}=await supabase.from("profiles").select("id,display_name,role").eq("id",session.user.id).maybeSingle();
  if(error){gate.hidden=false;app.hidden=true;gate.innerHTML='<div class="auth-card"><h2>PROFILE ERROR.</h2><p>'+esc(error.message)+'</p></div>';return}
  state.profile=profile;
  if(!profile||!["admin","editor"].includes(profile.role)){
    gate.hidden=false;app.hidden=true;
    gate.innerHTML='<div class="auth-card"><div class="eyebrow">SIGNED IN</div><h2>ACCESS<br>PENDING.</h2><p>La cuenta ya existe, pero todavía no tiene rol de administración. Déjala abierta y avísame en el chat para habilitarla.</p><p class="small">ROLE · '+esc(profile?.role||"NO PROFILE")+'</p></div>';
    return;
  }
  gate.hidden=true;app.hidden=false;await loadData();
}
async function signInWithPassword(ev){
  ev.preventDefault();
  const form=new FormData(ev.currentTarget),email=form.get("email"),password=form.get("password"),msg=$("#login-msg");
  msg.textContent="SIGNING IN…";
  const {error}=await supabase.auth.signInWithPassword({email,password});
  msg.textContent=error?"Email o contraseña incorrectos.":"";
}
async function loadData(){
  setBusy(true);
  try{
    const [ph,ed,ap,fy,pr,se,co]=await Promise.all([
      supabase.from("photos").select("*").order("sort_order"),
      supabase.from("editions").select("*").order("sort_order"),
      supabase.from("applications").select("*").order("sort_order"),
      supabase.from("physicals").select("*").order("sort_order"),
      supabase.from("production_records").select("*").order("id"),
      supabase.from("settings").select("*").order("key"),
      fetch("/data/costing.json").then(r=>r.json()).catch(()=>null)
    ]);
    for(const r of [ph,ed,ap,fy,pr,se]) if(r.error) throw r.error;
    state.photos=ph.data||[];state.editions=ed.data||[];state.applications=ap.data||[];state.physicals=fy.data||[];state.production=pr.data||[];state.settings=se.data||[];state.costing=co;
    renderSummary();render();
  }catch(err){$("#panel").innerHTML='<p>ADMIN DATA COULD NOT BE LOADED · '+esc(err.message)+'</p>'}
  finally{setBusy(false)}
}
function renderSummary(){
  $("#summary").innerHTML=[["PHOTOS",state.photos.length],["APPAREL EDITIONS",state.editions.length],["APPLICATIONS",state.applications.length],["PHYSICALS",state.physicals.length],["PRODUCTION",state.production.length]].map(([k,v])=>'<div class="metric"><span>'+k+'</span><strong>'+String(v).padStart(2,"0")+'</strong></div>').join("");
}
function render(){
  if(state.tab==="photos")return renderPhotos();
  if(state.tab==="editions")return renderEditions();
  if(state.tab==="applications")return renderApplications();
  if(state.tab==="physicals")return renderPhysicals();
  if(state.tab==="production")return renderProduction();
  if(state.tab==="costing")return renderCosting();
  if(state.tab==="settings")return renderSettings();
  renderQueue();bindPanel();
}
function renderQueue(){
  const unpublished=state.photos.filter(p=>!p.published).length,ready=state.production.filter(p=>p.status==="PRODUCTION_READY").length,work=state.production.length-ready;
  $("#panel").innerHTML=title("VALIDATION QUEUE","El backend ya es persistente: los cambios hechos aquí se guardan en Supabase.")+'<div class="queue"><article class="issue ok"><h3>DATABASE CONNECTED</h3><p>'+state.photos.length+' photos · '+state.editions.length+' editions · '+state.applications.length+' applications · '+state.production.length+' production records.</p></article><article class="issue '+(unpublished?"warn":"ok")+'"><h3>PUBLICATION</h3><p>'+unpublished+' photos remain unpublished.</p></article><article class="issue '+(work?"warn":"ok")+'"><h3>PRODUCTION</h3><p>'+ready+' ready · '+work+' still require template/export/review work.</p></article><article class="issue ok"><h3>PRICING</h3><p>PVP remains deferred. No product or quality changes have been made.</p></article></div>';
}
function reviewButtons(table,id,current){
  return '<div class="review-actions">'+PHOTO_STATUSES.map(s=>'<button type="button" class="mini-button '+(current===s?"active":"")+'" data-action="review" data-table="'+table+'" data-id="'+esc(id)+'" data-status="'+s+'">'+s.replaceAll("_"," ")+'</button>').join("")+'</div>';
}
function textarea(name,label,value){return '<label class="field-label field-wide">'+label+'<textarea name="'+name+'" rows="4">'+esc(value||"")+'</textarea></label>'}
function safeName(name){return String(name||"file").normalize("NFKD").replace(/[^\\w.\\-]+/g,"-").replace(/-+/g,"-")}
function publicUrl(path){return supabase.storage.from("afcndxs-public").getPublicUrl(path).data.publicUrl}
function assetForm(type,id,publicValue,privateValue){
  const pub=type==="production"?"":'<label class="upload-box"><strong>PUBLIC PREVIEW</strong><span>Imagen optimizada · máx. 5 MB</span><input type="file" name="public_file" accept="image/*"><small>'+esc(publicValue||"NO PUBLIC PREVIEW")+'</small></label>';
  const privLabel=type==="photo"?"PRIVATE ORIGINAL":type==="production"?"PRIVATE PRODUCTION FILE":"PRIVATE MASTER";
  return '<form class="asset-form" data-form="asset" data-type="'+type+'" data-id="'+esc(id)+'">'+pub+'<label class="upload-box"><strong>'+privLabel+'</strong><span>No se publica en la web.</span><input type="file" name="private_file"><small>'+esc(privateValue||"NO PRIVATE FILE")+'</small></label><button class="secondary-admin" type="submit">UPLOAD FILES →</button></form>';
}
async function uploadOne(bucket,path,file,isPublic){
  if(!file||!file.size)return null;
  if(isPublic&&(!file.type.startsWith("image/")||file.size>5*1024*1024))throw new Error("El preview público debe ser una imagen de menos de 5 MB.");
  const {error}=await supabase.storage.from(bucket).upload(path,file,{upsert:true,contentType:file.type||undefined});
  if(error)throw error;
  return isPublic?publicUrl(path):path;
}
async function uploadAssets(form){
  const type=form.dataset.type,id=form.dataset.id,fd=new FormData(form),pub=fd.get("public_file"),priv=fd.get("private_file");
  if((!pub||!pub.size)&&(!priv||!priv.size)){notify("Selecciona al menos un archivo.","bad");return}
  setBusy(true);
  try{
    const stamp=Date.now();
    if(type==="photo"){
      const patch={};
      if(pub&&pub.size){const path="photos/"+id+"/preview/"+stamp+"-"+safeName(pub.name);patch.image_url=await uploadOne("afcndxs-public",path,pub,true)}
      if(priv&&priv.size){const path="photos/"+id+"/original/"+stamp+"-"+safeName(priv.name);patch.original_file_path=await uploadOne("afcndxs-private",path,priv,false);patch.source_file=priv.name}
      return updateRow("photos",id,patch,"Photo files uploaded");
    }
    if(type==="edition"){
      const patch={};
      if(pub&&pub.size){const path="editions/"+id+"/preview/"+stamp+"-"+safeName(pub.name);patch.public_preview=await uploadOne("afcndxs-public",path,pub,true)}
      if(priv&&priv.size){const path="editions/"+id+"/master/"+stamp+"-"+safeName(priv.name);patch.master_file_path=await uploadOne("afcndxs-private",path,priv,false);patch.source_filename=priv.name}
      return updateRow("editions",id,patch,"Edition files uploaded");
    }
    if(type==="application"){
      const patch={};
      if(pub&&pub.size){const path="applications/"+id+"/preview/"+stamp+"-"+safeName(pub.name);patch.public_preview=await uploadOne("afcndxs-public",path,pub,true)}
      if(priv&&priv.size){const path="applications/"+id+"/master/"+stamp+"-"+safeName(priv.name);patch.master_file_path=await uploadOne("afcndxs-private",path,priv,false);patch.source_filename=priv.name}
      return updateRow("applications",id,patch,"Application files uploaded");
    }
    if(type==="production"){
      if(!priv||!priv.size)throw new Error("Selecciona el archivo de producción.");
      const path="production/"+id+"/"+stamp+"-"+safeName(priv.name);
      const production_file_path=await uploadOne("afcndxs-private",path,priv,false);
      return updateRow("production_records",id,{production_file_path},"Production file uploaded");
    }
  }catch(err){notify(err.message||String(err),"bad");setBusy(false)}
}
function renderPhotos(){
  $("#panel").innerHTML=title("PHOTOS","Edita metadatos, estado y publicación. Estos cambios ya se guardan en Supabase.")+'<div class="record-list">'+state.photos.map(p=>`
    <article class="admin-record">
      <div class="record-top">
        <div><span class="small">[${esc(p.id)}]</span><h3>${esc(p.title)}</h3><p class="small">${esc(p.place)} · ${esc(p.city)} · ${esc(p.country)}</p></div>
        <div>${status(p.review_status,statusType(p.review_status))}<label class="toggle-line"><input type="checkbox" data-action="publish" data-id="${esc(p.id)}" ${p.published?"checked":""}> PUBLISHED</label></div>
      </div>
      ${reviewButtons("photos",p.id,p.review_status)}
      ${p.image_url?`<img class="admin-preview" src="${esc(p.image_url)}" alt="">`:""}
      ${assetForm("photo",p.id,p.image_url,p.original_file_path||p.source_file)}
      <details><summary>EDIT METADATA</summary>
        <form class="edit-form" data-form="photo" data-id="${esc(p.id)}">
          ${input("title","TITLE",p.title)}${input("place","PLACE",p.place)}${input("address","ADDRESS",p.address)}
          ${input("city","CITY",p.city)}${input("region","REGION",p.region)}${input("country","COUNTRY",p.country)}
          ${input("photo_date","DATE",p.photo_date,"date")}${input("photo_time","TIME",p.photo_time,"time")}
          ${input("coordinates","COORDINATES",p.coordinates)}${input("camera","CAMERA",p.camera)}
          ${input("lens","LENS",p.lens)}${input("capture","CAPTURE",p.capture)}
          ${input("event","EVENT",p.event)}${input("temperature","TEMPERATURE",p.temperature)}
          <button class="primary-admin" type="submit">SAVE PHOTO →</button>
        </form>
      </details>
    </article>`).join("")+'</div>';bindPanel();
}
function renderEditions(){
  $("#panel").innerHTML=title("APPAREL EDITIONS","Aprobación y estado persistentes. Los archivos maestros siguen privados.")+'<div class="record-list">'+state.editions.map(e=>{const source=state.photos.find(p=>p.id===e.archive_id);return `<article class="admin-record"><div class="record-top"><div><span class="small">[${esc(e.id)}]</span><h3>${esc(e.title)} · ${esc(e.variant)}</h3><p class="small">SOURCE · [${esc(e.archive_id)}] ${esc(source?.title||"")}</p><p class="small">${esc(e.source_filename)}</p></div>${status(e.review_status,statusType(e.review_status))}</div>${reviewButtons("editions",e.id,e.review_status)}${e.public_preview?`<img class="admin-preview" src="${esc(e.public_preview)}" alt="">`:""}${assetForm("edition",e.id,e.public_preview,e.master_file_path||e.source_filename)}</article>`}).join("")+'</div>';bindPanel();
}
function renderApplications(){
  $("#panel").innerHTML=title("APPLICATIONS","Postcard / notebook / tote. Cada adaptación mantiene su propio estado.")+'<div class="record-list">'+state.applications.map(a=>`<article class="admin-record"><div class="record-top"><div><span class="small">[${esc(a.id)}]</span><h3>${esc(a.title)} · ${esc(a.support.toUpperCase())}</h3><p class="small">${esc(a.source_filename)}</p></div>${status(a.review_status,statusType(a.review_status))}</div>${reviewButtons("applications",a.id,a.review_status)}${a.public_preview?`<img class="admin-preview" src="${esc(a.public_preview)}" alt="">`:""}${assetForm("application",a.id,a.public_preview,a.master_file_path||a.source_filename)}</article>`).join("")+'</div>';bindPanel();
}

function renderPhysicals(){
  const desktop=window.matchMedia("(min-width: 681px)").matches;
  $("#panel").innerHTML=title("PHYSICALS","Edita producto, PVP, referencias y textos ES/EN. En móvil cada producto se abre solo cuando lo necesitas.")+
  '<div class="physical-list">'+state.physicals.map(p=>{
    const cfg=p.config||{},models=cfg.models||[];
    const modelForms=models.map((m,i)=>'<details class="model-editor"><summary><span>'+esc(m.name_es||m.name_en||m.id||("MODEL "+(i+1)))+'</span><span class="summary-hint">EDIT →</span></summary><div class="edit-form model-edit-form">'+
      '<div class="form-section-title field-wide">TEXTOS DEL MODELO</div>'+
      input("model__"+i+"__name_es","NOMBRE ES",m.name_es)+input("model__"+i+"__name_en","NAME EN",m.name_en)+
      textarea("model__"+i+"__description_es","DESCRIPCIÓN ES",m.description_es)+textarea("model__"+i+"__description_en","DESCRIPTION EN",m.description_en)+
      '<div class="form-section-title field-wide">PRECIO Y REFERENCIAS</div>'+
      input("model__"+i+"__price","PVP EUR",m.price,"number","0.01")+input("model__"+i+"__supplierCostRef","COSTE / REFERENCIA",m.supplierCostRef)+
      input("model__"+i+"__shippingRef","ENVÍO / REFERENCIA",m.shippingRef)+
      '<div class="form-section-title field-wide">VARIANTES</div>'+
      input("model__"+i+"__sizes","TALLAS · separadas por coma",(m.sizes||[]).join(", "))+input("model__"+i+"__colors","COLORES · separados por coma",(m.colors||[]).join(", "))+
      '</div></details>').join("");
    const price=p.price==null?"PVP PENDIENTE":Number(p.price).toFixed(2)+" €";
    return '<article class="physical-card">'+
      '<div class="physical-card-head"><div><div class="small">'+esc(p.code||"")+' · '+esc(p.supplier||"")+'</div><h3>'+esc(p.name_es||p.name_en||p.id)+'</h3><div class="physical-price">'+price+'</div></div>'+
      '<label class="toggle-line compact-toggle"><input type="checkbox" data-action="physical-active" data-id="'+esc(p.id)+'" '+(p.active?"checked":"")+'> ACTIVE</label></div>'+
      '<details class="physical-editor" '+(desktop?'open':'')+'><summary><span>EDITAR PRODUCTO</span><span class="summary-hint">OPEN →</span></summary>'+
      '<form class="edit-form physical-form" data-form="physical" data-id="'+esc(p.id)+'">'+
      '<div class="form-section-title field-wide">CONTENIDO · ES / EN</div>'+
      input("name_es","NOMBRE ES",p.name_es)+input("name_en","NAME EN",p.name_en)+
      textarea("description_es","DESCRIPCIÓN ES",p.description_es)+textarea("description_en","DESCRIPTION EN",p.description_en)+
      '<div class="form-section-title field-wide">COMERCIAL</div>'+
      input("price","PVP EUR",p.price,"number","0.01")+input("supplier","PROVEEDOR",p.supplier)+input("source_url","URL PROVEEDOR",p.source_url)+
      '<div class="form-section-title field-wide">PRODUCCIÓN / REFERENCIAS</div>'+
      input("cfg__model","MODELO / REFERENCIA",cfg.model)+input("cfg__technique","TÉCNICA",cfg.technique)+input("cfg__material","MATERIAL",cfg.material)+
      input("cfg__supplierCostRef","COSTE / REFERENCIA",cfg.supplierCostRef)+input("cfg__shippingRef","ENVÍO / REFERENCIA",cfg.shippingRef)+
      textarea("cfg__productionNote_es","NOTA PRODUCCIÓN ES",cfg.productionNote_es)+textarea("cfg__productionNote_en","PRODUCTION NOTE EN",cfg.productionNote_en)+
      (modelForms?'<div class="field-wide models-block"><div class="form-section-title">MODELOS</div>'+modelForms+'</div>':'')+
      '<div class="mobile-save-bar field-wide"><button class="primary-admin save-physical" type="submit">SAVE PHYSICAL →</button></div>'+
      '</form></details></article>';
  }).join("")+'</div>';
  bindPanel();
}
function renderProduction(){
  $("#panel").innerHTML=title("PRODUCTION","Cambia el estado cuando una salida haya pasado plantilla, export y revisión.")+'<div class="object-grid">'+state.production.map(r=>`<article class="object-card"><div class="small">[${esc(r.id)}] · ${esc(r.source_type)}</div><h3>${esc(r.physical)} · ${esc(r.placement||"")}</h3><p class="small">${esc(r.source_filename)}<br>SOURCE · ${esc(r.source_pixels||"—")}${r.target_pixels?'<br>TARGET · '+esc(r.target_pixels):""}</p><label class="field-label">STATUS<select data-action="production-status" data-id="${esc(r.id)}">${PROD_STATUSES.map(s=>'<option '+(s===r.status?"selected":"")+'>'+s+'</option>').join("")}</select></label>${assetForm("production",r.id,null,r.production_file_path)}<p class="small">${esc(r.note||"")}</p></article>`).join("")+'</div>';bindPanel();
}
function renderCosting(){
  const c=state.costing;if(!c){$("#panel").innerHTML=title("COSTING","No data.");return}
  $("#panel").innerHTML=title("COSTING","PVP aparcado. Solo conservamos referencias de Printful para retomarlas después.")+'<div class="queue"><article class="issue warn"><h3>PVP DEFERRED</h3><p>'+esc(c.pricingNote||"Pendiente de revisión.")+'</p></article></div><div class="object-grid" style="margin-top:12px">'+(c.items||[]).map(i=>`<article class="object-card"><div class="small">${esc(i.status)}</div><h3>${esc(i.label)}</h3><p>PRODUCTO · ${i.productCost==null?"PENDIENTE":Number(i.productCost).toFixed(2)+" €"}<br>ENVÍO REF · ${i.shippingProxy==null?"PENDIENTE":Number(i.shippingProxy).toFixed(2)+" €"}</p><p class="small">PVP · PENDIENTE</p></article>`).join("")+'</div>';
}
function renderSettings(){
  $("#panel").innerHTML=title("SETTINGS","Configuración interna persistente.")+'<div class="record-list">'+state.settings.map(s=>`<article class="admin-record"><div class="record-top"><div><h3>${esc(s.key)}</h3><pre class="json-preview">${esc(JSON.stringify(s.value,null,2))}</pre></div></div></article>`).join("")+'</div>';
}
function input(name,label,value,type="text",step=""){return `<label class="field-label">${label}<input type="${type}" ${step?`step="${step}"`:""} name="${name}" value="${esc(value??"")}"></label>`}
function bindPanel(){
  const panel=$("#panel");if(!panel)return;
  panel.onclick=async ev=>{const b=ev.target.closest('[data-action="review"]');if(!b||state.busy)return;await setReview(b.dataset.table,b.dataset.id,b.dataset.status)};
  panel.onchange=async ev=>{const el=ev.target,action=el.dataset.action;if(!action||state.busy)return;if(action==="publish")await updateRow("photos",el.dataset.id,{published:el.checked},"Publication updated");if(action==="physical-active")await updateRow("physicals",el.dataset.id,{active:el.checked},"Physical updated");if(action==="production-status")await updateRow("production_records",el.dataset.id,{status:el.value},"Production status updated")};
  panel.onsubmit=async ev=>{
    const form=ev.target.closest("form");if(!form)return;ev.preventDefault();
    const kind=form.dataset.form;
    if(kind==="asset")return uploadAssets(form);
    const d=Object.fromEntries(new FormData(form).entries());
    for(const k of Object.keys(d))if(d[k]==="")d[k]=null;
    if(kind==="photo")return updateRow("photos",form.dataset.id,d,"Photo saved");
    if(kind==="physical"){
      const current=state.physicals.find(x=>x.id===form.dataset.id),cfg=structuredClone(current&&current.config?current.config:{}),patch={};
      for(const [k,v] of Object.entries(d)){if(k.startsWith("cfg__"))cfg[k.slice(5)]=v;else if(!k.startsWith("model__"))patch[k]=v}
      const models=cfg.models||[];
      for(const [k,v] of Object.entries(d)){
        if(!k.startsWith("model__"))continue;
        const parts=k.split("__"),i=Number(parts[1]),key=parts[2];if(!models[i])continue;
        if(key==="sizes"||key==="colors")models[i][key]=String(v||"").split(",").map(x=>x.trim()).filter(Boolean);
        else if(key==="price")models[i][key]=v==null?null:Number(v);
        else models[i][key]=v;
      }
      cfg.models=models;
      patch.price=patch.price==null?null:Number(patch.price);
      cfg.priceLabel_es=patch.price==null?"PRECIO A CONSULTAR":patch.price+" EUR";
      cfg.priceLabel_en=patch.price==null?"PRICE ON REQUEST":patch.price+" EUR";
      patch.config=cfg;
      return updateRow("physicals",form.dataset.id,patch,"Physical saved");
    }
  };
}
async function setReview(table,id,review_status){const patch={review_status};if(table==="editions"||table==="applications")patch.approved=review_status==="APPROVED";await updateRow(table,id,patch,"Review status updated")}
async function updateRow(table,id,patch,message){setBusy(true);const {error}=await supabase.from(table).update(patch).eq("id",id);if(error){notify(error.message,"bad");setBusy(false);return}notify(message,"ok");await loadData()}
boot().catch(err=>{$("#auth-gate").hidden=false;$("#auth-gate").innerHTML='<div class="auth-card"><h2>ADMIN ERROR.</h2><p>'+esc(err.message)+'</p></div>'});
