"use client";

import React, { useEffect, useState } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Image as ImageIcon, 
  CheckCircle, XCircle, X
} from 'lucide-react';
import { karyawanService } from '@/services/karyawanService';
import { getImageUrl } from '@/utils/imageHelper';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  id_user: number;
  username: string;
  email: string;
}

interface Karyawan {
  id_karyawan: number;
  id_user: number;
  nama_karyawan: string;
  foto_karyawan: string;
  no_telp: string;
  plat_nomor: string;
  jenis_kendaraan: string;
  status_ketersediaan: string;
  User: User;
}

export default function KaryawanPage() {
  const [data, setData] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    const savedNotif = sessionStorage.getItem('karyawan_notif');
    if (savedNotif) {
      setNotif({ message: savedNotif, type: 'success' });
      sessionStorage.removeItem('karyawan_notif'); 
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
    key: 'id_karyawan',
    direction: 'asc'
  });

  const fetchKaryawan = async () => {
    setIsLoading(true);
    try {
      const result = await karyawanService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching karyawan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus karyawan ${nama}? Akun user-nya juga ikut terhapus.`)) return;

    try {
      await karyawanService.delete(id);
      setData(data.filter(item => item.id_karyawan !== id));
      
      setNotif({ message: `Berhasil menghapus karyawan ${nama} (ID: ${id})!`, type: 'success' });
      
    } catch (error) {
      console.error(error);
      setNotif({ message: `Gagal menghapus karyawan ${nama}.`, type: 'error' });
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
        (item.nama_karyawan || '').toLowerCase().includes(lowerQuery) ||
        (item.User?.username || '').toLowerCase().includes(lowerQuery) ||
        (item.User?.email || '').toLowerCase().includes(lowerQuery) ||
        (item.no_telp || '').toLowerCase().includes(lowerQuery) ||
        (item.plat_nomor || '').toLowerCase().includes(lowerQuery) ||
        (item.status_ketersediaan || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        let aValue = sortConfig.key.includes('User.') ? a.User?.[sortConfig.key.split('.')[1]] : a[sortConfig.key];
        let bValue = sortConfig.key.includes('User.') ? b.User?.[sortConfig.key.split('.')[1]] : b[sortConfig.key];

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

  return (
    <div className="w-full relative">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Manajemen Karyawan
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
                placeholder="Cari..."
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
            href="/karyawan/tambah"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-[#1e3a5f]/20"
          >
            <Plus size={18} /> Tambah Karyawan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-y border-slate-200 min-w-[1000px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-[11px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 font-bold text-center w-16 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('id_karyawan')}>
                  <div className="flex items-center justify-center">
                    ID
                    {renderSortIcon('id_karyawan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold text-center w-24 border-x border-white/10">Foto</th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('nama_karyawan')}>
                  <div className="flex items-center justify-between">
                    <span>Nama Karyawan</span>
                    {renderSortIcon('nama_karyawan')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('User.username')}>
                  <div className="flex items-center justify-between">
                    <span>Username</span>
                    {renderSortIcon('User.username')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('no_telp')}>
                  <div className="flex items-center justify-between">
                    <span>No. Telp</span>
                    {renderSortIcon('no_telp')}
                  </div>
                </th>

                <th className="py-2.5 px-3 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('plat_nomor')}>
                  <div className="flex items-center justify-between">
                    <span>Plat Nomor</span>
                    {renderSortIcon('plat_nomor')}
                  </div>
                </th>
                
                <th className="py-2.5 px-3 font-bold text-center w-28 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('status_ketersediaan')}>
                  <div className="flex items-center justify-center">
                    Status
                    {renderSortIcon('status_ketersediaan')}
                  </div>
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
                    {searchQuery ? "Data tidak ditemukan." : "Belum ada data karyawan."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id_karyawan} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-400 border-x border-slate-200">
                      {row.id_karyawan}
                    </td>
                    <td className="py-2 px-3 flex justify-center border-x border-slate-200">
                      <div 
                        onClick={() => {
                          if (row.foto_karyawan) {
                            setPreviewImage({ src: getImageUrl(row.foto_karyawan), alt: row.nama_karyawan });
                          }
                        }}
                        className={`w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner transition-all hover:scale-105 duration-300 ${row.foto_karyawan ? 'cursor-pointer hover:opacity-80' : ''}`}
                      >
                        {row.foto_karyawan ? (
                          <img
                            src={getImageUrl(row.foto_karyawan)}
                            alt={row.nama_karyawan}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://api.dicebear.com/8.x/avataaars-neutral/svg?seed=fallback';
                            }}
                          />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 font-bold text-[#1e3a5f] capitalize border-x border-slate-200">
                      {row.nama_karyawan}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-700 border-x border-slate-200">
                      {row.User?.username || '-'}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-600 border-x border-slate-200">
                      {row.no_telp || '-'}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-600 border-x border-slate-200 uppercase">
                      {row.plat_nomor || '-'}
                    </td>
                    <td className="py-2 px-3 text-center border-x border-slate-200">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap inline-block ${
                        row.status_ketersediaan?.toLowerCase() === 'tersedia' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : row.status_ketersediaan?.toLowerCase() === 'sibuk'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {row.status_ketersediaan || '-'}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-x border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/karyawan/edit/${row.id_karyawan}`}
                          title="Edit"
                          className="p-1.5 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          title="Hapus"
                          onClick={() => handleDelete(row.id_karyawan, row.nama_karyawan)}
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
