import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/login.php', {
        username: username,
        password: password
      });
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert(response.data.message);
        // Redirect based on role
        const redirectUrl = response.data.redirect || '/dashboard';
        navigate(redirectUrl);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container">
      <div className="left-section">
        <img src="/berty.png" alt="Berty Shop" className="shop-image" />
      </div>
      <div className="right-section">
        <h1 className="welcome-text">SELAMAT DATANG</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
