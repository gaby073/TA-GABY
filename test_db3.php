<?php
require_once 'c:/Users/user/TA-GABY/config.php';
$stmt = $pdo->query("SHOW COLUMNS FROM penjualan");
echo "Columns:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $pdo->query("SELECT MAX(id_barang) as id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = 2 AND YEAR(waktu) = 2026 GROUP BY nama_barang ORDER BY total_terjual DESC LIMIT 10");
echo "\nQuery Month 2:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt = $pdo->query("SELECT MAX(id_barang) as id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = 3 AND YEAR(waktu) = 2026 GROUP BY nama_barang ORDER BY total_terjual DESC LIMIT 10");
echo "\nQuery Month 3:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
