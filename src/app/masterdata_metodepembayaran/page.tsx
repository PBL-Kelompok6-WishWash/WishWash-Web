"use client";

import React from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from 'lucide-react';
import MasterDataNav from '../components/MasterDataNav';

export default function MasterDataPembayaranPage() {
  // Data dummy sesuai gambar Metode Pembayaran
  const paymentMethods = [
    { id: 'MP001', nama: 'QRIS', provider: 'GoPay', biaya: 'Rp 0' },
    { id: 'MP002', nama: 'Transfer Bank', provider: 'Bank BNI', biaya: 'Rp 2.500' },
    { id: 'MP003', nama: 'COD', provider: '-', biaya: 'Rp 0' },
  ];

  return (
    <div className="w-full pt-10">
      
      {/* Menggunakan Komponen Navigasi Shared */}
      <MasterDataNav />

      {/* Main Card Tabel - mt-25 agar sejajar dengan tab lainnya */}
      <div className="mt-25 bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Tabel */}
        <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
          <h3 className="text-2xl font-black text-[#1e3a5f]">Daftar Metode Pembayaran</h3>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#123b6b] hover:bg-[#0c284a] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={18} />
              Tambah Metode Bayar
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Metode Bayar..." 
                className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4FD1D9] w-64 text-[#1e3a5f]"
              />
            </div>
          </div>
        </div>

        {/* Tabel Metode Pembayaran */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center text-[#1e3a5f]">
            <thead className="bg-[#e2e8f0] text-sm font-bold text-[#1e3a5f]">
              <tr>
                <th className="px-6 py-4 text-left flex items-center gap-1">
                  ID <span className="text-[10px] text-slate-400">▲</span>
                </th>
                <th className="px-6 py-4">Nama Metode Pembayaran</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Biaya Admin</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === paymentMethods.length - 1 ? 'border-none' : ''}`}
                >
                  <td className="px-6 py-4 text-left text-[#1e3a5f] font-medium">{item.id}</td>
                  <td className="px-6 py-4 text-[#1e3a5f] font-bold">{item.nama}</td>
                  <td className="px-6 py-4 text-[#1e3a5f]">{item.provider}</td>
                  <td className="px-6 py-4 text-[#1e3a5f] font-semibold">{item.biaya}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-4">
                      <button className="text-slate-600 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button className="text-slate-600 hover:text-red-600 transition-colors">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-end items-center gap-2 text-[#1e3a5f] bg-white border-t border-slate-200">
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 text-[#1e3a5f] font-bold text-xs">
            1
          </button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors">
            <ChevronRight size={18} />
          </button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors">
            <ChevronsRight size={18} />
          </button>
        </div>
        
      </div>
    </div>
  );
}