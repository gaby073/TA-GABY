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
    <title>Kasir Dashboard - Berty Shop</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
        }

        /* Sidebar Styles */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 260px;
            height: 100vh;
            background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 20px 0;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }

        .sidebar-header {
            padding: 0 20px 30px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        }

        .sidebar-header h2 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sidebar-header h2 i {
            color: #e74c3c;
        }

        .sidebar-header .admin-name {
            margin-top: 10px;
            font-size: 14px;
            opacity: 0.8;
        }

        .sidebar-menu {
            list-style: none;
            padding: 0 10px;
        }

        .sidebar-menu li {
            margin-bottom: 5px;
        }

        .sidebar-menu a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-size: 15px;
        }

        .sidebar-menu a:hover,
        .sidebar-menu a.active {
            background: rgba(255,255,255,0.15);
        }

        .sidebar-menu a i {
            width: 20px;
            text-align: center;
            color: #3498db;
        }

        .sidebar-footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            padding: 0 20px;
        }

        .logout-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 20px;
            background: rgba(231, 76, 60, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            width: 100%;
            font-size: 15px;
        }

        .logout-btn:hover {
            background: #e74c3c;
        }

        /* Main Content Styles */
        .main-content {
            margin-left: 260px;
            padding: 30px;
            min-height: 100vh;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .page-header h1 {
            color: #2c3e50;
            font-size: 28px;
        }

        .page-header .date {
            color: #7f8c8d;
            font-size: 14px;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 20px;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-icon {
            width: 55px;
            height: 55px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: white;
        }

        .stat-icon.blue { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); }
        .stat-icon.green { background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%); }
        .stat-icon.orange { background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); }
        .stat-icon.red { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }

        .stat-info h3 {
            font-size: 26px;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .stat-info p {
            color: #7f8c8d;
            font-size: 14px;
        }

        /* Content Section */
        .content-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }

        .content-section h2 {
            color: #2c3e50;
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3498db;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .content-section h2 i {
            color: #3498db;
        }

        /* Table Styles */
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }

        .data-table th {
            color: #2c3e50;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            background: #f8f9fa;
        }

        .data-table td {
            color: #34495e;
            font-size: 14px;
        }

        .data-table tr:hover {
            background: #f8f9fa;
        }

        .status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status.lunas { background: #d5f4e6; color: #27ae60; }
        .status.belum-lunas { background: #fadbd8; color: #e74c3c; }
        .status.proses { background: #d6eaf8; color: #3498db; }

        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: #3498db;
            color: white;
        }

        .btn-primary:hover {
            background: #2980b9;
        }

        .btn-success {
            background: #27ae60;
            color: white;
        }

        .btn-success:hover {
            background: #1e8449;
        }

        /* Quick Actions */
        .quick-actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .action-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background: #f8f9fa;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            font-size: 14px;
            color: #2c3e50;
        }

        .action-btn:hover {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }

        .action-btn i {
            width: 20px;
            text-align: center;
        }

        /* Form Styles */
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #2c3e50;
            font-weight: 500;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #3498db;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                width: 70px;
                padding: 20px 10px;
            }

            .sidebar-header h2 span,
            .sidebar-header .admin-name,
            .sidebar-menu a span,
            .logout-btn span {
                display: none;
            }

            .sidebar-menu a,
            .logout-btn {
                justify-content: center;
                padding: 12px;
            }

            .main-content {
                margin-left: 70px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <h2><i class="fas fa-store"></i> <span>Berty Shop</span></h2>
            <div class="kasir-name">Kasir: <?php echo htmlspecialchars($_SESSION['username']); ?></div>
        </div>
        
        <ul class="sidebar-menu">
            <li><a href="#" class="active"><i class="fas fa-home"></i> <span>Dashboard</span></a></li>
            <li><a href="#"><i class="fas fa-shopping-cart"></i> <span>Transaksi Penjualan</span></a></li>
            <li><a href="#"><i class="fas fa-box"></i> <span>Tabel Barang</span></a></li>
            <li><a href="#"><i class="fas fa-plus-circle"></i> <span>Stok Masuk</span></a></li>
            <li><a href="#"><i class="fas fa-users"></i> <span>Pelanggan</span></a></li>
            <li><a href="#"><i class="fas fa-chart-bar"></i> <span>Laporan</span></a></li>
            <li><a href="#"><i class="fas fa-cog"></i> <span>Pengaturan</span></a></li>
        </ul>

        <div class="sidebar-footer">
            <a href="logout.php" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
            </a>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="page-header">
            <h1>Dashboard</h1>
            <div class="date"><?php echo date('l, d F Y'); ?></div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
                <div class="stat-info">
                    <h3>156</h3>
                    <p>Total Transaksi</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fas fa-money-bill-wave"></i></div>
                <div class="stat-info">
                    <h3>Rp 12.500.000</h3>
                    <p>Total Pendapatan</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fas fa-boxes"></i></div>
                <div class="stat-info">
                    <h3><?php echo $jenisBarang; ?></h3>
                    <p>Jenis Barang</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red"><i class="fas fa-plus-square"></i></div>
                <div class="stat-info">
                    <h3>25</h3>
                    <p>Stok Masuk Hari Ini</p>
                </div>
            </div>
        </div>

        <!-- Transaksi Penjualan Section -->
        <div class="content-section">
            <h2><i class="fas fa-shopping-cart"></i> Transaksi Penjualan</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>No. Transaksi</th>
                        <th>Tanggal</th>
                        <th>Pelanggan</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>TRX-001</td>
                        <td>17 Mar 2026</td>
                        <td>Ahmad Pratama</td>
                        <td>Rp 250.000</td>
                        <td><span class="status lunas">Lunas</span></td>
                        <td><button class="btn btn-primary">Detail</button></td>
                    </tr>
                    <tr>
                        <td>TRX-002</td>
                        <td>17 Mar 2026</td>
                        <td>Siti Rahayu</td>
                        <td>Rp 175.000</td>
                        <td><span class="status belum-lunas">Belum Lunas</span></td>
                        <td><button class="btn btn-primary">Detail</button></td>
                    </tr>
                    <tr>
                        <td>TRX-003</td>
                        <td>16 Mar 2026</td>
                        <td>Budi Santoso</td>
                        <td>Rp 320.000</td>
                        <td><span class="status lunas">Lunas</span></td>
                        <td><button class="btn btn-primary">Detail</button></td>
                    </tr>
                    <tr>
                        <td>TRX-004</td>
                        <td>16 Mar 2026</td>
                        <td>Dewi Lestari</td>
                        <td>Rp 450.000</td>
                        <td><span class="status proses">Proses</span></td>
                        <td><button class="btn btn-primary">Detail</button></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Tabel Barang Section -->
        <div class="content-section">
            <h2><i class="fas fa-box"></i> Tabel Barang</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Kode</th>
                        <th>Nama Barang</th>
                        <th>Satuan</th>
                        <th>Isi</th>
                        <th>Jumlah Beli</th>
                        <th>Harga Beli</th>
                        <th>Harga Jual</th>
                        <th>Stok Total</th>
                        <th>Aksi</th>
                    </tr>
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
                        <td>
                            <button class="btn btn-success">Edit</button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Stok Masuk Section -->
        <div class="content-section">
            <h2><i class="fas fa-plus-circle"></i> Stok Masuk</h2>
            <div class="form-row">
                <div class="form-group">
                    <label>Kode Barang</label>
                    <input type="text" placeholder="Masukkan kode barang">
                </div>
                <div class="form-group">
                    <label>Nama Barang</label>
                    <input type="text" placeholder="Nama barang">
                </div>
                <div class="form-group">
                    <label>Jumlah</label>
                    <input type="number" placeholder="Jumlah stok">
                </div>
                <div class="form-group">
                    <label>&nbsp;</label>
                    <button class="btn btn-success" style="width: 100%;">Tambah Stok</button>
                </div>
            </div>
            
            <table class="data-table" style="margin-top: 20px;">
                <thead>
                    <tr>
                        <th>No. Penerimaan</th>
                        <th>Tanggal</th>
                        <th>Kode Barang</th>
                        <th>Nama Barang</th>
                        <th>Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>STM-001</td>
                        <td>17 Mar 2026</td>
                        <td>BRG-001</td>
                        <td>Kemeja Pria Lengan Panjang</td>
                        <td>20</td>
                    </tr>
                    <tr>
                        <td>STM-002</td>
                        <td>16 Mar 2026</td>
                        <td>BRG-002</td>
                        <td>Celana Jeans Slimfit</td>
                        <td>15</td>
                    </tr>
                    <tr>
                        <td>STM-003</td>
                        <td>15 Mar 2026</td>
                        <td>BRG-003</td>
                        <td>Sepatu Sneakers</td>
                        <td>10</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
