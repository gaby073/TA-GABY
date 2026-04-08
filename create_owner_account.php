<?php
// Script untuk membuat akun owner
// Password: owner123 (akan di-hash)

$host = 'localhost';
$dbname = 'ta_gaby';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Cek apakah owner sudah ada
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute(['owner']);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        echo "Akun owner sudah ada!\n";
    } else {
        // Hash password
        $hashedPassword = password_hash('owner123', PASSWORD_DEFAULT);
        
        // Insert owner
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
        $stmt->execute(['owner', $hashedPassword, 'owner']);
        
        echo "Akun owner berhasil dibuat!\n";
        echo "Username: owner\n";
        echo "Password: owner123\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
