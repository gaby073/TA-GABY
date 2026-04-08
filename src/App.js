import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import TabelBarang from './components/TabelBarang';
import TambahBarang from './components/TambahBarang';
import StokMasuk from './components/StokMasuk';
import TransaksiPenjualan from './components/TransaksiPenjualan';
import RiwayatPenjualan from './components/RiwayatPenjualan';
import OwnerDashboard from './components/owner/OwnerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/tabel-barang" element={<TabelBarang />} />
        <Route path="/tambah-barang" element={<TambahBarang />} />
        <Route path="/tambah-barangan" element={<TambahBarang />} />
        <Route path="/stok-masuk" element={<StokMasuk />} />
        <Route path="/transaksi-penjualan" element={<TransaksiPenjualan />} />
        <Route path="/riwayat-penjualan" element={<RiwayatPenjualan />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
