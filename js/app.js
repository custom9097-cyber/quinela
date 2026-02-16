let partidosAdmin = [];
let quinielas = [];

if(document.getElementById("lista")){
renderAdmin();
}

if(document.getElementById("partidos")){
cargarQuiniela();
}

function agregarPartido(){
const local=document.getElementById("local").value;
const visitante=document.getElementById("visitante").value;
const imgLocal=document.getElementById("imgLocal").value;
const imgVisitante=document.getElementById("imgVisitante").value;

partidosAdmin.push({
local:{nombre:local,img:imgLocal},
visitante:{nombre:visitante,img:imgVisitante}
});

renderAdmin();
}

function renderAdmin(){
const div=document.getElementById("lista");
if(!div)return;

div.innerHTML="";
partidosAdmin.forEach(p=>{
div.innerHTML+=`<p>${p.local.nombre} vs ${p.visitante.nombre}</p>`;
});
}

function guardarLiga(){

const data={
liga:document.getElementById("ligaNombre").value,
precio:document.getElementById("precioLiga").value,
partidos:partidosAdmin
};

localStorage.setItem("ligaActiva",JSON.stringify(data));
alert("Liga guardada");
}

function cargarQuiniela(){

const data=JSON.parse(localStorage.getItem("ligaActiva"));
if(!data)return;

document.getElementById("liga").innerText=data.liga;

const cont=document.getElementById("partidos");

data.partidos.forEach((p,i)=>{

cont.innerHTML+=`
<div class="partido">
<img src="${p.local.img}">
${p.local.nombre}
<select id="p${i}">
<option>L</option>
<option>E</option>
<option>V</option>
</select>
${p.visitante.nombre}
<img src="${p.visitante.img}">
</div>`;
});

document.getElementById("total").innerText=
"Precio por quiniela $" + data.precio;
}

function agregarQuiniela(){

const data=JSON.parse(localStorage.getItem("ligaActiva"));

let picks="";

data.partidos.forEach((p,i)=>{
picks+=document.getElementById("p"+i).value+" ";
});

quinielas.push(picks);

alert("Quiniela agregada. Total: "+quinielas.length);
}

function enviar(){

const data=JSON.parse(localStorage.getItem("ligaActiva"));
const nombre=document.getElementById("nombre").value;

let texto="";
quinielas.forEach(q=>{
texto+=q+"\n";
});

const total=data.precio*quinielas.length;

const mensaje=`${data.liga}
${texto}
${nombre}
TOTAL A PAGAR $${total}
Pago por transferencia`;

window.open("https://wa.me/521XXXXXXXXXX?text="+encodeURIComponent(mensaje));
}
