"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Package, 
  Users, Calendar, Clock, CreditCard, ChevronRight, ChevronLeft,
  ChevronUp, ChevronDown, Search, Download
} from 'lucide-react';
import { orderService } from '@/services/orderService';

const calcChartStep = (rawMax: number) => {
  const approxStep = rawMax / 5;
  if (approxStep <= 0) return 10000;
  const mag = Math.pow(10, Math.floor(Math.log10(approxStep)));
  return Math.ceil(approxStep / mag) * mag;
};

const calcMaxRev = (rawMax: number) => {
  if (rawMax <= 0) return 50000;
  const step = calcChartStep(rawMax);
  return Math.ceil(rawMax / step) * step;
};

const formatYAxisValue = (val: number) => {
  if (val >= 1000000) {
    return `Rp ${(val / 1000000).toFixed(1).replace('.0', '')}Jt`;
  }
  if (val >= 1000) {
    return `Rp ${(val / 1000).toFixed(0)}Rb`;
  }
  return `Rp ${val}`;
};

export default function LaporanPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [accumulatedRevenue, setAccumulatedRevenue] = useState(0);
  const [percentageTrend, setPercentageTrend] = useState("0%");
  const [maxRevenue, setMaxRevenue] = useState(50000);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'time', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [cashRatio, setCashRatio] = useState(0);
  const [digitalRatio, setDigitalRatio] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Filter and Sort Logic for Transactions table
  useEffect(() => {
    let result = [...transactions];

    // Day filter from clicking chart bars
    if (selectedDay !== null) {
      result = result.filter(tx => new Date(tx.time).getDate() === selectedDay);
    }

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        (tx.id && tx.id.toLowerCase().includes(q)) ||
        (tx.title && tx.title.toLowerCase().includes(q)) ||
        (tx.subtitle && tx.subtitle.toLowerCase().includes(q)) ||
        (tx.payment_method && tx.payment_method.toLowerCase().includes(q))
      );
    }

    // Apply Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'time') {
          const aTime = a.time ? new Date(a.time).getTime() : 0;
          const bTime = b.time ? new Date(b.time).getTime() : 0;
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
        }

        if (sortConfig.key === 'pelanggan') {
          aValue = (a.subtitle || '').split(' • ')[0] || '';
          bValue = (b.subtitle || '').split(' • ')[0] || '';
        }

        if (sortConfig.key === 'layanan') {
          const aParts = (a.subtitle || '').split(' • ');
          aParts.shift();
          aValue = aParts.join(' • ');

          const bParts = (b.subtitle || '').split(' • ');
          bParts.shift();
          bValue = bParts.join(' • ');
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [searchQuery, transactions, sortConfig, selectedDay]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: string) => {
    const isActive = sortConfig.key === columnKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';

    return (
      <div className="flex flex-col items-center -space-y-1.5 ml-1 shrink-0">
        <ChevronUp
          size={12}
          strokeWidth={isAsc ? 4 : 2}
          className={`transition-colors ${isAsc ? 'text-white' : 'text-slate-400/50'}`}
        />
        <ChevronDown
          size={12}
          strokeWidth={isDesc ? 4 : 2}
          className={`transition-colors ${isDesc ? 'text-white' : 'text-slate-400/50'}`}
        />
      </div>
    );
  };

  // Chart state
  const [svgChartBars, setSvgChartBars] = useState<{x: number, y: number, height: number, day: number, amount: number}[]>([]);

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const years = [2024, 2025, 2026, 2027];

  async function loadLaporan() {
    try {
      setIsLoading(true);
      const res = await orderService.getRevenueSummary(month, year);
      
      setTodayRevenue(res.today_revenue || 0);
      setMonthlyRevenue(res.monthly_revenue || 0);
      setAccumulatedRevenue(res.accumulated_revenue || 0);
      setPercentageTrend(res.percentage_trend || "0%");
      
      const txList = res.transactions || [];
      setTransactions(txList);

      // Hitung cash vs digital ratio
      if (txList.length > 0) {
        const cashCount = txList.filter((t: any) => t.method_type === 'cash').length;
        const cashPercent = Math.round((cashCount / txList.length) * 100);
        setCashRatio(cashPercent);
        setDigitalRatio(100 - cashPercent);
      } else {
        setCashRatio(50);
        setDigitalRatio(50);
      }

      // Generate daily chart for that month
      // Get number of days in selected month/year
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailySums = Array(daysInMonth).fill(0);

      txList.forEach((t: any) => {
        const txDate = new Date(t.time);
        if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
          const day = txDate.getDate();
          dailySums[day - 1] += t.amount || 0;
        }
      });

      const maxRev = calcMaxRev(Math.max(...dailySums, 0));
      setMaxRevenue(maxRev);
      const bars = dailySums.map((sum, index) => {
        const day = index + 1;
        const x = 60 + (index / (daysInMonth - 1 || 1)) * 515;
        // height: max 135 (from Y=160 to Y=25)
        const barHeight = maxRev > 0 ? (sum / maxRev) * 135 : 0;
        const y = 160 - barHeight;
        return { x, y, height: barHeight, day, amount: sum };
      });
      setSvgChartBars(bars);

    } catch (err) {
      console.error("Error loading laporan:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setSelectedDay(null);
    loadLaporan();
  }, [month, year]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-wider mb-1">
            Laporan Keuangan
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Analisis profitabilitas dan ringkasan transaksi bulanan.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
          {/* Month Dropdown */}
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-[#1e3a5f] rounded-xl focus:outline-none transition-colors cursor-pointer appearance-none border border-slate-200/50"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-[#1e3a5f] rounded-xl focus:outline-none transition-colors cursor-pointer appearance-none border border-slate-200/50"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button 
            onClick={() => window.print()}
            className="p-2.5 bg-[#4FD1D9] text-white rounded-xl hover:bg-[#3db8c0] transition-all duration-200 shadow-md shadow-[#4FD1D9]/20 hover:scale-105 active:scale-95 shrink-0"
            title="Cetak Laporan"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Pendapatan Bulan Ini', value: `Rp ${monthlyRevenue.toLocaleString('id-ID')}`, icon: <DollarSign className="text-emerald-500" />, sub: `Akumulasi bulan ${months[month-1].label}`, color: "emerald" },
          { label: 'Total Pendapatan Bersih', value: `Rp ${accumulatedRevenue.toLocaleString('id-ID')}`, icon: <TrendingUp className="text-[#4FD1D9]" />, sub: 'Total omset berjalan', color: "cyan" },
          { label: 'Rata-rata Harian', value: `Rp ${Math.round(monthlyRevenue / (new Date(year, month, 0).getDate())).toLocaleString('id-ID')}`, icon: <Clock className="text-purple-500" />, sub: 'Estimasi harian', color: "purple" },
          { label: 'Transaksi Bulan Ini', value: `${transactions.length} Order`, icon: <Package className="text-amber-500" />, sub: 'Status lunas/paid', color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                Laporan
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#1e3a5f] mb-1">{stat.value}</h3>
            <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
              stat.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
              stat.color === 'cyan' ? 'from-[#4FD1D9] to-blue-500' :
              stat.color === 'purple' ? 'from-purple-400 to-indigo-500' :
              'from-amber-400 to-orange-500'
            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        ))}
      </div>

      {/* Charts & Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-wide">Grafik Penjualan Harian</h3>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md tracking-wider uppercase">
              {months[month-1].label} {year}
            </span>
          </div>

          <div className="h-64 w-full relative flex items-end">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4FD1D9]"></div>
              </div>
            ) : svgChartBars.length === 0 || monthlyRevenue === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-300">
                Tidak ada data penjualan pada bulan ini.
              </div>
            ) : (
              <div className="w-full h-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4FD1D9" />
                      <stop offset="100%" stopColor="#1e3a5f" />
                    </linearGradient>
                    <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2fb5bd" />
                      <stop offset="100%" stopColor="#0f1e33" />
                    </linearGradient>
                    <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#4FD1D9" floodOpacity="0.2" />
                    </filter>
                  </defs>

                  {/* Vertical grid lines for each day */}
                  {svgChartBars.map((bar, idx) => (
                    <line 
                      key={`v-grid-${idx}`} 
                      x1={bar.x} 
                      y1="25" 
                      x2={bar.x} 
                      y2="160" 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                      strokeDasharray="2 3"
                    />
                  ))}

                  {/* Horizontal grid lines based on price ticks */}
                  {(() => {
                    const step = calcChartStep(maxRevenue);
                    const ticks: number[] = [];
                    for (let v = step; v <= maxRevenue; v += step) {
                      ticks.push(Math.round(v));
                    }
                    return ticks.map((val) => {
                      const yPos = 160 - (val / maxRevenue) * 135;
                      return (
                        <g key={`h-grid-group-${val}`}>
                          <line 
                            x1="55" 
                            x2="585" 
                            y1={yPos} 
                            y2={yPos} 
                            stroke="#cbd5e1" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                            opacity="0.3"
                          />
                          <text 
                            x="45" 
                            y={yPos} 
                            textAnchor="end" 
                            dominantBaseline="middle" 
                            className="fill-slate-400 font-normal text-[8px]"
                          >
                            {formatYAxisValue(val)}
                          </text>
                        </g>
                      );
                    });
                  })()}

                  {/* Y-axis Rp 0 label */}
                  <text 
                    x="45" 
                    y="160" 
                    textAnchor="end" 
                    dominantBaseline="middle" 
                    className="fill-slate-400 font-normal text-[8px]"
                  >
                    Rp 0
                  </text>

                  {/* Solid axis lines */}
                  <line x1="55" y1="160" x2="585" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="55" y1="25"  x2="55"  y2="160" stroke="#cbd5e1" strokeWidth="1.5" />

                   {/* X-axis labels centered below grid points natively */}
                   {svgChartBars.map((bar, idx) => {
                     const day = bar.day;
                     const isLastDay = day === svgChartBars.length;
                     const shouldShowLabel = day === 1 || day === 5 || day === 10 || day === 15 || day === 20 || day === 25 || day === 30 || isLastDay;
                     if (!shouldShowLabel) return null;
                     return (
                       <text 
                         key={`x-label-${idx}`}
                         x={bar.x} 
                         y="180" 
                         textAnchor="middle" 
                         className="fill-slate-400 font-extrabold text-[7.5px]"
                       >
                         Tgl {day}
                       </text>
                     );
                   })}

                  {/* Bars */}
                  {svgChartBars.map((bar, idx) => {
                    const isHovered = hoveredBar && hoveredBar.day === bar.day;
                    const isSelected = selectedDay === bar.day;
                    return (
                      <g key={idx} className="group/bar">
                        {/* Soft backdrop ray on hover */}
                        {(isHovered || isSelected) && (
                          <rect 
                            x={bar.x - 12}
                            y={25}
                            width="24"
                            height={135}
                            fill="#4FD1D9"
                            opacity={isSelected ? 0.12 : 0.06}
                            rx="6"
                          />
                        )}

                        {/* Transparent hover target */}
                        <rect
                          x={bar.x - 10}
                          y={0}
                          width="20"
                          height={200}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBar(bar)}
                          onMouseLeave={() => setHoveredBar(null)}
                          onClick={() => setSelectedDay(prev => prev === bar.day ? null : bar.day)}
                        />

                        {/* Visible bar */}
                        <rect 
                          x={bar.x - 6} 
                          y={bar.y} 
                          width="12" 
                          height={bar.height} 
                          fill={isSelected ? "url(#activeBarGradient)" : isHovered ? "url(#activeBarGradient)" : "url(#barGradient)"} 
                          rx="4"
                          filter="url(#barShadow)"
                          stroke={isSelected ? "#4FD1D9" : "none"}
                          strokeWidth={isSelected ? 1.5 : 0}
                          className="pointer-events-none transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredBar && (
                  <div 
                    className="absolute z-20 bg-[#1e3a5f] text-white px-3 py-1.5 rounded-xl text-xs font-normal border border-[#4FD1D9] shadow-xl pointer-events-none transition-all duration-100 flex flex-col items-center animate-fade-in"
                    style={{ 
                      left: `${(hoveredBar.x / 600) * 100}%`, 
                      top: `${((hoveredBar.y / 200) * 100) - 8}%`,
                      transform: 'translateX(-50%) translateY(-100%)'
                    }}
                  >
                    <span className="text-[9px] text-slate-300 font-medium">Tanggal {hoveredBar.day}</span>
                    <span>Rp {hoveredBar.amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      {/* Payment Methods Breakdowns will remain inside the grid container */}

        {/* Payment Methods Breakdowns */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group">
          <div>
            <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-wide mb-1">Metode Pembayaran</h3>
            <p className="text-slate-400 text-xs mb-8 font-medium">Distribusi penyelesaian order laundry</p>

            <div className="space-y-6">
              {/* Cash */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500" /> Cash / Tunai</span>
                  <span className="text-emerald-500">{cashRatio}%</span>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${cashRatio}%` }}></div>
                </div>
              </div>

              {/* Digital */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#4FD1D9]" /> Digital (QRIS/Bank)</span>
                  <span className="text-[#4FD1D9]">{digitalRatio}%</span>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                  <div className="h-full bg-[#4FD1D9] rounded-full transition-all duration-1000 ease-out" style={{ width: `${digitalRatio}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-[#1e3a5f]/5 transition-colors duration-300">
            <p className="text-[10px] font-black uppercase text-[#1e3a5f] tracking-wider mb-1">Total Pendapatan Terpilih</p>
            <p className="text-xl font-black text-[#1e3a5f]">Rp {monthlyRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-wide">Daftar Transaksi Selesai</h3>
                <p className="text-slate-400 text-xs font-medium">Histori pembayaran order laundry yang sudah selesai</p>
              </div>
              {selectedDay !== null && (
                <div className="flex items-center gap-1.5 bg-slate-100 text-[#1e3a5f] px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 animate-in fade-in zoom-in-95">
                  <span>Tanggal: {selectedDay}</span>
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="hover:text-red-500 font-extrabold text-xs ml-1 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari Transaksi..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#4FD1D9] transition-all font-medium"
                />
              </div>

              {/* Items per Page Dropdown */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 border-2 border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tampilkan:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-[#1e3a5f] focus:outline-none bg-transparent"
                >
                  <option value={5}>5 data</option>
                  <option value={10}>10 data</option>
                  <option value={20}>20 data</option>
                  <option value={50}>50 data</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4FD1D9] mb-4"></div>
              <p className="text-slate-400 font-bold">Memuat Transaksi...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-20 text-center font-bold text-slate-400">
              Tidak ada data transaksi yang ditemukan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse border-y border-slate-200">
              <thead>
                <tr className="bg-[#1e3a5f] text-white text-[10px] uppercase tracking-[0.15em] font-black select-none">
                  <th className="py-3 px-4 border-x border-white/10 text-center w-28 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Transaksi ID</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center justify-between">
                      <span>Order</span>
                      {renderSortIcon('title')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('pelanggan')}>
                    <div className="flex items-center justify-between">
                      <span>Pelanggan</span>
                      {renderSortIcon('pelanggan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('layanan')}>
                    <div className="flex items-center justify-between">
                      <span>Layanan</span>
                      {renderSortIcon('layanan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('time')}>
                    <div className="flex items-center justify-between">
                      <span>Waktu Transaksi</span>
                      {renderSortIcon('time')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 text-center cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('payment_method')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Metode</span>
                      {renderSortIcon('payment_method')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 text-right cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-between">
                      <span>Jumlah Bayar</span>
                      {renderSortIcon('amount')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {currentItems.map((tx, idx) => {
                  const parts = (tx.subtitle || '').split(' • ');
                  const pelangganName = parts[0] || '';
                  const layananName = parts.slice(1).join(' • ') || '';

                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-400 border-x border-slate-200">
                        {tx.id}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-bold text-[#1e3a5f]">
                        {tx.title}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-semibold text-slate-700">
                        {pelangganName}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-medium text-slate-600">
                        {layananName}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-slate-500 font-medium">
                        {new Date(tx.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold border uppercase tracking-wider whitespace-nowrap ${
                          tx.method_type === 'cash' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-right font-black text-emerald-600">
                        Rp {(tx.amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!isLoading && filteredTransactions.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400">
              Menampilkan <span className="text-[#1e3a5f]">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTransactions.length)}</span> dari <span className="text-[#1e3a5f]">{filteredTransactions.length}</span> data
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, '...', totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentPage, '...', totalPages);
                    }
                  }
                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ell-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-sm select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = page as number;
                    return (
                      <button 
                        key={pageNum} 
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pageNum === currentPage ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-[#1e3a5f] hover:border-[#1e3a5f]'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
