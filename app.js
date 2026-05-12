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
    
    // Inicializar total después de cargar los partidos
    calcularTotal();
  });

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
  document.getElementById('listaQuinielas').innerHTML = "";
  alert('✅ Quinielas enviadas correctamente');
}

function limpiarSelecciones() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  calcularTotal(); // Recalcular el total después de limpiar
}

function pintarListaQuinielas() {
  let contenedor = document.getElementById('listaQuinielas');
  contenedor.innerHTML = "";

  quinielas.forEach((q, i) => {
    contenedor.innerHTML += `<div><strong>Quiniela ${i+1}</strong><pre style="white-space: pre-wrap;">${q}</pre></div><hr>`;
  });
}

function limpiarTodo() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  calcularTotal(); // Recalcular después de limpiar
  alert('✅ Todas las selecciones han sido limpiadas');
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

  calcularTotal(); // Recalcular el total después del llenado aleatorio
  alert('🎲 Quiniela aleatoria generada');
}

function calcularTotal() {
  let totalExtras = 0;

  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`).length;

    if(seleccionados > 1){
      totalExtras += (seleccionados - 1);
    }
  });

  let total = 10 * Math.pow(2, totalExtras);
  document.getElementById('total').innerText = total;
  return total;
}

// Función nueva para limpiar solo los checks (la que estabas usando)
function limpiarChecks() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnTabla");
  if(btn){
    btn.addEventListener("click", tablaPosiciones);
  }
});

async function tablaPosiciones() {
  try {
    const q = await fetch('./quinielas.json');
    const quinielasData = await q.json();

    const r = await fetch('./resultados.json');
    const resultados = await r.json();

    let tabla = [];

    quinielasData.forEach(jugador => {
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

    let html = `
      <div id="tablaModal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:white;padding:20px;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.2);
      z-index:1000;max-width:400px;width:90%;">
        <h2>📊 Tabla de Posiciones</h2>
        <ol style="max-height:400px;overflow-y:auto;">
    `;
    
    tabla.forEach(t => {
      html += `<li><strong>${t.nombre}</strong> — ${t.puntos} puntos</li>`;
    });
    
    html += `
        </ol>
        <button onclick="this.parentElement.remove()" style="margin-top:15px;padding:8px;">Cerrar</button>
      </div>
      <div onclick="document.getElementById('tablaModal')?.remove()" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  } catch(error) {
    console.error('Error al cargar los archivos:', error);
    alert('Error al cargar los datos para la tabla de posiciones');
  }
}

function agregarQuiniela() {
  let nombre = document.getElementById('nombre').value.trim();

  if(!nombre){
    alert('⚠️ Escribe tu nombre');
    return;
  }

  // Verificar que al menos un partido tenga selección
  let tieneSelecciones = false;
  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`);
    if(seleccionados.length > 0) tieneSelecciones = true;
  });

  if(!tieneSelecciones) {
    alert('⚠️ Debes seleccionar al menos un resultado en algún partido');
    return;
  }

  let mensaje = `📋 *Quiniela #${contadorQuiniela}*\n👤 Nombre: ${nombre}\n\n`;

  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`);

    if(seleccionados.length > 0){
      let valores = [];
      seleccionados.forEach(s => valores.push(s.value));

      mensaje += `⚽ ${p.local} vs ${p.visitante}: ${valores.join(' / ')}\n`;
    }
  });

  let total = document.getElementById('total').innerText;
  mensaje += `\n💰 Pago total: $${total} pesos\n`;

  quinielas.push(mensaje);
  contadorQuiniela++;

  limpiarChecks();
  calcularTotal();
  document.getElementById('nombre').value = ''; // Limpiar nombre también
  pintarListaQuinielas();

  alert('✅ Quiniela agregada correctamente');
}