import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [barang, setBarang] = useState([]);
  const [stats, setStats] = useState({ totalPenjualan: 0, totalKeuntungan: 0 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch barang
      const barangResponse = await axios.get('/api/barang.php?_t=' + Date.now());
      const barangData = Array.isArray(barangResponse.data) ? barangResponse.data : [];
      setBarang(barangData);

      // Fetch penjualan for stats
      const penjualanResponse = await axios.get('/api/penjualan.php?filter=all');
      const penjualanData = Array.isArray(penjualanResponse.data) ? penjualanResponse.data : [];

      // Calculate totals from grouped data
      const totalPenjualan = penjualanData.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
      const totalKeuntungan = penjualanData.reduce((sum, item) => sum + parseFloat(item.total_keuntungan || 0), 0);

      setStats({ totalPenjualan, totalKeuntungan });
    } catch (error) {
      console.error('Error fetching data:', error);
      setBarang([]);
    }
  };

  const handleLogout = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmModal(false);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToExcel = (data) => {
    const headers = ['No', 'ID', 'Nama', 'Satuan', 'Isi', 'Harga Beli', 'Hbeli/Pcs', '% Untung', 'Untung/Pcs', 'Harga Jual', 'Stok Total'];
    const rows = data.map((item, index) => [
      index + 1,
      item.id_barang,
      item.nama_barang,
      item.satuan_beli,
      item.isi_satuan,
      item.harga_beli,
      item.harga_beli_pcs,
      item.persen_untungk,
      item.harga_jual - item.harga_beli_pcs,
      item.harga_jual,
      item.stok_total !== undefined && item.stok_total !== null ? item.stok_total : 0
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tabel_barang_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = (data) => {
    const printWindow = window.open('', '_blank');
    const tableRows = data.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.id_barang}</td>
        <td>${item.nama_barang}</td>
        <td>${item.satuan_beli}</td>
        <td>${item.isi_satuan}</td>
        <td>${formatRupiah(item.harga_beli)}</td>
        <td>${formatRupiah(item.harga_beli_pcs)}</td>
        <td>${item.persen_untungk}%</td>
        <td>${formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
        <td>${formatRupiah(item.harga_jual)}</td>
        <td style={{fontWeight: 'bold'}}>${item.stok_total !== undefined && item.stok_total !== null ? item.stok_total : 0}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export PDF - Tabel Barang</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background-color: #667eea; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Tabel Barang - Berty Shop</h1>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama</th>
              <th>Satuan</th>
              <th>Isi</th>
              <th>Harga Beli</th>
              <th>Hbeli/Pcs</th>
              <th>% Untung</th>
              <th>Untung/Pcs</th>
              <th>Harga Jual</th>
              <th>Stok Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
          <li><a href="#" onClick={() => navigate('/admin-dashboard')} className="active"><span>Dashboard</span></a></li>
          <li><a href="#" onClick={() => navigate('/transaksi-penjualan')}><span>Transaksi Penjualan</span></a></li>
          <li><a href="#" onClick={() => navigate('/tabel-barang')}><span>Tabel Barang</span></a></li>
          <li><a href="#" onClick={() => navigate('/stok-masuk')}><span>Stok Masuk</span></a></li>
          <li><a href="#" onClick={() => navigate('/stok-keluar')}><span>Stok Keluar</span></a></li>
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
          <h1>Dashboard</h1>
          <div className="date">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-shopping-cart"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(stats.totalPenjualan)}</h3>
              <p>Total Penjualan</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-money-bill-wave"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(stats.totalKeuntungan)}</h3>
              <p>Total Keuntungan</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><i className="fas fa-boxes"></i></div>
            <div className="stat-info">
              <h3>{barang.length}</h3>
              <p>Jumlah Barang</p>
            </div>
          </div>
        </div>

        {/* Tabel Barang Section */}
        <div className="content-section">
          <div className="section-header">
            <h2><i className="fas fa-box"></i> Tabel Barang</h2>
            <div className="export-buttons">
              <button className="btn btn-success" onClick={() => exportToExcel(barang)}>
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
              <button className="btn btn-danger" onClick={() => exportToPDF(barang)}>
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Satuan</th>
                <th>Isi</th>
                <th>Harga Beli</th>
                <th>Hbeli/Pcs</th>
                <th>% Untung</th>
                <th>Untung/Pcs</th>
                <th>Harga Jual</th>
                <th style={{backgroundColor: '#ff69b4', color: 'white'}}>Stok Total</th>
              </tr>
            </thead>
            <tbody>
              {barang.length > 0 ? (
                barang.map((item) => (
                  <tr key={item.id_barang}>
                    <td>{item.id_barang}</td>
                    <td>{item.nama_barang}</td>
                    <td>{item.satuan_beli}</td>
                    <td>{item.isi_satuan}</td>
                    <td>{formatRupiah(item.harga_beli)}</td>
                    <td>{formatRupiah(item.harga_beli_pcs)}</td>
                    <td>{item.persen_untungk}%</td>
                    <td>{formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
                    <td>{formatRupiah(item.harga_jual)}</td>
                    <td style={{backgroundColor: '#ffb6c1', fontWeight: 'bold'}}>{item.stok_total !== undefined && item.stok_total !== null ? item.stok_total : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{textAlign: 'center'}}>Tidak ada data barang</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showConfirmModal && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
              <h3>Konfirmasi Logout</h3>
              <p>Apakah Anda yakin ingin logout?</p>
              <div className="confirm-modal-buttons">
                <button className="btn-confirm-yes" onClick={handleConfirmYes}>YA</button>
                <button className="btn-confirm-no" onClick={handleConfirmNo}>TIDAK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
