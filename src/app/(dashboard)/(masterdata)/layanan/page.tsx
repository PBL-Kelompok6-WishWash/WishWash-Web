"use client";

import React, { useEffect, useState } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Image as ImageIcon, 
  CheckCircle, XCircle, X
} from 'lucide-react';
import { layananService } from '@/services/layananService';
import { getImageUrl } from '@/utils/imageHelper';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ReferensiStatus {
  id_referensi_status_layanan: number;
  nama_status: string;
  urutan_tahap: number;
}

interface Layanan {
  id_layanan: number;
  nama_layanan: string;
  gambar_layanan: string;
  jenis_satuan: string;
  harga_per_satuan: number;
  status_layanan: string;
  referensi_status: ReferensiStatus[];
  warna_layanan: string;
  deskripsi_layanan?: string;
  is_used?: boolean;
}

function LayananImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const resolvedSrc = getImageUrl(src);
  const isValid = resolvedSrc && (resolvedSrc.startsWith('data:image') || resolvedSrc.startsWith('http') || resolvedSrc.startsWith('/'));

  if (!isValid || error) {
    return <ImageIcon size={28} className="text-slate-300" />;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function LayananPage() {
  const [data, setData] = useState<Layanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    const savedNotif = sessionStorage.getItem('layanan_notif');
    if (savedNotif) {
      setNotif({ message: savedNotif, type: 'success' });
      sessionStorage.removeItem('layanan_notif'); 
    }
  }, [pathname]);

  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notif]);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRowsOpen, setIsRowsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsRowsOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'id_layanan',
    direction: 'asc'
  });

  const fetchLayanan = async () => {
    setIsLoading(true);
    try {
      const result = await layananService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching layanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus layanan ${nama}?`)) return;

    try {
      await layananService.delete(id);
      setData(data.filter(item => item.id_layanan !== id));
      
      setNotif({ message: `Berhasil menghapus layanan ${nama} (ID: ${id})!`, type: 'success' });
      
    } catch (error) {
      console.error(error);
      setNotif({ message: `Gagal menghapus layanan ${nama}.`, type: 'error' });
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedData = React.useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.nama_layanan || '').toLowerCase().includes(lowerQuery) ||
        (item.jenis_satuan || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        aValue = aValue || '';
        bValue = bValue || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, itemsPerPage]);

  const renderSortIcon = (columnKey: string) => {
    const isActive = sortConfig.key === columnKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';

    return (
      <div className="flex flex-col items-center -space-y-1.5 ml-1">
        <ChevronUp
          size={14}
          strokeWidth={isAsc ? 4 : 2}
          className={`transition-colors ${isAsc ? 'text-white' : 'text-slate-400/50'}`}
        />
        <ChevronDown
          size={14}
          strokeWidth={isDesc ? 4 : 2}
          className={`transition-colors ${isDesc ? 'text-white' : 'text-slate-400/50'}`}
        />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Tidak Aktif':
      case 'Tidak Tersedia':
      case 'Cuti':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Sibuk':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="w-full relative">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Daftar Layanan
      </h2>

      {notif && (
        <div className={`mb-6 py-3 px-4 rounded-xl border-l-4 font-medium flex items-center justify-between shadow-md transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${notif.type === 'success'
            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
            : 'bg-red-50 border-red-500 text-red-600'
          }`}>
          <div className="flex items-center gap-2.5">
            {notif.type === 'success' ? (
              <CheckCircle size={18} className="shrink-0" />
            ) : (
              <XCircle size={18} className="shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-semibold">{notif.message}</p>
          </div>
          <button
            onClick={() => setNotif(null)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-xs font-medium transition-colors"
              />
            </div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsRowsOpen(!isRowsOpen);
                }}
                className="flex items-center justify-between w-32 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold text-[#1e3a5f] outline-none cursor-pointer transition-all duration-300 hover:border-[#4FD1D9]/60 hover:shadow-md hover:shadow-slate-100 focus:border-[#4FD1D9] focus:ring-2 focus:ring-[#4FD1D9]/20"
              >
                <span>{itemsPerPage} Baris</span>
                <ChevronDown 
                  size={14} 
                  className={`text-[#1e3a5f] transition-transform duration-300 ${isRowsOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
              </button>
              
              {isRowsOpen && (
                <div className="absolute left-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 transition-all duration-200 origin-top animate-in fade-in slide-in-from-top-2">
                  {[5, 10, 25, 50].map(num => {
                    const isSelected = itemsPerPage === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setItemsPerPage(num);
                          setIsRowsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#4FD1D9]/10 text-[#1e3a5f] font-extrabold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a5f]'
                        }`}
                      >
                        <span>{num} Baris</span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#4FD1D9] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <Link
            href="/layanan/tambah"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-[#1e3a5f]/20"
          >
            <Plus size={18} /> Tambah Layanan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-y border-slate-200 min-w-[1000px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-[11px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 font-bold text-center w-16 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('id_layanan')}>
                  <div className="flex items-center justify-center">
                    ID
                    {renderSortIcon('id_layanan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold text-center w-24 border-x border-white/10">Gambar</th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('nama_layanan')}>
                  <div className="flex items-center justify-between">
                    <span>Nama Layanan</span>
                    {renderSortIcon('nama_layanan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('deskripsi_layanan')}>
                  <div className="flex items-center justify-between">
                    <span>Deskripsi</span>
                    {renderSortIcon('deskripsi_layanan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('harga_per_satuan')}>
                  <div className="flex items-center justify-between">
                    <span>Harga / Satuan</span>
                    {renderSortIcon('harga_per_satuan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold border-x border-white/10">
                  <div className="flex items-center justify-between">
                    <span>Urutan Status</span>
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold text-center w-24 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('status_layanan')}>
                  <div className="flex items-center justify-center">Status {renderSortIcon('status_layanan')}</div>
                </th>
                <th className="py-2.5 px-3 font-bold text-center w-28 border-x border-white/10">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    <div className="flex justify-center mb-2">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#4FD1D9] rounded-full animate-spin"></div>
                    </div>
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    {searchQuery ? "Data tidak ditemukan." : "Belum ada data layanan."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id_layanan} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-400 border-x border-slate-200">
                      {row.id_layanan}
                    </td>
                    <td className="py-2 px-3 flex justify-center border-x border-slate-200">
                      <div 
                        onClick={() => {
                          if (row.gambar_layanan) {
                            setPreviewImage({ src: getImageUrl(row.gambar_layanan), alt: row.nama_layanan });
                          }
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner transition-all hover:scale-105 duration-300 ${row.gambar_layanan ? 'cursor-pointer hover:opacity-80' : ''}`}
                      >
                        <LayananImage src={row.gambar_layanan} alt={row.nama_layanan} />
                      </div>
                    </td>
                    <td className="py-2 px-3 font-bold text-[#1e3a5f] border-x border-slate-200">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-sm animate-pulse-slow" 
                          style={{ backgroundColor: row.warna_layanan || '#00BCD4' }}
                          title={row.warna_layanan}
                        />
                        <span className="text-xs font-bold text-[#1e3a5f] leading-snug">{row.nama_layanan}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-600 border-x border-slate-200">
                      {row.deskripsi_layanan ? (
                        <span className="text-[11px] font-medium leading-relaxed text-slate-500 line-clamp-2 max-w-[280px]" title={row.deskripsi_layanan}>
                          {row.deskripsi_layanan}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Tidak ada deskripsi</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-700 border-x border-slate-200">
                      Rp {row.harga_per_satuan.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">/ {row.jenis_satuan}</span>
                    </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                       <div className="flex flex-wrap gap-1">
                          {row.referensi_status && row.referensi_status.length > 0 ? (
                             row.referensi_status.map((status, idx) => (
                               <span key={status.id_referensi_status_layanan} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 text-[10px] font-bold">
                                 {idx + 1}. {status.nama_status}
                               </span>
                             ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum ada status</span>
                          )}
                       </div>
                    </td>
                    <td className="py-2 px-3 text-center border-x border-slate-200">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-block ${getStatusBadge(row.status_layanan)}`}>
                          {row.status_layanan}
                        </span>
                     </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/layanan/edit/${row.id_layanan}`}
                          title="Edit"
                          className="p-1.5 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"
                        >
                          <Edit size={14} />
                        </Link>
                        {row.is_used ? (
                          <button
                            title="Layanan tidak dapat dihapus karena telah digunakan dalam transaksi"
                            disabled
                            className="p-1.5 bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed opacity-60"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            title="Hapus"
                            onClick={() => handleDelete(row.id_layanan, row.nama_layanan)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && processedData.length > 0 && (
          <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-400">
              Menampilkan <span className="text-[#1e3a5f]">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-[#1e3a5f]">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> dari <span className="text-[#1e3a5f]">{processedData.length}</span> data
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (currentPage <= 3) {
                      pages.push(1, 2, 3, '...', totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', currentPage, '...', totalPages);
                    }
                  }
                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ell-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold text-sm select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = page as number;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === pageNum
                          ? 'bg-[#1e3a5f] text-white shadow-md'
                          : 'text-slate-500 hover:bg-slate-50 bg-white border border-slate-200 hover:text-[#1e3a5f] hover:border-[#1e3a5f]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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