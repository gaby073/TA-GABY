<?php
// Create table for stock history (stok_masuk)

require_once 'config.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'stok_masuk'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        $pdo->exec("CREATE TABLE stok_masuk (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_barang VARCHAR(20) NOT NULL,
            nama_barang VARCHAR(100),
            stok_awal INT DEFAULT 0,
            stok_tambah INT NOT NULL,
            stok_total INT DEFAULT 0,
            keterangan TEXT,
            tgl_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        echo "Table 'stok_masuk' created successfully!<br>";
    } else {
        echo "Table 'stok_masuk' already exists.<br>";
    }
    
    echo "<br>Done!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
