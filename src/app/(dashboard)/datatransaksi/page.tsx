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
  biaya_penjemputan?: number;
  biaya_pengantaran?: number;
  keterangan_lokasi?: string;
  jadwal_pickup?: string;
  harga_saat_ini?: number;
  is_courier_on_way?: boolean;
  is_courier_arrived?: boolean;
  Pelanggan: {
    nama_lengkap: string;
    no_telp: string;
    foto_pelanggan?: string;
  };
  Layanan: {
    nama_layanan: string;
    harga: number;
  };
  PaketLayanan?: {
    nama_paket: string;
    durasi_jam: number;
    tarif_multiplier: number;
    biaya_tambahan?: number;
  };
  Parfum?: {
    nama_parfum: string;
  };
  PromoOrder?: Array<{
    id_promo_order?: number;
    Promo: {
      id_promo: number;
      nama_promo: string;
      nominal_potongan: number;
      tipe_promo: string;
      maksimal_potongan?: number;
    };
  }>;
  Karyawan?: {
    nama_karyawan: string;
    no_telp?: string;
    plat_nomor?: string;
    jenis_kendaraan?: string;
    foto_karyawan?: string;
  };
  AlamatPengambilan?: {
    alamat_lengkap: string;
    tipe_alamat?: string;
    nama_penerima?: string;
    nohp_penerima?: string;
  };
  AlamatPenyerahan?: {
    alamat_lengkap: string;
    tipe_alamat?: string;
    nama_penerima?: string;
    nohp_penerima?: string;
  };
  Pembayaran?: {
    status_pembayaran: string;
    metode_bayar: string;
    jumlah_bayar: number;
    waktu_bayar?: string;
  };
  Penilaian?: {
    bintang: number;
    komentar?: string;
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
                            <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{order.Pelanggan?.no_telp || ""}</p>
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

      {/* ═══════════════ DETAIL TRANSAKSI MODAL (READ-ONLY) ═══════════════ */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0a1628]/60 backdrop-blur-md p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-white w-full max-w-5xl rounded-t-[32px] sm:rounded-[28px] shadow-[0_30px_80px_rgba(10,22,40,0.3)] overflow-hidden border border-slate-100/50 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            {/* HERO HEADER */}
            <div className="relative bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#163358] text-white overflow-hidden shrink-0">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#4FD1D9]/10 pointer-events-none" />
              <div className="relative px-7 py-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                    <Package size={26} className="text-[#4FD1D9]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4FD1D9]/80">Detail Transaksi</span>
                    <h3 className="text-2xl font-black tracking-tight leading-none mt-0.5">
                      {selectedOrder.kode_order || `ORD-${selectedOrder.id_order}`}
                    </h3>
                    <p className="text-white/50 text-xs font-semibold mt-1.5">
                      Dipesan {new Date(selectedOrder.tgl_pesanan).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider whitespace-nowrap ${getStatusPesananBadge(getDisplayStatusName(selectedOrder))}`}>
                    {getDisplayStatusName(selectedOrder)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider whitespace-nowrap ${getStatusBayarBadge(selectedOrder.Pembayaran?.status_pembayaran || "Belum Bayar")}`}>
                    {(() => {
                      const s = selectedOrder.Pembayaran?.status_pembayaran || "Belum Bayar";
                      return s.toLowerCase() === 'belum bayar' ? 'Belum Lunas' : s;
                    })()}
                  </span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/15 p-2 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-7 space-y-5">

                  {/* Pelanggan */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <User size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Informasi Pelanggan</h4>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                      {selectedOrder.Pelanggan?.foto_pelanggan ? (
                        <img src={getImageUrl(selectedOrder.Pelanggan.foto_pelanggan)} alt={selectedOrder.Pelanggan.nama_lengkap} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#4FD1D9]/25 shadow-md shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4FD1D9]/15 to-[#1e3a5f]/10 flex items-center justify-center border border-[#4FD1D9]/20 shrink-0">
                          <User size={20} className="text-[#4FD1D9]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#1e3a5f] text-base leading-tight truncate">{selectedOrder.Pelanggan?.nama_lengkap || "Pelanggan"}</p>
                        <p className="text-sm text-slate-400 font-semibold mt-0.5">{selectedOrder.Pelanggan?.no_telp || "Nomor tidak tersedia"}</p>
                      </div>
                    </div>
                  </section>

                  {/* Layanan */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Package size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Layanan & Detail Pesanan</h4>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Layanan Laundry</span>
                          <p className="font-extrabold text-[#1e3a5f] text-sm">{selectedOrder.Layanan?.nama_layanan || "-"}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Rp {(selectedOrder.harga_saat_ini || selectedOrder.Layanan?.harga || 0).toLocaleString('id-ID')} / kg
                          </p>
                          {selectedOrder.PaketLayanan && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] bg-[#4FD1D9]/10 text-[#259b9f] border border-[#4FD1D9]/25 px-2 py-0.5 rounded-full font-extrabold">
                              {selectedOrder.PaketLayanan.nama_paket} · {selectedOrder.PaketLayanan.durasi_jam} Jam
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pilihan Parfum</span>
                          <p className="font-extrabold text-[#1e3a5f] text-sm">{selectedOrder.Parfum?.nama_parfum || "-"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Berat / Kuantitas</span>
                          <p className="font-extrabold text-[#1e3a5f] text-sm">{selectedOrder.kuantitas || 0} kg</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tanggal Pesanan</span>
                          <p className="font-bold text-[#1e3a5f] text-sm">
                            {new Date(selectedOrder.tgl_pesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Kurir */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <User size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Kurir / Petugas Lapangan</h4>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                      {selectedOrder.Karyawan ? (
                        <div className="flex items-center gap-4">
                          {selectedOrder.Karyawan.foto_karyawan ? (
                            <img src={getImageUrl(selectedOrder.Karyawan.foto_karyawan)} alt={selectedOrder.Karyawan.nama_karyawan} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                              <User size={18} className="text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#1e3a5f] text-sm">{selectedOrder.Karyawan.nama_karyawan}</p>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              {selectedOrder.Karyawan.jenis_kendaraan || "-"} &nbsp;·&nbsp; {selectedOrder.Karyawan.plat_nomor || "-"}
                            </p>
                            {selectedOrder.Karyawan.no_telp && (
                              <p className="text-[10px] text-[#259b9f] font-bold mt-0.5">{selectedOrder.Karyawan.no_telp}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <User size={16} className="text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400 font-bold italic">Belum ditugaskan ke kurir/petugas.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Logistik */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Filter size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Logistik & Alamat</h4>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipe Logistik</span>
                          <p className="font-bold text-[#1e3a5f] text-sm">{selectedOrder.tipe_logistik || "-"}</p>
                        </div>
                        {selectedOrder.jadwal_pickup && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jadwal Pickup</span>
                            <p className="font-bold text-[#1e3a5f] text-sm">
                              {new Date(selectedOrder.jadwal_pickup).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedOrder.AlamatPengambilan && (
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Alamat Penjemputan</span>
                          <p className="text-xs font-bold text-[#1e3a5f]">
                            {selectedOrder.AlamatPengambilan.nama_penerima}
                            {selectedOrder.AlamatPengambilan.nohp_penerima ? ` (${selectedOrder.AlamatPengambilan.nohp_penerima})` : ''}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{selectedOrder.AlamatPengambilan.alamat_lengkap}</p>
                        </div>
                      )}
                      {selectedOrder.AlamatPenyerahan && (
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Alamat Pengantaran</span>
                          <p className="text-xs font-bold text-[#1e3a5f]">
                            {selectedOrder.AlamatPenyerahan.nama_penerima}
                            {selectedOrder.AlamatPenyerahan.nohp_penerima ? ` (${selectedOrder.AlamatPenyerahan.nohp_penerima})` : ''}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{selectedOrder.AlamatPenyerahan.alamat_lengkap}</p>
                        </div>
                      )}
                      {selectedOrder.keterangan_lokasi && (
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Keterangan Lokasi</span>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{selectedOrder.keterangan_lokasi}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Catatan */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Catatan Pesanan</h4>
                    </div>
                    <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl min-h-[64px]">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                        {selectedOrder.catatan_order || "Tidak ada catatan khusus dari pelanggan."}
                      </p>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Pembayaran */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Rincian Pembayaran</h4>
                    </div>
                    <div className="bg-gradient-to-br from-[#0f2744] to-[#1e3a5f] rounded-2xl p-5 shadow-lg text-white">
                      {(() => {
                        const hargaPerKg = selectedOrder.harga_saat_ini || selectedOrder.Layanan?.harga || 0;
                        const qty = selectedOrder.kuantitas || 0;
                        const subtotal = qty * hargaPerKg;
                        const biayaTambahanPaket = selectedOrder.PaketLayanan?.biaya_tambahan || 0;
                        const biayaJemput = selectedOrder.biaya_penjemputan || 0;
                        const biayaAntar = selectedOrder.biaya_pengantaran || 0;
                        let promoDiscount = 0;
                        let promoName = "";
                        if (selectedOrder.PromoOrder && selectedOrder.PromoOrder.length > 0) {
                          const promo = selectedOrder.PromoOrder[0].Promo;
                          if (promo) {
                            promoName = promo.nama_promo;
                            if (promo.tipe_promo?.toLowerCase().includes("persen")) {
                              promoDiscount = subtotal * (promo.nominal_potongan / 100);
                              if (promo.maksimal_potongan && promoDiscount > promo.maksimal_potongan) promoDiscount = promo.maksimal_potongan;
                            } else {
                              promoDiscount = promo.nominal_potongan;
                            }
                          }
                        }
                        type BillingRow = { label: string; value: string; green?: boolean };
                        const rows: BillingRow[] = [
                          { label: `Tarif: Rp ${hargaPerKg.toLocaleString('id-ID')}/kg x ${qty} kg`, value: `Rp ${subtotal.toLocaleString('id-ID')}` },
                          ...(biayaTambahanPaket > 0 ? [{ label: `Tambahan Paket (${selectedOrder.PaketLayanan?.nama_paket})`, value: `Rp ${biayaTambahanPaket.toLocaleString('id-ID')}` }] : []),
                          { label: 'Biaya Penjemputan', value: `Rp ${biayaJemput.toLocaleString('id-ID')}` },
                          { label: 'Biaya Pengantaran', value: `Rp ${biayaAntar.toLocaleString('id-ID')}` },
                          ...(promoDiscount > 0 ? [{ label: `Promo: ${promoName}`, value: `-Rp ${promoDiscount.toLocaleString('id-ID')}`, green: true }] : []),
                        ];
                        return (
                          <div className="space-y-2">
                            {rows.map((r, i) => (
                              <div key={i} className="flex justify-between items-baseline text-xs">
                                <span className={`font-medium ${r.green ? 'text-emerald-300' : 'text-white/60'}`}>{r.label}</span>
                                <span className={`font-bold ${r.green ? 'text-emerald-300' : 'text-white'}`}>{r.value}</span>
                              </div>
                            ))}
                            <div className="border-t border-white/20 pt-3 mt-2 flex justify-between items-center">
                              <span className="font-black text-white/70 text-xs uppercase tracking-wider">Total Bayar</span>
                              <span className="font-black text-[#4FD1D9] text-xl">Rp {(selectedOrder.total_bayar || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="border-t border-white/15 pt-3 space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-white/50 font-medium">Metode Bayar</span>
                                <span className="text-white font-bold">{selectedOrder.Pembayaran?.metode_bayar || "-"}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-white/50 font-medium">Jumlah Dibayar</span>
                                <span className="text-white font-bold">Rp {(selectedOrder.Pembayaran?.jumlah_bayar || 0).toLocaleString('id-ID')}</span>
                              </div>
                              {selectedOrder.Pembayaran?.waktu_bayar && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-white/50 font-medium">Waktu Bayar</span>
                                  <span className="text-white font-bold">
                                    {new Date(selectedOrder.Pembayaran.waktu_bayar).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </section>

                  {/* Ulasan */}
                  {selectedOrder.Penilaian && selectedOrder.Penilaian.bintang > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={13} className="text-amber-400" />
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Ulasan Pelanggan</h4>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < (selectedOrder.Penilaian?.bintang || 0) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs font-black text-amber-600 ml-1">{selectedOrder.Penilaian.bintang}/5</span>
                        </div>
                        {selectedOrder.Penilaian.komentar && (
                          <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                            &ldquo;{selectedOrder.Penilaian.komentar}&rdquo;
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Riwayat Status */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Timer size={13} className="text-[#4FD1D9]" />
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">Riwayat Status & Pelacakan</h4>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                      <div className="overflow-y-auto max-h-[280px] custom-scrollbar pr-1">
                        {(() => {
                          const history = selectedOrder.RiwayatStatusDetail || [];
                          const sorted = [...history].sort((a, b) => {
                            const idA = (a as any).id_riwayat_status_detail || 0;
                            const idB = (b as any).id_riwayat_status_detail || 0;
                            return idA - idB;
                          });
                          if (sorted.length === 0) {
                            return <p className="text-slate-400 text-xs italic text-center py-4">Belum ada riwayat status.</p>;
                          }
                          return (
                            <div className="relative pl-5 ml-2 space-y-4 border-l-2 border-dashed border-slate-200">
                              {sorted.map((step, idx) => {
                                const refStatus = step.ReferensiStatus || step.referensiStatus || step.referensi_status;
                                const statusName = refStatus?.nama_status || "Status tidak dikenal";
                                const isLast = idx === sorted.length - 1;
                                const timeStr = new Date(step.waktu_update).toLocaleString('id-ID', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                });
                                return (
                                  <div key={idx} className="relative">
                                    <div className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full flex items-center justify-center border-2 ${isLast ? 'bg-[#4FD1D9] border-[#4FD1D9] shadow-[0_0_6px_rgba(79,209,217,0.5)]' : 'bg-white border-slate-300'}`}>
                                      {isLast && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <p className={`font-bold text-sm ${isLast ? 'text-[#1e3a5f]' : 'text-slate-500'}`}>{statusName}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{timeStr}</p>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#163358] text-white font-extrabold hover:from-[#163358] hover:to-[#0f2744] shadow-md transition-all active:scale-95 text-sm tracking-wide"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
