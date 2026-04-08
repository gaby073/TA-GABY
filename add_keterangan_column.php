<?php
require_once 'config.php';

try {
    // Add keterangan column if it doesn't exist
    $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS keterangan TEXT");
    echo "Column 'keterangan' added successfully or already exists.<br>";
    
    // Also add other columns that might be missing
    $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS stok_total INT DEFAULT 0");
    echo "Column 'stok_total' added successfully or already exists.<br>";
    
    $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS jumlah_beli INT DEFAULT 1");
    echo "Column 'jumlah_beli' added successfully or already exists.<br>";
    
    $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS persen_untungk DECIMAL(5,2) DEFAULT 0");
    echo "Column 'persen_untungk' added successfully or already exists.<br>";
    
    echo "<br>All columns verified successfully!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
