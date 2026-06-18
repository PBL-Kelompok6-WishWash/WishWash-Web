"use client";

import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { 
  ShoppingBag, Users, DollarSign, Clock, 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  Package, Truck, Calendar, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { karyawanService } from '@/services/karyawanService';
import { pelangganService } from '@/services/pelangganService';
import { layananService } from '@/services/layananService';
import { getImageUrl } from '@/utils/imageHelper';

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
}

interface StatItem {
  label: string;
  value: number;
  isCurrency: boolean;
  icon: React.ReactNode;
  color: string;
  trend: string;
  isUp: boolean;
}

interface RecentOrder {
  id: string;
  customer: string;
  service: string;
  status: string;
  amount: string;
  foto_pelanggan: string;
  tgl_pesanan: string;
}

interface ActiveKurir {
  name: string;
  status: string;
  orders: number;
  foto: string;
}

const calcChartStep = (rawMax: number) => {
  // Pick step so there are ~5 ticks tightly spanning the data
  const approxStep = rawMax / 5;
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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [activeKurir, setActiveKurir] = useState<ActiveKurir[]>([]);
  const [popularServices, setPopularServices] = useState<{label: string, percent: number, color: string}[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'tgl_pesanan', direction: 'asc' });

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
      <div className="flex flex-col items-center -space-y-1 ml-1.5 shrink-0">
        <ChevronUp
          size={11}
          strokeWidth={isAsc ? 4 : 2.5}
          className={`transition-colors ${isAsc ? 'text-white' : 'text-white/40'}`}
        />
        <ChevronDown
          size={11}
          strokeWidth={isDesc ? 4 : 2.5}
          className={`transition-colors ${isDesc ? 'text-white' : 'text-white/40'}`}
        />
      </div>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [orderSearchQuery, sortConfig]);
  
  // Data State for Trends
  const [revenueData, setRevenueData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [svgPath, setSvgPath] = useState<string>("");
  const [svgAreaPath, setSvgAreaPath] = useState<string>("");
  const [svgPoints, setSvgPoints] = useState<{x: number, y: number, amount: number, dateLabel: string, labelText?: string}[]>([]);
  const [maxRevenueValue, setMaxRevenueValue] = useState<number>(100000);
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, amount: number, dateLabel: string} | null>(null);

  // Real-time Clock Effect
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [revenueRes, ordersRes, karyawanRes, pelangganRes, layananRes] = await Promise.all([
          orderService.getRevenueSummary(),
          orderService.getAll(),
          karyawanService.getAll().catch(() => ({ data: [] })),
          pelangganService.getAll().catch(() => ({ data: [] })),
          layananService.getAll().catch(() => ({ data: [] }))
        ]);

        setRevenueData(revenueRes);

        const allOrders = ordersRes.data || [];
        const allKaryawan = karyawanRes.data || [];
        const allPelanggan = pelangganRes.data || [];

        // 2. Process Stats
        const totalRevenue = revenueRes.monthly_revenue || 0;
        const incomingOrdersCount = allOrders.length;
        const activeCustomersCount = allPelanggan.length;

        const processCount = allOrders.filter((ord: any) => {
          const history = ord.RiwayatStatusDetail || ord.riwayatStatusDetail || [];
          if (history.length === 0) return true;
          const sortedHistory = [...history].sort((a, b) => {
            const idA = a.id_riwayat_status_detail || a.id_riwayat || a.IDRiwayat || 0;
            const idB = b.id_riwayat_status_detail || b.id_riwayat || b.IDRiwayat || 0;
            return idA - idB;
          });
          const lastStatusObj = sortedHistory[sortedHistory.length - 1];
          const refStatus = lastStatusObj.ReferensiStatus || lastStatusObj.referensiStatus;
          const lastStatus = refStatus?.nama_status || refStatus?.NamaStatus;
          return !["Selesai", "Batal", "Dibatalkan"].includes(lastStatus);
        }).length;

        const processedStats: StatItem[] = [
          { 
            label: 'Pendapatan Bulan Ini', 
            value: totalRevenue, 
            isCurrency: true, 
            icon: <DollarSign size={32} />, 
            color: 'from-emerald-400 to-emerald-600', 
            trend: revenueRes.percentage_trend || '0%', 
            isUp: !(revenueRes.percentage_trend && revenueRes.percentage_trend.startsWith('-'))
          },
          { 
            label: 'Total Pesanan', 
            value: incomingOrdersCount, 
            isCurrency: false, 
            icon: <ShoppingBag size={32} />, 
            color: 'from-[#4FD1D9] to-[#2fb5bd]', 
            trend: '+100%', 
            isUp: true 
          },
          { 
            label: 'Pelanggan Terdaftar', 
            value: activeCustomersCount, 
            isCurrency: false, 
            icon: <Users size={32} />, 
            color: 'from-purple-400 to-purple-600', 
            trend: '+100%', 
            isUp: true 
          },
          { 
            label: 'Cucian Diproses', 
            value: processCount, 
            isCurrency: false, 
            icon: <Clock size={32} />, 
            color: 'from-amber-400 to-amber-600', 
            trend: 'Aktif', 
            isUp: true 
          },
        ];
        setStats(processedStats);

        // 3. Process Recent Orders
        const processedRecent: RecentOrder[] = allOrders.map((ord: any) => {
          let statusName = "Pesanan Diterima";
          const history = ord.RiwayatStatusDetail || ord.riwayatStatusDetail || [];
          if (history.length > 0) {
            const sortedHistory = [...history].sort((a, b) => {
              const idA = a.id_riwayat_status_detail || a.id_riwayat || a.IDRiwayat || 0;
              const idB = b.id_riwayat_status_detail || b.id_riwayat || b.IDRiwayat || 0;
              return idA - idB;
            });
            const lastStatusObj = sortedHistory[sortedHistory.length - 1];
            const refStatus = lastStatusObj.ReferensiStatus || lastStatusObj.referensiStatus || lastStatusObj.referensi_status;
            statusName = refStatus?.nama_status || refStatus?.NamaStatus || "Pesanan Diterima";
          }

          let displayStatus = statusName;
          if (statusName === "Batal" || statusName === "Dibatalkan") {
            displayStatus = "Dibatalkan";
          } else if ((ord.kuantitas || 0) <= 0) {
            if (statusName === "Pesanan Diterima") displayStatus = "Menunggu Konfirmasi";
            else if (statusName === "Penjemputan") displayStatus = "Menunggu Dijemput";
            else if (statusName === "Proses Timbang") displayStatus = "Menunggu Timbang";
          }

          return {
            id: ord.kode_order || `ORD-${ord.id_order}`,
            customer: ord.Pelanggan?.nama_lengkap || "Pelanggan",
            service: ord.Layanan?.nama_layanan || "Layanan",
            status: displayStatus,
            amount: `Rp ${(ord.total_bayar || 0).toLocaleString('id-ID')}`,
            foto_pelanggan: ord.Pelanggan?.foto_pelanggan || "",
            tgl_pesanan: ord.tgl_pesanan || ""
          };
        });
        setRecentOrders(processedRecent);

        // 4. Process Karyawan Status (Petugas Aktif)
        const activeEmployees: ActiveKurir[] = allKaryawan.map((kar: any) => {
          const employeeId = kar.id_karyawan || kar.IDKaryawan || kar.id;
          const activeJobs = allOrders.filter((ord: any) => {
            const orderEmployeeId = ord.id_karyawan || ord.idKaryawan || ord.id_user || ord.UserID;
            if (orderEmployeeId !== employeeId) return false;
            
            const history = ord.RiwayatStatusDetail || ord.riwayatStatusDetail || [];
            if (history.length === 0) return false;
            
            const sortedHistory = [...history].sort((a, b) => {
              const idA = a.id_riwayat_status_detail || a.id_riwayat || a.IDRiwayat || 0;
              const idB = b.id_riwayat_status_detail || b.id_riwayat || b.IDRiwayat || 0;
              return idA - idB;
            });
            const lastStatusObj = sortedHistory[sortedHistory.length - 1];
            const refStatus = lastStatusObj.ReferensiStatus || lastStatusObj.referensiStatus;
            const lastStatus = refStatus?.nama_status || refStatus?.NamaStatus;
            
            return !["Selesai", "Batal", "Dibatalkan"].includes(lastStatus);
          }).length;

          const employeeName = kar.nama_karyawan || kar.NamaKaryawan || "Karyawan";
          const dbStatus = kar.status_ketersediaan || kar.StatusKetersediaan || "Tersedia";

          return {
            name: employeeName,
            status: dbStatus,
            orders: activeJobs,
            foto: kar.foto_karyawan || kar.FotoKaryawan || ""
          };
        });
        
        const sortedEmployees = activeEmployees
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5);
        
        if (sortedEmployees.length === 0) {
          setActiveKurir([
            { name: 'Rahmat', status: 'Tersedia', orders: 0, foto: "" },
            { name: 'Doni', status: 'Tersedia', orders: 0, foto: "" }
          ]);
        } else {
          setActiveKurir(sortedEmployees);
        }

        // 5. Popular Services
        const serviceCounts: { [key: string]: number } = {};
        allOrders.forEach((ord: any) => {
          const serviceName = ord.Layanan?.nama_layanan;
          if (serviceName) {
            serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
          }
        });
        const totalServiceOrders = allOrders.length || 1;
        const sortedServices = Object.entries(serviceCounts)
          .map(([label, count]) => ({
            label,
            percent: Math.round((count / totalServiceOrders) * 100)
          }))
          .sort((a, b) => b.percent - a.percent);

        const allLayanan = layananRes.data || [];
        const layananColorMap = new Map<string, string>();
        allLayanan.forEach((lay: any) => {
          if (lay.nama_layanan && lay.warna_layanan) {
            layananColorMap.set(lay.nama_layanan.toLowerCase().trim(), lay.warna_layanan);
          }
        });

        const fallbackColors = ['#4FD1D9', '#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#a855f7'];
        const processedServices = sortedServices.map((srv, idx) => {
          const cleanLabel = srv.label.toLowerCase().trim();
          const dbColor = layananColorMap.get(cleanLabel);
          return {
            ...srv,
            color: dbColor || fallbackColors[idx % fallbackColors.length]
          };
        });
        
        if (processedServices.length === 0) {
          setPopularServices([
            { label: 'Cuci Kering Lipat', percent: 65, color: '#4FD1D9' },
            { label: 'Cuci & Setrika', percent: 42, color: '#6366f1' },
            { label: 'Setrika Saja', percent: 28, color: '#f59e0b' }
          ]);
        } else {
          setPopularServices(processedServices);
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Recalculate Trend Line based on viewMode (weekly/monthly)
  useEffect(() => {
    if (!revenueData) return;

    const today = new Date();
    const transactions = revenueData.transactions || [];
    
    if (viewMode === 'weekly') {
      const daysLabel: string[] = [];
      const dailyRevenue = Array(7).fill(0);
      const dates: Date[] = [];

      for (let i = 6; i >= 0; i--) {
        const idx = 6 - i;  // idx 0 = oldest, idx 6 = today
        const d = new Date();
        d.setDate(today.getDate() - i);
        daysLabel.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));
        dates.push(d);
        
        const dateStr = d.toDateString();
        transactions.forEach((tx: any) => {
          const txDate = new Date(tx.time);
          if (txDate.toDateString() === dateStr) {
            dailyRevenue[idx] += tx.amount || 0;
          }
        });
      }

      setTrendLabels(daysLabel);

      const rawMax = Math.max(...dailyRevenue, 0);
      const maxRev = calcMaxRev(rawMax || 50000);
      setMaxRevenueValue(maxRev);
      const points = dailyRevenue.map((val, idx) => {
        const x = 55 + (idx / 6) * 530;
        const y = 270 - (val / maxRev) * 240;
        const dateLabel = dates[idx].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const labelText = dates[idx].toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase();
        return { x, y, amount: val, dateLabel, labelText };
      });
      setSvgPoints(points);

    } else {
      // Monthly: current month days
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dailyRevenue = Array(daysInMonth).fill(0);
      const dates: Date[] = [];
      
      const labels: string[] = [];
      // create labels at intervals to avoid crowding
      for (let i = 1; i <= daysInMonth; i++) {
        if (i === 1 || i === 7 || i === 14 || i === 21 || i === 28 || i === daysInMonth) {
          labels.push(`Tgl ${i}`);
        } else {
          labels.push("");
        }

        const d = new Date(today.getFullYear(), today.getMonth(), i);
        dates.push(d);

        const dateStr = d.toDateString();
        transactions.forEach((tx: any) => {
          const txDate = new Date(tx.time);
          if (txDate.toDateString() === dateStr) {
            dailyRevenue[i - 1] += tx.amount || 0;
          }
        });
      }
      setTrendLabels(labels.filter(l => l !== ""));

      const rawMax = Math.max(...dailyRevenue, 0);
      const maxRev = calcMaxRev(rawMax || 50000);
      setMaxRevenueValue(maxRev);
      const points = dailyRevenue.map((val, idx) => {
        const x = 55 + (idx / (daysInMonth - 1)) * 530;
        const y = 270 - (val / maxRev) * 240;
        const dateLabel = dates[idx].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const dayNum = idx + 1;
        const labelText = (dayNum === 1 || dayNum === 7 || dayNum === 14 || dayNum === 21 || dayNum === 28 || dayNum === daysInMonth)
          ? `Tgl ${dayNum}`
          : "";
        return { x, y, amount: val, dateLabel, labelText };
      });
      setSvgPoints(points);
    }

  }, [revenueData, viewMode]);

  // Generate SVG Path whenever points update
  useEffect(() => {
    if (svgPoints.length === 0) return;

    let pathStr = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      const cpX1 = svgPoints[i-1].x + (svgPoints[i].x - svgPoints[i-1].x) / 3;
      const cpY1 = svgPoints[i-1].y;
      const cpX2 = svgPoints[i].x - (svgPoints[i].x - svgPoints[i-1].x) / 3;
      const cpY2 = svgPoints[i].y;
      pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${svgPoints[i].x} ${svgPoints[i].y}`;
    }
    
    setSvgPath(pathStr);
    setSvgAreaPath(`${pathStr} L ${svgPoints[svgPoints.length - 1].x} 270 L ${svgPoints[0].x} 270 Z`);
  }, [svgPoints]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4FD1D9]"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 md:space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-wider">
            Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-[#1e3a5f] flex items-center gap-2">
            <Calendar size={14} className="text-[#4FD1D9]" />
            {currentTime ? (
              <span>
                {currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                <span className="text-[#4FD1D9] mx-1.5 font-black">•</span>
                <span className="font-mono text-[#1e3a5f]">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </span>
            ) : (
              <span>Memuat waktu...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white py-5 px-4 md:py-8 md:px-6 min-h-[120px] md:min-h-[140px] rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group flex flex-col justify-center"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 -mr-8 -mt-8 rounded-full transition-transform duration-500 group-hover:scale-150`}></div>
            
            {/* Trend Percentage Absolute Top Right */}
            <div className={`absolute top-5 right-6 flex items-center gap-0.5 text-[10px] font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
              {stat.isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              <span>{stat.trend}</span>
            </div>
            
            {/* Main Area: Icon on Left, Title+Value Stacked Centered on Right */}
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl text-white shadow-lg shrink-0`}>
                {stat.icon}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1e3a5f]">
                  <Counter value={stat.value} isCurrency={stat.isCurrency} />
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Main Chart - Revenue Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white px-4 pt-4 pb-3 md:px-6 md:pt-6 md:pb-4 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 md:mb-4">
            <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-wide">
              Tren Pendapatan {viewMode === 'weekly' ? 'Harian' : 'Bulanan'}
            </h3>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'weekly' 
                    ? 'bg-white text-[#1e3a5f] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Mingguan
              </button>
              <button 
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'monthly' 
                    ? 'bg-white text-[#1e3a5f] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
          
          {/* SVG Chart */}
          {(() => {
            const step = calcChartStep(maxRevenueValue);
            const ticks: number[] = [];
            for (let v = step; v <= maxRevenueValue; v += step) {
              ticks.push(Math.round(v));
            }
            return (
              <div className="h-56 sm:h-64 md:h-80 lg:h-96 w-full relative group/chart">
                {svgPath && (
                  <svg 
                    viewBox="0 0 600 300" 
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4FD1D9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4FD1D9" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    
                    {/* Solid axes */}
                    <line x1="55" y1="270" x2="585" y2="270" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="55" y1="30"  x2="55"  y2="270" stroke="#cbd5e1" strokeWidth="1.5" />
                    
                    {/* Ticks Gridlines */}
                    {ticks.map((val) => {
                      const yPos = 270 - (val / maxRevenueValue) * 240;
                      return (
                        <line key={val} x1="55" x2="585" y1={yPos} y2={yPos} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                      );
                    })}

                    {/* Vertical Gridlines */}
                    {svgPoints.map((pt, i) => {
                      const shouldDrawGrid = viewMode === 'weekly' || (pt.labelText && pt.labelText !== "");
                      return (
                        <g key={i}>
                          {shouldDrawGrid && (
                            <line 
                              x1={pt.x} 
                              y1="30" 
                              x2={pt.x} 
                              y2="270" 
                              stroke="#e2e8f0" 
                              strokeWidth="1" 
                              strokeDasharray="4 4"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    <motion.path 
                      initial={{ opacity: 0, fillOpacity: 0 }}
                      animate={{ opacity: 1, fillOpacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      d={svgAreaPath} 
                      fill="url(#chartGradient)"
                    />
                    
                    {/* Main Line with Glow */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d={svgPath} 
                      fill="none" 
                      stroke="#4FD1D9" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />

                  </svg>
                )}

                {/* HTML Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-0 pointer-events-none text-[8px] font-bold text-slate-400 select-none w-[8%]">
                  {/* Rp 0 label */}
                  <span 
                    className="absolute right-1.5 whitespace-nowrap leading-none" 
                    style={{ top: `${(270 / 300) * 100}%`, transform: 'translateY(-50%)' }}
                  >
                    Rp 0
                  </span>
                  {ticks.map((val) => {
                    const yPos = 270 - (val / maxRevenueValue) * 240;
                    return (
                      <span 
                        key={val} 
                        className="absolute right-1.5 whitespace-nowrap leading-none"
                        style={{ top: `${(yPos / 300) * 100}%`, transform: 'translateY(-50%)' }}
                      >
                        {formatYAxisValue(val)}
                      </span>
                    );
                  })}
                </div>

                {/* HTML X-axis Labels */}
                {svgPoints.map((pt, i) => {
                  if (!pt.labelText) return null;
                  return (
                    <span
                      key={i}
                      className="absolute text-[8px] font-bold text-[#94a3b8] select-none leading-none -translate-x-1/2 pointer-events-none tracking-wide"
                      style={{
                        left: `${(pt.x / 600) * 100}%`,
                        top: `${(285 / 300) * 100}%`
                      }}
                    >
                      {pt.labelText}
                    </span>
                  );
                })}

                {/* HTML Dots - always perfect circles regardless of SVG stretch */}
                {svgPoints.map((pt, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    className="absolute w-3 h-3 rounded-full bg-white border-2 border-[#4FD1D9] cursor-pointer shadow-sm hover:scale-150 transition-transform"
                    style={{
                      left: `${(pt.x / 600) * 100}%`,
                      top:  `${(pt.y / 300) * 100}%`,
                      marginLeft: '-6px',
                      marginTop:  '-6px',
                    }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* Hover Tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute z-20 bg-[#1e3a5f] text-white px-3 py-2 rounded-xl text-xs font-bold border border-[#4FD1D9] shadow-xl pointer-events-none transition-all duration-100 flex flex-col items-center"
                    style={{ 
                      left: `${(hoveredPoint.x / 600) * 100}%`, 
                      top: `${((hoveredPoint.y / 300) * 100) - 14}%`,
                      transform: 'translateX(-50%) translateY(-100%)'
                    }}
                  >
                    <span className="text-[10px] text-slate-300 font-medium">{hoveredPoint.dateLabel}</span>
                    <span>Rp {hoveredPoint.amount.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>

        {/* Popular Services */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-wide mb-0.5">Layanan Terpopuler</h3>
            <p className="text-slate-400 text-[11px] mb-6 font-medium">Layanan yang paling sering dipesan</p>
            
            <div className="space-y-6">
              {popularServices.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span className="text-[#4FD1D9]">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-3 text-[#1e3a5f]">
                <div className="p-2 bg-white rounded-xl shadow-sm text-[#4FD1D9]">
                   <TrendingUp size={16} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-wider">Insight Operasional</p>
                   <p className="text-xs font-semibold text-slate-500">
                     {popularServices.length > 0 ? `${popularServices[0].label} mendominasi pemesanan.` : "Menunggu data transaksi masuk."}
                   </p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Recent Orders */}
        {(() => {
          const itemsPerPage = 5;
          const filteredOrders = recentOrders.filter(order => 
            order.customer.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            order.service.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            order.status.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
          );

          // Apply sorting
          const sortedOrders = [...filteredOrders];
          if (sortConfig.key) {
            sortedOrders.sort((a: any, b: any) => {
              let aValue = a[sortConfig.key];
              let bValue = b[sortConfig.key];

              if (sortConfig.key === 'amount') {
                const aNum = parseInt(aValue.replace(/[^0-9]/g, '')) || 0;
                const bNum = parseInt(bValue.replace(/[^0-9]/g, '')) || 0;
                return sortConfig.direction === 'asc' ? bNum - aNum : aNum - bNum;
              }

              if (sortConfig.key === 'tgl_pesanan') {
                const aTime = aValue ? new Date(aValue).getTime() : 0;
                const bTime = bValue ? new Date(bValue).getTime() : 0;
                return sortConfig.direction === 'asc' ? bTime - aTime : aTime - bTime;
              }

              aValue = (aValue || '').toString().toLowerCase();
              bValue = (bValue || '').toString().toLowerCase();

              if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
              if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
            });
          }

          const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
          const paginatedOrders = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 h-fit"
            >
              <div>
                {/* Header Section with Title & Search Bar */}
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-wide">Pesanan Terbaru</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-64 shrink-0">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={14} className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Cari pesanan..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-xs font-medium transition-colors"
                      />
                    </div>
                    <a href="/datatransaksi" className="text-[11px] font-bold text-[#4FD1D9] uppercase tracking-wider hover:opacity-70 transition-opacity mr-2">Selengkapnya</a>
                  </div>
                </div>
                
                <div className="overflow-x-auto border border-slate-200">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-[#1e3a5f] text-white text-[10px] uppercase tracking-wider select-none">
                        <th className="py-2.5 px-3 font-bold border-x border-white/10 text-center w-24 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('id')}>
                          <div className="flex items-center justify-center gap-1">
                            <span>ID Order</span>
                            {renderSortIcon('id')}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 font-bold border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('tgl_pesanan')}>
                          <div className="flex items-center justify-between">
                            <span>Tanggal & Waktu</span>
                            {renderSortIcon('tgl_pesanan')}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 font-bold border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('customer')}>
                          <div className="flex items-center justify-between">
                            <span>Pelanggan</span>
                            {renderSortIcon('customer')}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 font-bold border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('service')}>
                          <div className="flex items-center justify-between">
                            <span>Layanan</span>
                            {renderSortIcon('service')}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 font-bold text-center border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('status')}>
                          <div className="flex items-center justify-center gap-1">
                            <span>Status</span>
                            {renderSortIcon('status')}
                          </div>
                        </th>
                        <th className="py-2.5 px-3 font-bold text-right border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('amount')}>
                          <div className="flex items-center justify-end gap-1">
                            <span>Total</span>
                            {renderSortIcon('amount')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center font-bold text-slate-400">
                            {orderSearchQuery ? "Data tidak ditemukan." : "Belum ada pesanan terbaru."}
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order, i) => (
                          <tr key={i} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-[#1e3a5f] text-center border-x border-slate-200">{order.id}</td>
                            <td className="py-2.5 px-3 text-slate-500 font-semibold border-x border-slate-200">
                              {order.tgl_pesanan ? new Date(order.tgl_pesanan).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':') : '-'}
                            </td>
                            <td className="py-2.5 px-3 border-x border-slate-200">
                              <div className="flex items-center gap-2.5">
                                {order.foto_pelanggan ? (
                                  <img 
                                    src={getImageUrl(order.foto_pelanggan)} 
                                    alt={order.customer} 
                                    className="w-6 h-6 rounded-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#4FD1D9] group-hover:text-white transition-all duration-300">
                                    <Users size={10} />
                                  </div>
                                )}
                                <span className="font-bold text-[#1e3a5f] text-xs">{order.customer}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-semibold uppercase tracking-tight border-x border-slate-200">{order.service}</td>
                            <td className="py-2.5 px-3 text-center border-x border-slate-200">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider whitespace-nowrap ${
                                order.status.toLowerCase().includes('menunggu') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                ['Batal', 'Dibatalkan'].includes(order.status) ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-slate-700 border-x border-slate-200">{order.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Master-Style Pagination Controls */}
              {!isLoading && filteredOrders.length > 0 && (
                <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                  <p className="text-[11px] font-bold text-slate-400">
                    Menampilkan <span className="text-[#1e3a5f]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-[#1e3a5f]">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> dari <span className="text-[#1e3a5f]">{filteredOrders.length}</span> data
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                    >
                      <ChevronLeft size={14} />
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
                              <span key={`ell-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold text-xs select-none">
                                ...
                              </span>
                            );
                          }
                          const pageNum = page as number;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${currentPage === pageNum
                                ? 'bg-[#1e3a5f] text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 bg-white border border-slate-200 hover:text-[#1e3a5f] hover:border-[#1e3a5f]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* Petugas Aktif */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30"
        >
          <h3 className="text-base font-black text-[#1e3a5f] mb-5 uppercase tracking-wide text-center lg:text-left">Petugas Aktif</h3>
          <div className="space-y-5">
            {activeKurir.map((kurir, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {kurir.foto ? (
                    <img 
                      src={getImageUrl(kurir.foto)} 
                      alt={kurir.name} 
                      className="w-8 h-8 rounded-lg object-cover animate-in fade-in" 
                    />
                  ) : (
                    <div className={`p-2 rounded-lg ${
                      kurir.status.toLowerCase() === 'sibuk' 
                        ? 'bg-amber-50 text-amber-500' 
                        : kurir.status.toLowerCase() === 'tersedia'
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      <Truck size={14} />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#1e3a5f]">{kurir.name}</p>
                    <p className="text-[9px] font-bold text-slate-400">{kurir.orders} Tugas ({kurir.status})</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  kurir.status.toLowerCase() === 'tersedia' 
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                    : kurir.status.toLowerCase() === 'sibuk'
                    ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                }`}></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}