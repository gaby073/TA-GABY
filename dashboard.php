<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Berty Shop</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #ffc0cb 0%, #ffb6c1 100%);
        }
        h1 {
            color: white;
            font-size: 48px;
            margin-bottom: 20px;
        }
        .user-info {
            color: white;
            font-size: 24px;
            margin-bottom: 30px;
        }
        .logout-btn {
            padding: 15px 40px;
            background: #ff69b4;
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            cursor: pointer;
            text-decoration: none;
        }
        .logout-btn:hover {
            background: #ff1493;
        }
    </style>
</head>
<body>
    <h1>Selamat Datang di Dashboard Berty Shop!</h1>
    <div class="user-info">Login sebagai: <?php echo htmlspecialchars($_SESSION['username']); ?></div>
    <a href="logout.php" class="logout-btn">LOGOUT</a>
</body>
</html>
