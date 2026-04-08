import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TabelBarang.css';

function TabelBarang() {
  const [barang, setBarang] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id_barang: '',
    nama_barang: '',
    satuan_beli: 'DUS',
    isi_satuan: 1,
    harga_beli: 0,
    harga_beli_pcs: 0,
    persen_untungk: 0,
    harga_jual: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchBarang();
    }
  }, [navigate]);

  const fetchBarang = async () => {
    try {
      const response = await axios.get('/api/barang.php');
      const data = response.data;
      if (Array.isArray(data)) {
        setBarang(data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Auto calculate harga_beli_pcs and harga_jual
    if (name === 'harga_beli' || name === 'isi_satuan' || name === 'persen_untungk') {
      const harga_beli = name === 'harga_beli' ? parseFloat(value) : newFormData.harga_beli;
      const isi_satuan = name === 'isi_satuan' ? parseInt(value) : newFormData.isi_satuan;
      const persen_untungk = name === 'persen_untungk' ? parseFloat(value) : newFormData.persen_untungk;
      
      if (isi_satuan > 0) {
        newFormData.harga_beli_pcs = harga_beli / isi_satuan;
        newFormData.harga_jual = (harga_beli / isi_satuan) * (1 + persen_untungk / 100);
      }
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put('/api/barang.php', formData);
      } else {
        await axios.post('/api/barang.php', formData);
      }
      fetchBarang();
      resetForm();
    } catch (error) {
      console.error('Error saving barang:', error);
    }
  };

  const handleEdit = (item) => {
    // Save item to localStorage for edit mode
    localStorage.setItem('editItem', JSON.stringify(item));
    navigate('/tambah-barangan');
  };

  const handleDelete = async (id_barang) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        await axios.delete(`/api/barang.php?id_barang=${id_barang}`);
        fetchBarang();
      } catch (error) {
        console.error('Error deleting barang:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id_barang: '',
      nama_barang: '',
      satuan_beli: 'DUS',
      isi_satuan: 1,
      harga_beli: 0,
      harga_beli_pcs: 0,
      persen_untungk: 0,
      harga_jual: 0
    });
    setIsEditing(false);
    setShowForm(false);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
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
          <li><a href="#" className="active"><span>Tabel Barang</span></a></li>
          <li><a href="#" onClick={() => navigate('/stok-masuk')}><span>Stok Masuk</span></a></li>
          <li><a href="#"><span>Pengaturan</span></a></li>
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
          <h1>Tabel Barang</h1>
          <button className="btn btn-primary" onClick={() => navigate('/tambah-barang')}>
            <i className="fas fa-plus"></i> Tambah Barang
          </button>
        </div>

        {/* Table */}
        <div className="content-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Satuan</th>
                <th>Isi</th>
                <th>Jml Beli</th>
                <th>Harga Beli</th>
                <th>Stok Total</th>
                <th>Hbeli/Pcs</th>
                <th>% Untung</th>
                <th>Untung/Pcs</th>
                <th>Harga Jual</th>
                <th>Tgl Input</th>
                <th>Aksi</th>
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
                    <td>{item.jumlah_beli || '-'}</td>
                    <td>{formatRupiah(item.harga_beli)}</td>
                    <td>{item.stok_total || (item.isi_satuan * (item.jumlah_beli || 1)) || '-'}</td>
                    <td>{formatRupiah(item.harga_beli_pcs)}</td>
                    <td>{item.persen_untungk}%</td>
                    <td>{formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
                    <td>{formatRupiah(item.harga_jual)}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tgl_input ? new Date(item.tgl_input).toLocaleDateString('id-ID') : '-')}</td>
                    <td>
                      <button className="btn btn-success" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(item.id_barang)}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" style={{textAlign: 'center'}}>Tidak ada data barang</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TabelBarang;
