"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function MasterDataPage() {
  const pathname = usePathname();

  const subMenus = [
    { name: 'Layanan', path: '/masterdata_layanan' },
    { name: 'Parfum', path: '/masterdata_parfum' },
    { name: 'Metode Pembayaran', path: '/masterdata_metode' },
    { name: 'Manajemen Promo', path: '/masterdata_promo' },
  ];

  return (
    <div className="w-full">
      {/* 1. Navigasi 4 Menu - Dibuat Flex-1 agar presisi memenuhi lebar */}
      <div className="flex w-full justify-between gap-4 mb-10">
        {subMenus.map((menu) => {
          const isActive = pathname === menu.path;
          return (
            <Link 
              key={menu.name}
              href={menu.path}
              className={`flex-1 py-3 px-4 rounded-xl text-center font-bold transition-all duration-200 border-2 ${
                isActive 
                  ? 'bg-[#4FD1D9] border-[#4FD1D9] text-white shadow-md' 
                  : 'bg-white border-[#4FD1D9] text-[#4FD1D9] hover:bg-[#4FD1D9]/10'
              }`}
            >
              {menu.name}
            </Link>
          );
        })}
      </div>

      {/* 2. Kartu Tabel - Ditambah mt-4 agar agak turun sedikit */}
      <div className="mt-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Tabel */}
        <div className="p-8 flex flex-wrap items-center justify-between gap-6">
          <h3 className="text-2xl font-extrabold text-[#1e3a5f]">Daftar Layanan</h3>
          
          <div className="flex items-center gap-4">
            {/* Tombol Tambah */}
            <button className="flex items-center gap-2 bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1e3a5f]/90 transition-all shadow-sm">
              <Plus size={20} />
              Tambah Layanan Baru
            </button>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Layanan..." 
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4FD1D9]/50 w-64"
              />
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center text-[#1e3a5f]">
            <thead className="bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-8 py-4 text-left">ID ▲</th>
                <th className="px-8 py-4">Gambar</th>
                <th className="px-8 py-4">Nama Layanan</th>
                <th className="px-8 py-4">Jenis Satuan</th>
                <th className="px-8 py-4">Harga</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Contoh Row */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 text-left font-medium text-slate-400">LS001</td>
                <td className="px-8 py-6">
                  <div className="w-16 h-12 bg-slate-200 rounded-lg mx-auto overflow-hidden">
                    {/* Image dummy */}
                  </div>
                </td>
                <td className="px-8 py-6 font-bold">Wash & Ironing</td>
                <td className="px-8 py-6">
                    <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none">
                        <option>Kg</option>
                        <option>Pcs</option>
                    </select>
                </td>
                <td className="px-8 py-6 font-bold text-[#4FD1D9]">Rp 6.500 <span className="text-slate-400 font-normal">/ Kg</span></td>
                <td className="px-8 py-6">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">AKTIF</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <Edit2 size={18} className="cursor-pointer hover:text-[#1e3a5f]" />
                    <Trash2 size={18} className="cursor-pointer hover:text-red-500" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}