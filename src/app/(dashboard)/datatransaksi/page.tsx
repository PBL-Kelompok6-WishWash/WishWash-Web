"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Filter, Calendar, Clock, User, Package, CreditCard,
  CheckCircle, Timer, AlertCircle, X
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

interface Transaksi {
  id_order: number;
  kode_order: string;
  id_pelanggan: number;
  id_layanan: number;
  tgl_pesanan: string;
  total_bayar: number;
  tipe_logistik: string;
  kuantitas: number;
  catatan_order: string;
  Pelanggan: {
    nama_lengkap: string;
    no_telepon: string;
    foto_pelanggan?: string;
  };
  Layanan: {
    nama_layanan: string;
    harga: number;
  };
  Pembayaran?: {
    status_pembayaran: string;
    metode_bayar: string;
    jumlah_bayar: number;
  };
  RiwayatStatusDetail?: Array<{
    referensi_status?: {
      nama_status: string;
      urutan_tahap: number;
    };
    ReferensiStatus?: {
      nama_status: string;
      urutan_tahap: number;
    };
    referensiStatus?: {
      nama_status: string;
      urutan_tahap: number;
    };
    waktu_update: string;
  }>;
}

const getOrderStatus = (order: Transaksi): string => {
  const history = order.RiwayatStatusDetail || [];
  if (history.length === 0) return "Pesanan Diterima";
  const sortedHistory = [...history].sort((a, b) => {
    const idA = (a as any).id_riwayat_status_detail || 0;
    const idB = (b as any).id_riwayat_status_detail || 0;
    return idA - idB;
  });
  const lastHistory = sortedHistory[sortedHistory.length - 1];
  const refStatus = lastHistory?.ReferensiStatus || lastHistory?.referensiStatus || lastHistory?.referensi_status;
  return refStatus?.nama_status || "Pesanan Diterima";
};


const getDisplayStatusName = (order: Transaksi): string => {
  const history = order.RiwayatStatusDetail || [];
  let rawStatus = "Pesanan Diterima";
  if (history.length > 0) {
    const sortedHistory = [...history].sort((a, b) => {
      const idA = (a as any).id_riwayat_status_detail || 0;
      const idB = (b as any).id_riwayat_status_detail || 0;
      return idA - idB;
    });
    const lastHistory = sortedHistory[sortedHistory.length - 1];
    const refStatus = lastHistory?.ReferensiStatus || lastHistory?.referensiStatus || lastHistory?.referensi_status;
    rawStatus = refStatus?.nama_status || "Pesanan Diterima";
  }

  if (rawStatus === "Batal" || rawStatus === "Dibatalkan") return "Dibatalkan";
  if (rawStatus === "Ditolak") return "Ditolak";

  const qty = order.kuantitas || 0;
  const isCourierOnWay = (order as any).is_courier_on_way || (order as any).IsCourierOnWay || false;
  const isCourierArrived = (order as any).is_courier_arrived || (order as any).IsCourierArrived || false;
  const tipeLogistik = order.tipe_logistik || "";

  if (rawStatus === "Pesanan Diterima") {
    return "Menunggu Konfirmasi Pesanan";
  }

  if (rawStatus === "Penjemputan") {
    return isCourierOnWay ? "Sedang Dijemput" : "Menunggu Dijemput";
  }

  if (rawStatus === "Proses Timbang") {
    return qty > 0 ? "Proses Timbang" : "Menunggu Timbang";
  }

  if (rawStatus === "Siap Diantar") {
    if (tipeLogistik === "Self Pickup" || tipeLogistik === "Drop-off") {
      return "Menunggu Diambil";
    }
    if (isCourierArrived) {
      return "Selesai Diantar";
    }
    return isCourierOnWay ? "Sedang Diantar" : "Menunggu Diantar";
  }

  return rawStatus;
};

export default function DataTransaksiPage() {
  const [orders, setOrders] = useState<Transaksi[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Transaksi[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState<Transaksi | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State form update order
  const [editStatus, setEditStatus] = useState("");
  const [editKuantitas, setEditKuantitas] = useState(0);
  const [editStatusBayar, setEditStatusBayar] = useState("");
  const [editMetodeBayar, setEditMetodeBayar] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'tgl_pesanan', direction: 'asc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: string) => {
    const isActive = sortConfig.key === columnKey;
    const isAsc = isActive && sortConfig.direction === 'asc';
    const isDesc = isActive && sortConfig.direction === 'desc';

    return (
      <div className="flex flex-col items-center -space-y-1.5 ml-1 shrink-0">
        <ChevronUp
          size={12}
          strokeWidth={isAsc ? 4 : 2}
          className={`transition-colors ${isAsc ? 'text-white' : 'text-slate-400/50'}`}
        />
        <ChevronDown
          size={12}
          strokeWidth={isDesc ? 4 : 2}
          className={`transition-colors ${isDesc ? 'text-white' : 'text-slate-400/50'}`}
        />
      </div>
    );
  };



  async function loadOrders() {
    try {
      setIsLoading(true);
      const res = await orderService.getAll();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = orders;

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o.kode_order && o.kode_order.toLowerCase().includes(q)) ||
        (o.Pelanggan?.nama_lengkap && o.Pelanggan.nama_lengkap.toLowerCase().includes(q)) ||
        (o.Layanan?.nama_layanan && o.Layanan.nama_layanan.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== "Semua") {
      result = result.filter(o => {
        const displayStatus = getDisplayStatusName(o);
        return displayStatus === statusFilter;
      });
    }

    // Apply Sorting
    if (sortConfig.key) {
      result = [...result].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'kode_order') {
          aValue = a.kode_order || `ORD-${a.id_order}`;
          bValue = b.kode_order || `ORD-${b.id_order}`;
        } else if (sortConfig.key === 'pelanggan') {
          aValue = a.Pelanggan?.nama_lengkap || '';
          bValue = b.Pelanggan?.nama_lengkap || '';
        } else if (sortConfig.key === 'layanan') {
          aValue = a.Layanan?.nama_layanan || '';
          bValue = b.Layanan?.nama_layanan || '';
        } else if (sortConfig.key === 'tgl_pesanan') {
          const aTime = a.tgl_pesanan ? new Date(a.tgl_pesanan).getTime() : 0;
          const bTime = b.tgl_pesanan ? new Date(b.tgl_pesanan).getTime() : 0;
          return sortConfig.direction === 'asc' ? bTime - aTime : aTime - bTime;
        } else if (sortConfig.key === 'kuantitas') {
          aValue = a.kuantitas || 0;
          bValue = b.kuantitas || 0;
          return sortConfig.direction === 'asc' ? bValue - aValue : aValue - bValue;
        } else if (sortConfig.key === 'total_bayar') {
          aValue = a.total_bayar || 0;
          bValue = b.total_bayar || 0;
          return sortConfig.direction === 'asc' ? bValue - aValue : aValue - bValue;
        } else if (sortConfig.key === 'pembayaran') {
          aValue = a.Pembayaran?.status_pembayaran || 'Belum Bayar';
          bValue = b.Pembayaran?.status_pembayaran || 'Belum Bayar';
        } else if (sortConfig.key === 'status_pesanan') {
          aValue = getDisplayStatusName(a);
          bValue = getDisplayStatusName(b);
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, orders, sortConfig, itemsPerPage]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  const getStatusPesananBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('menunggu')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('sedang')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Dibatalkan':
      case 'Ditolak':
      case 'Batal':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Siap Diantar':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };

  const getStatusBayarBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s === 'paid' || s === 'lunas') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    } else if (s === 'unpaid' || s === 'belum bayar' || s === 'belum lunas') {
      return 'bg-red-50 text-red-700 border-red-100';
    }
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  const openDetails = (order: Transaksi) => {
    setSelectedOrder(order);
    const lastStatus = getOrderStatus(order);

    setEditStatus(lastStatus);
    setEditKuantitas(order.kuantitas || 0);
    setEditStatusBayar(order.Pembayaran?.status_pembayaran || "Belum Bayar");
    setEditMetodeBayar(order.Pembayaran?.metode_bayar || "Cash");
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const updatePayload: any = {
        status: editStatus,
        kuantitas: Number(editKuantitas),
        status_pembayaran: editStatusBayar,
        metode_bayar: editMetodeBayar
      };

      await orderService.update(selectedOrder.id_order, updatePayload);
      setIsModalOpen(false);
      loadOrders(); // reload
    } catch (err: any) {
      alert(err.message || "Gagal mengupdate pesanan");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-wider mb-1">
            Data Transaksi
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Monitoring dan perbarui status pesanan laundry pelanggan.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Clock size={18} className="text-[#4FD1D9]" />
            <span className="text-sm font-bold text-[#1e3a5f]">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* TOOLBAR */}
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Kode Order, Nama Pelanggan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#4FD1D9] transition-all font-medium"
              />
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] text-sm font-bold cursor-pointer transition-colors appearance-none bg-white shrink-0"
            >
              {[5, 10, 25, 50].map(num => (
                <option key={num} value={num}>{num} Baris</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
             <div className="flex items-center gap-2 bg-white px-4 py-2.5 border-2 border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-400">Filter Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-bold text-slate-600 focus:outline-none bg-transparent"
                >
                  <option value="Semua">Semua</option>
                  <option value="Menunggu Konfirmasi Pesanan">Menunggu Konfirmasi Pesanan</option>
                  <option value="Menunggu Dijemput">Menunggu Dijemput</option>
                  <option value="Sedang Dijemput">Sedang Dijemput</option>
                  <option value="Menunggu Timbang">Menunggu Timbang</option>
                  <option value="Proses Timbang">Proses Timbang</option>
                  <option value="Proses Cuci">Proses Cuci</option>
                  <option value="Proses Kering">Proses Kering</option>
                  <option value="Proses Lipat">Proses Lipat</option>
                  <option value="Proses Setrika">Proses Setrika</option>
                  <option value="Menunggu Diantar">Menunggu Diantar</option>
                  <option value="Menunggu Diambil">Menunggu Diambil</option>
                  <option value="Sedang Diantar">Sedang Diantar</option>
                  <option value="Selesai Diantar">Selesai Diantar</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
             </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4FD1D9] mb-4"></div>
              <p className="text-slate-400 font-bold">Memuat Transaksi...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center font-bold text-slate-400">
              Tidak ada data transaksi yang ditemukan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px] border-y border-slate-200">
              <thead>
                <tr className="bg-[#1e3a5f] text-white text-[10px] uppercase tracking-[0.15em] font-black select-none">
                  <th className="py-3 px-4 border-x border-white/10 text-center w-28 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('kode_order')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Kode Order</span>
                      {renderSortIcon('kode_order')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('pelanggan')}>
                    <div className="flex items-center justify-between">
                      <span>Pelanggan</span>
                      {renderSortIcon('pelanggan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('layanan')}>
                    <div className="flex items-center justify-between">
                      <span>Layanan</span>
                      {renderSortIcon('layanan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('tgl_pesanan')}>
                    <div className="flex items-center justify-between">
                      <span>Waktu Order</span>
                      {renderSortIcon('tgl_pesanan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('kuantitas')}>
                    <div className="flex items-center justify-between">
                      <span>Kuantitas</span>
                      {renderSortIcon('kuantitas')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('total_bayar')}>
                    <div className="flex items-center justify-between">
                      <span>Total Bayar</span>
                      {renderSortIcon('total_bayar')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 text-center cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('pembayaran')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Status Pembayaran</span>
                      {renderSortIcon('pembayaran')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 text-center cursor-pointer hover:bg-[#122640] transition-colors" onClick={() => handleSort('status_pesanan')}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Status Pesanan</span>
                      {renderSortIcon('status_pesanan')}
                    </div>
                  </th>
                  <th className="py-3 px-4 border-x border-white/10 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {currentItems.map((order, idx) => {
                  const lastStatus = getDisplayStatusName(order);

                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-bold text-slate-400 border-x border-slate-200">
                        {order.kode_order || `ORD-${order.id_order}`}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-bold text-[#1e3a5f]">
                        <div className="flex items-center gap-2">
                          {order.Pelanggan?.foto_pelanggan ? (
                            <img 
                              src={getImageUrl(order.Pelanggan.foto_pelanggan)} 
                              alt={order.Pelanggan.nama_lengkap} 
                              className="w-7 h-7 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <User size={12} />
                            </div>
                          )}
                          <div>
                            <p className="leading-tight">{order.Pelanggan?.nama_lengkap || "Pelanggan"}</p>
                            <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{order.Pelanggan?.no_telepon || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Package size={13} className="text-[#4FD1D9]" />
                          {order.Layanan?.nama_layanan || "Layanan"}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-300" />
                          {new Date(order.tgl_pesanan).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-bold text-slate-600">
                        {order.kuantitas || 0} kg
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 font-black text-[#1e3a5f]">
                        Rp {(order.total_bayar || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold border uppercase tracking-wider whitespace-nowrap ${getStatusBayarBadge(order.Pembayaran?.status_pembayaran || "Belum Bayar")}`}>
                          {(() => {
                            const status = order.Pembayaran?.status_pembayaran || "Belum Bayar";
                            return status.toLowerCase() === 'belum bayar' ? 'Belum Lunas' : status;
                          })()}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusPesananBadge(lastStatus)}`}>
                          {lastStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 border-x border-slate-200 text-center">
                        <button 
                          onClick={() => openDetails(order)}
                          className="p-1.5 bg-slate-100 text-[#1e3a5f] rounded-lg hover:bg-[#4FD1D9] hover:text-white transition-all active:scale-95 shadow-sm"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
             <p className="text-xs font-bold text-slate-400">
                Menampilkan <span className="text-[#1e3a5f]">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)}</span> dari <span className="text-[#1e3a5f]">{filteredOrders.length}</span> data
             </p>
             <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
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
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pageNum === currentPage ? 'bg-[#1e3a5f] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-[#1e3a5f] hover:border-[#1e3a5f]'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                >
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* DETAIL & EDIT MODAL */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3a5f]/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="bg-[#1e3a5f] text-white px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-wider">
                  Detail Transaksi
                </h3>
                <p className="text-xs text-slate-300 font-bold tracking-widest mt-0.5">
                  {selectedOrder.kode_order || `ORD-${selectedOrder.id_order}`}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateOrder} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pelanggan</label>
                  <p className="font-bold text-[#1e3a5f] text-base">{selectedOrder.Pelanggan?.nama_lengkap || "Pelanggan"}</p>
                  <p className="text-xs text-slate-500 font-semibold">{selectedOrder.Pelanggan?.no_telepon || ""}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Layanan</label>
                  <p className="font-bold text-[#1e3a5f] text-base">{selectedOrder.Layanan?.nama_layanan || "Layanan"}</p>
                  <p className="text-xs text-[#4FD1D9] font-black">Rp {selectedOrder.Layanan?.harga?.toLocaleString('id-ID') || 0}/kg</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-6">
                {/* Kuantitas */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Kuantitas (kg)
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editKuantitas}
                    onChange={(e) => {
                      const newQty = Number(e.target.value);
                      setEditKuantitas(newQty);
                      if (newQty > 0 && (editStatus === "Proses Timbang" || editStatus === "Penjemputan" || editStatus === "Pesanan Diterima")) {
                        const namaLayanan = selectedOrder?.Layanan?.nama_layanan?.toLowerCase() || "";
                        if (namaLayanan.includes("setrika") && !namaLayanan.includes("cuci")) {
                          setEditStatus("Proses Setrika");
                        } else {
                          setEditStatus("Proses Cuci");
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[#1e3a5f] focus:outline-none focus:border-[#4FD1D9] focus:bg-white transition-all"
                    required
                  />
                </div>

                {/* Status Pesanan */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Status Pesanan
                  </label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[#1e3a5f] focus:outline-none focus:border-[#4FD1D9] focus:bg-white transition-all"
                  >
                    <option value="Pesanan Diterima">Menunggu Konfirmasi Pesanan</option>
                    <option value="Penjemputan">Penjemputan (Menunggu Dijemput / Sedang Dijemput)</option>
                    <option value="Proses Timbang">Proses Timbang (Menunggu Timbang / Timbang)</option>
                    <option value="Proses Cuci">Proses Cuci</option>
                    <option value="Proses Kering">Proses Kering</option>
                    <option value="Proses Lipat">Proses Lipat</option>
                    <option value="Proses Setrika">Proses Setrika</option>
                    <option value="Siap Diantar">Siap Diantar (Menunggu Diantar / Sedang Diantar)</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Status Pembayaran */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Status Pembayaran
                  </label>
                  <select 
                    value={editStatusBayar}
                    onChange={(e) => setEditStatusBayar(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[#1e3a5f] focus:outline-none focus:border-[#4FD1D9] focus:bg-white transition-all"
                  >
                    <option value="Belum Bayar">Belum Lunas</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>

                {/* Metode Bayar */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Metode Pembayaran
                  </label>
                  <select 
                    value={editMetodeBayar}
                    onChange={(e) => setEditMetodeBayar(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-[#1e3a5f] focus:outline-none focus:border-[#4FD1D9] focus:bg-white transition-all"
                  >
                    <option value="Cash">Cash / Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer">Transfer Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Catatan</label>
                <p className="text-slate-600 font-medium bg-slate-50 p-4 rounded-xl text-xs border border-slate-100 mt-2">
                  {selectedOrder.catatan_order || "Tidak ada catatan."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 rounded-xl bg-[#4FD1D9] text-white font-bold hover:bg-[#3db8c0] shadow-lg shadow-[#4FD1D9]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}