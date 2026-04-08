<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Add missing columns to penjualan table
    $columnsToAdd = [
        "id_barang INT(20) DEFAULT NULL",
        "nama_barang VARCHAR(100) DEFAULT NULL",
        "harga_beli_pcs DECIMAL(12,2) DEFAULT NULL",
        "harga_jual DECIMAL(12,2) DEFAULT NULL",
        "jumlah INT(10) DEFAULT 0",
        "total_harga DECIMAL(12,2) DEFAULT NULL",
        "keuntungan DECIMAL(12,2) DEFAULT NULL",
        "current_stok INT(10) DEFAULT 0",
        "waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    
    $results = [];
    
    foreach ($columnsToAdd as $colDef) {
        $colName = explode(' ', $colDef)[0];
        try {
            $pdo->exec("ALTER TABLE penjualan ADD COLUMN $colDef");
            $results[] = "Added column: $colName";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                $results[] = "Column already exists: $colName";
            } else {
                $results[] = "Error adding $colName: " . $e->getMessage();
            }
        }
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Columns updated",
        "details" => $results
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
