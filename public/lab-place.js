const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const browserLang=(navigator.language||"").toLowerCase(),defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";

const T={
  es:{title:"GUESS<br>THE PLACE.",intro:"MIRA PRIMERO. LOS DATOS VIENEN DESPUÉS.",hint:"A VECES ES CIUDAD; OTRAS, REGIÓN, COSTA, ISLA O COMARCA.",question:"¿DÓNDE FUE TOMADA?",next:"SIGUIENTE →",correct:"CORRECTO",wrong:"ERA"},
  ca:{title:"GUESS<br>THE PLACE.",intro:"MIRA PRIMER. LES DADES VENEN DESPRÉS.",hint:"DE VEGADES ÉS CIUTAT; D’ALTRES, REGIÓ, COSTA, ILLA O COMARCA.",question:"ON ES VA FER?",next:"SEGÜENT →",correct:"CORRECTE",wrong:"ERA"},
  en:{title:"GUESS<br>THE PLACE.",intro:"LOOK FIRST. THE DATA COMES AFTER.",hint:"SOMETIMES IT IS A CITY; OTHER TIMES A REGION, COAST, ISLAND OR DISTRICT.",question:"WHERE WAS IT TAKEN?",next:"NEXT →",correct:"CORRECT",wrong:"IT WAS"}
};

const QUESTIONS=[
  {id:"002",kind:"COSTA / ZONA",answer:"Costa Brava",options:["Costa Brava","Côte d’Azur","Liguria","Algarve"]},
  {id:"013",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"029",kind:"ISLA",answer:"Santorini",options:["Santorini","Naxos","Milos","Paros"]},
  {id:"030",kind:"CIUDAD",answer:"Rotterdam",options:["Rotterdam","Amberes","La Haya","Hamburgo"]},
  {id:"032",kind:"CIUDAD",answer:"Copenhague",options:["Copenhague","Estocolmo","Oslo","Gotemburgo"]},
  {id:"035",kind:"CIUDAD",answer:"Hamburgo",options:["Hamburgo","Bremen","Lübeck","Hannover"]},
  {id:"036",kind:"PROVINCIA",answer:"Jujuy",options:["Jujuy","Salta","Catamarca","La Rioja"]},
  {id:"039",kind:"PROVINCIA",answer:"Tierra del Fuego",options:["Tierra del Fuego","Santa Cruz","Chubut","Río Negro"]},
  {id:"041",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"043",kind:"ISLA",answer:"Santorini",options:["Santorini","Mykonos","Naxos","Syros"]},
  {id:"044",kind:"ISLA",answer:"Paros",options:["Paros","Naxos","Syros","Mykonos"]},
  {id:"048",kind:"CIUDAD",answer:"Ginebra",options:["Ginebra","Lausana","Zúrich","Annecy"]},
  {id:"052",kind:"CIUDAD",answer:"Porto",options:["Porto","Lisboa","A Coruña","Bilbao"]},
  {id:"053",kind:"REGIÓN / COSTA",answer:"Provenza",options:["Provenza","Costa Brava","Liguria","Algarve"]},
  {id:"055",kind:"PROVINCIA",answer:"Córdoba",options:["Córdoba","San Luis","Mendoza","Salta"]},
  {id:"058",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"060",kind:"MACIZO / ZONA",answer:"Montserrat",options:["Montserrat","Montseny","Picos de Europa","Sierra de Tramuntana"]},
  {id:"061",kind:"COMARCA",answer:"Garraf",options:["Garraf","Maresme","Baix Empordà","Tarragonès"]},
  {id:"069",kind:"CIUDAD",answer:"Montpellier",options:["Montpellier","Nîmes","Toulouse","Avignon"]},
  {id:"070",kind:"CIUDAD",answer:"Marrakech",options:["Marrakech","Fez","Rabat","Córdoba"]},
  {id:"074",kind:"COMARCA",answer:"Baix Empordà",options:["Baix Empordà","Alt Empordà","Garraf","Maresme"]},
  {id:"075",kind:"REGIÓN / PAISAJE",answer:"Baix Empordà",options:["Baix Empordà","Périgord","Toscana","Istria"]},
  {id:"042",kind:"CIUDAD",answer:"Stuttgart",options:["Stuttgart","Helsinki","Rotterdam","Copenhague"]},
  {id:"051",kind:"CIUDAD",answer:"Lyon",options:["Lyon","Marsella","Toulouse","Burdeos"]},
  {id:"057",kind:"CIUDAD",answer:"Porto",options:["Porto","Lisboa","Bilbao","A Coruña"]},
  {id:"071",kind:"CIUDAD",answer:"Barcelona",options:["Barcelona","Valencia","Marsella","Nápoles"]}
];

const state={lang:localStorage.getItem("afcndxs-lang")||defaultLang,archive:[],queue:[],current:null,answered:false,round:0,correct:0,lastOk:null};
const tr=k=>(T[state.lang]||T.es)[k]||k;
const shuffle=a=>{const o=[...a];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]]}return o};

function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(e=>e.textContent=tr(e.dataset.i18n));
  $$("[data-i18n-html]").forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  if(state.answered)revealResult();
}
function setLanguage(l){state.lang=l;localStorage.setItem("afcndxs-lang",l);applyLanguage()}
function resetQueue(){state.queue=shuffle(QUESTIONS)}
function nextQuestion(){
  if(!state.queue.length)resetQueue();
  state.current=state.queue.shift();state.answered=false;state.lastOk=null;state.round++;
  const photo=state.archive.find(p=>p.id===state.current.id);
  if(!photo){nextQuestion();return}
  $("#place-image").src=photo.image;$("#place-image").alt="Fotografía del archivo para adivinar ubicación";
  $("#place-id").textContent="["+photo.id+"]";$("#round").textContent=String(state.round).padStart(2,"0");
  $("#place-kind").textContent="// "+state.current.kind;$("#place-result").innerHTML="";$("#place-next").disabled=true;
  $("#place-options").innerHTML=shuffle(state.current.options).map(v=>'<button class="place-option" type="button" data-value="'+v.replaceAll('"',"&quot;")+'">'+v+'</button>').join("");
  $$(".place-option").forEach(b=>b.onclick=()=>answer(b));renderScore();
}
function answer(button){
  if(state.answered)return;state.answered=true;state.lastOk=button.dataset.value===state.current.answer;if(state.lastOk)state.correct++;
  $$(".place-option").forEach(b=>{b.disabled=true;if(b.dataset.value===state.current.answer)b.classList.add("correct");else if(b===button)b.classList.add("wrong")});
  revealResult();$("#place-next").disabled=false;renderScore();
}
function revealResult(){
  const photo=state.archive.find(p=>p.id===state.current?.id);if(!photo)return;
  $("#place-result").innerHTML='<strong>'+(state.lastOk?tr("correct"):tr("wrong")+" · "+state.current.answer)+'</strong><p>'+[photo.place,photo.city,photo.region,photo.country].filter(Boolean).join(" · ")+'</p>';
}
function renderScore(){$("#score").textContent=String(state.correct).padStart(2,"0")+" / "+String(state.round).padStart(2,"0")}
function bind(){$$(".lang-toggle").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));$("#place-next").onclick=nextQuestion}
async function init(){
  const r=await fetch("/data/archive.json?v=20261007-photos76");if(!r.ok)throw new Error("archive");
  state.archive=(await r.json()).filter(p=>p.published!==false&&p.image);resetQueue();bind();applyLanguage();nextQuestion();
}
init().catch(console.error);