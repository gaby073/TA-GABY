<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}
require_once 'config.php';
$stmt = $pdo->query("SELECT * FROM barang ORDER BY id_barang DESC");
$barang = $stmt->fetchAll(PDO::FETCH_ASSOC);
$totalStok = array_sum(array_column($barang, 'stok_total'));
$jenisBarang = count($barang);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Berty Shop</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .sidebar { position: fixed; left: 0; top: 0; width: 260px; height: 100vh; background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px 0; box-shadow: 2px 0 10px rgba(0,0,0,0.1); z-index: 1000; }
        .sidebar-header { padding: 0 20px 30px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; }
        .sidebar-header h2 { font-size: 24px; display: flex; align-items: center; gap: 10px; }
        .sidebar-header h2 i { color: #e74c3c; }
        .sidebar-header .user-name { margin-top: 10px; font-size: 14px; opacity: 0.8; }
        .sidebar-menu { list-style: none; padding: 0 10px; }
        .sidebar-menu li { margin-bottom: 5px; }
        .sidebar-menu a { display: flex; align-items: center; gap: 12px; padding: 12px 15px; color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; font-size: 15px; }
        .sidebar-menu a:hover, .sidebar-menu a.active { background: rgba(255,255,255,0.15); }
        .sidebar-menu a i { width: 20px; text-align: center; color: #3498db; }
        .sidebar-footer { position: absolute; bottom: 20px; left: 0; right: 0; padding: 0 20px; }
        .logout-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 20px; background: rgba(231, 76, 60, 0.2); color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; border: none; cursor: pointer; width: 100%; font-size: 15px; }
        .logout-btn:hover { background: #e74c3c; }
        .main-content { margin-left: 260px; padding: 30px; min-height: 100vh; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .page-header h1 { color: #2c3e50; font-size: 28px; }
        .page-header .date { color: #7f8c8d; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 20px; }
        .stat-icon { width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; }
        .stat-icon.blue { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }
        .stat-icon.green { background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); }
        .stat-info h3 { font-size: 26px; color: #2c3e50; margin-bottom: 5px; }
        .stat-info p { color: #7f8c8d; font-size: 14px; }
        .content-section { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; }
        .content-section h2 { color: #2c3e50; font-size: 20px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #3498db; display: flex; align-items: center; gap: 10px; }
        .content-section h2 i { color: #3498db; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ecf0f1; }
        .data-table th { color: #2c3e50; font-weight: 600; font-size: 13px; text-transform: uppercase; background: #f8f9fa; }
        .data-table td { color: #34495e; font-size: 14px; }
        .data-table tr:hover { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-header">
            <h2><i class="fas fa-store"></i> <span>Berty Shop</span></h2>
            <div class="user-name">Owner: <?php echo htmlspecialchars($_SESSION['username']); ?></div>
        </div>
        <ul class="sidebar-menu">
            <li><a href="#" class="active"><i class="fas fa-home"></i> <span>Dashboard</span></a></li>
            <li><a href="#"><i class="fas fa-box"></i> <span>Tabel Barang</span></a></li>
            <li><a href="#"><i class="fas fa-chart-bar"></i> <span>Laporan</span></a></li>
        </ul>
        <div class="sidebar-footer">
            <a href="logout.php" class="logout-btn"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a>
        </div>
    </div>
    <div class="main-content">
        <div class="page-header">
            <h1>Dashboard</h1>
            <div class="date"><?php echo date('l, d F Y'); ?></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
                <div class="stat-info"><h3><?php echo $jenisBarang; ?></h3><p>Jenis Barang</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-money-bill-wave"></i></div>
                <div class="stat-info"><h3>Rp <?php echo number_format($totalStok * 10000); ?></h3><p>Total Nilai Stok</p></div>
            </div>
        </div>
        <div class="content-section">
            <h2><i class="fas fa-box"></i> Tabel Barang</h2>
            <table class="data-table">
                <thead>
                    <tr><th>Kode</th><th>Nama Barang</th><th>Satuan</th><th>Isi</th><th>Jumlah Beli</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok Total</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($barang as $b): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($b['id_barang']); ?></td>
                        <td><?php echo htmlspecialchars($b['nama_barang']); ?></td>
                        <td><?php echo htmlspecialchars($b['satuan_beli']); ?></td>
                        <td><?php echo htmlspecialchars($b['isi_satuan']); ?></td>
                        <td><?php echo htmlspecialchars($b['jumlah_beli']); ?></td>
                        <td>Rp <?php echo number_format($b['harga_beli']); ?></td>
                        <td>Rp <?php echo number_format($b['harga_jual']); ?></td>
                        <td><?php echo htmlspecialchars($b['stok_total']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
