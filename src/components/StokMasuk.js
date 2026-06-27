import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TambahBarang.css';

function StokMasuk() {
  const navigate = useNavigate();
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [formData, setFormData] = useState({
    id_barang: '',
    jumlah_beli: '',
    keterangan: ''
  });
  const [calculated, setCalculated] = useState({
    total_pcs: 0,
    stok_total: 0,
    harga_beli_pcs: 0,
    stok_lama: 0,
    stok_baru: 0,
    stok_awal: 0
  });
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const userData = localStorage.getItem('user');
  if (!userData) {
    navigate('/login');
  }

  useEffect(() => {
    fetchBarang();
    fetchStokMasukHistory();
  }, []);

  const [stokMasukHistory, setStokMasukHistory] = useState([]);
  
  const fetchBarang = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/barang.php?_t=' + Date.now());
      console.log('Response from API:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        setBarang(data);
        console.log('Barang loaded:', data.length, 'items');
      } else {
        console.warn('Data is not an array:', data);
        setBarang([]);
      }
    } catch (error) {
      console.error('Error fetching barang:', error);
      setBarang([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStokMasukHistory = async () => {
    try {
      const response = await axios.get('/api/stok_masuk.php');
      const data = response.data;
      if (Array.isArray(data)) {
        setStokMasukHistory(data);
      } else {
        setStokMasukHistory([]);
      }
    } catch (error) {
      console.error('Error fetching stok masuk history:', error);
      setStokMasukHistory([]);
    }
  };

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setSelectedBarang(null);
      setFormData({
        id_barang: '',
        jumlah_beli: '',
        keterangan: ''
      });
      setCalculated({
        total_pcs: 0,
        stok_total: 0,
        harga_beli_pcs: 0,
        stok_lama: 0,
        stok_baru: 0,
        stok_awal: 0
      });
      return;
    }

    // Find selected barang - try multiple matching strategies
    let selected = barang.find(b => String(b.id_barang).trim() === String(selectedId).trim());
    
    // If not found by ID, try finding by index
    if (!selected && barang.length > 0) {
      // Try using the ID as an index
      const idx = parseInt(selectedId) - 1;
      if (idx >= 0 && idx < barang.length) {
        selected = barang[idx];
      }
      // Last try: get first item if only one exists
      if (!selected && barang.length === 1) {
        selected = barang[0];
      }
    }
    
    console.log('Selected ID:', selectedId);
    console.log('Available barang:', barang.map(b => ({id: b.id_barang, nama: b.nama_barang})));
    console.log('Found selected:', selected);
    
    if (selected) {
      setSelectedBarang({...selected});
      setFormData({
        id_barang: selectedId,
        jumlah_beli: '',
        keterangan: ''
      });
      
      // Reset calculated with stock from database
      setCalculated({
        total_pcs: 0,
        stok_total: parseInt(selected.stok_total) || 0,
        harga_beli_pcs: 0,
        profit_pcs: 0,
        harga_jual: 0,
        stok_lama: parseInt(selected.stok_total) || 0,
        stok_baru: parseInt(selected.stok_total) || 0,
        stok_awal: parseInt(selected.stok_total) || 0
      });
      
      // Update selectedBarang with the selected item for editing
      setSelectedBarang({...selected});
    } else {
      alert('Data barang tidak ditemukan!');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    if (!selectedBarang) return;

    const isiSatuan = parseInt(selectedBarang.isi_satuan) || 0;
    const jumlahBeli = parseInt(newFormData.jumlah_beli) || 0;
    const stokLama = parseInt(calculated.stok_lama) || 0;

    // Total pcs = jumlah beli × isi per satuan
    const totalPcs = jumlahBeli * isiSatuan;
    const stokBaru = stokLama + totalPcs;

    setCalculated(prev => ({
      ...prev,
      total_pcs: totalPcs,
      stok_total: stokBaru,
      stok_baru: stokBaru
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBarang) {
      setMessage('Pilih barang terlebih dahulu!');
      return;
    }

    try {
      // Use selectedBarang as primary source of data
      if (!selectedBarang) {
        setMessage('Pilih barang terlebih dahulu!');
        return;
      }
      
      const currentBarang = selectedBarang;
      const isiSatuan = parseInt(selectedBarang.isi_satuan) || parseInt(currentBarang.isi_satuan) || 0;
      const jumlahBeli = parseInt(formData.jumlah_beli) || 0;
      const totalPcs = jumlahBeli * isiSatuan;
      const newStokTotal = (currentBarang.stok_total || 0) + totalPcs;
      
      // Send id_barang, stok_total, and last_stok_masuk for tracking
      const dataToSend = {
        id_barang: formData.id_barang,
        stok_total: newStokTotal,
        last_stok_masuk: totalPcs,
        updated_at: new Date().toISOString()
      };

      // Update stock in barang table
      await axios.put('/api/barang.php', dataToSend);
      
      // Add to stock history - store all values at this point in time
      const historyData = {
        id_barang: formData.id_barang,
        nama_barang: currentBarang.nama_barang,
        satuan_beli: currentBarang.satuan_beli || 'DUS',
        isi_satuan: currentBarang.isi_satuan || 1,
        jumlah_masuk: totalPcs,
        stok_awal: calculated.stok_awal || 0,
        stok_total: newStokTotal,
        harga_beli_satuan: currentBarang.harga_beli_pcs || 0,
        keterangan: formData.keterangan || ''
      };
      await axios.post('/api/stok_masuk.php', historyData);
      
      setMessage('Stok berhasil ditambahkan!');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 1500);
      
      // Update local state immediately with new stock values
      const addedStock = totalPcs;
      const updatedBarang = barang.map(b => 
        b.id_barang === formData.id_barang 
          ? { ...b, stok_total: newStokTotal, last_stok_masuk: addedStock, updated_at: new Date().toISOString() }
          : b
      );
      setBarang(updatedBarang);
      
      // Update selectedBarang with new values
      const updatedSelected = updatedBarang.find(b => b.id_barang === formData.id_barang);
      if (updatedSelected) {
        setSelectedBarang(updatedSelected);
      }
      
      // Reset form for new entry (keep the same item selected)
      setFormData({
        id_barang: formData.id_barang,
        jumlah_beli: '',
        keterangan: ''
      });
      
      // Update calculated with new stock
      setCalculated(prev => ({
        ...prev,
        total_pcs: 0,
        stok_total: newStokTotal,
        stok_lama: newStokTotal,
        stok_baru: newStokTotal,
        stok_awal: newStokTotal
      }));
      
      // Refresh data from server to ensure consistency
      await fetchBarang();
      await fetchStokMasukHistory();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Gagal: ' + error.message);
    }
  };

  const handleEdit = (item) => {
    // Navigate to edit page or set the item for editing
    navigate('/tambah-barang', { state: { editData: item } });
  };

  const handleDelete = async (id_barang) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        await axios.delete(`/api/barang.php?id_barang=${id_barang}`);
        fetchBarang();
      } catch (error) {
        console.error('Error deleting barang:', error);
        setMessage('Gagal menghapus barang: ' + error.message);
      }
    }
  };

  const handleDeleteHistory = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
      try {
        await axios.delete(`/api/stok_masuk.php?id=${id}`);
        fetchStokMasukHistory();
      } catch (error) {
        console.error('Error deleting history:', error);
        setMessage('Gagal menghapus riwayat: ' + error.message);
      }
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToExcel = (data) => {
    const headers = ['No', 'ID', 'Nama', 'Satuan', 'Isi', 'Stok Awal', 'Stok Masuk', 'Stok Total', 'Keterangan', 'Tanggal'];
    const rows = data.map((item, index) => [
      index + 1,
      item.id_barang,
      item.nama_barang,
      item.satuan_beli,
      item.isi_satuan,
      item.stok_awal || 0,
      item.stok_masuk || 0,
      item.stok_total || 0,
      item.keterangan || '-',
      item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleString('id-ID') : '-'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat_stok_masuk_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = (data) => {
    const printWindow = window.open('', '_blank');
    const tableRows = data.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.id_barang}</td>
        <td>${item.nama_barang || '-'}</td>
        <td>${item.satuan_beli || '-'}</td>
        <td>${item.isi_satuan || '-'}</td>
        <td>${item.stok_awal || 0}</td>
        <td style={{color: 'green', fontWeight: 'bold'}}>+${item.stok_masuk || 0}</td>
        <td>${item.stok_total || 0}</td>
        <td>${item.keterangan || '-'}</td>
        <td>${item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleString('id-ID') : '-'}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export PDF - Riwayat Stok Masuk</title>
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
        <h1>Riwayat Stok Masuk - Berty Shop</h1>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama</th>
              <th>Satuan</th>
              <th>Isi</th>
              <th>Stok Awal</th>
              <th>Stok Masuk</th>
              <th>Stok Total</th>
              <th>Keterangan</th>
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

  const user = userData ? JSON.parse(userData) : null;

  // Debug: log selectedBarang state
  console.log('Render - selectedBarang:', selectedBarang);
  console.log('Render - formData.id_barang:', formData.id_barang);
  console.log('Render - barang.length:', barang.length);

  return (
    <div className="tambah-page">
      <div className="kasir-header">
        <div className="header-left">
          <h1>BERTY SHOP</h1>
        </div>
        <div className="header-right">
          <span className="kasir-label">ADMIN</span>
          <span className="kasir-name">- {user?.username}</span>
        </div>
      </div>

      <div className="tambah-container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <button className="btn-back" onClick={() => navigate('/tabel-barang')} style={{marginBottom: 0}}>← Kembali ke Tabel</button>
          <button className="btn btn-primary" onClick={() => navigate('/struk-grosir')} style={{padding: '10px 20px', fontWeight: 'bold'}}>
            <i className="fas fa-receipt"></i> Struk Grosir
          </button>
        </div>
        
        {/* Form Section */}
        <div className="form-card">
          <h2 className="form-title">STOK MASUK BARU</h2>
          
          {message && (
            <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="stok-masuk-form">
            {/* ID Barang Selector - with Informasi Barang on the right when selected */}
            <div className="form-section-title">PILIH BARANG</div>
            <div className="form-row">
              <div className="form-group" style={{flex: 2}}>
                <label>ID Barang</label>
                {loading ? (
                  <select disabled className="barang-select">
                    <option>Memuat data...</option>
                  </select>
                ) : barang.length === 0 ? (
                  <select disabled className="barang-select">
                    <option>Tidak ada barang - tambah barang dulu</option>
                  </select>
                ) : (
                  <select 
                    name="id_barang" 
                    value={formData.id_barang} 
                    onChange={handleSelectChange}
                    required
                    className="barang-select"
                  >
                    <option value="">-- Pilih ID Barang --</option>
                    {barang.map(item => (
                      <option key={item.id_barang} value={item.id_barang}>
                        {item.id_barang} - {item.nama_barang} (Stok: {item.stok_total || 0})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedBarang && (
                <>
                  {/* Informasi Barang Section - displayed on the right */}
                  <div className="form-group" style={{flex: 1}}>
                    <label>Nama Barang</label>
                    <input type="text" value={selectedBarang.nama_barang || ''} readOnly className="result-input" />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Stok Saat Ini (pcs)</label>
                    <input type="text" value={calculated.stok_lama || 0} readOnly className="result-input highlight" />
                  </div>
                </>
              )}
            </div>

            {selectedBarang && (
              <>
                {/* Two column layout: Pembelian on left, Keterangan on right */}
                <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                  <div style={{flex: 1, minWidth: '300px'}}>
                    <div className="form-section-title">DETAIL PEMBELIAN</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Satuan Besar</label>
                        <select 
                          name="satuan_beli" 
                          value={selectedBarang.satuan_beli || 'DUS'} 
                          onChange={(e) => setSelectedBarang({...selectedBarang, satuan_beli: e.target.value})}
                          className="result-input"
                        >
                          <option value="DUS">DUS</option>
                          <option value="PACK">PACK</option>
                          <option value="PCS">PCS</option>
                          <option value="KG">KG</option>
                          <option value="BOX">BOX</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Isi per Satuan (pcs)</label>
                        <input 
                          type="number" 
                          name="isi_satuan" 
                          value={selectedBarang.isi_satuan || ''} 
                          onChange={(e) => {
                            setSelectedBarang({...selectedBarang, isi_satuan: e.target.value});
                            const isiSatuan = parseInt(e.target.value) || 0;
                            const jumlahBeli = parseInt(formData.jumlah_beli) || 0;
                            const totalPcs = jumlahBeli * isiSatuan;
                            const stokBaru = (calculated.stok_lama || 0) + totalPcs;
                            setCalculated(prev => ({
                              ...prev,
                              total_pcs: totalPcs,
                              stok_total: stokBaru,
                              stok_baru: stokBaru
                            }));
                          }}
                          min="1"
                          placeholder="Contoh: 40"
                          className="result-input"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Jumlah Beli</label>
                        <input type="number" name="jumlah_beli" value={formData.jumlah_beli} onChange={handleInputChange} min="1" placeholder={`Misal: 2 ${selectedBarang?.satuan_beli || ''}`} required />
                      </div>
                      <div className="form-group">
                        <label>Stok Masuk (pcs)</label>
                        <input type="text" value={calculated.total_pcs > 0 ? '+' + calculated.total_pcs : '-'} readOnly className="result-input highlight" />
                      </div>
                      <div className="form-group">
                        <label>Total Stok (pcs)</label>
                        <input type="text" value={calculated.stok_baru || 0} readOnly className="result-input highlight" />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{flex: 1, minWidth: '250px'}}>
                    {/* Keterangan Section */}
                    <div className="form-section-title">KETERANGAN (OPSIONAL)</div>
                    <div className="form-row">
                      <div className="form-group" style={{flex: 1}}>
                        <textarea 
                          name="keterangan" 
                          value={formData.keterangan || ''} 
                          onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
                          placeholder="Contoh: Beli di Agen A atau Promo beli 10 gratis 1"
                          rows="4"
                          className="keterangan-input"
                          style={{width: '100%', minHeight: '80px'}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="button-row">
              <button type="submit" className="btn-simpan" disabled={!selectedBarang}>SIMPAN STOK</button>
              <button type="button" className="btn-batal" onClick={() => navigate('/tabel-barang')}>BATAL</button>
            </div>
          </form>
        </div>

        {/* Table Section - Stock History */}
        <div className="table-card">
          <div className="table-header-row">
            <h3>RIWAYAT STOK MASUK ({stokMasukHistory.length})</h3>
            <div className="export-buttons">
              <button className="btn btn-success" onClick={() => exportToExcel(stokMasukHistory)}>
                <i className="fas fa-file-excel"></i> Export Excel
              </button>
              <button className="btn btn-danger" onClick={() => exportToPDF(stokMasukHistory)}>
                <i className="fas fa-file-pdf"></i> Export PDF
              </button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Satuan</th>
                  <th>Isi</th>
                  <th>Stok Awal</th>
                  <th>Stok Masuk</th>
                  <th>Stok Total</th>
                  <th>Keterangan</th>
                  <th>Tgl Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stokMasukHistory.length > 0 ? (
                  stokMasukHistory.map((item) => (
                    <tr key={item.id_stok_masuk}>
                      <td>{item.id_barang}</td>
                      <td>{item.nama_barang || '-'}</td>
                      <td>{item.satuan_beli || '-'}</td>
                      <td>{item.isi_satuan || '-'}</td>
                      <td>{item.stok_awal || 0}</td>
                      <td style={{color: 'green', fontWeight: 'bold'}}>+{item.stok_masuk}</td>
                      <td>{item.stok_total || 0}</td>
                      <td>{item.keterangan || '-'}</td>
                      <td>{item.tanggal_masuk ? new Date(item.tanggal_masuk).toLocaleString('id-ID') : '-'}</td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleDeleteHistory(item.id_stok_masuk)}>Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty">Belum ada riwayat stok masuk</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-icon">✓</div>
            <p>Berhasil ditambahkan</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StokMasuk;
