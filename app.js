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

function enviarQuiniela() {
  let nombre = document.getElementById('nombre').value.trim();

  if(!nombre){
    alert('Escribe tu nombre');
    return;
  }

  let mensaje = `*Quiniela Jornada*\nNombre: ${nombre}\n\n`;

partidosData.forEach(p => {
  let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`);

  if(seleccionados.length > 0){
    let valores = [];
    seleccionados.forEach(s => valores.push(s.value));

    mensaje += `Partido ${p.id} (${p.local} vs ${p.visitante}): ${valores.join(' / ')}\n`;
  }
});

 let total = document.getElementById('total').innerText;
mensaje += `\nPago total: $${total} pesos`

  let telefono = "525515112194"; // cambia por tu numero
  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
}

function aleatorio() {
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