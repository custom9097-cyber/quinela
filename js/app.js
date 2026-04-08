let partidosData = [];

fetch('partidos.json')
  .then(res => res.json())
  .then(data => {
    partidosData = data;
    let contenedor = document.getElementById('partidos');

    data.forEach(p => {
      let div = document.createElement('div');
      div.className = 'partido';

      div.innerHTML = `
        <b>${p.local} vs ${p.visitante}</b><br><br>
        <label><input type="radio" name="p${p.id}" value="${p.local}"> ${p.local}</label><br>
        <label><input type="radio" name="p${p.id}" value="Empate"> Empate</label><br>
        <label><input type="radio" name="p${p.id}" value="${p.visitante}"> ${p.visitante}</label>
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
    let sel = document.querySelector(`input[name="p${p.id}"]:checked`);
    if(sel){
      mensaje += `Partido ${p.id} (${p.local} vs ${p.visitante}): ${sel.value}\n`;
    }
  });

  mensaje += `\nPago: $10 pesos`;

  // CAMBIA POR TU NUMERO
  let telefono = "521XXXXXXXXXX";

  let url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}