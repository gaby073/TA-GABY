import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Laporan.css';

function Laporan() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState(null);
  const [totals, setTotals] = useState({ totalPenjualan: 0, totalKeuntungan: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchTransactions();
    }
  }, [navigate, filter, date]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/penjualan.php?filter=${filter}&date=${date}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setTransactions(data);
        
        // Calculate totals
        const totalPenjualan = data.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
        const totalKeuntungan = data.reduce((sum, item) => sum + parseFloat(item.keuntungan || 0), 0);
        setTotals({ totalPenjualan, totalKeuntungan });
      } else {
        setTransactions([]);
        setTotals({ totalPenjualan: 0, totalKeuntungan: 0 });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  if (!user) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2><i className="fas fa-store"></i> <span>Berty Shop</span></h2>
          <div className="admin-name">Admin: {user.username}</div>
        </div>
        
        <ul className="sidebar-menu">
          <li><a href="#" onClick={() => navigate('/admin-dashboard')}><span>Dashboard</span></a></li>
          <li><a href="#" onClick={() => navigate('/transaksi-penjualan')}><span>Transaksi Penjualan</span></a></li>
          <li><a href="#" onClick={() => navigate('/tabel-barang')}><span>Tabel Barang</span></a></li>
          <li><a href="#" onClick={() => navigate('/stok-masuk')}><span>Stok Masuk</span></a></li>
          <li><a href="#" className="active"><span>Laporan</span></a></li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="page-header">
          <h1>Laporan</h1>
        </div>

        {/* Notification Banner */}
        <div className="notification-banner" onClick={() => navigate('/login')}>
          <i className="fas fa-info-circle"></i>
          <span>Login sebagai Owner untuk melihat rekapan keuntungan toko</span>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'daily' ? 'active' : ''}`}
              onClick={() => setFilter('daily')}
            >
              Harian
            </button>
            <button 
              className={`filter-btn ${filter === 'monthly' ? 'active' : ''}`}
              onClick={() => setFilter('monthly')}
            >
              Bulanan
            </button>
          </div>
          
          <div className="date-picker">
            <label>Tanggal: </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon blue">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="summary-info">
              <h3>{formatRupiah(totals.totalPenjualan)}</h3>
              <p>Total Penjualan</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon green">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="summary-info">
              <h3>{formatRupiah(totals.totalKeuntungan)}</h3>
              <p>Total Keuntungan</p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="content-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                <th>Jumlah Beli</th>
                <th>Total Harga Jual</th>
                <th>Total Keuntungan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.waktu ? new Date(item.waktu).toLocaleString('id-ID') : '-'}</td>
                    <td>{item.nama_barang_list || '-'}</td>
                    <td>{item.total_jumlah}</td>
                    <td>{formatRupiah(item.total_harga)}</td>
                    <td style={{color: 'green'}}>{formatRupiah(item.total_keuntungan)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>Tidak ada transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <h3>Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin logout?</p>
            <div className="confirm-modal-buttons">
              <button className="btn-confirm-yes" onClick={handleLogoutYes}>YA</button>
              <button className="btn-confirm-no" onClick={handleLogoutNo}>TIDAK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laporan;
