<?php
require 'c:\\Users\\user\\TA-GABY\\config.php';
$stmt = $pdo->query('SELECT MONTH(waktu) as bln, YEAR(waktu) as thn, COUNT(*) as cnt FROM penjualan GROUP BY thn, bln');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
