<?php
require 'c:\\Users\\user\\TA-GABY\\config.php';
echo "stok_masuk:\n";
print_r($pdo->query('DESCRIBE stok_masuk')->fetchAll(PDO::FETCH_ASSOC));
echo "\nhistory_penjualan:\n";
print_r($pdo->query('DESCRIBE history_penjualan')->fetchAll(PDO::FETCH_ASSOC));
?>
