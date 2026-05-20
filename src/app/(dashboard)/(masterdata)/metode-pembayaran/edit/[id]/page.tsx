"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, CreditCard, Tag, Settings, Image as ImageIcon, X, ChevronDown
} from 'lucide-react';
import { metodePembayaranService } from '@/services/metodePembayaranService';
import { getImageUrl } from '@/utils/imageHelper';
import SplashScreen from '@/app/components/SplashScreen';

export default function EditMetodePembayaranPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nama_metode: '',
    tipe_metode: 'Midtrans',
    kode_metode: '',
    gambar_metode: '',
    status_metode: 'Aktif'
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await metodePembayaranService.getById(id);
        const data = result.data;
        setFormData({
          nama_metode: data.nama_metode || '',
          tipe_metode: data.tipe_metode || 'Midtrans',
          kode_metode: data.kode_metode || '',
          gambar_metode: data.gambar_metode || '',
          status_metode: data.status_metode || 'Aktif'
        });
        if (data.gambar_metode) setPreview(getImageUrl(data.gambar_metode));
      } catch (error) {
        setErrorMsg("Gagal mengambil data.");
      } finally {
        setIsFetching(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

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
      await metodePembayaranService.update(id, formData);
      sessionStorage.setItem('mp_notif', `Berhasil memperbarui metode ${formData.nama_metode}!`);
      router.push('/metode-pembayaran');
    } catch (error: any) {
      setErrorMsg(error.error || "Gagal menyimpan");
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-8 text-center font-bold text-slate-400">Memuat data...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      {isLoading && <SplashScreen />}

      <div className="flex items-center gap-4 mb-8">
        <Link href="/metode-pembayaran" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">Edit Metode Pembayaran</h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg"><CreditCard size={24} className="text-[#4FD1D9]" /></div>
          <div>
            <h3 className="text-base font-bold">Formulir Edit Metode Pembayaran</h3>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">Ubah pengaturan gateway atau status metode pembayaran.</p>
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
                   <input type="text" required value={formData.nama_metode} onChange={(e) => setFormData({...formData, nama_metode: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] outline-none text-[#1e3a5f] font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Tipe Metode</label>
                <div className="relative">
                  <select value={formData.tipe_metode} onChange={(e) => setFormData({...formData, tipe_metode: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] appearance-none bg-white text-[#1e3a5f] font-medium">
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="Midtrans">Midtrans Gateway</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Kode Gateway <span className="text-red-500">*</span></label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Settings size={18} className="text-slate-400" /></div>
                   <input type="text" required value={formData.kode_metode} onChange={(e) => setFormData({...formData, kode_metode: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] outline-none text-[#1e3a5f] font-mono font-bold" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Status</label>
                <div className="relative">
                  <select value={formData.status_metode} onChange={(e) => setFormData({...formData, status_metode: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#4FD1D9] appearance-none bg-white text-[#1e3a5f] font-medium">
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Icon / Logo</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ImageIcon size={18} className="text-slate-400" /></div>
                   <input type="file" accept="image/*" onChange={handleFileChange} className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#1e3a5f]/10 file:text-[#1e3a5f]" />
                </div>
                {preview && (
                  <div className="mt-3 relative w-32 h-32 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-sm">
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
              <Save size={20} /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
