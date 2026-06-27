import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StrukGrosir.css';

function StrukGrosir() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'form'
  const [struks, setStruks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewImage, setViewImage] = useState(null); // State for image viewer modal
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [judulBelanja, setJudulBelanja] = useState('');
  const [namaToko, setNamaToko] = useState('');
  const [tanggalBelanja, setTanggalBelanja] = useState('');
  const [totalBelanja, setTotalBelanja] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const fileInputRef = useRef(null);

  const userData = localStorage.getItem('user');
  if (!userData) {
    navigate('/login');
  }
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    fetchStruks();
  }, []);

  const fetchStruks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/upload_struk.php?_t=' + Date.now());
      if (Array.isArray(response.data)) {
        setStruks(response.data);
      } else {
        setStruks([]);
      }
    } catch (error) {
      console.error('Error fetching struks:', error);
      setStruks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploadFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Mohon pilih file gambar yang valid.');
    }
  };

  const resetForm = () => {
    setUploadFile(null);
    setPreviewUrl('');
    setJudulBelanja('');
    setNamaToko('');
    
    // Set default date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setTanggalBelanja(now.toISOString().slice(0, 16));
    
    setTotalBelanja('');
    setKeterangan('');
  };

  const handleTambahBaru = () => {
    resetForm();
    setViewMode('form');
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Pilih foto struk/barang terlebih dahulu!");
      return;
    }
    if (!judulBelanja || !tanggalBelanja || !totalBelanja) {
      alert("Mohon lengkapi field yang wajib diisi!");
      return;
    }
    
    const formData = new FormData();
    formData.append('struk', uploadFile);
    formData.append('judul_belanja', judulBelanja);
    formData.append('nama_toko', namaToko);
    formData.append('tanggal_belanja', tanggalBelanja.replace('T', ' '));
    formData.append('total_belanja', totalBelanja);
    formData.append('keterangan', keterangan);
    formData.append('status', 'Selesai');
    
    try {
      const response = await axios.post('/api/upload_struk.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        alert('Struk belanja berhasil disimpan!');
        fetchStruks();
        setViewMode('table');
      } else {
        alert('Gagal: ' + response.data.message);
      }
    } catch (error) {
      alert('Error saat menyimpan: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus struk ini?')) {
      try {
        const response = await axios.delete(`/api/upload_struk.php?id=${id}`);
        if (response.data.success) {
          fetchStruks();
        } else {
          alert('Gagal menghapus: ' + response.data.message);
        }
      } catch (error) {
        alert('Error menghapus: ' + error.message);
      }
    }
  };

  const formatTanggal = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleDateString('id-ID');
  };

  const formatWaktu = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  };

  // Filter & Pagination
  const filteredStruks = struks.filter(s => 
    (s.judul_belanja && s.judul_belanja.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.keterangan && s.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStruks.length / itemsPerPage);
  const currentStruks = filteredStruks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderTableMode = () => (
    <>
      <div className="struk-header">
        <button className="btn-back" onClick={() => navigate('/stok-masuk')}>
          <i className="fas fa-arrow-left"></i> Kembali ke Stok Masuk
        </button>
        <button className="btn-primary" onClick={handleTambahBaru}>
          <i className="fas fa-upload"></i> Upload Struk Baru
        </button>
      </div>

      <div className="struk-card">
        <div className="card-header">
          <h2 className="card-title">KUMPULAN STRUK GROSIR</h2>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Cari judul atau keterangan..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <table className="struk-table">
          <thead>
            <tr>
              <th>FOTO</th>
              <th>WAKTU & TANGGAL</th>
              <th>JUDUL BELANJA</th>
              <th>KETERANGAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>Memuat data...</td></tr>
            ) : currentStruks.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>Tidak ada data struk.</td></tr>
            ) : (
              currentStruks.map(struk => (
                <tr key={struk.id_struk}>
                  <td>
                    <img 
                      src={`http://localhost/TA-GABY/uploads/struk/${struk.nama_file_gambar}`} 
                      alt={struk.judul_belanja || 'Struk'} 
                      className="struk-thumbnail"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Error'; }}
                    />
                  </td>
                  <td>
                    <div className="date-info">
                      <span className="date">{formatTanggal(struk.tanggal_belanja || struk.tanggal_upload)}</span>
                      <span className="time"><i className="far fa-clock"></i> {formatWaktu(struk.tanggal_belanja || struk.tanggal_upload)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="judul-info">
                      <span className="judul">{struk.judul_belanja || '-'}</span>
                      <span className={`status-badge ${struk.status ? struk.status.toLowerCase() : 'selesai'}`}>
                        {struk.status || 'Selesai'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="keterangan-text">
                      {struk.keterangan ? (struk.keterangan.length > 50 ? struk.keterangan.substring(0, 50) + '...' : struk.keterangan) : '-'}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" title="Lihat Foto" onClick={() => setViewImage(struk)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-action btn-edit" title="Edit Data" onClick={() => alert('Fitur edit detail segera hadir.')}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn-action btn-delete" title="Hapus Struk" onClick={() => handleDelete(struk.id_struk)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filteredStruks.length > 0 && (
          <div className="pagination-area">
            <span>Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, filteredStruks.length)} dari {filteredStruks.length} struk</span>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >Prev</button>
              
              {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >{page}</button>
              ))}
              
              <button 
                className="page-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderFormMode = () => (
    <>
      <div className="struk-header form-header-area" style={{marginBottom: 0}}>
        <div>
          <h2>Upload Struk Baru</h2>
          <p>Tambahkan riwayat belanja grosir ke dalam sistem</p>
        </div>
        <button className="btn-back" onClick={() => setViewMode('table')}>
          <i className="fas fa-arrow-left"></i> Kembali ke Tabel
        </button>
      </div>

      <div className="form-card" style={{marginTop: '24px'}}>
        <form className="struk-form" onSubmit={handleSimpan}>
          <div className="form-grid">
            
            {/* Left Column: File Upload */}
            <div className="upload-area-container">
              <label>Foto Struk / Barang <span className="required-star">*</span></label>
              <div 
                className="drag-drop-area"
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                ) : (
                  <>
                    <div className="upload-icon-circle">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Klik untuk upload foto</p>
                    <p style={{fontWeight: 'normal', color: '#718096', fontSize: '0.85rem'}}>atau drag and drop file di sini</p>
                    <span>Format: JPG, PNG, WEBP (Max. 5MB)</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFileChange(e.target.files[0])} 
                  accept="image/jpeg, image/png, image/webp, image/gif"
                  style={{display: 'none'}}
                />
              </div>
            </div>

            {/* Right Column: Inputs */}
            <div className="inputs-grid">
              
              <div className="input-group">
                <label>Judul Belanja <span className="required-star">*</span></label>
                <div className="input-field-wrapper">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Contoh: Belanja Kaos Polos" 
                    value={judulBelanja}
                    onChange={(e) => setJudulBelanja(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Nama Toko/Supplier</label>
                <div className="input-field-wrapper">
                  <i className="fas fa-store"></i>
                  <input 
                    type="text" 
                    className="input-field with-icon" 
                    placeholder="Contoh: Toko Mulia Abadi" 
                    value={namaToko}
                    onChange={(e) => setNamaToko(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Tanggal & Waktu Belanja <span className="required-star">*</span></label>
                <div className="input-field-wrapper">
                  <input 
                    type="datetime-local" 
                    className="input-field" 
                    value={tanggalBelanja}
                    onChange={(e) => setTanggalBelanja(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Total Belanja (Rp) <span className="required-star">*</span></label>
                <div className="input-field-wrapper">
                  <span className="prefix">Rp</span>
                  <input 
                    type="number" 
                    className="input-field with-icon" 
                    placeholder="0" 
                    value={totalBelanja}
                    onChange={(e) => setTotalBelanja(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Keterangan / Catatan</label>
                <div className="input-field-wrapper">
                  <textarea 
                    className="input-field" 
                    placeholder="Tuliskan rincian barang, alasan belanja, atau catatan tambahan di sini..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                  ></textarea>
                </div>
              </div>

            </div>

          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setViewMode('table')}>Batal</button>
            <button type="submit" className="btn-primary">
              <i className="fas fa-save"></i> Simpan Data Struk
            </button>
          </div>
        </form>
      </div>
    </>
  );

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

      <div className="tambah-container struk-grosir-container">
        {viewMode === 'table' ? renderTableMode() : renderFormMode()}
      </div>

      {viewImage && (
        <div className="image-viewer-overlay" onClick={() => setViewImage(null)}>
          <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
            <div className="image-viewer-header">
              <h3>{viewImage.judul_belanja || 'Foto Struk'}</h3>
              <button className="btn-close-viewer" onClick={() => setViewImage(null)}>
                <i className="fas fa-times"></i> Tutup
              </button>
            </div>
            <div className="image-viewer-body">
              <img 
                src={`http://localhost/TA-GABY/uploads/struk/${viewImage.nama_file_gambar}`} 
                alt="Preview Struk" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Gambar+Tidak+Ditemukan'; }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StrukGrosir;
