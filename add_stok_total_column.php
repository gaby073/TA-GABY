<?php
// Script to add stok_total column to barang table

require_once 'config.php';

try {
    // Check if column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'stok_total'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        // Add the column
        $pdo->exec("ALTER TABLE barang ADD COLUMN stok_total INT NOT NULL DEFAULT 0 AFTER jumlah_beli");
        
        // Calculate and update existing records
        $pdo->exec("UPDATE barang SET stok_total = isi_satuan * COALESCE(jumlah_beli, 1)");
        
        echo "Column 'stok_total' added successfully and existing records updated!";
    } else {
        echo "Column 'stok_total' already exists.";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
