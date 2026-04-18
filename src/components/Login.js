import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const response = await axios.post('http://localhost/TA-GABY/api/login.php', {
        username: username,
        password: password
      });
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          const redirectUrl = response.data.redirect || '/dashboard';
          navigate(redirectUrl);
        }, 1500);
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      setErrorMessage(errMsg);
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
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="login-btn">LOGIN</button>
        </form>

        {showSuccessModal && (
          <div className="success-modal-overlay">
            <div className="success-modal-content">
              <div className="success-icon">✓</div>
              <p>Berhasil Login</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
