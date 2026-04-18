import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TambahBarang.css';

function StokKeluar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stokKeluarData, setStokKeluarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barangData, setBarangData] = useState([]);

  const userData = localStorage.getItem('user');
  if (!userData) {
    navigate('/login');
  }

  useEffect(() => {
    setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, barangRes] = await Promise.all([
        axios.get('/api/history_penjualan.php'),
        axios.get('/api/barang.php?_t=' + Date.now())
      ]);
      
      let history = historyRes.data;
      const barang = barangRes.data;
      
      setBarangData(barang);
      
      if (Array.isArray(history)) {
        let expandedHistory = [];
        
        history.forEach(item => {
          const namaField = item.nama_barang || '';
          const jumlahAsli = parseInt(item.jumlah) || 0;
          
          if (namaField.includes(', ') || namaField.match(/\d+\s*pcs/)) {
            const parts = namaField.split(', ');
            parts.forEach(part => {
              const match = part.match(/(.+?):\s*(\d+)\s*pcs/);
              if (match) {
                expandedHistory.push({
                  ...item,
                  nama_barang: match[1].trim(),
                  jumlah: parseInt(match[2]),
                  _split: true
                });
              } else if (part.includes(':')) {
                const [nama, jumlah] = part.split(':').map(s => s.trim());
                expandedHistory.push({
                  ...item,
                  nama_barang: nama,
                  jumlah: parseInt(jumlah.replace(' pcs', '')),
                  _split: true
                });
              }
            });
          } else if (namaField !== 'null' && namaField) {
            expandedHistory.push({
              ...item,
              jumlah: Math.abs(jumlahAsli)
            });
          }
        });
        
        expandedHistory = expandedHistory.filter(item => item.nama_barang && item.nama_barang !== 'null');
        
        const sortedHistory = expandedHistory.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        
const processedData = sortedHistory.map((item, index) => {
          const namaItem = item.nama_barang;
          const jumlah = Math.abs(parseInt(item.jumlah) || 0);
          
          const barangInfo = barang.find(b => b.nama_barang === namaItem);
          const idBarangDisplay = barangInfo?.id_barang || '-';
          const stokSaatIni = barangInfo ? parseInt(barangInfo.stok_total) || 0 : 0;
          
          const stokAwal = stokSaatIni + jumlah;
          const totalAfter = stokAwal - jumlah;
          
          return {
            ...item,
            id_barang_display: idBarangDisplay,
            stok_awal: Math.max(0, stokAwal),
            stok_keluar: jumlah,
            stok_total: Math.max(0, totalAfter)
          };
        });
        
        processedData.reverse();
        setStokKeluarData(processedData);
      } else {
        setStokKeluarData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setStokKeluarData([]);
    }
    setLoading(false);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmYes = () => {
    setShowConfirmModal(false);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleConfirmNo = () => {
    setShowConfirmModal(false);
  };

  const userParsed = userData ? JSON.parse(userData) : null;

  return (
    <div className="tambah-page">
      <div className="kasir-header">
        <div className="header-left">
          <h1>BERTY SHOP</h1>
        </div>
        <div className="header-right">
          <span className="kasir-label">ADMIN</span>
          <span className="kasir-name">- {userParsed?.username}</span>
        </div>
      </div>

      <div className="tambah-container">
        <button className="btn-back" onClick={() => navigate('/admin-dashboard')}>← Kembali ke Dashboard</button>

        <div className="table-card">
          <h3>RIWAYAT STOK KELUAR ({stokKeluarData.length})</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>ID</th>
                    <th>Nama Barang</th>
                    <th>Stok Awal</th>
                    <th>Stok Keluar (-)</th>
                    <th>Stok Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stokKeluarData.length > 0 ? (
                    stokKeluarData.map((item, index) => {
                      const stokAwalVal = Math.max(0, parseInt(item.stok_awal) || 0);
                      const stokKeluarVal = parseInt(item.stok_keluar) || 0;
                      const stokTotalVal = Math.max(0, parseInt(item.stok_total) || 0);
                      const displayDate = item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-';
                      return (
                        <tr key={item.id_history + '_' + index}>
                          <td>{index + 1}</td>
                          <td>{displayDate}</td>
                          <td>{item.id_barang_display || '-'}</td>
                          <td>{item.nama_barang}</td>
                          <td>{stokAwalVal}</td>
                          <td style={{color: '#dc3545', fontWeight: 'bold'}}>{stokKeluarVal}</td>
                          <td>{stokTotalVal}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty">Belum ada stok keluar</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  );
}

export default StokKeluar;