import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RiwayatPenjualan.css';

const RiwayatPenjualan = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/history_penjualan.php');
      setHistoryData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat data riwayat penjualan');
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals
  const totalTerjual = historyData.reduce((sum, item) => sum + Math.abs(item.jumlah), 0);
  const totalPendapatan = historyData.reduce((sum, item) => sum + parseFloat(item.total_harga || 0), 0);
  const totalKeuntungan = historyData.reduce((sum, item) => sum + parseFloat(item.keuntungan || 0), 0);

  return (
    <div className="riwayat-penjualan">
      <h2>Riwayat Penjualan</h2>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Terjual</h3>
          <p className="summary-value">{totalTerjual} unit</p>
        </div>
        <div className="summary-card">
          <h3>Total Pendapatan</h3>
          <p className="summary-value">{formatCurrency(totalPendapatan)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Keuntungan</h3>
          <p className="summary-value success">{formatCurrency(totalKeuntungan)}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Memuat data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Jumlah Terjual</th>
                <th>Harga Jual</th>
                <th>Total Bayar</th>
                <th>Keuntungan</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">Belum ada riwayat penjualan</td>
                </tr>
              ) : (
                historyData.map((item, index) => (
                  <tr key={item.id_history}>
                    <td>{index + 1}</td>
                    <td>{item.nama_barang}</td>
                    <td className="jumlah-negative">{item.jumlah}</td>
                    <td>{formatCurrency(item.harga_jual)}</td>
                    <td>{formatCurrency(item.total_harga)}</td>
                    <td className="keuntungan">{formatCurrency(item.keuntungan)}</td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiwayatPenjualan;
