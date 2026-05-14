"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, SprayCan, AlignLeft, ChevronDown
} from 'lucide-react';
import { parfumService } from '@/services/parfumService';
import SplashScreen from '@/app/components/SplashScreen';

export default function TambahParfumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    nama_parfum: '',
    keterangan: '',
    status_parfum: 'Tersedia'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_parfum) {
      setErrorMsg("Nama Parfum wajib diisi!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const result = await parfumService.create(formData);
      sessionStorage.setItem('parfum_notif', `Berhasil menambahkan parfum ${formData.nama_parfum} (ID: ${result.data.id_parfum})!`);
      router.push('/parfum');
    } catch (error: any) {
      setErrorMsg(error.error || "Gagal menyimpan parfum");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      
      {isLoading && <SplashScreen />}

      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/parfum"
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">
          Tambah Parfum
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <SprayCan size={24} className="text-[#4FD1D9]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold leading-tight">Formulir Data Parfum</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
               Silakan masukkan detail varian parfum baru untuk layanan laundry.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nama Parfum <span className="text-red-500">*</span></label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <SprayCan size={18} className="text-slate-400" />
                 </div>
                 <input 
                   type="text" 
                   required
                   value={formData.nama_parfum}
                   onChange={(e) => setFormData({...formData, nama_parfum: e.target.value})}
                   placeholder="Contoh: Lavender Bliss" 
                   className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Keterangan</label>
              <div className="relative">
                 <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                   <AlignLeft size={18} className="text-slate-400" />
                 </div>
                 <textarea 
                   value={formData.keterangan}
                   onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                   placeholder="Contoh: Aroma bunga lavender yang menenangkan dan segar..." 
                   rows={4}
                   className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all resize-none"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Status Parfum</label>
              <div className="relative">
                <select 
                  value={formData.status_parfum}
                  onChange={(e) => setFormData({...formData, status_parfum: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all appearance-none bg-white"
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tidak Tersedia">Tidak Tersedia</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12 flex justify-end gap-3">
            <Link 
              href="/parfum"
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
