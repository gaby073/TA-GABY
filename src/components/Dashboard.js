import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
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
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <h1>Selamat Datang di Dashboard Berty Shop!</h1>
      <div className="user-info">Login sebagai: {user.username}</div>
      <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
    </div>
  );
}

export default Dashboard;
