<?php
require 'c:\\Users\\user\\TA-GABY\\config.php';
$stmt1 = $pdo->query('DESCRIBE penjualan');
$stmt2 = $pdo->query('DESCRIBE detail_penjualan');
echo "penjualan:\n";
print_r($stmt1->fetchAll(PDO::FETCH_ASSOC));
echo "\ndetail_penjualan:\n";
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
?>
