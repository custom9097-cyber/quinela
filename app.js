let quinielas = [];
let contadorQuiniela = 1;
let partidosData = [];

fetch('./partidos.json')
  .then(res => res.json())
  .then(data => {
    partidosData = data;
    let contenedor = document.getElementById('partidos');

    data.forEach(p => {
      let div = document.createElement('div');
      div.className = 'partido';

      div.innerHTML = `
  <b>${p.local} vs ${p.visitante}</b><br><br>
  <label><input type="checkbox" name="p${p.id}" value="${p.local}" onchange="calcularTotal()"> ${p.local}</label><br>
  <label><input type="checkbox" name="p${p.id}" value="Empate" onchange="calcularTotal()"> Empate</label><br>
  <label><input type="checkbox" name="p${p.id}" value="${p.visitante}" onchange="calcularTotal()"> ${p.visitante}</label>
  <hr>
`;

      contenedor.appendChild(div);
    });
  });


  function enviarQuiniela(){

  if(quinielas.length === 0){
    return alert("No has agregado quinielas");
  }

  let mensajeFinal = "*QUINIELAS JORNADA*\n";

  quinielas.forEach(q => {
    mensajeFinal += q + "\n";
  });

  let url = "https://wa.me/?text=" + encodeURIComponent(mensajeFinal);
  window.open(url, '_blank');

  // reset
  quinielas = [];
  contadorQuiniela = 1;
}

function enviarQuiniela() {

  if(quinielas.length === 0){
    alert("No has agregado quinielas");
    return;
  }

  let telefono = "525515112194";

  let mensajeFinal = "*QUINIELAS JORNADA*\n\n";

  quinielas.forEach(q => {
    mensajeFinal += q + "\n";
  });

  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeFinal)}`;
  window.open(url, '_blank');

  // reset
  quinielas = [];
  contadorQuiniela = 1;
}

function limpiarSelecciones() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });

    // MUY IMPORTANTE: limpiar el objeto en memoria
    quinielaActual = {};
}


function pintarListaQuinielas(){
  let contenedor = document.getElementById('listaQuinielas');
  contenedor.innerHTML = "";

  quinielas.forEach((q, i) => {
    contenedor.innerHTML += `<pre>Quiniela ${i+1}\n${q}</pre><hr>`;
  });
}

function limpiarTodo() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

function aleatorio() {

  // limpiar checks anteriores
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  // marcar uno nuevo por partido
  partidosData.forEach(p => {
    let opciones = document.querySelectorAll(`input[name="p${p.id}"]`);
    let random = Math.floor(Math.random() * opciones.length);
    opciones[random].checked = true;
  });

}

function calcularTotal(){
  let totalExtras = 0;

  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`).length;

    if(seleccionados > 1){
      totalExtras += (seleccionados - 1);
    }
  });

  let total = 10 * Math.pow(2, totalExtras);
  document.getElementById('total').innerText = total;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnTabla");
  if(btn){
    btn.addEventListener("click", tablaPosiciones);
  }
});

async function tablaPosiciones() {

  const q = await fetch('./quinielas.json');
  const quinielas = await q.json();

  const r = await fetch('./resultados.json');
  const resultados = await r.json();

  let tabla = [];

  quinielas.forEach(jugador => {
    let puntos = 0;

    resultados.forEach(res => {
      let picks = jugador.respuestas[res.id];

      if(picks && picks.includes(res.resultado)){
        puntos++;
      }
    });

    tabla.push({ nombre: jugador.nombre, puntos });
  });

  tabla.sort((a,b) => b.puntos - a.puntos);

  let html = "<h2>Tabla de Posiciones</h2><ol>";
  tabla.forEach(t => {
    html += `<li>${t.nombre} — ${t.puntos} puntos</li>`;
  });
  html += "</ol>";

  document.body.innerHTML += html;
}



function agregarQuiniela() {

  let nombre = document.getElementById('nombre').value.trim();

  if(!nombre){
    alert('Escribe tu nombre');
    return;
  }

  let mensaje = `*Quiniela #${contadorQuiniela}*\nNombre: ${nombre}\n\n`;

  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`);

    if(seleccionados.length > 0){
      let valores = [];
      seleccionados.forEach(s => valores.push(s.value));

      mensaje += `Partido ${p.id} (${p.local} vs ${p.visitante}): ${valores.join(' / ')}\n`;
    }
  });

  let total = document.getElementById('total').innerText;
  mensaje += `\nPago total: $${total} pesos\n`;

  // 🔴 EN VEZ DE ENVIAR → GUARDAR
  quinielas.push(mensaje);
  contadorQuiniela++;

  limpiarChecks();
  document.getElementById('total').innerText = 10;

  pintarListaQuinielas();   // 👈 ESTA ES LA CLAVE

  alert('Quiniela agregada ✔️');
}