<?php
// API for sales history (history_penjualan)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all history records
            $stmt = $pdo->query("SELECT * FROM history_penjualan ORDER BY created_at DESC");
            $data = $stmt->fetchAll();
            echo json_encode($data);
            break;
            
        case 'POST':
            // Add new history record (manual)
            $data = json_decode(file_get_contents('php://input'), true);
            
            $id_barang = $data['id_barang'] ?? '';
            $nama_barang = $data['nama_barang'] ?? '';
            $jumlah = $data['jumlah'] ?? 0;
            $harga_jual = $data['harga_jual'] ?? 0;
            $total_harga = $data['total_harga'] ?? 0;
            $keuntungan = $data['keuntungan'] ?? 0;
            
            $stmt = $pdo->prepare("INSERT INTO history_penjualan (id_barang, nama_barang, jumlah, harga_jual, total_harga, keuntungan) VALUES (?, ?, ?, ?, ?, ?)");
            
            if($stmt->execute([$id_barang, $nama_barang, $jumlah, $harga_jual, $total_harga, $keuntungan])) {
                echo json_encode(['success' => true, 'message' => 'History record added']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add record']);
            }
            break;
            
        case 'DELETE':
            // Delete history record
            $id = $_GET['id'] ?? '';
            
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM history_penjualan WHERE id_history = ?");
                if($stmt->execute([$id])) {
                    echo json_encode(['success' => true, 'message' => 'Record deleted']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to delete']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'ID required']);
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
