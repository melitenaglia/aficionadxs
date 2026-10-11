const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const browserLang=(navigator.language||"").toLowerCase();
const defaultLang=browserLang.startsWith("ca")?"ca":browserLang.startsWith("es")?"es":"en";

const T={
  es:{intro:"UNA FOTO. CUATRO LUGARES PLAUSIBLES.",hint:"A VECES PREGUNTAMOS CIUDAD; OTRAS, REGIÓN, COSTA, ISLA O COMARCA.",where:"¿DÓNDE FUE TOMADA?",next:"SIGUIENTE →",restart:"JUGAR DE NUEVO ↻",finishTitle:"YOUR ARCHIVE INSTINCT.",correct:"CORRECTO",wrong:"ERA",points:"PTS",finishGreat:"MUY BUENA LECTURA VISUAL. CASI PODRÍAS ORDENAR EL ARCHIVO SIN METADATOS.",finishMid:"BASTANTE BUEN INSTINTO. LAS PISTAS ESTÁN EN LA LUZ, LA ARQUITECTURA Y EL PAISAJE.",finishLow:"EL ARCHIVO TODAVÍA GUARDA SECRETOS. OTRA RONDA Y CAMBIA TODO."},
  ca:{intro:"UNA FOTO. QUATRE LLOCS PLAUSIBLES.",hint:"DE VEGADES PREGUNTEM CIUTAT; D’ALTRES, REGIÓ, COSTA, ILLA O COMARCA.",where:"ON ES VA FER?",next:"SEGÜENT →",restart:"TORNAR A JUGAR ↻",finishTitle:"YOUR ARCHIVE INSTINCT.",correct:"CORRECTE",wrong:"ERA",points:"PTS",finishGreat:"MOLT BONA LECTURA VISUAL. GAIREBÉ PODRIES ORDENAR L’ARXIU SENSE METADADES.",finishMid:"BASTANT BON INSTINT. LES PISTES SÓN A LA LLUM, L’ARQUITECTURA I EL PAISATGE.",finishLow:"L’ARXIU ENCARA GUARDA SECRETS. UNA ALTRA RONDA I TOT CANVIA."},
  en:{intro:"ONE PHOTO. FOUR PLAUSIBLE PLACES.",hint:"SOMETIMES THE QUESTION IS CITY; OTHER TIMES REGION, COAST, ISLAND OR DISTRICT.",where:"WHERE WAS IT TAKEN?",next:"NEXT →",restart:"PLAY AGAIN ↻",finishTitle:"YOUR ARCHIVE INSTINCT.",correct:"CORRECT",wrong:"IT WAS",points:"PTS",finishGreat:"VERY STRONG VISUAL READING. YOU COULD ALMOST SORT THE ARCHIVE WITHOUT METADATA.",finishMid:"GOOD INSTINCT. THE CLUES ARE IN THE LIGHT, ARCHITECTURE AND LANDSCAPE.",finishLow:"THE ARCHIVE STILL HAS SECRETS. ANOTHER ROUND CHANGES EVERYTHING."}
};

const Q=[
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

const state={lang:localStorage.getItem("afcndxs-lang")||defaultLang,archive:[],rounds:[],index:0,score:0,answered:false};
const tr=k=>(T[state.lang]||T.es)[k]||k;
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};

function localizeOption(value){
  const maps={
    ca:{"Asturias":"Astúries","Cantabria":"Cantàbria","Galicia":"Galícia","Euskadi":"Euskadi","Copenhague":"Copenhaguen","Hamburgo":"Hamburg","Ginebra":"Ginebra","Zúrich":"Zuric","Porto":"Porto","Lisboa":"Lisboa","Provenza":"Provença","Córdoba":"Còrdova","Tierra del Fuego":"Terra del Foc","Marrakech":"Marràqueix","Toscana":"Toscana"},
    en:{"Costa Brava":"Costa Brava","Côte d’Azur":"French Riviera","Liguria":"Liguria","Algarve":"Algarve","Asturias":"Asturias","Cantabria":"Cantabria","Galicia":"Galicia","Euskadi":"Basque Country","Copenhague":"Copenhagen","Estocolmo":"Stockholm","Gotemburgo":"Gothenburg","Hamburgo":"Hamburg","La Haya":"The Hague","Amberes":"Antwerp","Jujuy":"Jujuy","Salta":"Salta","Catamarca":"Catamarca","La Rioja":"La Rioja","Tierra del Fuego":"Tierra del Fuego","Ginebra":"Geneva","Lausana":"Lausanne","Zúrich":"Zurich","Porto":"Porto","Lisboa":"Lisbon","A Coruña":"A Coruña","Bilbao":"Bilbao","Provenza":"Provence","Córdoba":"Córdoba","San Luis":"San Luis","Mendoza":"Mendoza","Montserrat":"Montserrat","Montseny":"Montseny","Picos de Europa":"Picos de Europa","Sierra de Tramuntana":"Serra de Tramuntana","Garraf":"Garraf","Maresme":"Maresme","Baix Empordà":"Baix Empordà","Tarragonès":"Tarragonès","Montpellier":"Montpellier","Nîmes":"Nîmes","Toulouse":"Toulouse","Avignon":"Avignon","Marrakech":"Marrakesh","Fez":"Fez","Rabat":"Rabat","Alt Empordà":"Alt Empordà","Périgord":"Périgord","Toscana":"Tuscany","Istria":"Istria","Stuttgart":"Stuttgart","Helsinki":"Helsinki","Rotterdam":"Rotterdam","Lyon":"Lyon","Marsella":"Marseille","Burdeos":"Bordeaux","Barcelona":"Barcelona","Valencia":"Valencia","Nápoles":"Naples","Santorini":"Santorini","Naxos":"Naxos","Milos":"Milos","Paros":"Paros","Mykonos":"Mykonos","Syros":"Syros","Bremen":"Bremen","Lübeck":"Lübeck","Hannover":"Hanover","Annecy":"Annecy"}
  };
  return maps[state.lang]?.[value]||value;
}
function applyLanguage(){
  document.documentElement.lang=state.lang;
  $$("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));
  $$(".lang-toggle").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  if(!$("#guess-finish").hidden)renderFinish();else renderRound();
}
function setLanguage(lang){state.lang=lang;localStorage.setItem("afcndxs-lang",lang);applyLanguage()}
function makeRounds(){state.rounds=shuffle(Q).slice(0,10).map(q=>({...q,options:shuffle(q.options)}));state.index=0;state.score=0;state.answered=false}
function current(){return state.rounds[state.index]}
function renderRound(){
  const q=current();if(!q)return;const photo=state.archive.find(p=>p.id===q.id);if(!photo)return;
  $("#guess-game").hidden=false;$("#guess-finish").hidden=true;
  $("#round-label").textContent=String(state.index+1).padStart(2,"0")+" / 10";
  $("#score-label").textContent=String(state.score).padStart(2,"0")+" "+tr("points");
  $("#question-kind").textContent="// "+q.kind;
  $("#question-text").textContent=tr("where");
  $("#guess-photo").src=photo.image;$("#guess-photo").alt="Fotografía del archivo para adivinar ubicación";
  $("#guess-options").innerHTML=q.options.map((o,i)=>'<button class="guess-option" type="button" data-value="'+o+'"><span class="key">'+String.fromCharCode(65+i)+'</span><span>'+localizeOption(o)+'</span></button>').join("");
  $$(".guess-option").forEach(b=>b.addEventListener("click",()=>answer(b.dataset.value,b)));
  $("#guess-result").innerHTML="";
  $("#guess-next").disabled=true;$("#guess-next").textContent=tr("next");
  $("#guess-progress-bar").style.width=((state.index+1)/10*100)+"%";
  state.answered=false;
}
function answer(value,button){
  if(state.answered)return;state.answered=true;const q=current(),photo=state.archive.find(p=>p.id===q.id),correct=value===q.answer;
  if(correct)state.score++;
  $$(".guess-option").forEach(b=>{b.disabled=true;if(b.dataset.value===q.answer)b.classList.add("correct");else if(b===button&&!correct)b.classList.add("wrong")});
  const place=[photo.city,photo.region,photo.country].filter(Boolean).join(" · ");
  $("#guess-result").innerHTML='<strong>'+(correct?tr("correct"):tr("wrong")+" "+localizeOption(q.answer))+'</strong><div class="meta">['+photo.id+'] '+photo.title+'<br>'+place+'</div>';
  $("#score-label").textContent=String(state.score).padStart(2,"0")+" "+tr("points");
  $("#guess-next").disabled=false;
}
function next(){
  if(!state.answered)return;
  state.index++;
  if(state.index>=state.rounds.length)renderFinish();else renderRound();
}
function renderFinish(){
  $("#guess-game").hidden=true;$("#guess-finish").hidden=false;
  $("#finish-score").textContent=state.score+"/10";
  $("#finish-copy").textContent=state.score>=8?tr("finishGreat"):state.score>=5?tr("finishMid"):tr("finishLow");
  $("#restart-game").textContent=tr("restart");
}
function restart(){makeRounds();renderRound()}
async function init(){
  const response=await fetch("/data/archive.json?v=20261007-photos76");if(!response.ok)throw new Error("archive");
  state.archive=(await response.json()).filter(p=>p.published!==false);
  $$(".lang-toggle").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang)));
  $("#guess-next").addEventListener("click",next);$("#restart-game").addEventListener("click",restart);
  makeRounds();applyLanguage();
}
init().catch(console.error);
