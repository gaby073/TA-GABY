uanny<?php
$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully!\n\n";
    
    // Check current columns
    $stmt = $pdo->query("DESCRIBE barang");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Current columns in barang table:\n";
    print_r($columns);
    echo "\n";
    
    // Add missing columns
    $alterations = [];
    
    // Add jumlah_beli column if not exists
    if (!in_array('jumlah_beli', $columns)) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN jumlah_beli INT DEFAULT 1 AFTER isi_satuan");
        echo "Added column: jumlah_beli\n";
    }
    
    // Add stok_total column if not exists
    if (!in_array('stok_total', $columns)) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN stok_total INT DEFAULT 0 AFTER harga_jual");
        echo "Added column: stok_total\n";
    }
    
    // Add keterangan column if not exists
    if (!in_array('keterangan', $columns)) {
        $pdo->exec("ALTER TABLE barang ADD COLUMN keterangan TEXT AFTER stok_total");
        echo "Added column: keterangan\n";
    }
    
    // Rename persen_untungan to persen_untungk if exists
    if (in_array('persen_untungkan', $columns)) {
        $pdo->exec("ALTER TABLE barang CHANGE COLUMN persen_untungkan persen_untungk DECIMAL(5,2) NOT NULL");
        echo "Renamed column: persen_untungkan -> persen_untungk\n";
    } elseif (!in_array('persen_untungk', $columns) && in_array('persen_untung', $columns)) {
        $pdo->exec("ALTER TABLE barang CHANGE COLUMN persen_untung persen_untungk DECIMAL(5,2) NOT NULL");
        echo "Renamed column: persen_untung -> persen_untungk\n";
    }
    
    // Update existing records to have stok_total if it's 0 or null
    $pdo->exec("UPDATE barang SET stok_total = COALESCE(stok_total, isi_satuan * COALESCE(jumlah_beli, 1)) WHERE stok_total IS NULL OR stok_total = 0");
    echo "Updated existing records with stok_total calculation\n";
    
    // Show final columns
    $stmt = $pdo->query("DESCRIBE barang");
    $finalColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nFinal columns in barang table:\n";
    print_r($finalColumns);
    
    echo "\n✅ Database updated successfully for Stok Masuk!\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>