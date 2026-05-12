<?php
session_start();

// Verificar que sea admin
if(!isset($_SESSION['admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents('php://input'), true);

if(!$data) {
    echo json_encode(['success' => false, 'error' => 'No hay datos']);
    exit;
}

// Guardar en partidos.json
if(file_put_contents('partidos.json', json_encode($data, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al escribir archivo']);
}
?>