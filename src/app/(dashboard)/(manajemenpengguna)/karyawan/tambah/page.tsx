"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, User, Mail, Lock, Phone, UserCircle, Image as ImageIcon, X, Truck, Tag, Hash
} from 'lucide-react';
import { karyawanService } from '@/services/karyawanService';
import SplashScreen from '@/app/components/SplashScreen';

export default function TambahKaryawanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_karyawan: "",
    username: "",
    email: "",
    no_telp: "",
    password: "",
    foto_karyawan: "",
    plat_nomor: "",
    jenis_kendaraan: "Motor",
    status_ketersediaan: "Tersedia"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert("Ukuran file terlalu besar! Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setFormData({ ...formData, foto_karyawan: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setPreview(null);
    setFormData({ ...formData, foto_karyawan: "" });
    const fileInput = document.getElementById('foto_upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await karyawanService.create(formData);
      sessionStorage.setItem('karyawan_notif', `Berhasil menambah karyawan ${formData.nama_karyawan} (ID: ${result.data.id_karyawan})!`);
      router.push('/karyawan');
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
      setIsLoading(false); 
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      
      {isLoading && <SplashScreen />}

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/karyawan"
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">
          Tambah Karyawan
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <UserCircle size={24} className="text-[#4FD1D9]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold leading-tight">Formulir Data Karyawan</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
               Silakan masukkan data profil dan akun karyawan baru secara lengkap.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nama Karyawan <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="nama_karyawan"
                  value={formData.nama_karyawan}
                  onChange={handleChange}
                  required
                  placeholder="Budi Santoso"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="no_telp"
                  value={formData.no_telp}
                  onChange={handleChange}
                  required
                  placeholder="0812xxxx"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Username <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold ml-0.5">@</span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="username_karyawan"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Alamat Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Password Akun <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Plat Nomor Kendaraan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="plat_nomor"
                  value={formData.plat_nomor}
                  onChange={handleChange}
                  placeholder="BP 1234 AB"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all uppercase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Jenis Kendaraan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Truck size={18} className="text-slate-400" />
                </div>
                <select
                  name="jenis_kendaraan"
                  value={formData.jenis_kendaraan}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="Motor">Motor</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Pick Up">Pick Up</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Status Ketersediaan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag size={18} className="text-slate-400" />
                </div>
                <select
                  name="status_ketersediaan"
                  value={formData.status_ketersediaan}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Sibuk">Sibuk</option>
                  <option value="Cuti">Cuti</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Foto Karyawan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon size={18} className="text-slate-400" />
                </div>
                <input
                  id="foto_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-sm font-medium transition-all text-slate-500
                  file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1e3a5f]/10 file:text-[#1e3a5f] hover:file:bg-[#1e3a5f]/20 cursor-pointer"
                />
              </div>
              
              {preview && (
                <div className="mt-3 relative w-32 h-32 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="mt-12 flex justify-end gap-3">
            <Link 
              href="/karyawan"
              className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1e3a5f]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              Tambah Data
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
