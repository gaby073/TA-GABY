<?php
session_start();
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        // Redirect based on role
        if ($user['role'] === 'admin') {
            echo json_encode(['success' => true, 'message' => 'Login berhasil!', 'redirect' => 'admin_dashboard.php']);
        } else {
            echo json_encode(['success' => true, 'message' => 'Login berhasil!', 'redirect' => 'dashboard.php']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Username atau password salah!']);
    }
    exit;
}
?>
