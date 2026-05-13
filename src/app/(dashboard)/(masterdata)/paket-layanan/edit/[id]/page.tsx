"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Package, Tag, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { paketLayananService } from '@/services/paketLayananService';

export default function EditPaketLayananPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [formData, setFormData] = useState({
    nama_paket: '',
    durasi_jam: '',
    biaya_tambahan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const formatCurrency = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(val, 10));
  };

  const handleBiayaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({...formData, biaya_tambahan: rawValue});
  };

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const res = await paketLayananService.getById(id);
        const data = res.data;
        setFormData({
          nama_paket: data.nama_paket,
          durasi_jam: data.durasi_jam.toString(),
          biaya_tambahan: data.biaya_tambahan.toString()
        });
      } catch (error) {
        console.error("Gagal memuat paket layanan", error);
        alert("Gagal memuat paket layanan.");
        router.push('/paket-layanan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaket();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_paket || !formData.durasi_jam) {
      setErrorMsg("Mohon isi field yang wajib!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await paketLayananService.update(id, {
        nama_paket: formData.nama_paket,
        durasi_jam: parseInt(formData.durasi_jam),
        biaya_tambahan: formData.biaya_tambahan ? parseFloat(formData.biaya_tambahan) : 0
      });
      sessionStorage.setItem('paket_notif', `Berhasil memperbarui paket layanan ${formData.nama_paket}!`);
      router.push('/paket-layanan');
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal mengupdate paket layanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/paket-layanan"
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">
          Edit Paket Layanan
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <Package size={24} className="text-[#4FD1D9]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold leading-tight">Formulir Edit Paket</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
               Perbarui nama, durasi, atau harga tambahan untuk paket ini.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nama Paket <span className="text-red-500">*</span></label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Tag size={18} className="text-slate-400" />
                 </div>
                 <input 
                   type="text" 
                   required
                   value={formData.nama_paket}
                   onChange={(e) => setFormData({...formData, nama_paket: e.target.value})}
                   className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Durasi Layanan <span className="text-red-500">*</span></label>
              <div className="flex items-center">
                 <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="number" 
                      required
                      value={formData.durasi_jam}
                      onChange={(e) => setFormData({...formData, durasi_jam: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-l-xl border-2 border-r-0 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                    />
                 </div>
                 <div className="bg-slate-100 border-2 border-slate-100 px-6 py-3 rounded-r-xl text-slate-500 font-bold">
                   Jam
                 </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#1e3a5f] ml-1">Biaya Tambahan</label>
              <div className="flex items-center">
                <div className="bg-slate-100 border-2 border-r-0 border-slate-100 px-6 py-3 rounded-l-xl text-slate-500 font-bold">
                  + Rp
                </div>
                <input 
                  type="text" 
                  value={formData.biaya_tambahan ? formatCurrency(formData.biaya_tambahan) : ''}
                  onChange={handleBiayaChange}
                  className="flex-1 px-4 py-3 rounded-r-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                />
              </div>
            </div>

          </div>

          <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link 
              href="/paket-layanan"
              className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1e3a5f]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
