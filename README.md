# Berty Shop - React.js + PHP

## 📋 Persyaratan
- Node.js (download di nodejs.org)
- XAMPP (Apache + MySQL)

## 🚀 Cara Menjalankan

### 1. Setup Database
1. Buka XAMPP Control Panel
2. Start **Apache** dan **MySQL**
3. Buka browser: `http://localhost/phpmyadmin`
4. Buat database `ta_gaby`
5. Jalankan query SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Pindahkan Folder ke htdocs
- Copy folder `TA-Gaby` ke `C:\xampp\htdocs\`

### 3. Insert Admin
- Buka browser: `http://localhost/TA-Gaby/insert_admin.php`

### 4. Install Dependencies React
Buka terminal/cmd di folder `C:\xampp\htdocs\TA-Gaby`:
```bash
npm install
```

### 5. Jalankan React
```bash
npm start
```

### 6. Akses Aplikasi
- Browser otomatis buka: `http://localhost:3000`
- Login dengan:
  - Username: `Bertyshop20`
  - Password: `larismajaya123`

## 📁 Struktur Folder
```
TA-Gaby/
├── api/              # Backend PHP
│   └── login.php
├── public/           # Static files
├── src/              # React source
│   ├── components/
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── App.js
│   └── index.js
├── config.php        # Database config
├── insert_admin.php  # Script insert admin
└── package.json
```

## ⚙️ Teknologi
- Frontend: React.js
- Backend: PHP
- Database: MySQL
- HTTP Client: Axios
