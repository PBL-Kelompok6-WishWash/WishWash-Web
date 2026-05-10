"use client";

import React from 'react';
import {
  Plus, Search, Edit2, Trash2,
  ChevronLeft, ChevronRight, ChevronsRight, ChevronDown
} from 'lucide-react';
// Import MasterDataNav SUDAH DIHAPUS DARI SINI 🧹

export default function MasterDataPage() {
  const services = [
    { id: 'LS001', img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=100&q=80', nama: 'Wash & Ironing', satuan: 'Kg', harga: 'Rp 6.500', status: 'Aktif' },
    { id: 'LS002', img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=100&q=80', nama: 'Ironing Only', satuan: 'Kg', harga: 'Rp 5.000', status: 'Aktif' },
    { id: 'LS003', img: 'https://images.unsplash.com/photo-1582735689146-28fa6b0a70f5?auto=format&fit=crop&w=100&q=80', nama: 'Wash Only', satuan: 'Kg', harga: 'Rp 5.000', status: 'Nonaktif' },
    { id: 'LS004', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=100&q=80', nama: 'Dry Clean', satuan: 'Pcs', harga: 'Rp 12.000', status: 'Aktif' },
  ];

  return (
    <div className="w-full">

      {/* Main Card Tabel */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">

        {/* Header Tabel */}
        <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
          <h3 className="text-2xl font-black text-[#1e3a5f]">Daftar Layanan</h3>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#123b6b] hover:bg-[#0c284a] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={18} />
              Tambah Layanan Baru
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari Layanan..."
                className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4FD1D9] w-64 text-[#1e3a5f]"
              />
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center text-[#1e3a5f]">
            <thead className="bg-[#e2e8f0] text-sm font-bold text-[#1e3a5f]">
              <tr>
                <th className="px-6 py-4 text-left">ID ▲</th>
                <th className="px-6 py-4">Gambar</th>
                <th className="px-6 py-4">Nama Layanan</th>
                <th className="px-6 py-4">Jenis Satuan</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv, index) => (
                <tr key={srv.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === services.length - 1 ? 'border-none' : ''}`}>
                  <td className="px-6 py-4 text-left text-[#1e3a5f] font-medium">{srv.id}</td>
                  <td className="px-6 py-4 flex justify-center">
                    <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={srv.img} alt={srv.nama} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{srv.nama}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-24">
                      <select className="w-full appearance-none border-2 border-slate-200 rounded-md px-3 py-1.5 bg-white text-[#1e3a5f] font-medium focus:outline-none focus:border-[#4FD1D9] cursor-pointer">
                        <option value="Kg">Kg</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {srv.harga} <span className="text-slate-400 font-normal">/ {srv.satuan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-md font-bold text-xs ${srv.status === 'Aktif' ? 'bg-[#9af3ae] text-green-800 border border-green-300' : 'bg-[#ff9c9c] text-red-900 border border-red-300'}`}>
                      {srv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-3">
                      <button className="text-slate-600 hover:text-blue-600 transition-colors"><Edit2 size={18} strokeWidth={2.5} /></button>
                      <button className="text-slate-600 hover:text-red-600 transition-colors"><Trash2 size={18} strokeWidth={2.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-end items-center gap-2 text-[#1e3a5f] bg-white border-t border-slate-200">
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronLeft size={18} /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 text-[#1e3a5f] font-bold text-xs">1</button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronRight size={18} /></button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronsRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}