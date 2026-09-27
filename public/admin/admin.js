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
    gate.innerHTML='<div class="auth-card"><div class="eyebrow">PRIVATE ADMIN</div><h2>ACCESS.</h2><p>Entra con tu email. Supabase enviará un enlace de acceso de un solo uso.</p><form id="login-form"><label>EMAIL<input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label><button class="primary-admin" type="submit">SEND MAGIC LINK →</button><p id="login-msg" class="small"></p></form></div>';
    $("#login-form").onsubmit=sendMagicLink;return;
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
async function sendMagicLink(ev){
  ev.preventDefault();const email=new FormData(ev.currentTarget).get("email"),msg=$("#login-msg");msg.textContent="SENDING…";
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+"/admin/",shouldCreateUser:true}});
  msg.textContent=error?error.message:"Check your inbox. Open the AFCNDXS access link on this device.";
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
function renderPhotos(){
  $("#panel").innerHTML=title("PHOTOS","Edita metadatos, estado y publicación. Estos cambios ya se guardan en Supabase.")+'<div class="record-list">'+state.photos.map(p=>`
    <article class="admin-record">
      <div class="record-top">
        <div><span class="small">[${esc(p.id)}]</span><h3>${esc(p.title)}</h3><p class="small">${esc(p.place)} · ${esc(p.city)} · ${esc(p.country)}</p></div>
        <div>${status(p.review_status,statusType(p.review_status))}<label class="toggle-line"><input type="checkbox" data-action="publish" data-id="${esc(p.id)}" ${p.published?"checked":""}> PUBLISHED</label></div>
      </div>
      ${reviewButtons("photos",p.id,p.review_status)}
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
  $("#panel").innerHTML=title("APPAREL EDITIONS","Aprobación y estado persistentes. Los archivos maestros siguen privados.")+'<div class="record-list">'+state.editions.map(e=>{const source=state.photos.find(p=>p.id===e.archive_id);return `<article class="admin-record"><div class="record-top"><div><span class="small">[${esc(e.id)}]</span><h3>${esc(e.title)} · ${esc(e.variant)}</h3><p class="small">SOURCE · [${esc(e.archive_id)}] ${esc(source?.title||"")}</p><p class="small">${esc(e.source_filename)}</p></div>${status(e.review_status,statusType(e.review_status))}</div>${reviewButtons("editions",e.id,e.review_status)}</article>`}).join("")+'</div>';bindPanel();
}
function renderApplications(){
  $("#panel").innerHTML=title("APPLICATIONS","Postcard / notebook / tote. Cada adaptación mantiene su propio estado.")+'<div class="record-list">'+state.applications.map(a=>`<article class="admin-record"><div class="record-top"><div><span class="small">[${esc(a.id)}]</span><h3>${esc(a.title)} · ${esc(a.support.toUpperCase())}</h3><p class="small">${esc(a.source_filename)}</p></div>${status(a.review_status,statusType(a.review_status))}</div>${reviewButtons("applications",a.id,a.review_status)}</article>`).join("")+'</div>';bindPanel();
}
function renderPhysicals(){
  $("#panel").innerHTML=title("PHYSICALS","No se han cambiado modelos ni calidades. Desde aquí solo activamos/desactivamos formatos por ahora.")+'<div class="object-grid">'+state.physicals.map(p=>{const cfg=p.config||{},models=(cfg.models||[]).map(m=>'<span class="tag">'+esc(m.name_es||m.name_en||m.id)+'</span>').join("");return `<article class="object-card"><div class="small">${esc(p.code||"")}</div><h3>${esc(p.name_es||p.name_en||p.id)}</h3><p>${esc(p.description_es||p.description_en||"")}</p>${models?'<div class="tags">'+models+'</div>':""}<label class="toggle-line"><input type="checkbox" data-action="physical-active" data-id="${esc(p.id)}" ${p.active?"checked":""}> ACTIVE</label><p class="small">PVP · ${p.price==null?"PENDIENTE":Number(p.price).toFixed(2)+" €"}</p></article>`}).join("")+'</div>';bindPanel();
}
function renderProduction(){
  $("#panel").innerHTML=title("PRODUCTION","Cambia el estado cuando una salida haya pasado plantilla, export y revisión.")+'<div class="object-grid">'+state.production.map(r=>`<article class="object-card"><div class="small">[${esc(r.id)}] · ${esc(r.source_type)}</div><h3>${esc(r.physical)} · ${esc(r.placement||"")}</h3><p class="small">${esc(r.source_filename)}<br>SOURCE · ${esc(r.source_pixels||"—")}${r.target_pixels?'<br>TARGET · '+esc(r.target_pixels):""}</p><label class="field-label">STATUS<select data-action="production-status" data-id="${esc(r.id)}">${PROD_STATUSES.map(s=>'<option '+(s===r.status?"selected":"")+'>'+s+'</option>').join("")}</select></label><p class="small">${esc(r.note||"")}</p></article>`).join("")+'</div>';bindPanel();
}
function renderCosting(){
  const c=state.costing;if(!c){$("#panel").innerHTML=title("COSTING","No data.");return}
  $("#panel").innerHTML=title("COSTING","PVP aparcado. Solo conservamos referencias de Printful para retomarlas después.")+'<div class="queue"><article class="issue warn"><h3>PVP DEFERRED</h3><p>'+esc(c.pricingNote||"Pendiente de revisión.")+'</p></article></div><div class="object-grid" style="margin-top:12px">'+(c.items||[]).map(i=>`<article class="object-card"><div class="small">${esc(i.status)}</div><h3>${esc(i.label)}</h3><p>PRODUCTO · ${i.productCost==null?"PENDIENTE":Number(i.productCost).toFixed(2)+" €"}<br>ENVÍO REF · ${i.shippingProxy==null?"PENDIENTE":Number(i.shippingProxy).toFixed(2)+" €"}</p><p class="small">PVP · PENDIENTE</p></article>`).join("")+'</div>';
}
function renderSettings(){
  $("#panel").innerHTML=title("SETTINGS","Configuración interna persistente.")+'<div class="record-list">'+state.settings.map(s=>`<article class="admin-record"><div class="record-top"><div><h3>${esc(s.key)}</h3><pre class="json-preview">${esc(JSON.stringify(s.value,null,2))}</pre></div></div></article>`).join("")+'</div>';
}
function input(name,label,value,type="text"){return `<label class="field-label">${label}<input type="${type}" name="${name}" value="${esc(value||"")}"></label>`}
function bindPanel(){
  const panel=$("#panel");if(!panel)return;
  panel.onclick=async ev=>{const b=ev.target.closest('[data-action="review"]');if(!b||state.busy)return;await setReview(b.dataset.table,b.dataset.id,b.dataset.status)};
  panel.onchange=async ev=>{const el=ev.target,action=el.dataset.action;if(!action||state.busy)return;if(action==="publish")await updateRow("photos",el.dataset.id,{published:el.checked},"Publication updated");if(action==="physical-active")await updateRow("physicals",el.dataset.id,{active:el.checked},"Physical updated");if(action==="production-status")await updateRow("production_records",el.dataset.id,{status:el.value},"Production status updated")};
  panel.onsubmit=async ev=>{const form=ev.target.closest('form[data-form="photo"]');if(!form)return;ev.preventDefault();const d=Object.fromEntries(new FormData(form).entries());for(const k of Object.keys(d))if(d[k]==="")d[k]=null;await updateRow("photos",form.dataset.id,d,"Photo saved")};
}
async function setReview(table,id,review_status){const patch={review_status};if(table==="editions"||table==="applications")patch.approved=review_status==="APPROVED";await updateRow(table,id,patch,"Review status updated")}
async function updateRow(table,id,patch,message){setBusy(true);const {error}=await supabase.from(table).update(patch).eq("id",id);if(error){notify(error.message,"bad");setBusy(false);return}notify(message,"ok");await loadData()}
boot().catch(err=>{$("#auth-gate").hidden=false;$("#auth-gate").innerHTML='<div class="auth-card"><h2>ADMIN ERROR.</h2><p>'+esc(err.message)+'</p></div>'});
