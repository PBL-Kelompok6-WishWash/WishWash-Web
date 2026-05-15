"use client";

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';

export default function LaporanPage() {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Laporan & Statistik
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Pendapatan', value: 'Rp 0', icon: <DollarSign className="text-emerald-500" />, trend: '0%' },
          { label: 'Pesanan Selesai', value: '0', icon: <Package className="text-blue-500" />, trend: '0%' },
          { label: 'Pelanggan Baru', value: '0', icon: <Users className="text-purple-500" />, trend: '0%' },
          { label: 'Rata-rata Order', value: 'Rp 0', icon: <TrendingUp className="text-amber-500" />, trend: '0%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                Bulan Ini
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-[#1e3a5f]">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-10 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Modul Laporan Sedang Dikembangkan</h3>
          <p className="text-slate-500 mb-8">
            Halaman ini nantinya akan menampilkan grafik pendapatan, performa layanan, dan statistik operasional WishWash secara real-time.
          </p>
          <div className="flex justify-center gap-3">
            <div className="w-3 h-3 bg-[#4FD1D9] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#4FD1D9] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-[#4FD1D9] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
