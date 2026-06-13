import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const handleLogoutYes = () => {
    setShowConfirmModal(false);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogoutNo = () => {
    setShowConfirmModal(false);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <h1>Selamat Datang di Dashboard Berty Shop!</h1>
      <div className="user-info">Login sebagai: {user.username}</div>
      <button onClick={handleLogout} className="logout-btn">LOGOUT</button>

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#28a745', padding: '30px 40px', borderRadius: '12px',
            textAlign: 'center', maxWidth: '400px'
          }}>
            <h3 style={{color: 'white', marginBottom: '15px', fontSize: '20px'}}>Konfirmasi Logout</h3>
            <p style={{color: 'white', marginBottom: '25px', fontSize: '16px'}}>Apakah Anda yakin ingin logout?</p>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button onClick={handleLogoutYes} style={{
                padding: '12px 40px', background: 'white', color: '#28a745',
                border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer'
              }}>YA</button>
              <button onClick={handleLogoutNo} style={{
                padding: '12px 40px', background: 'white', color: '#dc3545',
                border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer'
              }}>TIDAK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
