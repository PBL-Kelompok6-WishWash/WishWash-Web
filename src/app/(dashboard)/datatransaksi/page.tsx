"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, ChevronLeft, ChevronRight, 
  Filter, Calendar, Clock, User, Package, CreditCard,
  CheckCircle, Timer, AlertCircle
} from 'lucide-react';

// Interface dummy untuk tipe data transaksi
interface Transaksi {
  id_order: string;
  pelanggan: string;
  layanan: string;
  tgl_pesanan: string;
  total_bayar: number;
  status_pembayaran: 'Lunas' | 'Belum Bayar' | 'Proses';
  status_pesanan: string;
}

export default function DataTransaksiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Data Dummy untuk preview UI
  const dummyData: Transaksi[] = [
    { id_order: 'ORD-001', pelanggan: 'Budi Santoso', layanan: 'Cuci Kering Lipat', tgl_pesanan: '2024-05-15 10:30', total_bayar: 35000, status_pembayaran: 'Lunas', status_pesanan: 'Proses Cuci' },
    { id_order: 'ORD-002', pelanggan: 'Siti Aminah', layanan: 'Cuci & Setrika', tgl_pesanan: '2024-05-15 11:15', total_bayar: 50000, status_pembayaran: 'Belum Bayar', status_pesanan: 'Penjemputan' },
    { id_order: 'ORD-003', pelanggan: 'Andi Wijaya', layanan: 'Setrika', tgl_pesanan: '2024-05-14 09:00', total_bayar: 12000, status_pembayaran: 'Lunas', status_pesanan: 'Selesai' },
    { id_order: 'ORD-004', pelanggan: 'Rina Putri', layanan: 'Cuci Kering', tgl_pesanan: '2024-05-15 14:20', total_bayar: 25000, status_pembayaran: 'Proses', status_pesanan: 'Proses Timbang' },
    { id_order: 'ORD-005', pelanggan: 'Eko Prasetyo', layanan: 'Cuci Kering Lipat', tgl_pesanan: '2024-05-13 16:45', total_bayar: 42000, status_pembayaran: 'Lunas', status_pesanan: 'Selesai' },
  ];

  const getStatusPesananBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pesanan Diterima':
      case 'Penjemputan':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Siap Diantar':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  const getStatusBayarBadge = (status: string) => {
    switch (status) {
      case 'Lunas':
        return 'bg-emerald-500 text-white';
      case 'Belum Bayar':
        return 'bg-red-500 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-wider mb-1">
            Data Transaksi
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Monitoring seluruh pesanan laundry pelanggan secara real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Clock size={18} className="text-[#4FD1D9]" />
            <span className="text-sm font-bold text-[#1e3a5f]">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID Order, Nama Pelanggan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-[#4FD1D9] transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
             <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter size={18} /> Filter
             </button>
             <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#1e3a5f] rounded-2xl text-sm font-bold text-white hover:bg-[#122640] transition-all shadow-lg shadow-[#1e3a5f]/20">
                Export Laporan
             </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-[11px] uppercase tracking-[0.2em] font-black">
                <th className="p-5 border-x border-white/10 text-center w-24">ID Order</th>
                <th className="p-5 border-x border-white/10">Pelanggan</th>
                <th className="p-5 border-x border-white/10">Layanan</th>
                <th className="p-5 border-x border-white/10">Waktu Order</th>
                <th className="p-5 border-x border-white/10">Total Bayar</th>
                <th className="p-5 border-x border-white/10 text-center">Pembayaran</th>
                <th className="p-5 border-x border-white/10 text-center">Status Pesanan</th>
                <th className="p-5 border-x border-white/10 text-center w-24">Detail</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dummyData.map((order, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-center font-bold text-slate-400 border-x border-slate-50">
                    {order.id_order}
                  </td>
                  <td className="p-5 border-x border-slate-50 font-bold text-[#1e3a5f]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={14} />
                      </div>
                      {order.pelanggan}
                    </div>
                  </td>
                  <td className="p-5 border-x border-slate-50 font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#4FD1D9]" />
                      {order.layanan}
                    </div>
                  </td>
                  <td className="p-5 border-x border-slate-50 text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-300" />
                      {order.tgl_pesanan}
                    </div>
                  </td>
                  <td className="p-5 border-x border-slate-50 font-black text-[#1e3a5f]">
                    Rp {order.total_bayar.toLocaleString('id-ID')}
                  </td>
                  <td className="p-5 border-x border-slate-50 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusBayarBadge(order.status_pembayaran)}`}>
                      {order.status_pembayaran}
                    </span>
                  </td>
                  <td className="p-5 border-x border-slate-50 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold border ${getStatusPesananBadge(order.status_pesanan)}`}>
                      {order.status_pesanan}
                    </span>
                  </td>
                  <td className="p-5 border-x border-slate-50 text-center">
                    <button className="p-2.5 bg-slate-100 text-[#1e3a5f] rounded-xl hover:bg-[#4FD1D9] hover:text-white transition-all active:scale-95 shadow-sm">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan <span className="text-[#1e3a5f]">1 - 5</span> dari <span className="text-[#1e3a5f]">48</span> Order
           </p>
           <div className="flex items-center gap-2">
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1e3a5f] disabled:opacity-30 transition-all">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(n => (
                  <button key={n} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${n === 1 ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#1e3a5f] transition-all">
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}