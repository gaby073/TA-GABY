<?php
// Script to add last_added_stock and updated_at columns to barang table

require_once 'config.php';

try {
    // Check if last_added_stock column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'last_added_stock'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN last_added_stock INT NOT NULL DEFAULT 0 AFTER stok_total");
        echo "Column 'last_added_stock' added successfully!<br>";
    } else {
        echo "Column 'last_added_stock' already exists.<br>";
    }
    
    // Check if updated_at column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'updated_at'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL AFTER last_added_stock");
        echo "Column 'updated_at' added successfully!<br>";
    } else {
        echo "Column 'updated_at' already exists.<br>";
    }
    
    echo "<br>Done! Database is ready.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
