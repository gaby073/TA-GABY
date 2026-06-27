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
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSaveConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSaveConfirmModal(false);
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
      if (!isEditing) {
        generateNextId();
      }
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
        <form onSubmit={handleSubmit} className="tb-unified-card">
          <div className="tb-unified-header">
            <div className="tb-unified-icon">📦</div>
            <div className="tb-unified-header-text">
              <h2>{isEditing ? 'Edit Barang' : 'Tambah Barang Baru'}</h2>
              <p>Masukkan detail barang dan atur margin keuntungan</p>
            </div>
          </div>
          
          {message && (
            <div style={{padding: '0 35px'}}>
              <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            </div>
          )}
          
          <div className="tb-unified-body">
            <div className="tb-unified-left">
              
              <div className="tb-section-block">
                <h3 className="tb-section-title-new"><span>❖</span> INFORMASI DASAR</h3>
                <div className="tb-grid-row">
                  <div className="form-group">
                    <label>ID Barang</label>
                    <input type="text" name="id_barang" value={formData.id_barang} readOnly className="tb-input-disabled" />
                    <span className="tb-input-hint">*Dibuat otomatis oleh sistem</span>
                  </div>
                  <div className="form-group">
                    <label>Nama Barang</label>
                    <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleInputChange} required placeholder="Kemeja Pria" />
                  </div>
                </div>
              </div>

              <hr className="tb-divider" />

              <div className="tb-section-block">
                <h3 className="tb-section-title-new"><span>$</span> DETAIL PEMBELIAN</h3>
                <div className="tb-grid-row">
                  <div className="form-group">
                    <label>Satuan Pembelian</label>
                    <select name="satuan_beli" value={formData.satuan_beli} onChange={handleInputChange}>
                      <option value="DUS">DUS (Karton)</option>
                      <option value="PACK">PACK</option>
                      <option value="RENCENG">RENCENG</option>
                      <option value="KALENG">KALENG</option>
                      <option value="LUSIN">LUSIN</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Isi per {formData.satuan_beli || 'DUS'}</label>
                    <div className="tb-input-suffix-wrapper">
                      <input type="number" name="isi_satuan" value={formData.isi_satuan} onChange={handleInputChange} min="1" placeholder="10" />
                      <span className="tb-suffix">pcs</span>
                    </div>
                  </div>
                </div>
                <div className="tb-grid-row">
                  <div className="form-group">
                    <label>Jumlah Beli</label>
                    <div className="tb-input-suffix-wrapper">
                      <input type="number" name="jumlah_beli" value={formData.jumlah_beli} onChange={handleInputChange} min="1" placeholder="3" />
                      <span className="tb-suffix">{formData.satuan_beli ? formData.satuan_beli.toLowerCase() : 'dus'}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Harga Beli (Total)</label>
                    <div className="tb-input-prefix-wrapper">
                      <span className="tb-prefix">Rp</span>
                      <input type="number" name="harga_beli" value={formData.harga_beli} onChange={handleInputChange} placeholder="500000" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="tb-divider" />

              <div className="tb-section-block">
                <h3 className="tb-section-title-new"><span>📈</span> MARGIN KEUNTUNGAN</h3>
                <div className="tb-grid-row">
                  <div className="form-group">
                    <label>Target Keuntungan</label>
                    <div className="tb-input-suffix-wrapper">
                      <input type="number" name="persen_untungk" value={formData.persen_untungk} onChange={handleInputChange} placeholder="20" />
                      <span className="tb-suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="tb-unified-right">
              <div className="tb-summary-box">
                <h3 className="tb-summary-box-title"><span>📋</span> Ringkasan Kalkulasi</h3>
                
                <div className="tb-summary-line">
                  <span className="tb-summary-line-label">Total Pcs</span>
                  <span className="tb-summary-line-value">{calculated.total_pcs} pcs</span>
                </div>
                
                <div className="tb-summary-line">
                  <span className="tb-summary-line-label">Modal per Pcs</span>
                  <span className="tb-summary-line-value">{formatRupiah(calculated.harga_beli_pcs)}</span>
                </div>
                
                <div className="tb-summary-line">
                  <span className="tb-summary-line-label">Untung per Pcs</span>
                  <span className="tb-summary-line-value tb-text-profit">+{formatRupiah(calculated.profit_pcs)}</span>
                </div>

                <div className="tb-suggested-price">
                  <div className="tb-sp-label-new">SARAN HARGA JUAL</div>
                  <div className="tb-sp-val-new">{formatRupiah(calculated.harga_jual)}</div>
                  <div className="tb-sp-unit-new">/ pcs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="tb-unified-footer">
            <button type="button" className="tb-btn-cancel" onClick={() => navigate('/tabel-barang')}>✕ Batal</button>
            <button type="submit" className="tb-btn-save">💾 Simpan Barang</button>
          </div>
        </form>

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
                  <th>Harga Beli</th>
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
                      <td>{formatRupiah(item.harga_beli)}</td>
                      <td>{formatRupiah(item.harga_beli_pcs)}</td>
                      <td>{item.persen_untungk}%</td>
                      <td>{formatRupiah(item.harga_jual - item.harga_beli_pcs)}</td>
                      <td>{formatRupiah(item.harga_jual)}</td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : (item.tgl_input ? new Date(item.tgl_input).toLocaleDateString('id-ID') : '-')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty">Belum ada barang</td>
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

      {showSaveConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <h3>Konfirmasi Simpan</h3>
            <p>Apakah Anda yakin data barang sudah benar dan ingin menyimpannya?</p>
            <div className="confirm-modal-buttons">
              <button type="button" className="btn-confirm-yes" onClick={handleConfirmSubmit}>
                YA
              </button>
              <button type="button" className="btn-confirm-no" onClick={() => setShowSaveConfirmModal(false)}>
                TIDAK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TambahBarang;
