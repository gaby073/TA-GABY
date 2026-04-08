<?php
require_once 'config.php';

$username = 'bettysartika';
$password = 'bertystore321';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Update existing user's password to hashed
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $stmt->execute([$hashed_password, $username]);
        echo "Password untuk admin '$username' berhasil di-hash!\n";
        echo "Password lama (plain text): $password\n";
        echo "Password baru (hashed): $hashed_password\n";
    } else {
        // Insert new admin if doesn't exist
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')");
        $stmt->execute([$username, $hashed_password]);
        echo "Admin '$username' berhasil dibuat dengan password ter-hash!\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
