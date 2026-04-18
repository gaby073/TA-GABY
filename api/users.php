<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, username, password, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        
        echo json_encode($users);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // VALIDASI INPUT
    $errors = [];
    
    $username = trim($data['username'] ?? '');
    if (empty($username)) {
        $errors[] = 'Username tidak boleh kosong';
    } elseif (strlen($username) < 3) {
        $errors[] = 'Username minimal 3 karakter';
    }
    
    $password = $data['password'] ?? '';
    if (empty($password)) {
        $errors[] = 'Password tidak boleh kosong';
    } elseif (strlen($password) < 4) {
        $errors[] = 'Password minimal 4 karakter';
    }
    
    $role = $data['role'] ?? 'user';
    if (!in_array($role, ['admin', 'owner', 'user'])) {
        $errors[] = 'Role tidak valid';
    }
    
    if (count($errors) > 0) {
        echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
        exit;
    }
    
    try {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $role]);
        
        echo json_encode(['success' => true, 'message' => 'User berhasil ditambahkan!']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // VALIDASI INPUT
    $errors = [];
    
    $id = $data['id'] ?? '';
    if (empty($id)) {
        $errors[] = 'ID harus diisi';
    }
    
    $username = trim($data['username'] ?? '');
    if (empty($username)) {
        $errors[] = 'Username tidak boleh kosong';
    } elseif (strlen($username) < 3) {
        $errors[] = 'Username minimal 3 karakter';
    }
    
    $role = $data['role'] ?? 'user';
    if (!in_array($role, ['admin', 'owner', 'user'])) {
        $errors[] = 'Role tidak valid';
    }
    
    $password = $data['password'] ?? '';
    if (!empty($password) && strlen($password) < 4) {
        $errors[] = 'Password minimal 4 karakter';
    }
    
    if (count($errors) > 0) {
        echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
        exit;
    }
    
    try {
        if (!empty($password)) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET username = ?, role = ?, password = ? WHERE id = ?");
            $stmt->execute([$username, $role, $hashedPassword, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET username = ?, role = ? WHERE id = ?");
            $stmt->execute([$username, $role, $id]);
        }
        
        echo json_encode(['success' => true, 'message' => 'User berhasil diperbarui!']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'ID harus diisi!']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'User berhasil dihapus!']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'Method tidak diizinkan']);
}
?>
