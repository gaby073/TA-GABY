<?php
require_once 'config.php';

$username = 'bettysartika';
$password = 'bertystore321';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')");
    $stmt->execute([$username, $hashed_password]);
    echo "Admin berhasil ditambahkan!\n";
    echo "Username: $username\n";
    echo "Password: $password\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
