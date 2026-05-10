import React from 'react';
import { ShoppingBag, RefreshCcw, Truck, CheckCircle2, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>

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