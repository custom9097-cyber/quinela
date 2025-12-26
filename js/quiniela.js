const liga = JSON.parse(localStorage.getItem("liga"));
const costoPorQuiniela = 10;
const numeroWhats = "5531009495"; // 👈 CAMBIA ESTE NÚMERO

let quinielas = [];

document.getElementById("titulo").textContent = liga.nombre;
const cont = document.getElementById("partidos");

liga.partidos.forEach(p => {
  cont.innerHTML += `
    <div class="partido">
      <strong>${p.local} vs ${p.visita}</strong>
      <select id="p${p.id}">
        <option value="">-</option>
        <option value="L">Local</option>
        <option value="E">Empate</option>
        <option value="V">Visita</option>
      </select>
    </div>
  `;
});

function agregarQuiniela() {
  const nombre = document.getElementById("nombre").value.trim();
  if (!nombre) {
    alert("Escribe tu nombre");
    return;
  }

  let picks = "";
  for (const p of liga.partidos) {
    const val = document.getElementById(`p${p.id}`).value;
    if (!val) {
      alert("Completa todos los partidos");
      return;
    }
    picks += val + " ";
  }

  quinielas.push(picks.trim());
  actualizarLista();
  limpiarSeleccion();
}

function actualizarLista() {
  const ul = document.getElementById("listaQuinielas");
  ul.innerHTML = "";

  quinielas.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = `Q${i + 1}: ${q}`;
    ul.appendChild(li);
  });

  document.getElementById("total").textContent =
    `TOTAL: $${quinielas.length * costoPorQuiniela}`;
}

function limpiarSeleccion() {
  liga.partidos.forEach(p => {
    document.getElementById(`p${p.id}`).value = "";
  });
}

function enviarWhats() {
  if (quinielas.length === 0) {
    alert("No hay quinielas agregadas");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const total = quinielas.length * costoPorQuiniela;

  let mensaje = "";
  quinielas.forEach((q, i) => {
    mensaje += `Q${i + 1}: ${q}\n`;
  });

  mensaje += `\n${nombre}\nTOTAL A PAGAR $${total}`;

  const url = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}
