"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, TicketPercent, Tag, AlignLeft, CalendarRange,
  Percent, BadgeDollarSign, Image as ImageIcon, X, ChevronDown
} from 'lucide-react';
import { promoService } from '@/services/promoService';
import SplashScreen from '@/app/components/SplashScreen';

const formatThousands = (val: string) => {
  const num = val.replace(/\D/g, '');
  return num ? num.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
};
const parseThousands = (val: string) => val.replace(/\./g, '').replace('%', '');

export default function TambahPromoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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

  // raw angka untuk nominal potongan, tanpa simbol
  const [nominalRaw, setNominalRaw] = useState('');
  // tampilan di input (bisa ada % atau titik ribuan)
  const [nominalDisplay, setNominalDisplay] = useState('');
  const [nominalFocused, setNominalFocused] = useState(false);

  const [formData, setFormData] = useState({
    kode_promo: '',
    nama_promo: '',
    deskripsi: '',
    tipe_promo: 'Persentase',
    minimal_order: '',
    maksimal_potongan: '',
    tgl_mulai: '',
    tgl_berakhir: '',
    status_promo: 'Aktif',
    gambar_promo: '',
  });

  const handleTipeChange = (val: string) => {
    setFormData(prev => ({ ...prev, tipe_promo: val }));
    setNominalRaw('');
    setNominalDisplay('');
  };

  // Nominal input: saat focus tampil angka raw, saat blur tampil format
  const handleNominalFocus = () => {
    setNominalFocused(true);
    setNominalDisplay(nominalRaw); // tampilkan angka murni saat diedit
  };

  const handleNominalChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setNominalRaw(clean);
    setNominalDisplay(clean);
  };

  const handleNominalBlur = () => {
    setNominalFocused(false);
    if (!nominalRaw) { setNominalDisplay(''); return; }
    if (formData.tipe_promo === 'Persentase') {
      setNominalDisplay(`${nominalRaw}%`);
    } else {
      setNominalDisplay(formatThousands(nominalRaw));
    }
  };

  const handleRupiahChange = (field: 'minimal_order' | 'maksimal_potongan', val: string) => {
    const clean = parseThousands(val);
    setFormData(prev => ({ ...prev, [field]: formatThousands(clean) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert('Ukuran file terlalu besar! Maks 1MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData(prev => ({ ...prev, gambar_promo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGambar = () => {
    setPreview(null);
    setFormData(prev => ({ ...prev, gambar_promo: '' }));
    const inp = document.getElementById('gambar_promo_upload') as HTMLInputElement;
    if (inp) inp.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode_promo || !formData.nama_promo || !nominalRaw || !formData.tgl_mulai || !formData.tgl_berakhir) {
      setErrorMsg('Harap isi semua field yang wajib diisi!');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await promoService.create({
        kode_promo: formData.kode_promo.toUpperCase(),
        nama_promo: formData.nama_promo,
        deskripsi: formData.deskripsi,
        tipe_promo: formData.tipe_promo,
        nominal_potongan: Number(nominalRaw),
        minimal_order: Number(parseThousands(formData.minimal_order)) || 0,
        maksimal_potongan: Number(parseThousands(formData.maksimal_potongan)) || 0,
        tgl_mulai: formData.tgl_mulai,
        tgl_berakhir: formData.tgl_berakhir,
        status_promo: formData.status_promo,
        gambar_promo: formData.gambar_promo,
      });
      sessionStorage.setItem('promo_notif', `Berhasil menambahkan promo ${formData.nama_promo} (ID: ${result.data.id_promo})!`);
      router.push('/promo');
    } catch (err: any) {
      setErrorMsg(err.error || 'Gagal menyimpan promo');
      setIsLoading(false);
    }
  };

  const ic = "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none";
  const inp = "w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all";
  const lbl = "text-sm font-bold text-[#1e3a5f] ml-1";
  const isPersentase = formData.tipe_promo === 'Persentase';

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-10">
      {isLoading && <SplashScreen />}

      <div className="flex items-center gap-4 mb-8">
        <Link href="/promo" className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all active:scale-95 shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">Tambah Promo</h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <TicketPercent size={24} className="text-[#4FD1D9]" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight">Formulir Data Promo</h3>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">Isi detail kode promo dan periode berlakunya.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">{errorMsg}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Kode Promo */}
            <div className="space-y-2">
              <label className={lbl}>Kode Promo <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className={ic}><Tag size={18} className="text-slate-400" /></div>
                <input type="text" required value={formData.kode_promo}
                  onChange={e => setFormData({ ...formData, kode_promo: e.target.value })}
                  placeholder="Contoh: WISHNEW25" className={inp + " uppercase"} />
              </div>
            </div>

            {/* Nama Promo */}
            <div className="space-y-2">
              <label className={lbl}>Nama Promo <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className={ic}><TicketPercent size={18} className="text-slate-400" /></div>
                <input type="text" required value={formData.nama_promo}
                  onChange={e => setFormData({ ...formData, nama_promo: e.target.value })}
                  placeholder="Contoh: First Order Promo" className={inp} />
              </div>
            </div>

            {/* Tipe Promo */}
            <div className="space-y-2">
              <label className={lbl}>Tipe Promo <span className="text-red-500">*</span></label>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div className={ic}><Percent size={18} className="text-slate-400" /></div>
                <button
                  type="button"
                  onClick={() => {
                    setIsTipeOpen(!isTipeOpen);
                    setIsStatusOpen(false);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-[#1e3a5f] font-medium flex items-center justify-between transition-all hover:border-[#4FD1D9]/60 focus:border-[#4FD1D9] focus:outline-none text-left"
                >
                  <span>{formData.tipe_promo === 'Persentase' ? 'Persentase (%)' : 'Nominal (Rp)'}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isTipeOpen ? 'rotate-180' : 'rotate-0'} text-[#1e3a5f]`} />
                </button>
                
                {isTipeOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                    {[
                      { val: 'Persentase', label: 'Persentase (%)' },
                      { val: 'Nominal', label: 'Nominal (Rp)' }
                    ].map(item => {
                      const isSelected = formData.tipe_promo === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            handleTipeChange(item.val);
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

            {/* Nominal Potongan — smart input */}
            <div className="space-y-2">
              <label className={lbl}>Nominal Potongan <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className={ic}>
                  {isPersentase
                    ? <Percent size={18} className="text-slate-400" />
                    : <BadgeDollarSign size={18} className="text-slate-400" />}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nominalDisplay}
                  onChange={e => handleNominalChange(e.target.value)}
                  onFocus={handleNominalFocus}
                  onBlur={handleNominalBlur}
                  placeholder={isPersentase ? '30' : '5.000'}
                  className={inp + " font-bold"}
                />
              </div>
              {/* Live preview */}
              {nominalRaw && (
                <p className="text-xs ml-1 font-medium text-[#1e9a9f]">
                  {isPersentase
                    ? `Potongan: ${nominalRaw}%`
                    : `Potongan: Rp ${parseInt(nominalRaw).toLocaleString('id-ID')}`}
                </p>
              )}
            </div>

            {/* Minimal Order */}
            <div className="space-y-2">
              <label className={lbl}>Minimal Order (Rp)</label>
              <div className="relative">
                <div className={ic}><BadgeDollarSign size={18} className="text-slate-400" /></div>
                <input type="text" inputMode="numeric" value={formData.minimal_order}
                  onChange={e => handleRupiahChange('minimal_order', e.target.value)}
                  placeholder="30.000" className={inp} />
              </div>
            </div>

            {/* Maksimal Potongan */}
            <div className="space-y-2">
              <label className={lbl}>Maksimal Potongan (Rp)</label>
              <div className="relative">
                <div className={ic}><BadgeDollarSign size={18} className="text-slate-400" /></div>
                <input type="text" inputMode="numeric" value={formData.maksimal_potongan}
                  onChange={e => handleRupiahChange('maksimal_potongan', e.target.value)}
                  placeholder="20.000" className={inp} />
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-2">
              <label className={lbl}>Tanggal Mulai <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className={ic}><CalendarRange size={18} className="text-slate-400" /></div>
                <input type="date" required value={formData.tgl_mulai}
                  onChange={e => setFormData({ ...formData, tgl_mulai: e.target.value })}
                  className={inp} />
              </div>
            </div>

            {/* Tanggal Berakhir */}
            <div className="space-y-2">
              <label className={lbl}>Tanggal Berakhir <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className={ic}><CalendarRange size={18} className="text-slate-400" /></div>
                <input type="date" required value={formData.tgl_berakhir}
                  onChange={e => setFormData({ ...formData, tgl_berakhir: e.target.value })}
                  className={inp} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className={lbl}>Status Promo <span className="text-red-500">*</span></label>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div className={ic}><TicketPercent size={18} className="text-slate-400" /></div>
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusOpen(!isStatusOpen);
                    setIsTipeOpen(false);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-[#1e3a5f] font-medium flex items-center justify-between transition-all hover:border-[#4FD1D9]/60 focus:border-[#4FD1D9] focus:outline-none text-left"
                >
                  <span>{formData.status_promo}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : 'rotate-0'} text-[#1e3a5f]`} />
                </button>
                
                {isStatusOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                    {['Aktif', 'Tidak Aktif'].map(val => {
                      const isSelected = formData.status_promo === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status_promo: val });
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

            {/* Gambar Promo — gaya upload file seperti karyawan */}
            <div className="space-y-2">
              <label className={lbl}>Gambar Promo</label>
              <div className="relative">
                <div className={ic}><ImageIcon size={18} className="text-slate-400" /></div>
                <input
                  id="gambar_promo_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-sm font-medium transition-all text-slate-500
                  file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1e3a5f]/10 file:text-[#1e3a5f] hover:file:bg-[#1e3a5f]/20 cursor-pointer"
                />
              </div>
              {preview && (
                <div className="mt-3 relative w-full h-40 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeGambar}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Deskripsi — full width */}
            <div className="space-y-2 md:col-span-2">
              <label className={lbl}>Deskripsi</label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none"><AlignLeft size={18} className="text-slate-400" /></div>
                <textarea value={formData.deskripsi}
                  onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Keterangan tambahan tentang promo ini..."
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all resize-none" />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-3">
            <Link href="/promo" className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95">Batal</Link>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1e3a5f]/20 disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={20} /> Tambah Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
