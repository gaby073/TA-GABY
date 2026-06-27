<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Check if requesting next_id
        if (isset($_GET['action']) && $_GET['action'] === 'next_id') {
            $stmt = $pdo->query("SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1");
            $lastItem = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($lastItem) {
                $lastNum = intval(str_replace('BRG-', '', $lastItem['id_barang']));
                $newNum = $lastNum + 1;
                $nextId = 'BRG-' . str_pad($newNum, 3, '0', STR_PAD_LEFT);
            } else {
                $nextId = 'BRG-001';
            }
            echo json_encode(['next_id' => $nextId]);
            break;
        }
        
        // Get all barang - get all columns
        $stmt = $pdo->query("SELECT * FROM barang ORDER BY id_barang DESC");
        $barang = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($barang);
        break;
        
    case 'POST':
        // Add new barang
        $data = json_decode(file_get_contents('php://input'), true);
        
        // VALIDASI INPUT
        $errors = [];
        
        // Validate required fields
        $nama_barang = trim($data['nama_barang'] ?? '');
        if (empty($nama_barang)) {
            $errors[] = 'Nama barang tidak boleh kosong';
        }
        
        $satuan_beli = trim($data['satuan_beli'] ?? '');
        if (empty($satuan_beli)) {
            $errors[] = 'Satuan beli tidak boleh kosong';
        }
        
        // Validate numeric fields - must be positive
        $isi_satuan = intval($data['isi_satuan'] ?? 0);
        if ($isi_satuan <= 0) {
            $errors[] = 'Isi satuan harus lebih dari 0';
        }
        
        $jumlah_beli = intval($data['jumlah_beli'] ?? 0);
        if ($jumlah_beli < 0) {
            $errors[] = 'Jumlah beli tidak boleh negatif';
        }
        
        $harga_beli = floatval($data['harga_beli'] ?? 0);
        if ($harga_beli < 0) {
            $errors[] = 'Harga beli tidak boleh negatif';
        }
        
        $harga_jual = floatval($data['harga_jual'] ?? 0);
        if ($harga_jual < 0) {
            $errors[] = 'Harga jual tidak boleh negatif';
        }
        
        $persen_untungk = floatval($data['persen_untungk'] ?? 0);
        if ($persen_untungk < 0) {
            $errors[] = 'Persen keuntungan tidak boleh negatif';
        }
        
        // If there are errors, return them
        if (count($errors) > 0) {
            echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
            break;
        }
        
        // Auto generate id_barang if not provided
        $id_barang = $data['id_barang'] ?? '';
        if (empty($id_barang) || $id_barang === 'AUTO') {
            // Get last ID
            $stmt = $pdo->query("SELECT id_barang FROM barang ORDER BY id_barang DESC LIMIT 1");
            $lastItem = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($lastItem) {
                // Extract number from last ID (e.g., "BRG-001" -> 1)
                $lastNum = intval(str_replace('BRG-', '', $lastItem['id_barang']));
                $newNum = $lastNum + 1;
                $id_barang = 'BRG-' . str_pad($newNum, 3, '0', STR_PAD_LEFT);
            } else {
                $id_barang = 'BRG-001';
            }
        }
        
        $keterangan = $data['keterangan'] ?? '';
        $stok_total = $isi_satuan * $jumlah_beli;
        $harga_beli_pcs = $stok_total > 0 ? ($harga_beli / $stok_total) : 0;
        
        try {
            $stmt = $pdo->prepare("INSERT INTO barang (id_barang, nama_barang, satuan_beli, isi_satuan, jumlah_beli, harga_beli, harga_beli_pcs, persen_untungk, harga_jual, stok_total, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            if($stmt->execute([$id_barang, $nama_barang, $satuan_beli, $isi_satuan, $jumlah_beli, $harga_beli, $harga_beli_pcs, $persen_untungk, $harga_jual, $stok_total, $keterangan])) {
                echo json_encode(['success' => true, 'message' => 'Barang berhasil ditambahkan', 'id_barang' => $id_barang]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menambahkan barang']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Update barang - only update fields that are provided
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Ensure last_stok_masuk and updated_at columns exist
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'last_stok_masuk'");
            if (!$stmt->fetch()) {
                $pdo->exec("ALTER TABLE barang ADD COLUMN last_stok_masuk INT NOT NULL DEFAULT 0 AFTER stok_total");
            }
            $stmt = $pdo->query("SHOW COLUMNS FROM barang LIKE 'updated_at'");
            if (!$stmt->fetch()) {
                $pdo->exec("ALTER TABLE barang ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL AFTER last_stok_masuk");
            }
        } catch (Exception $e) {
            // Continue even if columns can't be added
        }
        
        $id_barang = $data['id_barang'] ?? '';
        
        if (empty($id_barang)) {
            echo json_encode(['success' => false, 'message' => 'ID barang diperlukan']);
            break;
        }
        
        // Check if this is a partial update (only stock update from StokMasuk)
        $isStockOnly = isset($data['stok_total']) && !isset($data['nama_barang']) && !isset($data['harga_beli']);
        
        if ($isStockOnly) {
            // Update stok_total and last_stok_masuk
            $stok_total = intval($data['stok_total'] ?? 0);
            if ($stok_total < 0) {
                echo json_encode(['success' => false, 'message' => 'Stok total tidak boleh negatif']);
                break;
            }
            $last_stok_masuk = intval($data['last_stok_masuk'] ?? 0);
            $updated_at = $data['updated_at'] ?? date('Y-m-d H:i:s');
            
            $stmt = $pdo->prepare("UPDATE barang SET stok_total = ?, last_stok_masuk = ?, updated_at = ? WHERE id_barang = ?");
            if($stmt->execute([$stok_total, $last_stok_masuk, $updated_at, $id_barang])) {
                echo json_encode(['success' => true, 'message' => 'Stok berhasil diupdate']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal mengupdate stok']);
            }
        } else {
            // Full update - validate input
            $errors = [];
            
            $nama_barang = trim($data['nama_barang'] ?? '');
            if (empty($nama_barang)) {
                $errors[] = 'Nama barang tidak boleh kosong';
            }
            
            $satuan_beli = trim($data['satuan_beli'] ?? '');
            if (empty($satuan_beli)) {
                $errors[] = 'Satuan beli tidak boleh kosong';
            }
            
            $isi_satuan = intval($data['isi_satuan'] ?? 0);
            if ($isi_satuan <= 0) {
                $errors[] = 'Isi satuan harus lebih dari 0';
            }
            
            $jumlah_beli = intval($data['jumlah_beli'] ?? 0);
            if ($jumlah_beli < 0) {
                $errors[] = 'Jumlah beli tidak boleh negatif';
            }
            
            $harga_beli = floatval($data['harga_beli'] ?? 0);
            if ($harga_beli < 0) {
                $errors[] = 'Harga beli tidak boleh negatif';
            }
            
            $harga_jual = floatval($data['harga_jual'] ?? 0);
            if ($harga_jual < 0) {
                $errors[] = 'Harga jual tidak boleh negatif';
            }
            
            $persen_untungk = floatval($data['persen_untungk'] ?? 0);
            if ($persen_untungk < 0) {
                $errors[] = 'Persen keuntungan tidak boleh negatif';
            }
            
            if (count($errors) > 0) {
                echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
                break;
            }
            
            $keterangan = $data['keterangan'] ?? '';
            $stok_total = $data['stok_total'] ?? ($isi_satuan * $jumlah_beli);
            $total_pcs_beli = $isi_satuan * $jumlah_beli;
            $harga_beli_pcs_calc = $total_pcs_beli > 0 ? ($harga_beli / $total_pcs_beli) : 0;
            
            $stmt = $pdo->prepare("UPDATE barang SET nama_barang = ?, satuan_beli = ?, isi_satuan = ?, jumlah_beli = ?, harga_beli = ?, harga_beli_pcs = ?, persen_untungk = ?, harga_jual = ?, stok_total = ?, keterangan = ? WHERE id_barang = ?");
            
            if($stmt->execute([$nama_barang, $satuan_beli, $isi_satuan, $jumlah_beli, $harga_beli, $harga_beli_pcs_calc, $persen_untungk, $harga_jual, $stok_total, $keterangan, $id_barang])) {
                echo json_encode(['success' => true, 'message' => 'Barang berhasil diupdate']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal mengupdate barang']);
            }
        }
        break;
        
    case 'DELETE':
        // Delete barang
        $id_barang = $_GET['id_barang'] ?? '';
        
        $stmt = $pdo->prepare("DELETE FROM barang WHERE id_barang = ?");
        
        if($stmt->execute([$id_barang])) {
            echo json_encode(['success' => true, 'message' => 'Barang berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus barang']);
        }
        break;
}
?>
