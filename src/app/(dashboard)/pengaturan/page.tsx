"use client";

import React, { useEffect, useState } from 'react';
import { Camera, Pencil } from 'lucide-react';

export default function PengaturanPage() {
  const [username, setUsername] = useState("Admin");

  // Ambil nama dari penyimpanan saat halaman dimuat
  useEffect(() => {
    const savedName = localStorage.getItem("remembered_username");
    if (savedName) {
      setUsername(savedName);
    }
  }, []);

  return (
    <div className="w-full">
      {/* Judul Halaman */}
      <h2 className="text-4xl font-black text-[#1e3a5f] uppercase mb-10 tracking-wider">
        PENGATURAN
      </h2>

      {/* Kartu Putih Utama */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl p-12 max-w-5xl mx-auto">
        
        {/* Bagian Profil */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            {/* Foto Profil Besar (Dinamis mengikuti nama) */}
            <div className="w-48 h-48 rounded-full border-4 border-[#1e3a5f] overflow-hidden shadow-lg bg-slate-100">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Tombol Kamera */}
            <button className="absolute bottom-2 right-2 bg-[#123b6b] p-2 rounded-full text-white border-2 border-white shadow-md hover:bg-[#0c284a] transition-all">
              <Camera size={20} />
            </button>
          </div>

          {/* Nama & Role */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-3xl font-black text-[#1e3a5f] capitalize">{username}</h3>
              <button className="text-[#1e3a5f] hover:text-[#4FD1D9]">
                <Pencil size={24} />
              </button>
            </div>
            <p className="text-xl text-[#1e3a5f] font-medium opacity-80">(Administrator)</p>
          </div>
        </div>

        {/* Form Pengaturan */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Baris 1: Nama Lengkap & Password */}
          <div className="space-y-2">
            <label className="block text-lg font-bold text-[#1e3a5f]">Nama Lengkap</label>
            <input 
              type="text" 
              defaultValue={username} // Menampilkan nama asli
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium capitalize"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-bold text-[#1e3a5f]">Password</label>
            <input 
              type="password" 
              defaultValue="********"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium"
            />
          </div>

          {/* Baris 2: Email */}
          <div className="space-y-2">
            <label className="block text-lg font-bold text-[#1e3a5f]">Email</label>
            <input 
              type="email" 
              defaultValue={`${username.toLowerCase()}@wishwash.com`} // Email dummy dinamis
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium"
            />
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="mt-12 flex justify-end">
          <button className="bg-[#1eb3bc] hover:bg-[#178e96] text-white px-10 py-3 rounded-xl font-black text-lg shadow-lg transition-all active:scale-95">
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}