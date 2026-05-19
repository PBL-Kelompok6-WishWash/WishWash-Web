"use client";

import React, { useEffect, useState } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, X, BadgePercent
} from 'lucide-react';
import { promoService } from '@/services/promoService';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Promo {
  id_promo: number;
  kode_promo: string;
  nama_promo: string;
  deskripsi: string;
  tipe_promo: string;
  nominal_potongan: number;
  minimal_order: number;
  maksimal_potongan: number;
  tgl_mulai: string;
  tgl_berakhir: string;
  status_promo: string;
  gambar_promo: string;
}

const formatCurrency = (val: number) =>
  'Rp ' + val.toLocaleString('id-ID');

const formatDate = (iso: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PromoPage() {
  const [data, setData] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    const saved = sessionStorage.getItem('promo_notif');
    if (saved) {
      setNotif({ message: saved, type: 'success' });
      sessionStorage.removeItem('promo_notif');
    }
  }, [pathname]);

  useEffect(() => {
    if (notif) {
      const t = setTimeout(() => setNotif(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notif]);

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'id_promo', direction: 'asc' });

  const fetchPromo = async () => {
    setIsLoading(true);
    try {
      const result = await promoService.getAll();
      setData(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPromo(); }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus promo "${nama}"?`)) return;
    try {
      await promoService.delete(id);
      setData(prev => prev.filter(p => p.id_promo !== id));
      setNotif({ message: `Berhasil menghapus promo ${nama} (ID: ${id})!`, type: 'success' });
    } catch {
      setNotif({ message: `Gagal menghapus promo ${nama}.`, type: 'error' });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const processedData = React.useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nama_promo?.toLowerCase().includes(q) ||
        p.kode_promo?.toLowerCase().includes(q)
      );
    }
    result.sort((a: any, b: any) => {
      const av = a[sortConfig.key] ?? '';
      const bv = b[sortConfig.key] ?? '';
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, searchQuery, sortConfig]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderSortIcon = (key: string) => {
    const isActive = sortConfig.key === key;
    return (
      <div className="flex flex-col items-center -space-y-1.5 ml-1">
        <ChevronUp size={14} strokeWidth={isActive && sortConfig.direction === 'asc' ? 4 : 2}
          className={isActive && sortConfig.direction === 'asc' ? 'text-white' : 'text-slate-400/50'} />
        <ChevronDown size={14} strokeWidth={isActive && sortConfig.direction === 'desc' ? 4 : 2}
          className={isActive && sortConfig.direction === 'desc' ? 'text-white' : 'text-slate-400/50'} />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Aktif') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return 'bg-red-100 text-red-700 border border-red-200';
  };

  return (
    <div className="w-full relative">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Daftar Promo
      </h2>

      {notif && (
        <div className={`mb-6 p-4 rounded-2xl border-l-4 font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 ${
          notif.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'
        }`}>
          <div className="flex items-center gap-3">
            {notif.type === 'success' ? <CheckCircle size={22} className="shrink-0" /> : <XCircle size={22} className="shrink-0" />}
            <p className="text-sm md:text-base">{notif.message}</p>
          </div>
          <button onClick={() => setNotif(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors"><X size={18} /></button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

        {/* TOOLBAR */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari kode atau nama promo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-medium transition-colors"
              />
            </div>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-bold cursor-pointer transition-colors appearance-none bg-white"
            >
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} Baris</option>)}
            </select>
          </div>
          <Link
            href="/promo/tambah"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-[#1e3a5f]/20"
          >
            <Plus size={18} /> Tambah Promo
          </Link>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-y border-slate-200 min-w-[1100px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-[11px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 font-bold text-center w-16 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('id_promo')}>
                  <div className="flex items-center justify-center">ID {renderSortIcon('id_promo')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold text-center w-28 border-x border-white/10 text-[10px]">Gambar Promo</th>
                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('kode_promo')}>
                  <div className="flex items-center justify-between">Kode Promo {renderSortIcon('kode_promo')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('nama_promo')}>
                  <div className="flex items-center justify-between">Nama Promo {renderSortIcon('nama_promo')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold border-x border-white/10">Tipe & Potongan</th>
                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('minimal_order')}>
                  <div className="flex items-center justify-between">Min. Order {renderSortIcon('minimal_order')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('tgl_mulai')}>
                  <div className="flex items-center justify-between">Periode {renderSortIcon('tgl_mulai')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold text-center border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('status_promo')}>
                  <div className="flex items-center justify-center">Status {renderSortIcon('status_promo')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold text-center w-24 border-x border-white/10">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {isLoading ? (
                <tr><td colSpan={9} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                  <div className="flex justify-center mb-2"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#4FD1D9] rounded-full animate-spin" /></div>
                  Memuat data...
                </td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={9} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                  {searchQuery ? 'Data tidak ditemukan.' : 'Belum ada data promo.'}
                </td></tr>
              ) : (
                paginatedData.map(row => (
                  <tr key={row.id_promo} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-400 border-x border-slate-200">{row.id_promo}</td>
                    <td className="py-2 px-3 text-center border-x border-slate-200">
                      <div 
                        onClick={() => {
                          if (row.gambar_promo) {
                            setPreviewImage({ src: row.gambar_promo, alt: row.nama_promo });
                          }
                        }}
                        className={`w-20 h-12 mx-auto rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner transition-all hover:scale-105 duration-300 ${row.gambar_promo ? 'cursor-pointer hover:opacity-80' : ''}`}
                      >
                        {row.gambar_promo ? (
                          <img src={row.gambar_promo} alt="Promo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-300"><BadgePercent size={20} /></div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <span className="font-black text-[#1e3a5f] tracking-wider uppercase bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {row.kode_promo}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-[#1e3a5f] border-x border-slate-200">{row.nama_promo}</td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{row.tipe_promo}</span>
                        <span className="font-bold text-[#1e9a9f]">
                          {row.tipe_promo === 'Persentase'
                            ? `${row.nominal_potongan}%`
                            : formatCurrency(row.nominal_potongan)}
                        </span>
                        {row.maksimal_potongan > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">maks. {formatCurrency(row.maksimal_potongan)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-600 border-x border-slate-200">
                      {row.minimal_order > 0 ? formatCurrency(row.minimal_order) : <span className="text-slate-300 font-normal">Tidak ada</span>}
                    </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <div className="text-[10px] font-medium text-slate-500 space-y-0.5">
                        <div><span className="text-slate-400">Mulai:</span> {formatDate(row.tgl_mulai)}</div>
                        <div><span className="text-slate-400">Berakhir:</span> {formatDate(row.tgl_berakhir)}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center border-x border-slate-200">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-block ${getStatusBadge(row.status_promo)}`}>
                        {row.status_promo}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/promo/edit/${row.id_promo}`}
                          title="Edit"
                          className="p-1.5 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          title="Hapus"
                          onClick={() => handleDelete(row.id_promo, row.nama_promo)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && processedData.length > 0 && (
          <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-400">
              Menampilkan <span className="text-[#1e3a5f]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-[#1e3a5f]">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> dari <span className="text-[#1e3a5f]">{processedData.length}</span> data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X size={24} />
          </button>
          <div 
            className="relative max-w-4xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewImage.src} 
              alt={previewImage.alt} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold py-2 px-3 rounded-lg text-center">
              {previewImage.alt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}