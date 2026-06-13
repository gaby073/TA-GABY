<?php
// 1. Header untuk Keamanan & CORS
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// 2. Handle Preflight Request (Sangat Penting untuk Axios)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data JSON dari Axios
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username dan password harus diisi!']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verifikasi: Gunakan password_verify jika di DB sudah di-hash
        // Atau pakai ($password === $user['password']) HANYA jika masih plain text di DB
        if ($user && password_verify($password, $user['password'])) {
            
            // Tentukan redirect berdasarkan role
            $redirect = '/dashboard';
            if ($user['role'] === 'admin') {
                $redirect = '/admin-dashboard';
            } elseif ($user['role'] === 'owner') {
                $redirect = '/owner-dashboard';
            }
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login berhasil!',
                'redirect' => $redirect,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Username atau password salah!']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error database: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}
?>