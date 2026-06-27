<?php
require_once 'c:/Users/user/TA-GABY/config.php';
try {
    $pdo->exec("ALTER TABLE struk_belanja 
                ADD COLUMN judul_belanja VARCHAR(255) NULL,
                ADD COLUMN nama_toko VARCHAR(255) NULL,
                ADD COLUMN tanggal_belanja DATETIME NULL,
                ADD COLUMN total_belanja DECIMAL(15,2) NULL,
                ADD COLUMN status ENUM('Selesai', 'Pending') DEFAULT 'Selesai'");
    echo "Table altered successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
