<?php
// API for sales transactions (penjualan)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get transactions - support filtering
        $filter = $_GET['filter'] ?? 'all';
        $date = $_GET['date'] ?? date('Y-m-d');
        $stats = $_GET['stats'] ?? false;
        
        if ($stats) {
            // Get sales statistics per product with period filter
            $period = $_GET['period'] ?? 'all';
            $month = intval($_GET['month'] ?? date('n'));
            $year = intval($_GET['year'] ?? date('Y'));
            if ($period === 'week') {
                $stmt = $pdo->prepare("SELECT id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = ? AND YEAR(waktu) = ? GROUP BY id_barang, nama_barang ORDER BY total_terjual DESC LIMIT 10");
                $stmt->execute([$month, $year]);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($data);
                break;
            } elseif ($period === 'month') {
                $stmt = $pdo->prepare("SELECT id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan WHERE MONTH(waktu) = ? AND YEAR(waktu) = ? GROUP BY id_barang, nama_barang ORDER BY total_terjual DESC LIMIT 10");
                $stmt->execute([$month, $year]);
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($data);
                break;
            } else {
                $stmt = $pdo->query("SELECT id_barang, nama_barang, SUM(jumlah) as total_terjual, SUM(total_harga) as total_penjualan, SUM(keuntungan) as total_keuntungan FROM penjualan GROUP BY id_barang, nama_barang ORDER BY total_terjual DESC LIMIT 10");
            }
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            break;
        }
        
        if ($filter === 'chart_data') {
            // Get chart data for sales/profit over time
            $period = $_GET['period'] ?? 'week';
            $month = intval($_GET['month'] ?? date('n'));
            $year = intval($_GET['year'] ?? date('Y'));
            
            if ($period === 'month') {
                $stmt = $pdo->prepare("
                    SELECT 
                        CONCAT('Minggu ', FLOOR((DAY(waktu)-1)/7)+1) as label,
                        SUM(total_harga) as total_penjualan,
                        SUM(keuntungan) as total_keuntungan
                    FROM penjualan 
                    WHERE MONTH(waktu) = ? AND YEAR(waktu) = ?
                    GROUP BY FLOOR((DAY(waktu)-1)/7)
                    ORDER BY MIN(waktu)
                ");
                $stmt->execute([$month, $year]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                // Fill missing days - get all days in month
                $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                $dataByDay = [];
                foreach ($rows as $row) {
                    $dataByDay[$row['label']] = $row;
                }
                $result = [];
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $dateStr = sprintf('%04d-%02d-%02d', $year, $month, $d);
                    $label = $dateStr;
                    $result[] = [
                        'label' => $label,
                        'total_penjualan' => isset($dataByDay[$label]) ? $dataByDay[$label]['total_penjualan'] : 0,
                        'total_keuntungan' => isset($dataByDay[$label]) ? $dataByDay[$label]['total_keuntungan'] : 0,
                    ];
                }
                echo json_encode($result);
                break;
            } else {
                // Per minggu: Minggu 1-4 (atau 5) dalam bulan & tahun yang dipilih
                $stmt = $pdo->prepare("
                    SELECT 
                        FLOOR((DAY(waktu)-1)/7)+1 as minggu_ke,
                        SUM(total_harga) as total_penjualan,
                        SUM(keuntungan) as total_keuntungan
                    FROM penjualan 
                    WHERE MONTH(waktu) = ? AND YEAR(waktu) = ?
                    GROUP BY minggu_ke
                    ORDER BY minggu_ke
                ");
                $stmt->execute([$month, $year]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Hitung jumlah minggu nyata dalam bulan ini
                $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
                $totalMinggu = ceil($daysInMonth / 7);

                // Index by minggu_ke
                $dataByWeek = [];
                foreach ($rows as $row) {
                    $dataByWeek[intval($row['minggu_ke'])] = $row;
                }

                $result = [];
                for ($w = 1; $w <= $totalMinggu; $w++) {
                    $result[] = [
                        'label' => 'Minggu ' . $w,
                        'total_penjualan' => isset($dataByWeek[$w]) ? floatval($dataByWeek[$w]['total_penjualan']) : 0,
                        'total_keuntungan' => isset($dataByWeek[$w]) ? floatval($dataByWeek[$w]['total_keuntungan']) : 0,
                    ];
                }
                echo json_encode($result);
                break;
            }
        }
        
        if ($filter === 'custom') {
            // Get transactions within custom date range
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-14 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            $stmt = $pdo->prepare("SELECT id_barang, nama_barang, SUM(jumlah) as jumlah, SUM(total_harga) as total_harga, SUM(keuntungan) as keuntungan FROM penjualan WHERE DATE(waktu) BETWEEN ? AND ? GROUP BY id_barang, nama_barang ORDER BY jumlah DESC");
            $stmt->execute([$startDate, $endDate]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            break;
        }

        if ($filter === 'weekly') {
            $week = intval($_GET['week'] ?? 1);
            $month = intval($_GET['month'] ?? date('n'));
            $year = intval($_GET['year'] ?? date('Y'));
            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
            $week = max(1, min($week, ceil($daysInMonth / 7)));
            $startDay = ($week - 1) * 7 + 1;
            $endDay = min($week * 7, $daysInMonth);
            $startDate = sprintf('%04d-%02d-%02d', $year, $month, $startDay);
            $endDate = sprintf('%04d-%02d-%02d', $year, $month, $endDay);
            $stmt = $pdo->prepare("SELECT waktu, SUM(jumlah) as total_jumlah, SUM(total_harga) as total_harga, SUM(keuntungan) as total_keuntungan, GROUP_CONCAT(nama_barang SEPARATOR ', ') as nama_barang_list FROM penjualan WHERE DATE(waktu) BETWEEN ? AND ? GROUP BY waktu ORDER BY waktu DESC, id_penjualan DESC");
            $stmt->execute([$startDate, $endDate]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
            break;
        }
        
        if ($filter === 'daily') {
            // Get today's transactions grouped by waktu (timestamp)
            $stmt = $pdo->prepare("SELECT waktu, SUM(jumlah) as total_jumlah, SUM(total_harga) as total_harga, SUM(keuntungan) as total_keuntungan, GROUP_CONCAT(nama_barang SEPARATOR ', ') as nama_barang_list FROM penjualan WHERE DATE(waktu) = ? GROUP BY waktu ORDER BY waktu DESC, id_penjualan DESC");
            $stmt->execute([$date]);
        } elseif ($filter === 'monthly') {
            // Get this month's transactions grouped by waktu
            $yearMonth = date('Y-m', strtotime($date));
            $stmt = $pdo->prepare("SELECT waktu, SUM(jumlah) as total_jumlah, SUM(total_harga) as total_harga, SUM(keuntungan) as total_keuntungan, GROUP_CONCAT(nama_barang SEPARATOR ', ') as nama_barang_list FROM penjualan WHERE DATE_FORMAT(waktu, '%Y-%m') = ? GROUP BY waktu ORDER BY waktu DESC, id_penjualan DESC");
            $stmt->execute([$yearMonth]);
        } else {
            // Get all transactions grouped by waktu
            $stmt = $pdo->query("SELECT waktu, SUM(jumlah) as total_jumlah, SUM(total_harga) as total_harga, SUM(keuntungan) as total_keuntungan, GROUP_CONCAT(nama_barang SEPARATOR ', ') as nama_barang_list FROM penjualan GROUP BY waktu ORDER BY waktu DESC, id_penjualan DESC");
        }
        
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        break;
        
    case 'POST':
        // Add new transaction
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Check if receiving multiple items (new format) or single item (legacy format)
        if (isset($data['items']) && is_array($data['items'])) {
            // New format: multiple items in one transaction
            $items = $data['items'];
            
            // Validate: must have at least one item
            if (count($items) == 0) {
                echo json_encode(['success' => false, 'message' => 'Minimal harus ada 1 item']);
                break;
            }
            
            // Calculate combined totals
            $totalJumlah = 0;
            $totalHarga = 0;
            $totalKeuntungan = 0;
            $namaBarangList = [];
            $errors = [];
            
            foreach ($items as $index => $item) {
                $idBarang = $item['id_barang'] ?? '';
                $jumlah = intval($item['jumlah'] ?? 0);
                $currentStok = intval($item['current_stok'] ?? 0);
                
                // Get fresh stock from database for validation
                $stmtCheck = $pdo->prepare("SELECT stok_total FROM barang WHERE id_barang = ?");
                $stmtCheck->execute([$idBarang]);
                $barangCheck = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                $dbStok = $barangCheck ? intval($barangCheck['stok_total']) : 0;
                
                // Validate each item using fresh DB stock
                if (empty($idBarang)) {
                    $errors[] = 'Item #' . ($index + 1) . ': ID barang tidak boleh kosong';
                }
                if ($jumlah <= 0) {
                    $errors[] = 'Item #' . ($index + 1) . ': Jumlah harus lebih dari 0';
                }
                if ($jumlah > $dbStok) {
                    $errors[] = 'Item #' . ($index + 1) . ': Stok tidak mencukupi (stok tersedia: ' . $dbStok . ')';
                }
                
                $totalJumlah += $jumlah;
                $totalHarga += floatval($item['total'] ?? $item['total_harga'] ?? 0);
                $totalKeuntungan += floatval($item['keuntungan'] ?? 0);
                $namaBarangList[] = $item['nama_barang'] ?? '';
            }
            
            // If there are errors, return them
            if (count($errors) > 0) {
                echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
                break;
            }
            
            foreach ($items as $item) {
                // Get current stock from database
                $idBarang = $item['id_barang'] ?? '';
                $jumlah = intval($item['jumlah'] ?? 0);
                
                // Get current stock direct from database every time
                $stmtGet = $pdo->prepare("SELECT stok_total FROM barang WHERE id_barang = ?");
                $stmtGet->execute([$idBarang]);
                $barangData = $stmtGet->fetch(PDO::FETCH_ASSOC);
                $currentStok = $barangData ? intval($barangData['stok_total']) : 0;
                
                // Calculate new stock - only reduce if stock > 0
                $newStok = max(0, $currentStok - $jumlah);
                
                // Update stock in database
                $stmt2 = $pdo->prepare("UPDATE barang SET stok_total = ? WHERE id_barang = ?");
                $stmt2->execute([$newStok, $idBarang]);
            }
            
            // Combine all item names with quantities
            $detailList = [];
            foreach ($items as $item) {
                $detailList[] = ($item['nama_barang'] ?? '') . ': ' . ($item['jumlah'] ?? 0) . ' pcs';
            }
            $namaBarang = implode(', ', $detailList);
            $negativeJumlah = -$totalJumlah;
            
            try {
                // Insert each item separately into history_penjualan
                foreach ($items as $item) {
                    $itemNamaBarang = ($item['nama_barang'] ?? '') . ': ' . ($item['jumlah'] ?? 0) . ' pcs';
                    $negativeJumlah = -intval($item['jumlah'] ?? 0);
                    $stmt3 = $pdo->prepare("INSERT INTO history_penjualan (id_barang, nama_barang, jumlah, harga_jual, total_harga, keuntungan) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt3->execute([
                        $item['id_barang'] ?? '',
                        $item['nama_barang'] ?? '',
                        $negativeJumlah,
                        $item['harga_jual'] ?? 0,
                        $item['total'] ?? $item['total_harga'] ?? 0,
                        $item['keuntungan'] ?? 0
                    ]);
                }
                
                // Also insert each item into penjualan table
                foreach ($items as $item) {
                    $stmt = $pdo->prepare("INSERT INTO penjualan (id_barang, nama_barang, harga_beli_pcs, harga_jual, jumlah, total_harga, keuntungan) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $item['id_barang'] ?? '',
                        $item['nama_barang'] ?? '',
                        $item['harga_beli_pcs'] ?? 0,
                        $item['harga_jual'] ?? 0,
                        $item['jumlah'] ?? 0,
                        $item['total'] ?? $item['total_harga'] ?? 0,
                        $item['keuntungan'] ?? 0
                    ]);
                }
                
                echo json_encode(['success' => true, 'message' => 'Transaksi berhasil disimpan']);
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
        } else {
            // Legacy format: single item
            $id_barang = $data['id_barang'] ?? '';
            $nama_barang = $data['nama_barang'] ?? '';
            $harga_beli_pcs = floatval($data['harga_beli_pcs'] ?? 0);
            $harga_jual = floatval($data['harga_jual'] ?? 0);
            $jumlah = intval($data['jumlah'] ?? 0);
            $total_harga = floatval($data['total_harga'] ?? ($data['total'] ?? 0));
            $keuntungan = floatval($data['keuntungan'] ?? 0);
            
            // Get current stock from database
            $stmtGet = $pdo->prepare("SELECT stok_total FROM barang WHERE id_barang = ?");
            $stmtGet->execute([$id_barang]);
            $barangData = $stmtGet->fetch(PDO::FETCH_ASSOC);
            $currentStok = $barangData ? intval($barangData['stok_total']) : 0;
            
            // Validate
            $errors = [];
            if (empty($id_barang)) {
                $errors[] = 'ID barang tidak boleh kosong';
            }
            if ($jumlah <= 0) {
                $errors[] = 'Jumlah harus lebih dari 0';
            }
            if ($currentStok > 0 && $jumlah > $currentStok) {
                $errors[] = 'Stok tidak mencukupi (stok tersedia: ' . $currentStok . ')';
            }
            if ($total_harga < 0) {
                $errors[] = 'Total harga tidak boleh negatif';
            }
            if ($keuntungan < 0) {
                $errors[] = 'Keuntungan tidak boleh negatif';
            }
            
            if (count($errors) > 0) {
                echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
                break;
            }
            
            try {
                // Insert transaction into penjualan table
                $stmt = $pdo->prepare("INSERT INTO penjualan (id_barang, nama_barang, harga_beli_pcs, harga_jual, jumlah, total_harga, keuntungan) VALUES (?, ?, ?, ?, ?, ?, ?)");
                
                if($stmt->execute([$id_barang, $nama_barang, $harga_beli_pcs, $harga_jual, $jumlah, $total_harga, $keuntungan])) {
                    // Also insert into history_penjualan with negative quantity
                    $stmt3 = $pdo->prepare("INSERT INTO history_penjualan (id_barang, nama_barang, jumlah, harga_jual, total_harga, keuntungan) VALUES (?, ?, ?, ?, ?, ?)");
                    $negativeJumlah = -$jumlah;
                    $stmt3->execute([$id_barang, $nama_barang, $negativeJumlah, $harga_jual, $total_harga, $keuntungan]);
                    
                    // Update stock in barang table
                    $newStok = $currentStok - $jumlah;
                    if ($newStok < 0) $newStok = 0;
                    
                    $stmt2 = $pdo->prepare("UPDATE barang SET stok_total = ? WHERE id_barang = ?");
                    $stmt2->execute([$newStok, $id_barang]);
                    
                    echo json_encode(['success' => true, 'message' => 'Transaksi berhasil disimpan']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan transaksi']);
                }
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
        }
        break;
        
    case 'DELETE':
        // Delete transaction(s) by waktu (timestamp)
        $waktu = $_GET['waktu'] ?? '';
        $id = $_GET['id'] ?? '';
        
        if ($waktu) {
            // Delete all transactions with the same waktu timestamp
            // First get transactions to restore stock
            $stmt = $pdo->prepare("SELECT * FROM penjualan WHERE waktu = ?");
            $stmt->execute([$waktu]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Restore stock for each item
            foreach ($transactions as $transaction) {
                $stmt2 = $pdo->prepare("UPDATE barang SET stok_total = stok_total + ? WHERE id_barang = ?");
                $stmt2->execute([$transaction['jumlah'], $transaction['id_barang']]);
            }
            
            // Delete all transactions with same waktu
            $stmt = $pdo->prepare("DELETE FROM penjualan WHERE waktu = ?");
            if($stmt->execute([$waktu])) {
                echo json_encode(['success' => true, 'message' => 'Transaksi berhasil dihapus']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menghapus transaksi']);
            }
        } elseif ($id) {
            // Get transaction first to restore stock (legacy single delete)
            $stmt = $pdo->prepare("SELECT * FROM penjualan WHERE id_penjualan = ?");
            $stmt->execute([$id]);
            $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($transaction) {
                // Restore stock
                $stmt2 = $pdo->prepare("UPDATE barang SET stok_total = stok_total + ? WHERE id_barang = ?");
                $stmt2->execute([$transaction['jumlah'], $transaction['id_barang']]);
            }
            
            $stmt = $pdo->prepare("DELETE FROM penjualan WHERE id_penjualan = ?");
            if($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Transaksi berhasil dihapus']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menghapus transaksi']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'waktu atau id diperlukan']);
        }
        break;
}
?>
