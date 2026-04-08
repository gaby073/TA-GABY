<?php
$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage(),
        'hint' => 'Pastikan XAMPP MySQL sudah dinyalakan dan database ta_gaby sudah dibuat'
    ]);
    exit;
}
?>
