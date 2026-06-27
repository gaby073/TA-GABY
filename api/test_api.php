<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['stats'] = '1';
$_GET['period'] = 'month';
$_GET['month'] = '4';
$_GET['year'] = '2026';
require 'penjualan.php';
?>
