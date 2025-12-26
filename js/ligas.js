fetch("data/ligas.json")
  .then(res => res.json())
  .then(ligas => {
    const cont = document.getElementById("ligas");

    ligas.forEach(liga => {
      const btn = document.createElement("button");
      btn.textContent = liga.nombre;
      btn.onclick = () => {
        localStorage.setItem("liga", JSON.stringify(liga));
        location.href = "quiniela.html";
      };
      cont.appendChild(btn);
    });
  });
