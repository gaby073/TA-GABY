document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('login_process.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Redirect based on role
            const redirectUrl = data.redirect || 'dashboard.php';
            window.location.href = redirectUrl;
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        alert('Terjadi kesalahan: ' + error);
    });
});
