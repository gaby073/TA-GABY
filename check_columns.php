<?php
// Check current columns in barang table

require_once 'config.php';

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM barang");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Current columns in barang table:<br>";
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")<br>";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
