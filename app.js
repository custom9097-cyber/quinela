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
      div.style.marginBottom = '15px';
      div.style.padding = '8px';
      div.style.border = '1px solid #ddd';
      div.style.borderRadius = '12px';
      div.style.background = '#f5f5f5';

      // Logos más pequeños para celular
      let localLogo = p.localImg ? `<img src="${p.localImg}" style="width:70px;height:70px;object-fit:contain" onerror="this.style.display='none'">` : '⚽';
      let visitanteLogo = p.visitanteImg ? `<img src="${p.visitanteImg}" style="width:70px;height:70px;object-fit:contain" onerror="this.style.display='none'">` : '⚽';

      div.innerHTML = `
        <!-- TÍTULO DEL PARTIDO -->
        <div style="text-align:center;margin-bottom:10px;padding:6px;background:white;border-radius:8px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap;">
            ${localLogo}
            <strong style="font-size:13px;">${p.local}</strong>
            <span style="color:#999;font-size:12px;">VS</span>
            <strong style="font-size:13px;">${p.visitante}</strong>
            ${visitanteLogo}
          </div>
        </div>
        
        <!-- RECUADRO BLANCO CON CHECKBOXES -->
        <div style="background:white;border-radius:10px;padding:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:5px;">
            
            <!-- LOCAL -->
            <label style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:6px;border-radius:8px;flex:1;text-align:center;">
              <input type="checkbox" name="p${p.id}" value="${p.local}" onchange="calcularTotal()" style="width:16px;height:16px">
              ${localLogo}
              <span style="font-size:10px;">${p.local}</span>
            </label>
            
            <!-- EMPATE -->
            <label style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:6px;border-radius:8px;flex:1;text-align:center;">
              <input type="checkbox" name="p${p.id}" value="Empate" onchange="calcularTotal()" style="width:16px;height:16px">
              <span style="font-size:22px;">🤝</span>
              <span style="font-size:10px;">Empate</span>
            </label>
            
            <!-- VISITANTE -->
            <label style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:6px;border-radius:8px;flex:1;text-align:center;">
              <input type="checkbox" name="p${p.id}" value="${p.visitante}" onchange="calcularTotal()" style="width:16px;height:16px">
              ${visitanteLogo}
              <span style="font-size:10px;">${p.visitante}</span>
            </label>
            
          </div>
        </div>
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

  let telefono = "525635407774";
  
  let mensajeFinal = "*📋 DETALLE DE QUINIELAS:*\n\n";

  quinielas.forEach((q, index) => {
    mensajeFinal += `*Quiniela ${index + 1}*\n${q}\n`;
    mensajeFinal += "─".repeat(40) + "\n\n";
  });

  mensajeFinal += "═".repeat(40) + "\n\n";
  mensajeFinal += "*📊 RESUMEN DE QUINIELAS*\n";
  mensajeFinal += `📝 Total de quinielas: ${quinielas.length}\n`;
  mensajeFinal += `💰 Total a pagar: $${totalGeneral} pesos\n`;
  mensajeFinal += "\n✨ ¡Gracias por participar! ✨";

  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeFinal)}`;
  window.open(url, '_blank');

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

function limpiarTodo() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  calcularTotal();
  alert('✅ Selecciones limpiadas');
}

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

function limpiarChecks() {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

function actualizarResumen() {
  let resumenDiv = document.getElementById('resumenQuinielas');
  if(!resumenDiv) {
    let resumen = document.createElement('div');
    resumen.id = 'resumenQuinielas';
    resumen.style.cssText = 'background:#e3f2fd;padding:15px;border-radius:8px;margin:15px 0;border-left:4px solid #2196f3;font-size:14px';
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
        <pre style="white-space: pre-wrap;font-family:Arial;font-size:12px;margin:5px 0">${q}</pre>
      </div>
    `;
  });
  
  actualizarResumen();
}

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
  
  pintarListaQuinielas();

  alert(`✅ Quiniela agregada correctamente\n📝 Total acumulado: $${totalGeneral}`);
}

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