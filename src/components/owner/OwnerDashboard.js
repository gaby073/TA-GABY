import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [user, setUser] = useState(null);
  const [barang, setBarang] = useState([]);
  const [stats, setStats] = useState({
    totalPenjualan: 0,
    totalKeuntungan: 0,
    jumlahBarang: 0
  });
  const [salesStats, setSalesStats] = useState([]);
  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem('ownerActiveMenu') || 'dashboard';
  });
  const navigate = useNavigate();

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToExcel = (data) => {
    const headers = ['ID', 'Nama', 'Satuan', 'Isi', 'Harga Beli', 'Hbeli/Pcs', '% Untung', 'Untung/Pcs', 'Harga Jual', 'Stok Total'];
    const rows = data.map(item => [
      item.id_barang,
      item.nama_barang,
      item.satuan_beli,
      item.isi_satuan,
      item.harga_beli,
      item.harga_beli_pcs,
      item.persen_untungk,
      item.harga_jual - item.harga_beli_pcs,
      item.harga_jual,
      item.stok_total || (item.isi_satuan * (item.jumlah_beli || 1)) || '-'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `barang_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = (data) => {
    const printWindow = window.open('', '_blank');
    const tableRows = data.map(item => `
      <tr>
        <td>${item.id_barang}</td>
        <td>${item.nama_barang}</td>
        <td>${item.satuan_beli}</td>
        <td>${item.isi_satuan}</td>
        <td>${formatRupiah(item.harga_beli)}</td>
        <td>${formatRupiah(item.harga_beli_pcs)}</td>
        <td>${item.persen_untungk}%</td>
        <td>${formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
        <td>${formatRupiah(item.harga_jual)}</td>
        <td>${item.stok_total || (item.isi_satuan * (item.jumlah_beli || 1)) || '-'}</td>
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
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #ff69b4; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Tabel Barang - Berty Shop</h1>
        <table>
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

  const handleMenuClick = (menu) => {
    localStorage.setItem('ownerActiveMenu', menu);
    setActiveMenu(menu);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'owner') {
        navigate('/login');
      } else {
        setUser(parsedUser);
        fetchData();
      }
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      // Fetch barang
      const barangResponse = await axios.get('/api/barang.php');
      const barangData = Array.isArray(barangResponse.data) ? barangResponse.data : [];
      setBarang(barangData);

      // Fetch penjualan for stats
      const penjualanResponse = await axios.get('/api/penjualan.php?filter=all');
      const penjualanData = Array.isArray(penjualanResponse.data) ? penjualanResponse.data : [];

      // Calculate stats
      const totalPenjualan = penjualanData.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
      const totalKeuntungan = penjualanData.reduce((sum, item) => sum + parseFloat(item.total_keuntungan || 0), 0);

      setStats({
        totalPenjualan,
        totalKeuntungan,
        jumlahBarang: barangData.length
      });

      // Fetch sales statistics per product
      const salesStatsResponse = await axios.get('/api/penjualan.php?stats=true');
      const salesStatsData = Array.isArray(salesStatsResponse.data) ? salesStatsResponse.data : [];
      setSalesStats(salesStatsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="owner-content">
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
                  <p>Keuntungan</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><i className="fas fa-boxes"></i></div>
                <div className="stat-info">
                  <h3>{stats.jumlahBarang}</h3>
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
                        <td style={{backgroundColor: '#ffb6c1', fontWeight: 'bold'}}>{item.stok_total || (item.isi_satuan * (item.jumlah_beli || 1)) || '-'}</td>
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
          </div>
        );
      case 'laporan':
        return <LaporanKeuntungan />;
      case 'manajemen':
        return <ManajemenUser />;
      case 'tabel':
        return <TabelBarangOwner barang={barang} salesStats={salesStats} />;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="owner-layout">
      {/* Sidebar */}
      <div className="owner-sidebar">
        <div className="sidebar-header">
          <h2><span>Berty Shop</span></h2>
          <div className="owner-name">Owner: {user.username}</div>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <a href="#" onClick={() => handleMenuClick('dashboard')} className={activeMenu === 'dashboard' ? 'active' : ''}>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleMenuClick('laporan')} className={activeMenu === 'laporan' ? 'active' : ''}>
              <span>Laporan Keuntungan</span>
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleMenuClick('manajemen')} className={activeMenu === 'manajemen' ? 'active' : ''}>
              <span>Manajemen User</span>
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleMenuClick('tabel')} className={activeMenu === 'tabel' ? 'active' : ''}>
              <span>Tabel Barang</span>
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="owner-main-content">
        {renderContent()}
      </div>
    </div>
  );
}

// Laporan Keuntungan Component
function LaporanKeuntungan() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totals, setTotals] = useState({ totalPenjualan: 0, totalKeuntungan: 0, totalItems: 0 });
  const [recapData, setRecapData] = useState([]);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filter, date]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/api/penjualan.php?filter=${filter}&date=${date}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setTransactions(data);
        
        // Use total_jumlah and total_keuntungan from grouped API response
        const totalPenjualan = data.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
        const totalKeuntungan = data.reduce((sum, item) => sum + parseFloat(item.total_keuntungan || 0), 0);
        const totalItems = data.reduce((sum, item) => sum + parseInt(item.total_jumlah || 0), 0);
        setTotals({ totalPenjualan, totalKeuntungan, totalItems });
        
        // Create recap data
        if (filter === 'daily') {
          // Group by date for daily view
          const grouped = {};
          data.forEach(item => {
            const day = item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID') : 'Unknown';
            if (!grouped[day]) {
              grouped[day] = { tanggal: day, totalPenjualan: 0, totalKeuntungan: 0, jumlahTransaksi: 0 };
            }
            grouped[day].totalPenjualan += parseFloat(item.total_harga || 0);
            grouped[day].totalKeuntungan += parseFloat(item.total_keuntungan || 0);
            grouped[day].jumlahTransaksi += 1;
          });
          setRecapData(Object.values(grouped));
        } else {
          // Group by month for monthly view
          const grouped = {};
          data.forEach(item => {
            const month = item.waktu ? new Date(item.waktu).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : 'Unknown';
            if (!grouped[month]) {
              grouped[month] = { tanggal: month, totalPenjualan: 0, totalKeuntungan: 0, jumlahTransaksi: 0 };
            }
            grouped[month].totalPenjualan += parseFloat(item.total_harga || 0);
            grouped[month].totalKeuntungan += parseFloat(item.total_keuntungan || 0);
            grouped[month].jumlahTransaksi += 1;
          });
          setRecapData(Object.values(grouped));
        }
      } else {
        setTransactions([]);
        setTotals({ totalPenjualan: 0, totalKeuntungan: 0, totalItems: 0 });
        setRecapData([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="owner-content">
      <div className="page-header">
        <h1>Laporan Keuntungan</h1>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'daily' ? 'active' : ''}`}
            onClick={() => { setFilter('daily'); setShowRecap(false); }}
          >
            Harian
          </button>
          <button 
            className={`filter-btn ${filter === 'monthly' ? 'active' : ''}`}
            onClick={() => { setFilter('monthly'); setShowRecap(false); }}
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

        <button 
          className={`filter-btn ${showRecap ? 'active' : ''}`}
          onClick={() => setShowRecap(!showRecap)}
          style={{ marginLeft: '10px' }}
        >
          {showRecap ? 'Detail' : 'Rekap'}
        </button>
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
        <div className="summary-card">
          <div className="summary-icon orange">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="summary-info">
            <h3>{totals.totalItems}</h3>
            <p>Total Items Terjual</p>
          </div>
        </div>
      </div>

      {showRecap ? (
        /* Rekap Table */
        <div className="content-section">
          <h2>Rekap {filter === 'daily' ? 'Harian' : 'Bulanan'}</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>{filter === 'daily' ? 'Tanggal' : 'Bulan'}</th>
                <th>Jumlah Transaksi</th>
                <th>Total Penjualan</th>
                <th>Total Keuntungan</th>
              </tr>
            </thead>
            <tbody>
              {recapData.length > 0 ? (
                recapData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td>{item.jumlahTransaksi}</td>
                    <td>{formatRupiah(item.totalPenjualan)}</td>
                    <td style={{color: 'green'}}>{formatRupiah(item.totalKeuntungan)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center'}}>Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Transactions Table */
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
      )}
    </div>
  );
}

// Manajemen User Component
function ManajemenUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users.php');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users.php', formData);
      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        setFormData({ username: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('/api/users.php', {
        id: editingUser.id,
        username: formData.username,
        role: formData.role,
        password: formData.password
      });
      if (response.data.success) {
        alert(response.data.message);
        setShowEditModal(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        const response = await axios.delete(`/api/users.php?id=${id}`);
        if (response.data.success) {
          alert(response.data.message);
          fetchUsers();
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const roleClass = role === 'admin' ? 'badge-admin' : role === 'owner' ? 'badge-owner' : 'badge-user';
    return <span className={`badge ${roleClass}`}>{role}</span>;
  };

  if (loading) {
    return <div className="owner-content"><p>Loading...</p></div>;
  }

  return (
    <div className="owner-content">
      <div className="page-header">
        <h1>Manajemen User</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Tambah User
        </button>
      </div>

      <div className="content-section">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Role</th>
              <th>Tanggal Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <button className="btn btn-edit" onClick={() => handleEditClick(user)} title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDeleteUser(user.id)} title="Hapus">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>Tidak ada user</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Tambah User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password (kosongkan jika tidak ingin mengubah)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tabel Barang Owner Component
function TabelBarangOwner({ barang, salesStats }) {
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // State for analysis date range
  const [analysisMode, setAnalysisMode] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [analysisData, setAnalysisData] = useState({ bestSellers: [], worstSellers: [] });
  const [loading, setLoading] = useState(false);

  // Fetch analysis data based on date range
  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/penjualan.php?filter=custom&start_date=${startDate}&end_date=${endDate}`);
      const data = response.data;
      
      if (Array.isArray(data) && data.length > 0) {
        // Group by id_barang and calculate totals
        const productStats = {};
        data.forEach(item => {
          if (item.id_barang) {
            if (!productStats[item.id_barang]) {
              productStats[item.id_barang] = {
                id_barang: item.id_barang,
                nama_barang: item.nama_barang,
                total_terjual: 0,
                total_penjualan: 0,
                total_keuntungan: 0
              };
            }
            productStats[item.id_barang].total_terjual += parseInt(item.jumlah || item.total_jumlah || 0);
            productStats[item.id_barang].total_penjualan += parseFloat(item.total_harga || 0);
            productStats[item.id_barang].total_keuntungan += parseFloat(item.keuntungan || item.total_keuntungan || 0);
          }
        });
        
        const products = Object.values(productStats);
        // Sort by total_terjual descending
        products.sort((a, b) => b.total_terjual - a.total_terjual);
        
        // Get best sellers (top 5) and worst sellers (bottom 5)
        const bestSellers = products.slice(0, 5);
        const worstSellers = products.slice(-5).reverse();
        
        setAnalysisData({ bestSellers, worstSellers });
      } else {
        setAnalysisData({ bestSellers: [], worstSellers: [] });
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysisData({ bestSellers: [], worstSellers: [] });
    }
    setLoading(false);
  };

  const handleAnalyze = () => {
    fetchAnalysis();
  };

  return (
    <div className="owner-content">
      <div className="page-header">
        <h1>Tabel Barang</h1>
        <div className="header-actions">
          <button 
            className={`btn ${analysisMode ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setAnalysisMode(!analysisMode)}
          >
            {analysisMode ? 'Tutup Analisis' : 'Analisis Penjualan'}
          </button>
          <div className="export-buttons">
            <button className="btn btn-success" onClick={() => exportToExcel(barang)}>
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
            <button className="btn btn-danger" onClick={() => exportToPDF(barang)}>
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      {analysisMode && (
        <div className="content-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px' }}>Analisis Penjualan Produk</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ marginRight: '10px' }}>Tanggal Mulai:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ marginRight: '10px' }}>Tanggal Akhir:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleAnalyze}>
              Analisis
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Best Sellers */}
              <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#155724', marginBottom: '10px' }}>🔥 Produk Paling Laris</h4>
                {analysisData.bestSellers.length > 0 ? (
                  <table className="data-table" style={{ backgroundColor: 'white' }}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Nama Barang</th>
                        <th>Terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.bestSellers.map((item, index) => (
                        <tr key={item.id_barang}>
                          <td style={{ fontWeight: 'bold' }}>#{index + 1}</td>
                          <td>{item.nama_barang}</td>
                          <td style={{ fontWeight: 'bold', color: '#155724' }}>{item.total_terjual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Tidak ada data penjualan</p>
                )}
              </div>

              {/* Worst Sellers */}
              <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#721c24', marginBottom: '10px' }}>⚠️ Produk Jarang Laku</h4>
                {analysisData.worstSellers.length > 0 ? (
                  <table className="data-table" style={{ backgroundColor: 'white' }}>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Nama Barang</th>
                        <th>Terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.worstSellers.map((item, index) => (
                        <tr key={item.id_barang}>
                          <td style={{ fontWeight: 'bold' }}>#{index + 1}</td>
                          <td>{item.nama_barang}</td>
                          <td style={{ fontWeight: 'bold', color: '#721c24' }}>{item.total_terjual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Tidak ada data penjualan</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="content-section">
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
                  <td style={{backgroundColor: '#ffb6c1', fontWeight: 'bold'}}>{item.stok_total || (item.isi_satuan * (item.jumlah_beli || 1)) || '-'}</td>
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
    </div>
  );
}

export default OwnerDashboard;
