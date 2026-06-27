<?php
require_once 'config.php';
$stmt = $pdo->prepare("SELECT MAX(id_barang) as id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = ? AND YEAR(waktu) = ? GROUP BY nama_barang ORDER BY total_terjual DESC LIMIT 10");
$stmt->execute([2, 2026]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "Month 2:\n";
print_r($data);

$stmt->execute([6, 2026]);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "\nMonth 6:\n";
print_r($data);
?>
