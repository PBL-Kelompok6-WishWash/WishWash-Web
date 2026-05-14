"use client";

import React, { useEffect, useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, 
  ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, X, CreditCard, Image as ImageIcon
} from 'lucide-react';
import { metodePembayaranService } from '@/services/metodePembayaranService';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface MetodePembayaran {
  id_metode_pembayaran: number;
  nama_metode: string;
  tipe_metode: string;
  kode_metode: string;
  gambar_metode: string;
  status_metode: string;
}

export default function MetodePembayaranPage() {
  const [data, setData] = useState<MetodePembayaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notif, setNotif] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    const savedNotif = sessionStorage.getItem('mp_notif');
    if (savedNotif) {
      setNotif({ message: savedNotif, type: 'success' });
      sessionStorage.removeItem('mp_notif');
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

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: 'id_metode_pembayaran',
    direction: 'asc'
  });

  const fetchMP = async () => {
    setIsLoading(true);
    try {
      const result = await metodePembayaranService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMP();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus metode pembayaran ${nama}?`)) return;

    try {
      await metodePembayaranService.delete(id);
      setData(data.filter(item => item.id_metode_pembayaran !== id));
      setNotif({ message: `Berhasil menghapus ${nama}!`, type: 'success' });
    } catch (error) {
      console.error(error);
      setNotif({ message: `Gagal menghapus ${nama}.`, type: 'error' });
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
        (item.nama_metode || '').toLowerCase().includes(lowerQuery) ||
        (item.kode_metode || '').toLowerCase().includes(lowerQuery) ||
        (item.tipe_metode || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
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
        <ChevronUp size={14} strokeWidth={isAsc ? 4 : 2} className={`transition-colors ${isAsc ? 'text-white' : 'text-slate-400/50'}`} />
        <ChevronDown size={14} strokeWidth={isDesc ? 4 : 2} className={`transition-colors ${isDesc ? 'text-white' : 'text-slate-400/50'}`} />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Tidak Aktif':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="w-full relative">
      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider">
        Metode Pembayaran
      </h2>

      {notif && (
        <div className={`mb-6 p-4 rounded-2xl border-l-4 font-bold flex items-center justify-between shadow-lg transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
          notif.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-600'
        }`}>
          <div className="flex items-center gap-3">
            {notif.type === 'success' ? <CheckCircle size={22} /> : <XCircle size={22} />}
            <p className="text-sm md:text-base">{notif.message}</p>
          </div>
          <button onClick={() => setNotif(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
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
                placeholder="Cari metode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-medium transition-colors"
              />
            </div>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-bold cursor-pointer transition-colors appearance-none bg-white"
            >
              {[5, 10, 25, 50].map(num => <option key={num} value={num}>{num} Baris</option>)}
            </select>
          </div>

          <Link 
            href="/metode-pembayaran/tambah"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-[#1e3a5f]/20"
          >
            <Plus size={18} /> Tambah Metode
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-y border-slate-200 min-w-[800px]">
            <thead>
              <tr className="bg-[#1e3a5f] text-white text-xs uppercase tracking-widest select-none">
                <th className="p-4 font-bold text-center w-20 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('id_metode_pembayaran')}>
                  <div className="flex items-center justify-center gap-1">ID {renderSortIcon('id_metode_pembayaran')}</div>
                </th>
                <th className="p-4 font-bold text-center w-24 border-x border-white/10 text-[10px]">Icon</th>
                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('nama_metode')}>
                   <div className="flex items-center justify-between"><span>Nama Metode</span>{renderSortIcon('nama_metode')}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('tipe_metode')}>
                   <div className="flex items-center justify-between"><span>Tipe</span>{renderSortIcon('tipe_metode')}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('kode_metode')}>
                   <div className="flex items-center justify-between"><span>Kode Gateway</span>{renderSortIcon('kode_metode')}</div>
                </th>
                <th className="p-4 font-bold text-center w-28 cursor-pointer hover:bg-[#122640] transition-colors border-x border-white/10" onClick={() => handleSort('status_metode')}>
                   <div className="flex items-center justify-center">Status {renderSortIcon('status_metode')}</div>
                </th>
                <th className="p-4 font-bold text-center w-32 border-x border-white/10">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    <div className="flex justify-center mb-2"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#4FD1D9] rounded-full animate-spin"></div></div>
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-medium border-b border-slate-200">
                    {searchQuery ? "Data tidak ditemukan." : "Belum ada metode pembayaran."}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id_metode_pembayaran} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center font-bold text-slate-400 border-x border-slate-200">{row.id_metode_pembayaran}</td>
                    <td className="p-4 border-x border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto overflow-hidden border border-slate-200 shadow-inner">
                        {row.gambar_metode ? (
                          <img src={row.gambar_metode} alt={row.nama_metode} className="w-full h-full object-contain p-1" />
                        ) : <CreditCard size={20} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#1e3a5f] border-x border-slate-200">{row.nama_metode}</td>
                    <td className="p-4 border-x border-slate-200 font-medium">
                      <span className={`px-2 py-1 rounded-lg text-[10px] uppercase font-black ${
                        row.tipe_metode === 'Midtrans' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {row.tipe_metode}
                      </span>
                    </td>
                    <td className="p-4 border-x border-slate-200 font-mono text-xs font-bold text-slate-500">{row.kode_metode}</td>
                    <td className="p-4 text-center border-x border-slate-200">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap inline-block ${getStatusBadge(row.status_metode)}`}>
                        {row.status_metode}
                      </span>
                    </td>
                    <td className="p-4 border-x border-slate-200">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/metode-pembayaran/edit/${row.id_metode_pembayaran}`} className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors active:scale-95"><Edit size={16} /></Link>
                        <button onClick={() => handleDelete(row.id_metode_pembayaran, row.nama_metode)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors active:scale-95"><Trash2 size={16} /></button>
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
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>{page}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
