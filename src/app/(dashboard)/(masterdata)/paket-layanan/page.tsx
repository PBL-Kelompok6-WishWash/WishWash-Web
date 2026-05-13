"use client";

import React, { useEffect, useState } from 'react';
import {
  Search, Plus, Edit, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, X
} from 'lucide-react';
import { paketLayananService } from '@/services/paketLayananService';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface PaketLayanan {
  id_paket_layanan: number;
  nama_paket: string;
  durasi_jam: number;
  biaya_tambahan: number;
}

export default function PaketLayananPage() {
  const [data, setData] = useState<PaketLayanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    const savedNotif = sessionStorage.getItem('paket_notif');
    if (savedNotif) {
      setNotif({ message: savedNotif, type: 'success' });
      sessionStorage.removeItem('paket_notif'); 
    }
  }, [pathname]);

  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notif]);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'id_paket_layanan',
    direction: 'asc'
  });

  const fetchPakets = async () => {
    setIsLoading(true);
    try {
      const result = await paketLayananService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching paket layanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPakets();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus paket layanan ${nama}?`)) return;

    try {
      await paketLayananService.delete(id);
      setData(data.filter(item => item.id_paket_layanan !== id));
      
      setNotif({ message: `Berhasil menghapus paket ${nama} (ID: ${id})!`, type: 'success' });
      
    } catch (error) {
      console.error(error);
      setNotif({ message: `Gagal menghapus paket ${nama}.`, type: 'error' });
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
        (item.nama_paket || '').toLowerCase().includes(lowerQuery)
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

  return (
    <div className="w-full relative">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Master Paket Layanan
      </h2>

      {notif && (
        <div className={`mb-6 p-4 rounded-2xl border-l-4 font-bold flex items-center justify-between shadow-lg transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${notif.type === 'success'
            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
            : 'bg-red-50 border-red-500 text-red-600'
          }`}>
          <div className="flex items-center gap-3">
            {notif.type === 'success' ? (
              <CheckCircle size={22} className="shrink-0" />
            ) : (
              <XCircle size={22} className="shrink-0" />
            )}
            <p className="text-sm md:text-base">{notif.message}</p>
          </div>
          <button
            onClick={() => setNotif(null)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={18} />
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
                placeholder="Cari paket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-medium transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-bold cursor-pointer transition-colors appearance-none bg-white"
              >
                {[10, 15, 20, 25].map(num => (
                  <option key={num} value={num}>{num} Baris</option>
                ))}
              </select>
            </div>
          </div>

          <Link
            href="/paket-layanan/tambah"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-[#1e3a5f]/20"
          >
            <Plus size={18} /> Tambah Paket
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-y border-slate-200 min-w-[800px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-xs uppercase tracking-widest select-none">
                <th className="p-4 font-bold text-center w-20 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('id_paket_layanan')}>
                  <div className="flex items-center justify-center">
                    ID
                    {renderSortIcon('id_paket_layanan')}
                  </div>
                </th>

                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('nama_paket')}>
                  <div className="flex items-center justify-between">
                    <span>Nama Paket</span>
                    {renderSortIcon('nama_paket')}
                  </div>
                </th>

                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('durasi_jam')}>
                  <div className="flex items-center justify-between">
                    <span>Durasi Waktu</span>
                    {renderSortIcon('durasi_jam')}
                  </div>
                </th>

                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('biaya_tambahan')}>
                  <div className="flex items-center justify-between">
                    <span>Biaya Tambahan</span>
                    {renderSortIcon('biaya_tambahan')}
                  </div>
                </th>

                <th className="p-4 font-bold text-center w-32 border-x border-white/10">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    <div className="flex justify-center mb-2">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#4FD1D9] rounded-full animate-spin"></div>
                    </div>
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    {searchQuery ? "Data tidak ditemukan." : "Belum ada data paket layanan."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id_paket_layanan} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center font-bold text-slate-400 border-x border-slate-200">
                      {row.id_paket_layanan}
                    </td>
                    <td className="p-4 font-bold text-[#1e3a5f] border-x border-slate-200">
                      {row.nama_paket}
                    </td>
                    <td className="p-4 font-medium text-slate-700 border-x border-slate-200">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                        {row.durasi_jam} Jam
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 border-x border-slate-200">
                      <span className="text-emerald-600 font-bold">+ Rp {row.biaya_tambahan.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="p-4 border-x border-slate-200">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/paket-layanan/edit/${row.id_paket_layanan}`}
                          title="Edit"
                          className="p-2 flex items-center justify-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          title="Hapus"
                          onClick={() => handleDelete(row.id_paket_layanan, row.nama_paket)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors active:scale-95"
                        >
                          <Trash2 size={16} />
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page
                      ? 'bg-[#1e3a5f] text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {page}
                  </button>
                ))}
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
    </div>
  );
}
