import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';
import './GrafikPenjualan.css';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const YEARS = [2026, 2025, 2024];

import api from '../../utils/api';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const penjualan = payload.find(p => p.dataKey === 'total_penjualan')?.value || 0;
    const keuntungan = payload.find(p => p.dataKey === 'total_keuntungan')?.value || 0;
    
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <div className="tooltip-row penjualan">
          <span className="label-name">Penjualan:</span>
          <span className="value">{formatRupiah(penjualan)}</span>
        </div>
        <div className="tooltip-row keuntungan">
          <span className="label-name">Keuntungan:</span>
          <span className="value">{formatRupiah(keuntungan)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const GrafikPenjualan = () => {
  const [viewMode, setViewMode] = useState('Mingguan');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const period = viewMode === 'Mingguan' ? 'week' : (viewMode === 'Harian' ? 'month' : 'year');
        const res = await api.get(`/penjualan.php?filter=chart_data&period=${period}&month=${month}&year=${year}&_t=${Date.now()}`);
        setChartData(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Error fetching chart data:', e);
      }
    };
    fetchData();
  }, [viewMode, month, year]);

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return 'Rp 0k';
    return `Rp ${tickItem / 1000}k`;
  };

  const totalPenjualan = chartData.reduce((acc, curr) => acc + parseFloat(curr.total_penjualan || 0), 0);
  const totalKeuntungan = chartData.reduce((acc, curr) => acc + parseFloat(curr.total_keuntungan || 0), 0);
  const marginPercentage = totalPenjualan > 0 ? ((totalKeuntungan / totalPenjualan) * 100).toFixed(1) : 0;

  return (
    <div className="grafik-container">
      <div className="grafik-header">
        <div className="grafik-title-group">
          <div className="grafik-icon">
            <BarChart2 size={24} strokeWidth={2.5} />
          </div>
          <div className="grafik-title">
            <h3>Penjualan &amp; Keuntungan</h3>
            <p>Ringkasan performa bisnis Anda</p>
          </div>
        </div>
        
        <div className="grafik-controls">
          <div className="grafik-toggle">
            <button 
              className={`grafik-toggle-btn ${viewMode === 'Harian' ? 'active' : ''}`}
              onClick={() => setViewMode('Harian')}
            >
              Harian
            </button>
            <button 
              className={`grafik-toggle-btn ${viewMode === 'Mingguan' ? 'active' : ''}`}
              onClick={() => setViewMode('Mingguan')}
            >
              Mingguan
            </button>
            <button 
              className={`grafik-toggle-btn ${viewMode === 'Bulanan' ? 'active' : ''}`}
              onClick={() => setViewMode('Bulanan')}
            >
              Bulanan
            </button>
          </div>
          
          {viewMode !== 'Bulanan' && (
            <select className="grafik-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}
          
          <select className="grafik-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>


      <div className="grafik-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorKeuntungan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={formatYAxis}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total_penjualan" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPenjualan)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
            />
            <Area 
              type="monotone" 
              dataKey="total_keuntungan" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorKeuntungan)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot penjualan"></div>
          <span>Penjualan</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot keuntungan"></div>
          <span>Keuntungan</span>
        </div>
      </div>
    </div>
  );
};

export default GrafikPenjualan;
