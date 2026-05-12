let quinielas = [];
let contadorQuiniela = 1;
let partidosData = [];
let totalGeneral = 0;

// Cargar los partidos
fetch('./partidos.json')
  .then(res => res.json())
  .then(data => {
    partidosData = data;
    let contenedor = document.getElementById('partidos');

    data.forEach(p => {
      let div = document.createElement('div');
      div.className = 'partido';

      // Mostrar logos si existen en el JSON
      let localLogo = p.localImg ? `<img src="${p.localImg}" style="width:25px;height:25px;vertical-align:middle;margin-right:5px" onerror="this.style.display='none'">` : '⚽';
      let visitanteLogo = p.visitanteImg ? `<img src="${p.visitanteImg}" style="width:25px;height:25px;vertical-align:middle;margin-right:5px" onerror="this.style.display='none'">` : '⚽';

      div.innerHTML = `
        <b>
          ${localLogo}
          ${p.local} 
          vs 
          ${visitanteLogo}
          ${p.visitante}
        </b><br><br>
        <label><input type="checkbox" name="p${p.id}" value="${p.local}" onchange="calcularTotal()"> ${p.local}</label><br>
        <label><input type="checkbox" name="p${p.id}" value="Empate" onchange="calcularTotal()"> Empate</label><br>
        <label><input type="checkbox" name="p${p.id}" value="${p.visitante}" onchange="calcularTotal()"> ${p.visitante}</label>
        <hr>
      `;

      contenedor.appendChild(div);
    });
    
    calcularTotal();
  })
  .catch(error => {
    console.error('Error cargando partidos.json:', error);
    document.getElementById('partidos').innerHTML = '<p style="color:red">Error: No se pudo cargar partidos.json</p>';
  });

// ENVIAR POR WHATSAPP
function enviarQuiniela() {
  if(quinielas.length === 0){
    alert("❌ No has agregado quinielas");
    return;
  }

  let telefono = "525515112194";
  
  let mensajeFinal = "*📋 DETALLE DE QUINIELAS:*\n\n";

  quinielas.forEach((q, index) => {
    mensajeFinal += `*Quiniela ${index + 1}*\n${q}\n`;
    mensajeFinal += "─".repeat(40) + "\n\n";
  });

  // Separador decorativo
  mensajeFinal += "═".repeat(40) + "\n\n";
  
  // Resumen al FINAL
  mensajeFinal += "*📊 RESUMEN DE QUINIELAS*\n";
  mensajeFinal += `📝 Total de quinielas: ${quinielas.length}\n`;
  mensajeFinal += `💰 Total a pagar: $${totalGeneral} pesos\n`;
  mensajeFinal += "\n✨ ¡Gracias por participar! ✨";

  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeFinal)}`;
  window.open(url, '_blank');

  // Reiniciar todo después de enviar
  quinielas = [];
  contadorQuiniela = 1;
  totalGeneral = 0;
  actualizarResumen();
  document.getElementById('listaQuinielas').innerHTML = "";
  document.getElementById('nombre').value = "";
  limpiarChecks();
  calcularTotal();
  
  alert('✅ Quinielas enviadas correctamente');
}

// LIMPIAR SOLO SELECCIONES
function limpiarTodo() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  calcularTotal();
  alert('✅ Selecciones limpiadas');
}

// LLENADO ALEATORIO
function aleatorio() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

  partidosData.forEach(p => {
    let opciones = document.querySelectorAll(`input[name="p${p.id}"]`);
    let random = Math.floor(Math.random() * opciones.length);
    opciones[random].checked = true;
  });

  calcularTotal();
  alert('🎲 Quiniela aleatoria generada');
}

// CALCULAR TOTAL A PAGAR
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

// FUNCIÓN AUXILIAR PARA LIMPIAR CHECKS
function limpiarChecks() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

// ACTUALIZAR RESUMEN VISUAL
function actualizarResumen() {
  let resumenDiv = document.getElementById('resumenQuinielas');
  if(!resumenDiv) {
    let resumen = document.createElement('div');
    resumen.id = 'resumenQuinielas';
    resumen.style.cssText = 'background:#e3f2fd;padding:15px;border-radius:8px;margin:15px 0;border-left:4px solid #2196f3;font-size:16px';
    resumen.innerHTML = `
      <strong>📊 Resumen de quinielas agregadas:</strong><br>
      📝 Cantidad: <span id="cantidadQuinielas">0</span><br>
      💰 Total acumulado: $<span id="totalAcumulado">0</span> pesos
    `;
    
    const btnLimpiar = document.querySelector('button[onclick="limpiarTodo()"]');
    if(btnLimpiar && btnLimpiar.parentNode) {
      btnLimpiar.parentNode.insertBefore(resumen, btnLimpiar.nextSibling);
    } else {
      document.querySelector('h3').before(resumen);
    }
  }
  
  document.getElementById('cantidadQuinielas').innerText = quinielas.length;
  document.getElementById('totalAcumulado').innerText = totalGeneral;
}

// MOSTRAR LISTA DE QUINIELAS AGREGADAS
function pintarListaQuinielas() {
  let contenedor = document.getElementById('listaQuinielas');
  contenedor.innerHTML = "";

  if(quinielas.length === 0) {
    contenedor.innerHTML = "<em>No hay quinielas agregadas aún</em>";
    return;
  }

  quinielas.forEach((q, i) => {
    let totalMatch = q.match(/Total: \$(\d+)/);
    let totalQuiniela = totalMatch ? totalMatch[1] : '?';
    
    contenedor.innerHTML += `
      <div style="background:#f9f9f9;padding:10px;margin-bottom:10px;border-radius:5px;border-left:4px solid #2196f3">
        <strong>📋 Quiniela ${i+1} - 💰 $${totalQuiniela}</strong>
        <pre style="white-space: pre-wrap;font-family:Arial;font-size:14px;margin:5px 0">${q}</pre>
      </div>
    `;
  });
  
  actualizarResumen();
}

// AGREGAR QUINIELA A LA LISTA
function agregarQuiniela() {
  let nombre = document.getElementById('nombre').value.trim();

  if(!nombre){
    alert('⚠️ Escribe tu nombre');
    return;
  }

  let tieneSeleccion = false;
  partidosData.forEach(p => {
    if(document.querySelectorAll(`input[name="p${p.id}"]:checked`).length > 0) {
      tieneSeleccion = true;
    }
  });

  if(!tieneSeleccion) {
    alert('⚠️ Selecciona al menos un resultado en algún partido');
    return;
  }

  let totalActual = calcularTotal();
  let mensaje = `👤 *${nombre}*\n\n`;

  partidosData.forEach(p => {
    let seleccionados = document.querySelectorAll(`input[name="p${p.id}"]:checked`);
    if(seleccionados.length > 0){
      let valores = [];
      seleccionados.forEach(s => valores.push(s.value));
      mensaje += `⚽ ${p.local} vs ${p.visitante}: ${valores.join(' / ')}\n`;
    }
  });

  mensaje += `\n💰 Total: $${totalActual} pesos`;

  quinielas.push(mensaje);
  totalGeneral += totalActual;
  contadorQuiniela++;

  limpiarChecks();
  calcularTotal();
  
  // NO borrar el nombre - el usuario puede seguir agregando más quinielas
  
  pintarListaQuinielas();

  alert(`✅ Quiniela agregada correctamente\n📝 Total acumulado: $${totalGeneral}`);
}

// TABLA DE POSICIONES
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnTabla");
  if(btn){
    btn.addEventListener("click", tablaPosiciones);
  }
  actualizarResumen();
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

    let modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:center;justify-content:center';
    
    modal.innerHTML = `
      <div style="background:white;padding:20px;border-radius:8px;max-width:400px;width:90%;max-height:80%;overflow:auto;">
        <h2>📊 Tabla de Posiciones</h2>
        <ol style="margin:15px 0">
          ${tabla.map(t => `<li><strong>${t.nombre}</strong> — ${t.puntos} pts</li>`).join('')}
        </ol>
        <button onclick="this.closest('div').parentElement.remove()" style="padding:8px 15px">Cerrar</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch(error) {
    console.error('Error:', error);
    alert('❌ Error al cargar la tabla de posiciones');
  }
}