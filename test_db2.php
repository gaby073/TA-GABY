<?php
require 'c:\\Users\\user\\TA-GABY\\config.php';

echo "Month 3:\n";
$stmt = $pdo->prepare("SELECT MAX(id_barang) as id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = ? AND YEAR(waktu) = ? GROUP BY nama_barang ORDER BY total_terjual DESC LIMIT 10");
$stmt->execute([3, 2026]);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "Month 4:\n";
$stmt->execute([4, 2026]);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "Month 5:\n";
$stmt->execute([5, 2026]);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
