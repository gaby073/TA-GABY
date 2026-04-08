<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fix: Rename Id_penjualan to id_penjualan and add AUTO_INCREMENT
    // First check if there's any data
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM penjualan");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($count['cnt'] > 0) {
        // Table has data - need to recreate with new structure
        // Rename old table
        $pdo->exec("ALTER TABLE penjualan RENAME TO penjualan_old");
        
        // Create new table with proper structure
        $pdo->exec("CREATE TABLE penjualan (
            id_penjualan INT(10) AUTO_INCREMENT PRIMARY KEY,
            tanggal_penjualan DATE DEFAULT NULL,
            total_penjualan INT(10) DEFAULT 0,
            total_keuntungan INT(10) DEFAULT 0,
            id_barang INT(20) DEFAULT NULL,
            nama_barang VARCHAR(100) DEFAULT NULL,
            harga_beli_pcs DECIMAL(12,2) DEFAULT NULL,
            harga_jual DECIMAL(12,2) DEFAULT NULL,
            jumlah INT(10) DEFAULT 0,
            total_harga DECIMAL(12,2) DEFAULT NULL,
            keuntungan DECIMAL(12,2) DEFAULT NULL,
            current_stok INT(10) DEFAULT 0,
            waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Copy data from old table (mapping column names)
        $pdo->exec("INSERT INTO penjualan (id_penjualan, tanggal_penjualan, total_penjualan, total_keuntungan, id_barang, nama_barang, harga_beli_pcs, harga_jual, jumlah, total_harga, keuntungan, current_stok, waktu)
                    SELECT Id_penjualan, Tanggal_penjualan, Total_penjualan, Total_keuntungan, id_barang, nama_barang, harga_beli_pcs, harga_jual, jumlah, total_harga, keuntungan, current_stok, waktu 
                    FROM penjualan_old");
        
        // Drop old table
        $pdo->exec("DROP TABLE penjualan_old");
        
        echo json_encode([
            "success" => true,
            "message" => "Table recreated with AUTO_INCREMENT and proper column names"
        ]);
    } else {
        // No data - just modify the table
        $pdo->exec("ALTER TABLE penjualan MODIFY COLUMN Id_penjualan INT(10) AUTO_INCREMENT PRIMARY KEY");
        
        echo json_encode([
            "success" => true,
            "message" => "Added AUTO_INCREMENT to existing table"
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
