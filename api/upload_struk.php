<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Memeriksa apakah ada file yang diunggah
    if (!isset($_FILES['struk']) || $_FILES['struk']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Tidak ada file yang diunggah atau terjadi kesalahan saat mengunggah.']);
        exit;
    }

    $file = $_FILES['struk'];
    $keterangan = $_POST['keterangan'] ?? '';
    $judul_belanja = $_POST['judul_belanja'] ?? '';
    $nama_toko = $_POST['nama_toko'] ?? '';
    $tanggal_belanja = $_POST['tanggal_belanja'] ?? null;
    $total_belanja = $_POST['total_belanja'] ?? 0;
    $status = $_POST['status'] ?? 'Selesai';

    // Validasi tipe file
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Hanya file gambar (JPG, PNG, GIF, WEBP) yang diizinkan.']);
        exit;
    }

    // Pastikan direktori tujuan ada
    $uploadDir = '../uploads/struk/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate nama file unik agar tidak bentrok
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFileName = 'struk_' . time() . '_' . uniqid() . '.' . $fileExtension;
    $targetPath = $uploadDir . $newFileName;

    // Pindahkan file ke direktori tujuan
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Simpan ke database
        try {
            $stmt = $pdo->prepare("INSERT INTO struk_belanja (nama_file_gambar, judul_belanja, nama_toko, tanggal_belanja, total_belanja, status, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if ($stmt->execute([$newFileName, $judul_belanja, $nama_toko, $tanggal_belanja, $total_belanja, $status, $keterangan])) {
                echo json_encode(['success' => true, 'message' => 'Struk belanja berhasil diunggah.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Gagal menyimpan data struk ke database.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal memindahkan file yang diunggah.']);
    }
} elseif ($method === 'GET') {
    // Jika perlu mengambil daftar struk
    try {
        $stmt = $pdo->query("SELECT * FROM struk_belanja ORDER BY id_struk DESC");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        try {
            $stmt = $pdo->prepare("SELECT nama_file_gambar FROM struk_belanja WHERE id_struk = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $filePath = '../uploads/struk/' . $row['nama_file_gambar'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                $delStmt = $pdo->prepare("DELETE FROM struk_belanja WHERE id_struk = ?");
                if ($delStmt->execute([$id])) {
                    echo json_encode(['success' => true, 'message' => 'Data berhasil dihapus']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Gagal menghapus data dari database']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID diperlukan']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan.']);
}
?>
