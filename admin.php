<?php
session_start();

// CONTRASEÑA - ¡CÁMBIALA!
$password_correcta = "admin123";

// Verificar login
if(isset($_POST['password'])) {
    if($_POST['password'] == $password_correcta) {
        $_SESSION['admin'] = true;
    }
}

// Cerrar sesión
if(isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin_panel.php");
    exit;
}

// Verificar autenticación
$autenticado = isset($_SESSION['admin']);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin - Logos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .login-box, .panel {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .equipo {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            background: #fafafa;
        }
        .equipo img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            vertical-align: middle;
            margin-right: 15px;
        }
        input, button {
            padding: 8px 12px;
            margin: 5px;
            border-radius: 5px;
        }
        input[type="text"] {
            width: 60%;
            border: 1px solid #ccc;
        }
        button {
            background: #2196f3;
            color: white;
            border: none;
            cursor: pointer;
        }
        button:hover {
            background: #1976d2;
        }
        .success {
            background: #4caf50;
            padding: 10px;
            border-radius: 5px;
            color: white;
            margin: 10px 0;
        }
        .error {
            background: #f44336;
            padding: 10px;
            border-radius: 5px;
            color: white;
            margin: 10px 0;
        }
        .logout {
            background: #f44336;
            float: right;
        }
    </style>
</head>
<body>

<?php if(!$autenticado): ?>
    <!-- FORMULARIO DE LOGIN -->
    <div class="login-box">
        <h2>🔒 Panel de Administración</h2>
        <p>Ingresa tu contraseña para gestionar los logos</p>
        <?php if(isset($error)) echo "<div class='error'>$error</div>"; ?>
        <form method="POST">
            <input type="password" name="password" placeholder="Contraseña" required>
            <button type="submit">Entrar</button>
        </form>
    </div>
<?php else: ?>
    <!-- PANEL DE ADMINISTRACIÓN -->
    <div class="panel">
        <a href="?logout=1" class="logout" style="float:right;background:#f44336;color:white;padding:5px 10px;text-decoration:none;border-radius:5px">🚪 Cerrar Sesión</a>
        <h2>🖼️ Gestor de Logos de Equipos</h2>
        <p>Aquí puedes modificar los logos que se mostrarán en la quiniela</p>
        
        <div id="mensaje"></div>
        <div id="listaEquipos">
            <p>Cargando equipos...</p>
        </div>
        
        <br>
        <button onclick="guardarTodosLosLogos()" style="background:#4caf50;font-size:16px">💾 GUARDAR TODOS LOS CAMBIOS</button>
        <button onclick="window.location.href='index.html'">👁️ Ver Quiniela</button>
    </div>

    <script>
        let equiposData = [];

        // Cargar equipos desde partidos.json
        async function cargarEquipos() {
            try {
                const response = await fetch('./partidos.json');
                const partidos = await response.json();
                
                // Extraer equipos únicos
                const equiposUnicos = new Map();
                partidos.forEach(p => {
                    if(!equiposUnicos.has(p.local)) {
                        equiposUnicos.set(p.local, { nombre: p.local, logo: p.localImg || '' });
                    }
                    if(!equiposUnicos.has(p.visitante)) {
                        equiposUnicos.set(p.visitante, { nombre: p.visitante, logo: p.visitanteImg || '' });
                    }
                });
                
                equiposData = Array.from(equiposUnicos.values());
                mostrarEquipos();
            } catch(error) {
                document.getElementById('listaEquipos').innerHTML = '<p style="color:red">Error cargando equipos</p>';
            }
        }

        function mostrarEquipos() {
            let html = '<div style="max-height:500px;overflow-y:auto">';
            equiposData.forEach((equipo, index) => {
                html += `
                    <div class="equipo">
                        <div style="display:flex;align-items:center">
                            ${equipo.logo ? `<img src="${equipo.logo}" onerror="this.src='https://via.placeholder.com/50?text=Logo'">` : '<div style="width:50px;height:50px;background:#ddd;display:inline-block;margin-right:15px"></div>'}
                            <strong style="flex-grow:1">${equipo.nombre}</strong>
                        </div>
                        <div style="margin-top:10px">
                            <input type="text" id="logo_${index}" placeholder="URL del logo" value="${equipo.logo || ''}" style="width:70%">
                            <button onclick="buscarLogoAuto('${equipo.nombre}', ${index})">🔍 Buscar automático</button>
                            <br>
                            <small>💡 Sugerencia: Usa imágenes de imgur.com, postimg.cc o sube a tu servidor</small>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            document.getElementById('listaEquipos').innerHTML = html;
        }

        async function buscarLogoAuto(nombreEquipo, index) {
            const input = document.getElementById(`logo_${index}`);
            input.value = '🔄 Buscando...';
            
            // Buscar en TheSportsDB API (gratis)
            const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(nombreEquipo)}`;
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                if(data.teams && data.teams[0]) {
                    const logo = data.teams[0].strTeamBadge || data.teams[0].strTeamLogo;
                    if(logo) {
                        input.value = logo;
                        mostrarMensaje(`✅ Logo encontrado para ${nombreEquipo}`, 'success');
                    } else {
                        input.value = '';
                        mostrarMensaje(`⚠️ No se encontró logo para ${nombreEquipo}`, 'error');
                    }
                } else {
                    input.value = '';
                    mostrarMensaje(`⚠️ No se encontró logo para ${nombreEquipo}`, 'error');
                }
            } catch(error) {
                input.value = '';
                mostrarMensaje(`❌ Error buscando logo para ${nombreEquipo}`, 'error');
            }
        }

        function mostrarMensaje(msg, tipo) {
            const div = document.getElementById('mensaje');
            div.innerHTML = `<div class="${tipo}">${msg}</div>`;
            setTimeout(() => { div.innerHTML = ''; }, 3000);
        }

        async function guardarTodosLosLogos() {
            // Actualizar logos de los inputs
            equiposData.forEach((equipo, index) => {
                const input = document.getElementById(`logo_${index}`);
                if(input) {
                    equipo.logo = input.value;
                }
            });
            
            // Crear mapa de logos por equipo
            const logosMap = new Map();
            equiposData.forEach(equipo => {
                logosMap.set(equipo.nombre, equipo.logo);
            });
            
            // Cargar partidos actuales y actualizar logos
            try {
                const response = await fetch('./partidos.json');
                let partidos = await response.json();
                
                partidos = partidos.map(partido => ({
                    ...partido,
                    localImg: logosMap.get(partido.local) || partido.localImg,
                    visitanteImg: logosMap.get(partido.visitante) || partido.visitanteImg
                }));
                
                // Guardar via PHP
                const saveResponse = await fetch('guardar_logos.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(partidos)
                });
                
                const result = await saveResponse.json();
                if(result.success) {
                    mostrarMensaje('✅ ¡Logos guardados exitosamente!', 'success');
                    setTimeout(() => { window.location.href = 'admin_panel.php'; }, 1500);
                } else {
                    mostrarMensaje('❌ Error al guardar: ' + result.error, 'error');
                }
            } catch(error) {
                mostrarMensaje('❌ Error al guardar los logos', 'error');
            }
        }

        // Inicializar
        cargarEquipos();
    </script>
<?php endif; ?>
</body>
</html>