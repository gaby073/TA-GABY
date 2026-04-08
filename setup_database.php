<?php
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Connect without database first
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS ta_gaby");
    echo "Database 'ta_gaby' created or already exists.\n";
    
    // Use the database
    $pdo->exec("USE ta_gaby");
    
    // Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "Table 'users' created or already exists.\n";
    
    // Create barang table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS barang (
            id_barang VARCHAR(20) PRIMARY KEY,
            nama_barang VARCHAR(100) NOT NULL,
            satuan_beli VARCHAR(20) NOT NULL,
            isi_satuan INT NOT NULL,
            harga_beli DECIMAL(12,2) NOT NULL,
            harga_beli_pcs DECIMAL(12,2) NOT NULL,
            persen_untung DECIMAL(5,2) NOT NULL,
            harga_jual DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    echo "Table 'barang' created or already exists.\n";
    
    // Insert the admin user with hashed password
    $adminUsername = 'bettysartika';
    $adminPassword = 'bertystore321';
    $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$adminUsername]);
    
    if ($stmt->fetch()) {
        // Update existing user
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $stmt->execute([$hashedPassword, $adminUsername]);
        echo "Admin password updated successfully!\n";
    } else {
        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')");
        $stmt->execute([$adminUsername, $hashedPassword]);
        echo "Admin created successfully!\n";
    }
    
    echo "Username: $adminUsername\n";
    echo "Password: $adminPassword\n";
    echo "Hashed password stored in database.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
