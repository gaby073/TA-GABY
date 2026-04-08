<?php
require_once 'config.php';

$stmt = $pdo->exec("UPDATE barang SET stok_total = isi_satuan * COALESCE(jumlah_beli, 1)");
echo "Stok total updated successfully!";
?>
