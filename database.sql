CREATE DATABASE IF NOT EXISTS ta_gaby;
USE ta_gaby;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);

INSERT INTO users (username, password, role) VALUES 
('Bertyshop20', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
