<?php
// API for stock history (stok_masuk)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all stock history - use stored values from the table
        $stmt = $pdo->query("
            SELECT 
                sm.id_stok_masuk,
                sm.id_barang,
                sm.nama_barang,
                sm.satuan_beli,
                sm.isi_satuan,
                sm.stok_awal,
                sm.jumlah_masuk as stok_masuk,
                sm.stok_total,
                sm.keterangan,
                sm.tanggal_masuk
            FROM stok_masuk sm
            ORDER BY sm.id_stok_masuk DESC
        ");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        break;
        
    case 'POST':
        // Add new stock entry - store all required values
        $data = json_decode(file_get_contents('php://input'), true);
        
        // VALIDASI INPUT
        $errors = [];
        
        $id_barang = trim($data['id_barang'] ?? '');
        if (empty($id_barang)) {
            $errors[] = 'ID barang tidak boleh kosong';
        }
        
        $nama_barang = trim($data['nama_barang'] ?? '');
        if (empty($nama_barang)) {
            $errors[] = 'Nama barang tidak boleh kosong';
        }
        
        $jumlah_masuk = intval($data['stok_tambah'] ?? $data['jumlah_masuk'] ?? 0);
        if ($jumlah_masuk <= 0) {
            $errors[] = 'Jumlah masuk harus lebih dari 0';
        }
        
        $isi_satuan = intval($data['isi_satuan'] ?? 1);
        if ($isi_satuan <= 0) {
            $errors[] = 'Isi satuan harus lebih dari 0';
        }
        
        $harga_beli_satuan = floatval($data['harga_beli_satuan'] ?? 0);
        if ($harga_beli_satuan < 0) {
            $errors[] = 'Harga beli tidak boleh negatif';
        }
        
        if (count($errors) > 0) {
            echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
            break;
        }
        
        $satuan_beli = $data['satuan_beli'] ?? 'DUS';
        $stok_awal = intval($data['stok_awal'] ?? 0);
        $stok_total = intval($data['stok_total'] ?? 0);
        $keterangan = $data['keterangan'] ?? '';
        
        try {
            $stmt = $pdo->prepare("INSERT INTO stok_masuk (id_barang, nama_barang, satuan_beli, isi_satuan, jumlah_masuk, stok_awal, stok_total, harga_beli_satuan, tanggal_masuk, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)");
            
            if($stmt->execute([$id_barang, $nama_barang, $satuan_beli, $isi_satuan, $jumlah_masuk, $stok_awal, $stok_total, $harga_beli_satuan, $keterangan])) {
                echo json_encode(['success' => true, 'message' => 'Stok masuk berhasil dicatat']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal mencatat stok masuk']);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Delete stock history entry - use id_stok_masuk
        $id = $_GET['id'] ?? '';
        
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM stok_masuk WHERE id_stok_masuk = ?");
            if($stmt->execute([$id])) {
                echo json_encode(['success' => true, 'message' => 'Data berhasil dihapus']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menghapus data']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'ID diperlukan']);
        }
        break;
}
?>
