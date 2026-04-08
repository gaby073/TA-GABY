<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create history_penjualan table (similar to stok_masuk but for sales)
    $pdo->exec("CREATE TABLE IF NOT EXISTS history_penjualan (
        id_history INT(10) AUTO_INCREMENT PRIMARY KEY,
        id_barang INT(20) DEFAULT NULL,
        nama_barang VARCHAR(100) DEFAULT NULL,
        jumlah INT(10) DEFAULT 0,
        harga_jual DECIMAL(12,2) DEFAULT NULL,
        total_harga DECIMAL(12,2) DEFAULT NULL,
        keuntungan DECIMAL(12,2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Fix the penjualan table - rename Id_penjualan to id_penjualan and add AUTO_INCREMENT
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
    } else {
        // No data - just modify the table
        $pdo->exec("ALTER TABLE penjualan MODIFY COLUMN Id_penjualan INT(10) AUTO_INCREMENT PRIMARY KEY");
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Created history_penjualan table and fixed penjualan table"
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
