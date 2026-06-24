"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, CreditCard, Tag, Settings, Image as ImageIcon, X, ChevronDown
} from 'lucide-react';
import { metodePembayaranService } from '@/services/metodePembayaranService';
import SplashScreen from '@/app/components/SplashScreen';

export default function TambahMetodePembayaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isTipeOpen, setIsTipeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsTipeOpen(false);
      setIsStatusOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  
  const [formData, setFormData] = useState({
    nama_metode: '',
    tipe_metode: 'Midtrans',
    kode_metode: '',
    gambar_metode: '',
    status_metode: 'Aktif'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512 * 1024) { 
        alert("Ukuran file terlalu besar! Maksimal 512KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setFormData({ ...formData, gambar_metode: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setPreview(null);
    setFormData({ ...formData, gambar_metode: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_metode || !formData.kode_metode) {
      setErrorMsg("Nama dan Kode Metode wajib diisi!");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    try {
      await metodePembayaranService.create(formData);
      sessionStorage.setItem('mp_notif', `Berhasil menambahkan metode pembayaran ${formData.nama_metode}!`);
      router.push('/metode-pembayaran');
    } catch (error: any) {
      setErrorMsg(error.error || "Gagal menyimpan metode pembayaran");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      {isLoading && <SplashScreen />}

      <div className="flex items-center gap-4 mb-8">
        <Link href="/metode-pembayaran" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">Tambah Metode Pembayaran</h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg"><CreditCard size={24} className="text-[#4FD1D9]" /></div>
          <div>
            <h3 className="text-base font-bold">Formulir Metode Pembayaran</h3>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">Daftarkan cara pembayaran baru (Cash atau Midtrans Gateway).</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {errorMsg && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">{errorMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nama Metode <span className="text-red-500">*</span></label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag size={18} className="text-slate-400" /></div>
                   <input type="text" required value={formData.nama_metode} onChange={(e) => setFormData({...formData, nama_metode: e.target.value})} placeholder="Contoh: Gopay" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] outline-none text-[#1e3a5f] font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Tipe Metode</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTipeOpen(!isTipeOpen);
                      setIsStatusOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-[#1e3a5f] font-medium flex items-center justify-between transition-all hover:border-[#4FD1D9]/60 focus:border-[#4FD1D9] focus:outline-none"
                  >
                    <span>{formData.tipe_metode === 'Tunai' ? 'Tunai (Cash)' : 'Midtrans Gateway'}</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isTipeOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  
                  {isTipeOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                      {[
                        { val: 'Tunai', label: 'Tunai (Cash)' },
                        { val: 'Midtrans', label: 'Midtrans Gateway' }
                      ].map(item => {
                        const isSelected = formData.tipe_metode === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, tipe_metode: item.val });
                              setIsTipeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all duration-150 flex items-center justify-between ${
                              isSelected 
                                ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                            }`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Kode Gateway <span className="text-red-500">*</span></label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Settings size={18} className="text-slate-400" /></div>
                   <input type="text" required value={formData.kode_metode} onChange={(e) => setFormData({...formData, kode_metode: e.target.value})} placeholder="Contoh: gopay / cash" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] outline-none text-[#1e3a5f] font-mono font-bold" />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Gunakan kode kecil (lowercase). Misal: gopay, shopeepay, bca_va.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Status</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStatusOpen(!isStatusOpen);
                      setIsTipeOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-[#1e3a5f] font-medium flex items-center justify-between transition-all hover:border-[#4FD1D9]/60 focus:border-[#4FD1D9] focus:outline-none"
                  >
                    <span>{formData.status_metode}</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  
                  {isStatusOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                      {["Aktif", "Tidak Aktif"].map(val => {
                        const isSelected = formData.status_metode === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, status_metode: val });
                              setIsStatusOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all duration-150 flex items-center justify-between ${
                              isSelected 
                                ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                            }`}
                          >
                            <span>{val}</span>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Icon / Logo</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ImageIcon size={18} className="text-slate-400" /></div>
                   <input type="file" accept="image/*" onChange={handleFileChange} className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#1e3a5f]/10 file:text-[#1e3a5f]" />
                </div>
                {preview && (
                  <div className="mt-3 relative w-32 h-32 rounded-2xl border-4 border-slate-100 overflow-hidden group">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                    <button type="button" onClick={removeFoto} className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-3">
            <Link href="/metode-pembayaran" className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Batal</Link>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1e3a5f]/20">
              <Save size={20} /> Tambah Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
