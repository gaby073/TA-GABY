<?php
require_once 'config.php';

echo "<h2>Fixing Stok Konsisten</h2>";

// Debug: Tampilkan semua data penjualan
echo "<h3>Semua Data Penjualan:</h3>";
$stmtDebug = $pdo->query("SELECT id_barang, nama_barang, jumlah, waktu FROM penjualan ORDER BY waktu DESC");
$penjualanDebug = $stmtDebug->fetchAll(PDO::FETCH_ASSOC);
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID Barang</th><th>Nama</th><th>Jumlah</th><th>Waktu</th></tr>";
$totalPerBarang = [];
foreach ($penjualanDebug as $p) {
    echo "<tr><td>{$p['id_barang']}</td><td>{$p['nama_barang']}</td><td>{$p['jumlah']}</td><td>{$p['waktu']}</td></tr>";
    if (!isset($totalPerBarang[$p['id_barang']])) $totalPerBarang[$p['id_barang']] = ['nama' => $p['nama_barang'], 'total' => 0];
    $totalPerBarang[$p['id_barang']]['total'] += $p['jumlah'];
}
echo "</table>";

echo "<h3>Total Terjual per ID:</h3>";
foreach ($totalPerBarang as $id => $data) {
    echo "ID: $id - {$data['nama']} - Total terjual: {$data['total']}<br>";
}

echo "<h3>Semua Data Barang:</h3>";
$stmt = $pdo->query("SELECT id_barang, nama_barang, stok_total, isi_satuan, jumlah_beli FROM barang ORDER BY id_barang DESC");
$barang = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($barang) == 0) {
    echo "<p style='color:red'>TIDAK ADA DATA BARANG! Coba cek apakah tabel barang ada isinya.</p>";
    // Cek apakah ada di database
    $cek = $pdo->query("SELECT COUNT(*) as cnt FROM barang");
    $cnt = $cek->fetch(PDO::FETCH_ASSOC);
    echo "Jumlah record di tabel barang: " . $cnt['cnt'] . "<br>";
}

echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID</th><th>Nama</th><th>Stok DB</th><th>Terjual (penjualan)</th><th>Stok Benar</th><th>Status</th></tr>";

$fixed = 0;
foreach ($barang as $b) {
    $idBarang = $b['id_barang'];
    
    $stmt2 = $pdo->prepare("SELECT SUM(jumlah) as total_terjual FROM penjualan WHERE id_barang = ?");
    $stmt2->execute([$idBarang]);
    $penjualan = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    $totalTerjual = intval($penjualan['total_terjual'] ?? 0);
    $stokSekarang = intval($b['stok_total']);
    $stokBenar = $stokSekarang - $totalTerjual;
    if ($stokBenar < 0) $stokBenar = 0;
    
    $status = ($stokSekarang != $stokBenar) ? "<span style='color:red'>BEDA!</span>" : "OK";
    
    echo "<tr>";
    echo "<td>{$b['id_barang']}</td>";
    echo "<td>{$b['nama_barang']}</td>";
    echo "<td>{$stokSekarang}</td>";
    echo "<td>{$totalTerjual}</td>";
    echo "<td><strong>{$stokBenar}</strong></td>";
    echo "<td>{$status}</td>";
    echo "</tr>";
    
    if ($stokSekarang != $stokBenar) {
        $updateStmt = $pdo->prepare("UPDATE barang SET stok_total = ? WHERE id_barang = ?");
        $updateStmt->execute([$stokBenar, $idBarang]);
        $fixed++;
    }
}

echo "</table>";

echo "<p><strong>Total barang yang diperbaiki:</strong> {$fixed}</p>";
echo "<p><em>Stok Benar = Stok DB - Total Terjual</em></p>";
?>