<?php
// Create table for sales transactions (penjualan)

require_once 'config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'penjualan'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        $pdo->exec("CREATE TABLE penjualan (
            id_penjualan INT AUTO_INCREMENT PRIMARY KEY,
            id_barang VARCHAR(20) NOT NULL,
            nama_barang VARCHAR(100),
            harga_beli_pcs DECIMAL(12,2),
            harga_jual DECIMAL(12,2),
            jumlah INT NOT NULL,
            total_harga DECIMAL(12,2),
            keuntungan DECIMAL(12,2),
            tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        echo "Table 'penjualan' created successfully!<br>";
    } else {
        echo "Table 'penjualan' already exists.<br>";
    }
    
    echo "<br>Done!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
