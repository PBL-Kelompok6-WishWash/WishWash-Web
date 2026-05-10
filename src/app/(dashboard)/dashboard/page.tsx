import React from 'react';
import { ShoppingBag, RefreshCcw, Truck, CheckCircle2, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      {/* Header Khusus Dashboard */}
      <header className="flex justify-between items-center mb-10">
        <h2 className="text-[50px] font-bold text-[#1e3a5f] leading-tight">
          Hi, Admin Mahesa!
        </h2>
        
        {/* Profil Admin */}
        <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors h-fit">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FD1D9]">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mahesa" 
              alt="Admin" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[#1e3a5f]">Admin Mahesa</span>
          <ChevronDown size={18} className="text-[#1e3a5f]" />
        </div>
      </header>

      {/* 4 Kartu Statistik Utama */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pesanan', val: '17', color: 'text-purple-500', icon: <ShoppingBag size={24} /> },
          { label: 'Proses', val: '3', color: 'text-blue-500', icon: <RefreshCcw size={24} /> },
          { label: 'Antar', val: '13', color: 'text-orange-500', icon: <Truck size={24} /> },
          { label: 'Selesai', val: '35', color: 'text-green-500', icon: <CheckCircle2 size={24} /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border-2 border-slate-200 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 border-2 border-slate-100 rounded-md ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
            </div>
            <span className="text-4xl font-black text-[#1e3a5f]">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Kartu Total Pemasukan */}
      <div className="bg-white rounded-2xl border-2 border-[#4FD1D9] p-8 text-center mb-8 shadow-sm">
        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Total Pemasukan Bulan Ini</h3>
        <p className="text-3xl font-black text-[#1e3a5f]">Rp 1.250.000,00</p>
      </div>

      {/* Grid Grafik */}
      <div className="grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-slate-200 h-64 flex items-center justify-center p-4 shadow-sm">
            <div className="w-full h-full bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 italic">
              Area Grafik {i}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}