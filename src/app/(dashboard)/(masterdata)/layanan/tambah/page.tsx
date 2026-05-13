"use client";

import React, { useState } from 'react';
import { ChevronLeft, Image as ImageIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function TambahLayananPage() {
  const [status, setStatus] = useState('Aktif');

  return (
    <div className="w-full bg-white min-h-screen p-8 rounded-2xl border-2 border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/masterdata_layanan" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={32} className="text-[#123b6b]" strokeWidth={3} />
        </Link>
        <h1 className="text-2xl font-black text-[#123b6b]">Tambah Layanan Baru</h1>
      </div>

      <hr className="mb-10 border-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
        
        {/* Kolom Kiri */}
        <div className="space-y-8">
          {/* ID Layanan */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#123b6b]">ID Layanan</label>
            <input 
              type="text" 
              value="LS005" 
              disabled 
              className="w-full p-3 bg-slate-200 border-2 border-slate-300 rounded-lg text-slate-500 font-medium outline-none"
            />
          </div>

          {/* Nama Layanan */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#123b6b]">Nama Layanan</label>
            <input 
              type="text" 
              placeholder="Contoh: Wash & Ironing" 
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-[#4FD1D9] outline-none transition-colors text-[#123b6b]"
            />
          </div>

          {/* Gambar Layanan */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#123b6b]">Gambar Layanan</label>
            <div className="relative group cursor-pointer">
              <div className="w-full h-48 border-2 border-dashed border-[#4FD1D9] rounded-2xl bg-[#E6F9FA] flex flex-col items-center justify-center gap-3 transition-all group-hover:bg-[#D1F2F4]">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <ImageIcon size={48} className="text-[#1e9a9f]" />
                </div>
                <span className="text-[#1e9a9f] font-bold text-sm flex items-center gap-2">
                  <span className="text-xl">+</span> Tambah Gambar Layanan
                </span>
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-8">
          {/* Jenis Satuan */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#123b6b]">Jenis Satuan</label>
            <div className="relative">
              <select className="w-full p-3 appearance-none border-2 border-slate-200 rounded-lg focus:border-[#4FD1D9] outline-none bg-white text-[#123b6b] font-medium cursor-pointer">
                <option value="Kg">Kg</option>
                <option value="Pcs">Pcs</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#123b6b]" size={24} />
            </div>
          </div>

          {/* Harga */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#123b6b]">Harga</label>
            <div className="flex items-center">
              <div className="bg-slate-200 border-2 border-r-0 border-slate-200 px-4 py-3 rounded-l-lg text-slate-500 font-bold">
                Rp
              </div>
              <input 
                type="number" 
                placeholder="0" 
                className="flex-1 p-3 border-2 border-slate-200 focus:border-[#4FD1D9] outline-none text-[#123b6b] font-medium"
              />
              <div className="bg-slate-200 border-2 border-l-0 border-slate-200 px-4 py-3 rounded-r-lg text-slate-500 font-medium">
                / unit
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#123b6b]">Status</label>
            <div className="flex gap-16">
              {/* Aktif */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="status" 
                    className="sr-only" 
                    checked={status === 'Aktif'}
                    onChange={() => setStatus('Aktif')}
                  />
                  <div className={`w-7 h-7 rounded-full border-2 transition-all ${status === 'Aktif' ? 'border-[#1e9a9f]' : 'border-slate-300'}`}></div>
                  {status === 'Aktif' && <div className="absolute w-4 h-4 bg-[#1e9a9f] rounded-full"></div>}
                </div>
                <span className={`font-bold ${status === 'Aktif' ? 'text-[#123b6b]' : 'text-slate-400'}`}>Aktif</span>
              </label>

              {/* Nonaktif */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="status" 
                    className="sr-only" 
                    checked={status === 'Nonaktif'}
                    onChange={() => setStatus('Nonaktif')}
                  />
                  <div className={`w-7 h-7 rounded-full border-2 transition-all ${status === 'Nonaktif' ? 'border-[#123b6b]' : 'border-slate-300'}`}></div>
                  {status === 'Nonaktif' && <div className="absolute w-4 h-4 bg-[#123b6b] rounded-full"></div>}
                </div>
                <span className={`font-bold ${status === 'Nonaktif' ? 'text-[#123b6b]' : 'text-slate-400'}`}>Nonaktif</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-20">
        <Link 
          href="/masterdata_layanan"
          className="flex-1 py-4 border-2 border-[#4FD1D9] text-[#1e9a9f] font-black rounded-xl text-center hover:bg-slate-50 transition-colors"
        >
          Batal
        </Link>
        <button 
          className="flex-1 py-4 bg-[#1e9a9f] text-white font-black rounded-xl hover:bg-[#167d81] transition-colors shadow-lg shadow-teal-100"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}