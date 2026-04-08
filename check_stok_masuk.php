<?php
// Check columns in stok_masuk table

require_once 'config.php';

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM stok_masuk");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns in stok_masuk table:<br>";
    foreach ($columns as $col) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")<br>";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
