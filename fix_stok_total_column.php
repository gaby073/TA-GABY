<?php
// Script to ensure stok_total column exists and has correct values

require_once 'config.php';

try {
    // Check if stok_total column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'stok_total'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        // Add the column if it doesn't exist
        $pdo->exec("ALTER TABLE barang ADD COLUMN stok_total INT NOT NULL DEFAULT 0 AFTER jumlah_beli");
        echo "Column 'stok_total' added successfully!<br>";
    } else {
        echo "Column 'stok_total' already exists.<br>";
    }
    
    // Calculate and update any missing stok_total values
    $pdo->exec("UPDATE barang SET stok_total = isi_satuan * COALESCE(jumlah_beli, 1) WHERE stok_total = 0 OR stok_total IS NULL");
    echo "Stock values synchronized!<br>";
    
    echo "<br>Done!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
