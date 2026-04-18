import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './TambahBarang.css';

function TambahBarang() {
  const navigate = useNavigate();
  const location = useLocation();
  const [barang, setBarang] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    id_barang: '',
    nama_barang: '',
    satuan_beli: 'DUS',
    isi_satuan: '',
    jumlah_beli: '',
    harga_beli: '',
    persen_untungk: ''
  });
  const [calculated, setCalculated] = useState({
    total_pcs: 0,
    stok_total: 0,
    harga_beli_pcs: 0,
    profit_pcs: 0,
    harga_jual: 0
  });
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const userData = localStorage.getItem('user');
  if (!userData) {
    navigate('/login');
  }

  useEffect(() => {
    fetchBarang();
    
    // Check if we're in edit mode
    const editItemStr = localStorage.getItem('editItem');
    if (editItemStr) {
      try {
        const editItem = JSON.parse(editItemStr);
        setIsEditing(true);
        setEditId(editItem.id_barang);
        setFormData({
          id_barang: editItem.id_barang || '',
          nama_barang: editItem.nama_barang || '',
          satuan_beli: editItem.satuan_beli || 'DUS',
          isi_satuan: editItem.isi_satuan || '',
          jumlah_beli: editItem.jumlah_beli || '',
          harga_beli: editItem.harga_beli || '',
          persen_untungk: editItem.persen_untungk || ''
        });
        // Calculate values
        const hargaBeli = parseFloat(editItem.harga_beli) || 0;
        const isiSatuan = parseInt(editItem.isi_satuan) || 0;
        const jumlahBeli = parseInt(editItem.jumlah_beli) || 1;
        const persenUntung = parseFloat(editItem.persen_untungk) || 0;
        const totalPcs = jumlahBeli * isiSatuan;
        if (totalPcs > 0) {
          const hbPcs = Math.round(hargaBeli / totalPcs);
          const profitPcs = Math.round(hbPcs * persenUntung / 100);
          const hj = hbPcs + profitPcs;
          setCalculated({
            total_pcs: totalPcs,
            stok_total: totalPcs,
            harga_beli_pcs: hbPcs,
            profit_pcs: profitPcs,
            harga_jual: hj
          });
        }
      } catch (e) {
        console.error('Error parsing editItem:', e);
        generateNextId();
      }
    } else {
      generateNextId();
    }
  }, []);

  const generateNextId = async () => {
    try {
      const response = await axios.get('/api/barang.php?action=next_id');
      if (response.data && response.data.next_id) {
        setFormData(prev => ({ ...prev, id_barang: response.data.next_id }));
      }
    } catch (error) {
      // If can't get next ID, use default
      setFormData(prev => ({ ...prev, id_barang: 'BRG-001' }));
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await axios.get('/api/barang.php?_t=' + Date.now());
      const data = response.data;
      if (Array.isArray(data)) {
        setBarang(data);
      } else {
        setBarang([]);
      }
    } catch (error) {
      setBarang([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    const hargaBeli = parseFloat(newFormData.harga_beli) || 0;
    const isiSatuan = parseInt(newFormData.isi_satuan) || 0;
    const jumlahBeli = parseInt(newFormData.jumlah_beli) || 1;
    const persenUntung = parseFloat(newFormData.persen_untungk) || 0;
    
    // Total pcs = jumlah beli × isi per satuan
    const totalPcs = jumlahBeli * isiSatuan;
    
    if (totalPcs > 0) {
      const hbPcs = Math.round(hargaBeli / totalPcs);
      const profitPcs = Math.round(hbPcs * persenUntung / 100);
      const hj = hbPcs + profitPcs;
      
      setCalculated({
        total_pcs: totalPcs,
        stok_total: totalPcs,
        harga_beli_pcs: hbPcs,
        profit_pcs: profitPcs,
        harga_jual: hj
      });
    }
  };

  const handleProfitClick = (persen) => {
    const newFormData = { ...formData, persen_untungk: persen };
    setFormData(newFormData);
    
    const hargaBeli = parseFloat(newFormData.harga_beli) || 0;
    const isiSatuan = parseInt(newFormData.isi_satuan) || 0;
    const jumlahBeli = parseInt(newFormData.jumlah_beli) || 1;
    const persenUntung = parseFloat(persen) || 0;
    
    // Total pcs = jumlah beli × isi per satuan
    const totalPcs = jumlahBeli * isiSatuan;
    
    if (totalPcs > 0) {
      const hbPcs = Math.round(hargaBeli / totalPcs);
      const profitPcs = Math.round(hbPcs * persenUntung / 100);
      const hj = hbPcs + profitPcs;
      
      setCalculated({
        total_pcs: totalPcs,
        stok_total: totalPcs,
        harga_beli_pcs: hbPcs,
        profit_pcs: profitPcs,
        harga_jual: hj
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        harga_beli_pcs: calculated.harga_beli_pcs,
        persen_untungk: parseFloat(formData.persen_untungk) || 0,
        harga_jual: calculated.harga_jual,
        stok_total: calculated.stok_total // Stok total = isi_satuan × jumlah_beli
      };
      
      if (isEditing) {
        await axios.put('/api/barang.php', dataToSend);
        setMessage('Barang berhasil diupdate!');
        localStorage.removeItem('editItem');
      } else {
        await axios.post('/api/barang.php', dataToSend);
        setMessage('Barang berhasil ditambahkan!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 1500);
      }
      
      fetchBarang();
      
      // Reset form
      setFormData({
        id_barang: '',
        nama_barang: '',
        satuan_beli: 'DUS',
        isi_satuan: '',
        jumlah_beli: '',
        harga_beli: '',
        persen_untungk: ''
      });
      setCalculated({
        total_pcs: 0,
        stok_total: 0,
        harga_beli_pcs: 0,
        profit_pcs: 0,
        harga_jual: 0
      });
      setIsEditing(false);
      setEditId(null);
      
      setTimeout(() => {
        setMessage('');
        if (isEditing) {
          navigate('/tabel-barang');
        }
      }, 3000);
    } catch (error) {
      setMessage('Gagal: ' + error.message);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const user = userData ? JSON.parse(userData) : null;

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
        <button className="btn-back" onClick={() => navigate('/tabel-barang')}>← Kembali ke Tabel</button>
        
        {/* Form Section */}
        <div className="form-card">
          <h2 className="form-title">{isEditing ? 'EDIT BARANG' : 'TAMBAH BARANG'}</h2>
          
          {message && (
            <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>ID Barang</label>
                <input type="text" name="id_barang" value={formData.id_barang} readOnly className="result-input" />
              </div>
              <div className="form-group">
                <label>Nama Barang</label>
                <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleInputChange} required placeholder="Kemeja Pria" />
              </div>
              <div className="form-group">
                <label>Satuan</label>
                <select name="satuan_beli" value={formData.satuan_beli} onChange={handleInputChange}>
                  <option value="DUS">DUS</option>
                  <option value="PACK">PACK</option>
                  <option value="RENCENG">RENCENG</option>
                  <option value="KALENG">KALENG</option>
                  <option value="LUSIN">LUSIN</option>
                </select>
              </div>
              <div className="form-group">
                <label>Isi</label>
                <input type="number" name="isi_satuan" value={formData.isi_satuan} onChange={handleInputChange} min="1" placeholder="10" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Beli</label>
                <input type="number" name="jumlah_beli" value={formData.jumlah_beli} onChange={handleInputChange} min="1" placeholder="3" />
              </div>
              <div className="form-group">
                <label>Harga Beli (Total)</label>
                <input type="number" name="harga_beli" value={formData.harga_beli} onChange={handleInputChange} placeholder="500000" />
              </div>
              <div className="form-group">
                <label>Total Pcs</label>
                <input type="text" value={calculated.total_pcs + ' pcs'} readOnly className="result-input" />
              </div>
              <div className="form-group">
                <label>Hbeli/Pcs</label>
                <input type="text" value={formatRupiah(calculated.harga_beli_pcs)} readOnly className="result-input" />
              </div>
              <div className="form-group">
                <label>% Untung</label>
                <input type="number" name="persen_untungk" value={formData.persen_untungk} onChange={handleInputChange} placeholder="Masukkan %" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Keuntungan/Pcs</label>
                <input type="text" value={formatRupiah(calculated.profit_pcs)} readOnly className="result-input profit-input" />
              </div>
              <div className="form-group">
                <label>Harga Jual</label>
                <input type="text" value={formatRupiah(calculated.harga_jual)} readOnly className="result-input highlight" />
              </div>
            </div>
            
            <div className="button-row">
              <button type="submit" className="btn-simpan">SIMPAN BARANG</button>
              <button type="button" className="btn-batal" onClick={() => navigate('/tabel-barang')}>BATAL</button>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="table-card">
          <h3>DAFTAR BARANG ({barang.length})</h3>
          <div className="table-scroll">
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
                      <td>{item.stok_total !== undefined && item.stok_total !== null ? item.stok_total : '-'}</td>
                      <td>{formatRupiah(item.harga_beli_pcs)}</td>
                      <td>{item.persen_untungk}%</td>
                      <td>{formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
                      <td>{formatRupiah(item.harga_jual)}</td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tgl_input ? new Date(item.tgl_input).toLocaleDateString('id-ID') : '-')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="empty">Belum ada barang</td>
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

export default TambahBarang;
