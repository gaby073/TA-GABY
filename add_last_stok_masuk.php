<?php
// Script to add last_stok_masuk column to barang table

require_once 'config.php';

try {
    // Check if last_stok_masuk column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'last_stok_masuk'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN last_stok_masuk INT NOT NULL DEFAULT 0 AFTER stok_total");
        echo "Column 'last_stok_masuk' added successfully!<br>";
    } else {
        echo "Column 'last_stok_masuk' already exists.<br>";
    }
    
    // Check if updated_at column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'updated_at'");
    $columnExists = $stmt->fetch();
    
    if (!$columnExists) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL AFTER last_stok_masuk");
        echo "Column 'updated_at' added successfully!<br>";
    } else {
        echo "Column 'updated_at' already exists.<br>";
    }
    
    echo "<br>Done! Database is ready.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
