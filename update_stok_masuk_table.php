<?php
// Update stok_masuk table to add required columns

require_once 'config.php';

try {
    // Check if columns exist and add if needed
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk LIKE 'stok_awal'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE stok_masuk ADD COLUMN stok_awal INT DEFAULT 0 AFTER jumlah_masuk");
        echo "Added stok_awal column<br>";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk LIKE 'stok_total'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE stok_masuk ADD COLUMN stok_total INT DEFAULT 0 AFTER stok_awal");
        echo "Added stok_total column<br>";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk LIKE 'nama_barang'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE stok_masuk ADD COLUMN nama_barang VARCHAR(100) AFTER id_barang");
        echo "Added nama_barang column<br>";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk LIKE 'satuan_beli'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE stok_masuk ADD COLUMN satuan_beli VARCHAR(20) AFTER nama_barang");
        echo "Added satuan_beli column<br>";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk LIKE 'isi_satuan'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE stok_masuk ADD COLUMN isi_satuan INT DEFAULT 1 AFTER satuan_beli");
        echo "Added isi_satuan column<br>";
    }
    
    // Update existing records with current stock values from barang table
    $pdo->exec("UPDATE stok_masuk sm 
                LEFT JOIN barang b ON sm.id_barang = b.id_barang 
                SET sm.nama_barang = b.nama_barang,
                    sm.satuan_beli = b.satuan_beli,
                    sm.isi_satuan = b.isi_satuan,
                    sm.stok_awal = COALESCE(b.stok_total, 0) - COALESCE(sm.jumlah_masuk, 0),
                    sm.stok_total = COALESCE(b.stok_total, 0)
                WHERE sm.stok_awal = 0 OR sm.stok_awal IS NULL");
    
    echo "<br>Updated existing records!<br>";
    echo "Done!";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
