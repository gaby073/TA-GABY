<?php
require 'c:\\Users\\user\\TA-GABY\\config.php';
$stmt = $pdo->query('SHOW TABLES');
print_r($stmt->fetchAll(PDO::FETCH_COLUMN));
?>
