const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const browserLang=(navigator.language||"").toLowerCase(),defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";

const T={
  es:{title:"GUESS<br>THE PLACE.",intro:"MIRA PRIMERO. LOS DATOS VIENEN DESPUÉS.",hint:"CIUDAD · PROVINCIA · REGIÓN · PAÍS · CONTINENTE.",question:"¿DÓNDE FUE TOMADA?",next:"SIGUIENTE →",correct:"CORRECTO",wrong:"ERA",photos:"FOTOS",start:"EMPEZAR →",restart:"OTRA PARTIDA ↻",hits:"ACIERTOS",accuracy:"PRECISIÓN",bestStreak:"MEJOR RACHA",scoreRules:"CONTINENTE 50 · PAÍS 75 · REGIÓN/PROVINCIA 100 · CIUDAD 125 · BONUS POR RACHA",great:"MUY BUENA LECTURA DEL ARCHIVO.",mid:"BUEN INSTINTO. LAS PISTAS ESTÁN EN LA LUZ, LA ARQUITECTURA Y EL PAISAJE.",low:"EL ARCHIVO TODAVÍA GUARDA SECRETOS."},
  ca:{title:"GUESS<br>THE PLACE.",intro:"MIRA PRIMER. LES DADES VENEN DESPRÉS.",hint:"CIUTAT · PROVÍNCIA · REGIÓ · PAÍS · CONTINENT.",question:"ON ES VA FER?",next:"SEGÜENT →",correct:"CORRECTE",wrong:"ERA",photos:"FOTOS",start:"COMENÇAR →",restart:"UNA ALTRA PARTIDA ↻",hits:"ENCERTS",accuracy:"PRECISIÓ",bestStreak:"MILLOR RATXA",scoreRules:"CONTINENT 50 · PAÍS 75 · REGIÓ/PROVÍNCIA 100 · CIUTAT 125 · BONUS PER RATXA",great:"MOLT BONA LECTURA DE L’ARXIU.",mid:"BON INSTINT. LES PISTES SÓN A LA LLUM, L’ARQUITECTURA I EL PAISATGE.",low:"L’ARXIU ENCARA GUARDA SECRETS."},
  en:{title:"GUESS<br>THE PLACE.",intro:"LOOK FIRST. THE DATA COMES AFTER.",hint:"CITY · PROVINCE · REGION · COUNTRY · CONTINENT.",question:"WHERE WAS IT TAKEN?",next:"NEXT →",correct:"CORRECT",wrong:"IT WAS",photos:"PHOTOS",start:"START →",restart:"PLAY AGAIN ↻",hits:"HITS",accuracy:"ACCURACY",bestStreak:"BEST STREAK",scoreRules:"CONTINENT 50 · COUNTRY 75 · REGION/PROVINCE 100 · CITY 125 · STREAK BONUS",great:"VERY STRONG READING OF THE ARCHIVE.",mid:"GOOD INSTINCT. THE CLUES ARE IN THE LIGHT, ARCHITECTURE AND LANDSCAPE.",low:"THE ARCHIVE STILL HAS SECRETS."}
};

const QUESTIONS=[
  {id:"002",group:"regional",kind:"COSTA / ZONA",answer:"Costa Brava",options:["Costa Brava","Côte d’Azur","Liguria","Algarve"]},
  {id:"013",group:"regional",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"029",group:"regional",kind:"ISLA",answer:"Santorini",options:["Santorini","Naxos","Milos","Paros"]},
  {id:"030",group:"city",kind:"CIUDAD",answer:"Rotterdam",options:["Rotterdam","Amberes","La Haya","Hamburgo"]},
  {id:"032",group:"city",kind:"CIUDAD",answer:"Copenhague",options:["Copenhague","Estocolmo","Oslo","Gotemburgo"]},
  {id:"035",group:"city",kind:"CIUDAD",answer:"Hamburgo",options:["Hamburgo","Bremen","Lübeck","Hannover"]},
  {id:"036",group:"regional",kind:"PROVINCIA",answer:"Jujuy",options:["Jujuy","Salta","Catamarca","La Rioja"]},
  {id:"039",group:"regional",kind:"PROVINCIA",answer:"Tierra del Fuego",options:["Tierra del Fuego","Santa Cruz","Chubut","Río Negro"]},
  {id:"041",group:"regional",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"043",group:"regional",kind:"ISLA",answer:"Santorini",options:["Santorini","Mykonos","Naxos","Syros"]},
  {id:"044",group:"regional",kind:"ISLA",answer:"Paros",options:["Paros","Naxos","Syros","Mykonos"]},
  {id:"048",group:"city",kind:"CIUDAD",answer:"Ginebra",options:["Ginebra","Lausana","Zúrich","Annecy"]},
  {id:"052",group:"city",kind:"CIUDAD",answer:"Porto",options:["Porto","Lisboa","A Coruña","Bilbao"]},
  {id:"053",group:"regional",kind:"REGIÓN / COSTA",answer:"Provenza",options:["Provenza","Costa Brava","Liguria","Algarve"]},
  {id:"055",group:"regional",kind:"PROVINCIA",answer:"Córdoba",options:["Córdoba","San Luis","Mendoza","Salta"]},
  {id:"058",group:"regional",kind:"REGIÓN",answer:"Asturias",options:["Asturias","Cantabria","Galicia","Euskadi"]},
  {id:"060",group:"regional",kind:"MACIZO / ZONA",answer:"Montserrat",options:["Montserrat","Montseny","Picos de Europa","Sierra de Tramuntana"]},
  {id:"061",group:"regional",kind:"COMARCA",answer:"Garraf",options:["Garraf","Maresme","Baix Empordà","Tarragonès"]},
  {id:"069",group:"city",kind:"CIUDAD",answer:"Montpellier",options:["Montpellier","Nîmes","Toulouse","Avignon"]},
  {id:"070",group:"city",kind:"CIUDAD",answer:"Marrakech",options:["Marrakech","Fez","Rabat","Córdoba"]},
  {id:"074",group:"regional",kind:"COMARCA",answer:"Baix Empordà",options:["Baix Empordà","Alt Empordà","Garraf","Maresme"]},
  {id:"075",group:"regional",kind:"REGIÓN / PAISAJE",answer:"Baix Empordà",options:["Baix Empordà","Périgord","Toscana","Istria"]},
  {id:"042",group:"city",kind:"CIUDAD",answer:"Stuttgart",options:["Stuttgart","Helsinki","Rotterdam","Copenhague"]},
  {id:"051",group:"city",kind:"CIUDAD",answer:"Lyon",options:["Lyon","Marsella","Toulouse","Burdeos"]},
  {id:"057",group:"city",kind:"CIUDAD",answer:"Porto",options:["Porto","Lisboa","Bilbao","A Coruña"]},
  {id:"071",group:"city",kind:"CIUDAD",answer:"Barcelona",options:["Barcelona","Valencia","Marsella","Nápoles"]},

  {id:"004",group:"country",kind:"PAÍS",answer:"Alemania",options:["Alemania","Países Bajos","Bélgica","Austria"]},
  {id:"005",group:"country",kind:"PAÍS",answer:"Chequia",options:["Chequia","Austria","Hungría","Polonia"]},
  {id:"006",group:"country",kind:"PAÍS",answer:"Irlanda",options:["Irlanda","Reino Unido","Dinamarca","Países Bajos"]},
  {id:"010",group:"country",kind:"PAÍS",answer:"Bélgica",options:["Bélgica","Países Bajos","Alemania","Francia"]},
  {id:"020",group:"country",kind:"PAÍS",answer:"Grecia",options:["Grecia","Italia","Turquía","Croacia"]},
  {id:"021",group:"country",kind:"PAÍS",answer:"Portugal",options:["Portugal","España","Francia","Italia"]},
  {id:"031",group:"country",kind:"PAÍS",answer:"Alemania",options:["Alemania","Austria","Bélgica","Países Bajos"]},
  {id:"034",group:"country",kind:"PAÍS",answer:"Italia",options:["Italia","Grecia","Croacia","España"]},
  {id:"046",group:"country",kind:"PAÍS",answer:"Grecia",options:["Grecia","Turquía","Italia","Croacia"]},
  {id:"059",group:"country",kind:"PAÍS",answer:"Argentina",options:["Argentina","Uruguay","Brasil","Chile"]},
  {id:"067",group:"country",kind:"PAÍS",answer:"Estados Unidos",options:["Estados Unidos","Canadá","Reino Unido","Australia"]},
  {id:"076",group:"country",kind:"PAÍS",answer:"España",options:["España","Francia","Italia","Portugal"]},

  {id:"017",group:"continent",kind:"CONTINENTE",answer:"América del Norte",options:["América del Norte","Europa","América del Sur","Asia"]},
  {id:"033",group:"continent",kind:"CONTINENTE",answer:"América del Norte",options:["América del Norte","Europa","Asia","Oceanía"]},
  {id:"054",group:"continent",kind:"CONTINENTE",answer:"América del Sur",options:["América del Sur","América del Norte","África","Europa"]},
  {id:"070",group:"continent",kind:"CONTINENTE",answer:"África",options:["África","Europa","Asia","América del Sur"]},
  {id:"020",group:"continent",kind:"CONTINENTE",answer:"Europa",options:["Europa","Asia","África","América del Sur"]},
  {id:"024",group:"continent",kind:"CONTINENTE",answer:"Europa",options:["Europa","América del Norte","Asia","Oceanía"]}
];

const state={lang:localStorage.getItem("afcndxs-lang")||defaultLang,archive:[],gameLength:10,game:[],index:0,current:null,answered:false,correct:0,points:0,streak:0,bestStreak:0,lastAward:0,lastOk:null};
const tr=k=>(T[state.lang]||T.es)[k]||k;
const shuffle=a=>{const o=[...a];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]]}return o};

function basePoints(q){if(q.group==="continent")return 50;if(q.group==="country")return 75;if(q.group==="city")return 125;return 100}
function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(e=>e.textContent=tr(e.dataset.i18n));
  $$("[data-i18n-html]").forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  if(state.answered)revealResult();
}
function setLanguage(l){state.lang=l;localStorage.setItem("afcndxs-lang",l);applyLanguage()}

function sampleGroup(group,count,used){
  const pool=shuffle(QUESTIONS.filter(q=>q.group===group&&!used.has(q.id))),out=[];
  for(const q of pool){if(out.length>=count)break;if(!used.has(q.id)){out.push(q);used.add(q.id)}}
  return out;
}
function buildGame(total){
  const used=new Set(),plan=total===20?{city:6,regional:6,country:5,continent:3}:{city:3,regional:3,country:2,continent:2};
  let selected=[];
  for(const [group,count] of Object.entries(plan))selected.push(...sampleGroup(group,count,used));
  if(selected.length<total){
    for(const q of shuffle(QUESTIONS)){if(selected.length>=total)break;if(!used.has(q.id)){selected.push(q);used.add(q.id)}}
  }
  return shuffle(selected).slice(0,total).map(q=>({...q,options:shuffle(q.options)}));
}
function startGame(){
  state.game=buildGame(state.gameLength);state.index=0;state.correct=0;state.points=0;state.streak=0;state.bestStreak=0;
  $("#place-start").hidden=true;$("#place-finish").hidden=true;$("#place-game").hidden=false;renderQuestion();
}
function renderQuestion(){
  state.current=state.game[state.index];state.answered=false;state.lastOk=null;state.lastAward=0;
  const photo=state.archive.find(p=>p.id===state.current.id);if(!photo)return;
  $("#place-image").src=photo.image;$("#place-image").alt="Fotografía del archivo para adivinar ubicación";
  $("#place-id").textContent="["+photo.id+"]";$("#place-kind").textContent="// "+state.current.kind;
  $("#place-result").innerHTML="";$("#place-next").disabled=true;
  $("#place-options").innerHTML=state.current.options.map(v=>'<button class="place-option" type="button" data-value="'+v.replaceAll('"',"&quot;")+'">'+v+'</button>').join("");
  $$(".place-option").forEach(b=>b.onclick=()=>answer(b));
  renderStatus();
}
function answer(button){
  if(state.answered)return;state.answered=true;state.lastOk=button.dataset.value===state.current.answer;
  if(state.lastOk){
    state.correct++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);
    const bonus=Math.min(Math.max(state.streak-1,0),4)*25;
    state.lastAward=basePoints(state.current)+bonus;state.points+=state.lastAward;
  }else{state.streak=0;state.lastAward=0}
  $$(".place-option").forEach(b=>{b.disabled=true;if(b.dataset.value===state.current.answer)b.classList.add("correct");else if(b===button)b.classList.add("wrong")});
  revealResult();$("#place-next").disabled=false;renderStatus();
}
function revealResult(){
  const photo=state.archive.find(p=>p.id===state.current?.id);if(!photo)return;
  const scoreLine=state.lastOk?'<span class="place-award">+'+state.lastAward+' PTS</span>':'';
  $("#place-result").innerHTML='<strong>'+(state.lastOk?tr("correct"):tr("wrong")+" · "+state.current.answer)+'</strong>'+scoreLine+'<p>'+[photo.place,photo.city,photo.region,photo.country].filter(Boolean).join(" · ")+'</p>';
}
function renderStatus(){
  $("#round-status").textContent=String(state.index+1).padStart(2,"0")+" / "+String(state.gameLength).padStart(2,"0");
  $("#points-status").textContent=String(state.points).padStart(4,"0")+" PTS";
  $("#streak-status").textContent="STREAK ×"+state.streak;
  $("#place-progress-bar").style.width=((state.index+1)/state.gameLength*100)+"%";
}
function next(){
  if(!state.answered)return;
  state.index++;
  if(state.index>=state.gameLength)finishGame();else renderQuestion();
}
function finishGame(){
  $("#place-game").hidden=true;$("#place-finish").hidden=false;
  const accuracy=Math.round(state.correct/state.gameLength*100);
  $("#finish-points").textContent=String(state.points).padStart(4,"0")+" PTS";
  $("#finish-hits").textContent=state.correct+" / "+state.gameLength;
  $("#finish-accuracy").textContent=accuracy+"%";
  $("#finish-streak").textContent="×"+state.bestStreak;
  $("#finish-length").textContent=state.gameLength+" "+tr("photos");
  $("#finish-copy").textContent=accuracy>=80?tr("great"):accuracy>=50?tr("mid"):tr("low");
}
function returnToStart(){
  $("#place-finish").hidden=true;$("#place-game").hidden=true;$("#place-start").hidden=false;
}
function bind(){
  $$(".lang-toggle").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
  $$(".place-length").forEach(b=>b.onclick=()=>{state.gameLength=Number(b.dataset.length);$$(".place-length").forEach(x=>x.classList.toggle("active",x===b))});
  $("#place-start-button").onclick=startGame;$("#place-next").onclick=next;$("#place-restart").onclick=returnToStart;
}
async function init(){
  const r=await fetch("/data/archive.json?v=20261007-photos76");if(!r.ok)throw new Error("archive");
  state.archive=(await r.json()).filter(p=>p.published!==false&&p.image);bind();applyLanguage();
}
init().catch(console.error);