import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TransaksiPenjualan.css';

function TransaksiPenjualan() {
  const navigate = useNavigate();
  const [barang, setBarang] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchBarang();
      fetchHistory();
    }
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history_penjualan.php');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await axios.get('/api/barang.php');
      const data = response.data;
      if (Array.isArray(data)) {
        // Filter out items with 0 stock
        setBarang(data.filter(item => (parseInt(item.stok_total) || 0) > 0));
      } else {
        setBarang([]);
      }
    } catch (error) {
      console.error('Error fetching barang:', error);
      setBarang([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredBarang = barang.filter(item => 
    item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id_barang?.toString().includes(searchTerm)
  );

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.id_barang === item.id_barang);
    
    if (existingItem) {
      // Check if adding more would exceed stock
      const newQty = existingItem.jumlah + 1;
      if (newQty > item.stok_total) {
        setMessage('Stok tidak mencukupi!');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const updatedCart = cart.map(c => 
        c.id_barang === item.id_barang 
          ? { 
              ...c, 
              jumlah: c.jumlah + 1,
              total: (c.jumlah + 1) * c.harga_jual,
              keuntungan: ((c.harga_jual - c.harga_beli_pcs) * (c.jumlah + 1))
            }
          : c
      );
      setCart(updatedCart);
    } else {
      const newItem = {
        id_barang: item.id_barang,
        nama_barang: item.nama_barang,
        harga_beli_pcs: parseFloat(item.harga_beli_pcs) || 0,
        harga_jual: parseFloat(item.harga_jual) || 0,
        jumlah: 1,
        total: parseFloat(item.harga_jual) || 0,
        keuntungan: (parseFloat(item.harga_jual) - parseFloat(item.harga_beli_pcs)) || 0,
        current_stok: parseInt(item.stok_total) || 0
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (id_barang, newJumlah, item) => {
    if (newJumlah < 1) {
      removeFromCart(id_barang);
      return;
    }
    
    if (newJumlah > item.current_stok) {
      setMessage('Stok tidak mencukupi!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const updatedCart = cart.map(c => 
      c.id_barang === id_barang 
        ? { 
            ...c, 
            jumlah: newJumlah,
            total: newJumlah * c.harga_jual,
            keuntungan: newJumlah * (c.harga_jual - c.harga_beli_pcs)
          }
        : c
    );
    setCart(updatedCart);
  };

  const removeFromCart = (id_barang) => {
    setCart(cart.filter(c => c.id_barang !== id_barang));
  };

  const resetCart = () => {
    setCart([]);
    setMessage('');
  };

  const calculateTotals = () => {
    const totalBayar = cart.reduce((sum, item) => sum + item.total, 0);
    const totalKeuntungan = cart.reduce((sum, item) => sum + item.keuntungan, 0);
    return { totalBayar, totalKeuntungan };
  };

  const handleSaveTransaction = async () => {
    if (cart.length === 0) {
      setMessage('Keranjang kosong!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      // Send all cart items as one transaction
      await axios.post('/api/penjualan.php', { items: cart });
      
      setMessage('Transaksi berhasil disimpan!');
      setCart([]);
      fetchBarang(); // Refresh stock
      fetchHistory(); // Refresh history
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Gagal menyimpan transaksi: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToExcel = (data) => {
    const headers = ['No', 'Nama Barang', 'Jumlah Terjual', 'Total Bayar', 'Keuntungan', 'Tanggal'];
    const rows = data.slice(0, 10).map((item, index) => [
      index + 1,
      item.nama_barang,
      item.jumlah,
      item.total_harga,
      item.keuntungan,
      item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = (data) => {
    const printWindow = window.open('', '_blank');
    const tableRows = data.slice(0, 10).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama_barang}</td>
        <td>${item.jumlah}</td>
        <td>${formatRupiah(item.total_harga)}</td>
        <td>${formatRupiah(item.keuntungan)}</td>
        <td>${item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export PDF - Riwayat Penjualan</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #667eea; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Riwayat Penjualan Terakhir - Berty Shop</h1>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Barang</th>
              <th>Jumlah Terjual</th>
              <th>Total Bayar</th>
              <th>Keuntungan</th>
              <th>Tanggal</th>
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

  const { totalBayar, totalKeuntungan } = calculateTotals();

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
          <li><a href="#" onClick={() => navigate('/transaksi-penjualan')} className="active"><span>Transaksi Penjualan</span></a></li>
          <li><a href="#" onClick={() => navigate('/tabel-barang')}><span>Tabel Barang</span></a></li>
          <li><a href="#" onClick={() => navigate('/stok-masuk')}><span>Stok Masuk</span></a></li>
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
          <h1>Transaksi Penjualan</h1>
        </div>

        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="transaksi-container">
          {/* Search and Items Section */}
          <div className="items-section">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Cari Nama Barang..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Harga Beli/Pcs</th>
                  <th>Harga Jual</th>
                  <th>Stok Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarang.length > 0 ? (
                  filteredBarang.map((item) => (
                    <tr key={item.id_barang}>
                      <td>{item.id_barang}</td>
                      <td>{item.nama_barang}</td>
                      <td>{formatRupiah(item.harga_beli_pcs)}</td>
                      <td>{formatRupiah(item.harga_jual)}</td>
                      <td style={{fontWeight: 'bold', color: '#ff69b4'}}>{item.stok_total || 0}</td>
                      <td>
                        <button className="btn btn-primary" onClick={() => addToCart(item)}>Pilih</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center'}}>Tidak ada barang</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cart Section */}
          <div className="cart-section">
            <h2>Keranjang</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Jumlah</th>
                  <th>Total</th>
                  <th>Keuntungan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item, index) => (
                    <tr key={item.id_barang}>
                      <td>{index + 1}</td>
                      <td>{item.nama_barang}</td>
                      <td>{formatRupiah(item.harga_jual)}</td>
                      <td>
                        <input 
                          type="number" 
                          min="1" 
                          max={item.current_stok}
                          value={item.jumlah}
                          onChange={(e) => updateCartQuantity(item.id_barang, parseInt(e.target.value) || 1, item)}
                          style={{width: '60px', padding: '5px'}}
                        />
                      </td>
                      <td>{formatRupiah(item.total)}</td>
                      <td style={{color: 'green'}}>{formatRupiah(item.keuntungan)}</td>
                      <td>
                        <button className="btn btn-danger" onClick={() => removeFromCart(item.id_barang)}>X</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center'}}>Keranjang kosong</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Total Bayar:</span>
                <span className="summary-value">{formatRupiah(totalBayar)}</span>
              </div>
              <div className="summary-row">
                <span>Keuntungan:</span>
                <span className="summary-value profit">{formatRupiah(totalKeuntungan)}</span>
              </div>
            </div>

            <div className="cart-buttons">
              <button className="btn btn-success" onClick={handleSaveTransaction}>Simpan Transaksi</button>
              <button className="btn btn-danger" onClick={resetCart}>Reset</button>
            </div>
          </div>
        </div>

        {/* History Section - Below Transaction Form */}
        <div className="history-section" style={{marginTop: '20px'}}>
          <div className="section-header">
            <h2>Riwayat Penjualan Terakhir</h2>
            <div className="export-buttons">
              <button className="btn btn-success" onClick={() => exportToExcel(history)}>
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
              <button className="btn btn-danger" onClick={() => exportToPDF(history)}>
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
            </div>
          </div>
          <div className="table-scroll">
          <table className="data-table" style={{marginTop: '15px'}}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Jumlah Terjual</th>
                <th>Total Bayar</th>
                <th>Keuntungan</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.slice(0, 10).map((item, index) => (
                  <tr key={item.id_history}>
                    <td>{index + 1}</td>
                    <td>{item.nama_barang}</td>
                    <td style={{color: '#dc3545', fontWeight: 'bold'}}>{item.jumlah}</td>
                    <td>{formatRupiah(item.total_harga)}</td>
                    <td style={{color: 'green'}}>{formatRupiah(item.keuntungan)}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => setSelectedHistory(item)}>Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center'}}>Belum ada riwayat penjualan</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedHistory && (
          <div className="modal-overlay" onClick={() => setSelectedHistory(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Detail Transaksi</h3>
              <p><strong>Tanggal:</strong> {selectedHistory.created_at ? new Date(selectedHistory.created_at).toLocaleString('id-ID') : '-'}</p>
              <p><strong>Barang yang dibeli:</strong></p>
              <p style={{marginLeft: '15px'}}>{selectedHistory.nama_barang}</p>
              <button className="btn btn-danger" onClick={() => setSelectedHistory(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransaksiPenjualan;
