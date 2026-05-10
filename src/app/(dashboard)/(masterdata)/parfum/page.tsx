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

export default function MasterDataParfumPage() {
  // Data dummy untuk tabel Parfum
  const parfums = [
    {
      id: 'PRF001',
      nama: 'Malaikat Subuh',
      keterangan: 'Wangi enak cihuy wer werr'
    },
    {
      id: 'PRF002',
      nama: 'Lavender Bliss',
      keterangan: 'Wewangian menenangkan dengan aroma lavender asli'
    },
    {
      id: 'PRF003',
      nama: 'Citrus Burst',
      keterangan: 'Aroma jeruk segar yang memberikan energi'
    },
    {
      id: 'PRF004',
      nama: 'Fresh Cotton',
      keterangan: 'Aroma manis seperti permen karet'
    },
  ];

  return (
    <div className="w-full pt-10">

      {/* Main Card Tabel - mt-25 agar konsisten dengan halaman Layanan */}
      <div className="mt-25 bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">

        {/* Header Tabel */}
        <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
          <h3 className="text-2xl font-black text-[#1e3a5f]">Daftar Parfum</h3>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#123b6b] hover:bg-[#0c284a] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={18} />
              Tambah Parfum Baru
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari Parfum..."
                className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4FD1D9] w-64 text-[#1e3a5f]"
              />
            </div>
          </div>
        </div>

        {/* Tabel Parfum */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#1e3a5f]">
            <thead className="bg-[#e2e8f0] text-sm font-bold text-[#1e3a5f]">
              <tr>
                <th className="px-6 py-4 flex items-center gap-1">
                  ID <span className="text-[10px] text-slate-400">▲</span>
                </th>
                <th className="px-6 py-4">Nama Parfum</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {parfums.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === parfums.length - 1 ? 'border-none' : ''}`}
                >
                  {/* ID */}
                  <td className="px-6 py-4 text-[#1e3a5f] font-medium">{item.id}</td>

                  {/* Nama Parfum */}
                  <td className="px-6 py-4 text-[#1e3a5f] font-bold">{item.nama}</td>

                  {/* Keterangan */}
                  <td className="px-6 py-4 text-[#1e3a5f] max-w-xs italic">{item.keterangan}</td>

                  {/* Action Buttons */}
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

        {/* Pagination Bawah */}
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