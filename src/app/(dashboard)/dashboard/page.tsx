"use client";

import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { 
  ShoppingBag, Users, DollarSign, Clock, 
  ArrowUpRight, ArrowDownRight, TrendingUp, 
  Package, Truck, CheckCircle, MoreHorizontal,
  Calendar
} from 'lucide-react';

// Komponen Animasi Angka Berputar (Counter)
function Counter({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
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

export default function DashboardPage() {
  
  const stats = [
    { label: 'Total Pendapatan', value: 12450000, isCurrency: true, icon: <DollarSign size={24} />, color: 'from-emerald-400 to-emerald-600', trend: '+12.5%', isUp: true },
    { label: 'Pesanan Masuk', value: 148, isCurrency: false, icon: <ShoppingBag size={24} />, color: 'from-[#4FD1D9] to-[#2fb5bd]', trend: '+8.2%', isUp: true },
    { label: 'Pelanggan Aktif', value: 86, isCurrency: false, icon: <Users size={24} />, color: 'from-purple-400 to-purple-600', trend: '+2.4%', isUp: true },
    { label: 'Proses Cuci', value: 12, isCurrency: false, icon: <Clock size={24} />, color: 'from-amber-400 to-amber-600', trend: '-4.1%', isUp: false },
  ];

  const recentOrders = [
    { id: 'ORD-128', customer: 'Budi Santoso', service: 'Cuci Kering Lipat', status: 'Proses', amount: 'Rp 35.000' },
    { id: 'ORD-127', customer: 'Siti Aminah', service: 'Cuci & Setrika', status: 'Selesai', amount: 'Rp 50.000' },
    { id: 'ORD-126', customer: 'Andi Wijaya', service: 'Setrika', status: 'Siap Diantar', amount: 'Rp 12.000' },
    { id: 'ORD-125', customer: 'Rina Putri', service: 'Cuci Kering', status: 'Penjemputan', amount: 'Rp 25.000' },
  ];

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Header Section - Konsisten dengan menu lain */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-wider">
            Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm text-sm font-bold text-[#1e3a5f] flex items-center gap-2">
            <Calendar size={16} className="text-[#4FD1D9]" />
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 -mr-8 -mt-8 rounded-full transition-transform duration-500 group-hover:scale-150`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-black ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#1e3a5f]">
              <Counter value={stat.value} isCurrency={stat.isCurrency} />
            </h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart - Revenue Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-wide">
              Tren Pendapatan
            </h3>
            <div className="flex gap-2">
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md tracking-wider uppercase">Mingguan</span>
               <button className="text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
               </button>
            </div>
          </div>
          
          {/* SVG Chart - Modern & Simple */}
          <div className="h-64 w-full relative flex items-end justify-between px-2 pt-10 group/chart">
            <svg 
              viewBox="0 0 600 200" 
              className="absolute inset-0 w-full h-full p-4 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4FD1D9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4FD1D9" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Area fill */}
              <motion.path 
                initial={{ opacity: 0, fillOpacity: 0 }}
                animate={{ opacity: 1, fillOpacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                d="M0,150 C50,150 50,80 100,80 S150,120 200,120 S250,50 300,50 S350,180 400,180 S450,40 500,40 S550,100 600,100 L600,200 L0,200 Z" 
                fill="url(#chartGradient)"
              />
              
              {/* Main Line with Glow */}
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d="M0,150 C50,150 50,80 100,80 S150,120 200,120 S250,50 300,50 S350,180 400,180 S450,40 500,40 S550,100 600,100" 
                fill="none" 
                stroke="#4FD1D9" 
                strokeWidth="4" 
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Data Points */}
              {[0, 100, 200, 300, 400, 500, 600].map((x, i) => {
                const yValues = [150, 80, 120, 50, 180, 40, 100];
                return (
                  <motion.circle
                    key={i}
                    initial={{ r: 0 }}
                    animate={{ r: 4 }}
                    transition={{ delay: 1.5 + (i * 0.1) }}
                    cx={x}
                    cy={yValues[i]}
                    fill="white"
                    stroke="#4FD1D9"
                    strokeWidth="3"
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                )
              })}
            </svg>
            
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
              <div key={day} className="flex flex-col items-center gap-3 z-10">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popular Services - Konsisten Warna Putih */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-wide mb-1">Layanan Populer</h3>
            <p className="text-slate-400 text-xs mb-8 font-medium">Top 3 Layanan paling diminati</p>
            
            <div className="space-y-6">
              {[
                { label: 'Cuci Kering Lipat', percent: 65, color: 'bg-[#4FD1D9]' },
                { label: 'Cuci & Setrika', percent: 42, color: 'bg-indigo-500' },
                { label: 'Setrika Saja', percent: 28, color: 'bg-amber-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span className="text-[#4FD1D9]">{item.percent}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className={`h-full ${item.color} rounded-full`}
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
                   <p className="text-[10px] font-black uppercase tracking-wider">Insight Hari Ini</p>
                   <p className="text-xs font-medium text-slate-500">Layanan cuci lipat naik 15%</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-wide">Pesanan Terbaru</h3>
            <button className="text-[10px] font-black text-[#4FD1D9] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Selengkapnya</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-4">Pelanggan</th>
                  <th className="pb-4">Layanan</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-[#4FD1D9] group-hover:text-white transition-all duration-300">
                          <Users size={14} />
                        </div>
                        <span className="font-bold text-[#1e3a5f]">{order.customer}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-bold text-xs uppercase tracking-tight">{order.service}</td>
                    <td className="py-4 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'Proses' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-black text-[#1e3a5f]">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Karyawan Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30"
        >
          <h3 className="text-lg font-black text-[#1e3a5f] mb-6 uppercase tracking-wide text-center lg:text-left">Petugas Aktif</h3>
          <div className="space-y-6">
            {[
              { name: 'Rahmat', status: 'Sibuk', orders: 4 },
              { name: 'Doni', status: 'Tersedia', orders: 0 },
              { name: 'Fikri', status: 'Sibuk', orders: 2 },
            ].map((kurir, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${kurir.status === 'Sibuk' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1e3a5f]">{kurir.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{kurir.orders} Tugas Aktif</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${kurir.status === 'Sibuk' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}