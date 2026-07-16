"use client";

import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
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

// Komponen Animasi Angka Berputar (Counter)
function Counter({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  if (isCurrency) {
    return <span>Rp {displayValue.toLocaleString('id-ID')}</span>;
  }
  return <span>{displayValue.toLocaleString('id-ID')}</span>;
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
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isRowsOpen, setIsRowsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsMonthOpen(false);
      setIsYearOpen(false);
      setIsRowsOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  const [hoveredBar, setHoveredBar] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [printDateTime, setPrintDateTime] = useState('');

  useEffect(() => {
    const updatePrintTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
      const day = now.getDate();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = monthNames[now.getMonth()];
      const yearVal = now.getFullYear();
      setPrintDateTime(`${timeStr} ${day} ${monthName}, ${yearVal}`);
    };
    
    updatePrintTime();
    
    const handleBeforePrint = () => {
      updatePrintTime();
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

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
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

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

  const maxSalesDay = React.useMemo(() => {
    if (!svgChartBars || svgChartBars.length === 0) return null;
    let maxVal = -1;
    let bestDay: any = null;
    svgChartBars.forEach(b => {
      if (b.amount > maxVal) {
        maxVal = b.amount;
        bestDay = b;
      }
    });
    return bestDay && bestDay.amount > 0 ? bestDay : null;
  }, [svgChartBars]);

  const areaPaths = React.useMemo(() => {
    if (!svgChartBars || svgChartBars.length === 0) return { linePath: "", areaPath: "" };
    let linePath = `M ${svgChartBars[0].x} ${svgChartBars[0].y}`;
    for (let i = 1; i < svgChartBars.length; i++) {
      const prev = svgChartBars[i-1];
      const curr = svgChartBars[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = curr.x - (curr.x - prev.x) / 3;
      const cpY2 = curr.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    const areaPath = `${linePath} L ${svgChartBars[svgChartBars.length - 1].x} 160 L ${svgChartBars[0].x} 160 Z`;
    return { linePath, areaPath };
  }, [svgChartBars]);

  return (
    <>
      {/* Halaman Dashboard Biasa (Hidden on print) */}
      <div className="w-full space-y-8 pb-10 print:hidden">
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
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsMonthOpen(!isMonthOpen);
                setIsYearOpen(false);
              }}
              className="flex items-center justify-between w-44 px-4 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-bold text-[#1e3a5f] outline-none cursor-pointer transition-all duration-300 hover:border-[#4FD1D9]/60 hover:bg-white"
            >
              <span>{months.find(m => m.value === month)?.label || 'Januari'}</span>
              <ChevronDown 
                size={14} 
                className={`text-[#1e3a5f] transition-transform duration-300 ${isMonthOpen ? 'rotate-180' : 'rotate-0'}`} 
              />
            </button>
            
            {isMonthOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                {months.map(m => {
                  const isSelected = month === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => {
                        setMonth(m.value);
                        setIsMonthOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                        isSelected 
                          ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                      }`}
                    >
                      <span>{m.label}</span>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsYearOpen(!isYearOpen);
                setIsMonthOpen(false);
              }}
              className="flex items-center justify-between w-36 px-4 py-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-bold text-[#1e3a5f] outline-none cursor-pointer transition-all duration-300 hover:border-[#4FD1D9]/60 hover:bg-white"
            >
              <span>{year}</span>
              <ChevronDown 
                size={14} 
                className={`text-[#1e3a5f] transition-transform duration-300 ${isYearOpen ? 'rotate-180' : 'rotate-0'}`} 
              />
            </button>
            
            {isYearOpen && (
              <div className="absolute left-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                {years.map(y => {
                  const isSelected = year === y;
                  return (
                    <button
                      key={y}
                      onClick={() => {
                        setYear(y);
                        setIsYearOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                        isSelected 
                          ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                      }`}
                    >
                      <span>{y}</span>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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
          { label: 'Pendapatan Bulan Ini', numericValue: monthlyRevenue, isCurrency: true, suffix: '', icon: <DollarSign className="text-emerald-500" />, sub: `Akumulasi bulan ${months[month-1].label}`, color: "emerald" },
          { label: 'Total Pendapatan Bersih', numericValue: Math.round(monthlyRevenue * 0.85), isCurrency: true, suffix: '', icon: <TrendingUp className="text-[#4FD1D9]" />, sub: 'Estimasi bersih (85% omset)', color: "cyan" },
          { label: 'Rata-rata Harian', numericValue: Math.round(monthlyRevenue / (new Date(year, month, 0).getDate() || 30)), isCurrency: true, suffix: '', icon: <Clock className="text-purple-500" />, sub: 'Estimasi harian', color: "purple" },
          { label: 'Transaksi Bulan Ini', numericValue: transactions.length, isCurrency: false, suffix: ' Order', icon: <Package className="text-amber-500" />, sub: 'Status lunas/paid', color: "amber" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                Laporan
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#1e3a5f] mb-1">
              <Counter value={stat.numericValue} isCurrency={stat.isCurrency} />{stat.suffix}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
              stat.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
              stat.color === 'cyan' ? 'from-[#4FD1D9] to-blue-500' :
              stat.color === 'purple' ? 'from-purple-400 to-indigo-500' :
              'from-amber-400 to-orange-500'
            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </motion.div>
        ))}
      </div>

      {/* Charts & Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">        {/* Daily Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-md shadow-slate-200/50 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group"
        >
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="text-[#4FD1D9]" size={20} />
                Tren Penjualan Harian
              </h3>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                Monitoring grafik omset harian pada {months[month-1].label} {year}
              </p>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'area'
                    ? 'bg-[#1e3a5f] text-white shadow-md'
                    : 'text-slate-500 hover:text-[#1e3a5f] hover:bg-slate-100'
                }`}
              >
                <TrendingUp size={14} />
                Area
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'bar'
                    ? 'bg-[#1e3a5f] text-white shadow-md'
                    : 'text-slate-500 hover:text-[#1e3a5f] hover:bg-slate-100'
                }`}
              >
                <BarChart3 size={14} />
                Batang
              </button>
            </div>
          </div>

          {/* Quick Metrics Sub-Header */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 mb-6">
            <div className="border-r border-slate-200 last:border-0 pr-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Omset</p>
              <p className="text-sm font-extrabold text-[#1e3a5f] mt-0.5">Rp {monthlyRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className="border-r border-slate-200 last:border-0 px-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rata-rata</p>
              <p className="text-sm font-extrabold text-[#1e3a5f] mt-0.5">
                Rp {Math.round(monthlyRevenue / (svgChartBars.length || 30)).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="last:border-0 pl-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hari Puncak</p>
              <p className="text-sm font-extrabold text-emerald-600 truncate mt-0.5">
                {maxSalesDay ? `Tgl ${maxSalesDay.day} (${Math.round(maxSalesDay.amount / 1000)}K)` : '-'}
              </p>
            </div>
          </div>

          {/* Chart Display Area */}
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
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4FD1D9" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#4FD1D9" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4FD1D9" />
                      <stop offset="100%" stopColor="#1e3a5f" />
                    </linearGradient>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4FD1D9" />
                      <stop offset="100%" stopColor="#1e3a5f" />
                    </linearGradient>
                    <linearGradient id="activeBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2fb5bd" />
                      <stop offset="100%" stopColor="#0f1e33" />
                    </linearGradient>
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4FD1D9" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Horizontal dotted grid lines */}
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
                            stroke="#e2e8f0" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                            opacity="0.6"
                          />
                          <text 
                            x="45" 
                            y={yPos} 
                            textAnchor="end" 
                            dominantBaseline="middle" 
                            className="fill-slate-400 font-bold text-[8px]"
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
                    className="fill-slate-400 font-bold text-[8px]"
                  >
                    Rp 0
                  </text>

                  {/* Axis lines */}
                  <line x1="55" y1="160" x2="585" y2="160" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />

                  {/* X-axis labels centered below grid points */}
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
                        className="fill-slate-400 font-black text-[8px]"
                      >
                        Tgl {day}
                      </text>
                    );
                  })}

                  {/* Chart representation: AREA or BAR */}
                  {chartType === 'area' ? (
                    <>
                      {/* Area under the line */}
                      <path 
                        d={areaPaths.areaPath} 
                        fill="url(#areaGradient)" 
                        className="transition-all duration-300 animate-in fade-in"
                      />
                      
                      {/* Stroke line */}
                      <path 
                        d={areaPaths.linePath} 
                        fill="none" 
                        stroke="url(#lineGradient)" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />

                      {/* Glowing interactive dots */}
                      {svgChartBars.map((bar, idx) => {
                        const isHovered = hoveredBar && hoveredBar.day === bar.day;
                        const isSelected = selectedDay === bar.day;
                        if (bar.amount === 0) return null;
                        return (
                          <circle 
                            key={`dot-${idx}`}
                            cx={bar.x}
                            cy={bar.y}
                            r={isHovered || isSelected ? 6 : 4}
                            fill={isHovered || isSelected ? "#4FD1D9" : "#1e3a5f"}
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            filter={isHovered || isSelected ? "url(#glowFilter)" : "none"}
                            className="transition-all duration-150 pointer-events-none"
                          />
                        );
                      })}
                    </>
                  ) : (
                    /* Bar Representation */
                    svgChartBars.map((bar, idx) => {
                      const isHovered = hoveredBar && hoveredBar.day === bar.day;
                      const isSelected = selectedDay === bar.day;
                      return (
                        <g key={`bar-group-${idx}`}>
                          {/* Soft backdrop ray on hover */}
                          {(isHovered || isSelected) && (
                            <rect 
                              x={bar.x - 8}
                              y={25}
                              width="16"
                              height={135}
                              fill="#4FD1D9"
                              opacity={isSelected ? 0.12 : 0.06}
                              rx="4"
                            />
                          )}
                          <rect 
                            x={bar.x - 5} 
                            y={bar.y} 
                            width="10" 
                            height={bar.height} 
                            fill={isSelected ? "url(#activeBarGradient)" : isHovered ? "url(#activeBarGradient)" : "url(#barGradient)"} 
                            rx="3"
                            className="pointer-events-none transition-all duration-200"
                          />
                        </g>
                      );
                    })
                  )}

                  {/* Hotspots for interaction */}
                  {svgChartBars.map((bar, idx) => {
                    return (
                      <rect
                        key={`hotspot-${idx}`}
                        x={bar.x - 8}
                        y={20}
                        width="16"
                        height={140}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredBar(bar)}
                        onMouseLeave={() => setHoveredBar(null)}
                        onClick={() => setSelectedDay(prev => prev === bar.day ? null : bar.day)}
                      />
                    );
                  })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredBar && (
                  <div 
                    className="absolute z-20 bg-[#1e3a5f]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs font-bold border border-[#4FD1D9]/40 shadow-xl pointer-events-none transition-all duration-100 flex flex-col items-center animate-fade-in"
                    style={{ 
                      left: `${(hoveredBar.x / 600) * 100}%`, 
                      top: `${((hoveredBar.y / 200) * 100) - 10}%`,
                      transform: 'translateX(-50%) translateY(-100%)'
                    }}
                  >
                    <span className="text-[9px] text-[#4FD1D9] font-black uppercase tracking-wider">Tanggal {hoveredBar.day}</span>
                    <span className="font-extrabold text-[11px] mt-0.5">Rp {hoveredBar.amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      {/* Payment Methods Breakdowns will remain inside the grid container */}

        {/* Payment Methods Breakdowns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md shadow-slate-200/50 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group"
        >
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
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cashRatio}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-emerald-500 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Digital */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#4FD1D9]" /> Digital (QRIS/Bank)</span>
                  <span className="text-[#4FD1D9]">{digitalRatio}%</span>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${digitalRatio}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-[#4FD1D9] rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-[#1e3a5f]/5 transition-colors duration-300">
            <p className="text-[10px] font-black uppercase text-[#1e3a5f] tracking-wider mb-1">Total Pendapatan Terpilih</p>
            <p className="text-xl font-black text-[#1e3a5f]">Rp {monthlyRevenue.toLocaleString('id-ID')}</p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-md shadow-slate-200/50 overflow-hidden"
      >
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
                  className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#4FD1D9] transition-all font-medium text-[#1e3a5f]"
                />
              </div>

              {/* Items per Page Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRowsOpen(!isRowsOpen);
                  }}
                  className="flex items-center justify-between w-32 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-[#1e3a5f] outline-none cursor-pointer transition-all duration-300 hover:border-[#4FD1D9]/60 hover:shadow-md focus:border-[#4FD1D9] focus:ring-2 focus:ring-[#4FD1D9]/20"
                >
                  <span>{itemsPerPage} Baris</span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[#1e3a5f] transition-transform duration-300 ${isRowsOpen ? 'rotate-180' : 'rotate-0'}`} 
                  />
                </button>
                
                {isRowsOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                    {[5, 10, 20, 50].map(num => {
                      const isSelected = itemsPerPage === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setItemsPerPage(num);
                            setCurrentPage(1);
                            setIsRowsOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                            isSelected 
                              ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                          }`}
                        >
                          <span>{num} Baris</span>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
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
      </motion.div>
    </div>

    {/* Laporan Print / PDF View (Only visible on print) */}
    <div className="hidden print:block w-full text-slate-800 p-4 font-sans text-xs">
        {/* Header Laporan */}
        <div className="text-center mb-6 relative">
          {/* Top Left Print Date/Time */}
          <div className="absolute left-0 top-0 text-[10px] text-slate-500 font-normal">
            {printDateTime}
          </div>
          
          <h1 className="text-lg font-bold tracking-wider text-slate-900 uppercase">
            LAPORAN KEUANGAN LAUNDRY WISHWASH
          </h1>
          <h2 className="text-md font-bold text-slate-700 uppercase mt-1">
            BULAN {months[month-1]?.label.toUpperCase()} {year}
          </h2>
          <p className="text-[10px] text-red-600 font-semibold mt-1">
            {/* Range Date */}
            {`01 ${months[month-1]?.label} ${year} - ${new Date(year, month, 0).getDate()} ${months[month-1]?.label} ${year}`}
          </p>
          <div className="border-b-2 border-slate-800 w-full mt-4"></div>
        </div>

        {/* Data Table */}
        <table className="w-full border-collapse border border-slate-400 text-slate-800">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400">
              <th className="border border-slate-400 p-2 text-center w-8 font-bold">No</th>
              <th className="border border-slate-400 p-2 text-center w-24 font-bold">Tanggal</th>
              <th className="border border-slate-400 p-2 text-center w-28 font-bold">Transaksi ID</th>
              <th className="border border-slate-400 p-2 text-left w-36 font-bold">Pelanggan</th>
              <th className="border border-slate-400 p-2 text-left font-bold">Layanan / Order</th>
              <th className="border border-slate-400 p-2 text-center w-24 font-bold">Metode</th>
              <th className="border border-slate-400 p-2 text-right w-28 font-bold">Jumlah Bayar</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-slate-300 p-4 text-center text-slate-400 font-medium">
                  Tidak ada data transaksi pada bulan ini.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const parts = (tx.subtitle || '').split(' • ');
                const pelangganName = parts[0] || '';
                const layananName = parts.slice(1).join(' • ') || '';
                
                const txDate = new Date(tx.time);
                const formattedDate = txDate.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 text-center">{formattedDate}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">{tx.id}</td>
                    <td className="border border-slate-300 p-2 font-medium">{pelangganName}</td>
                    <td className="border border-slate-300 p-2 text-slate-600">{tx.title} {layananName ? `• ${layananName}` : ''}</td>
                    <td className="border border-slate-300 p-2 text-center capitalize">{tx.payment_method}</td>
                    <td className="border border-slate-300 p-2 text-right font-bold">
                      Rp {(tx.amount || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })
            )}
            
            {/* Total Row */}
            <tr className="bg-slate-50 border-t border-slate-400 font-bold">
              <td colSpan={6} className="border border-slate-400 p-2 text-right uppercase">
                Total Pendapatan :
              </td>
              <td className="border border-slate-400 p-2 text-right font-bold text-slate-900">
                Rp {monthlyRevenue.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Laporan */}
        <div className="mt-8 border-t border-slate-400 pt-2 flex justify-between text-[10px] text-slate-500 font-normal">
          <div>Halaman : 1</div>
          <div>Laporan Keuangan Laundry WishWash</div>
        </div>
      </div>
    </>
  );
}
