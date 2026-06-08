"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Search, CheckCheck, ShoppingBag, CreditCard, Rocket, UserPlus, Info, User, Truck, MapPin, Calendar, Clock, Smartphone, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { notifikasiService, NotifikasiDTO } from '../../../services/notifikasiService';
import { orderService } from '../../../services/orderService';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotifikasiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotif, setSelectedNotif] = useState<NotifikasiDTO | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const getLatestStatus = (order: any) => {
    const history = order.RiwayatStatusDetail || order.riwayatStatusDetail || [];
    if (history.length === 0) return "Pesanan Diterima";
    const sortedHistory = [...history].sort((a, b) => {
      const idA = a.id_riwayat_status_detail || a.idRiwayat || a.id_riwayat || 0;
      const idB = b.id_riwayat_status_detail || b.idRiwayat || b.id_riwayat || 0;
      return idA - idB;
    });
    const lastHistory = sortedHistory[sortedHistory.length - 1];
    const refStatus = lastHistory?.ReferensiStatus || lastHistory?.referensiStatus || lastHistory?.referensi_status;
    return refStatus?.nama_status || refStatus?.namaStatus || "Pesanan Diterima";
  };

  const getStatusStyle = (statusName: string) => {
    const name = statusName.toLowerCase();
    if (name === "pesanan diterima" || name === "menunggu konfirmasi pesanan") {
      return {
        label: "Menunggu Konfirmasi Pesanan",
        className: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
      };
    }
    if (name.includes("selesai")) {
      return {
        label: statusName,
        className: "bg-green-500/10 text-green-600 border border-green-500/20"
      };
    }
    return {
      label: statusName,
      className: "bg-[#4FD1D9]/10 text-[#259b9f] border border-[#4FD1D9]/20"
    };
  };

  const getEstSelesaiDate = (order: any) => {
    const baseDateStr = order.jadwal_pickup || order.tgl_pesanan;
    if (!baseDateStr) return '-';
    try {
      const baseDate = new Date(baseDateStr);
      const durasiJam = order.PaketLayanan?.durasi_jam || 0;
      if (durasiJam === 0) {
        return getFormattedDate(baseDateStr);
      }
      const estSelesai = new Date(baseDate.getTime() + durasiJam * 60 * 60 * 1000);
      return getFormattedDate(estSelesai.toISOString());
    } catch (e) {
      return getFormattedDate(baseDateStr);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await notifikasiService.getAll();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notifikasiService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id_notifikasi === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notifikasiService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Gagal menandai semua dibaca:", error);
    }
  };

  const getNotifIcon = (judul: string) => {
    const title = judul.toLowerCase();
    if (title.includes('pesanan baru') || title.includes('masuk')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
          <ShoppingBag size={22} />
        </div>
      );
    }
    if (title.includes('pembayaran') || title.includes('bayar')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 shrink-0 shadow-sm">
          <CreditCard size={22} />
        </div>
      );
    }
    if (title.includes('selesai')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
          <Rocket size={22} />
        </div>
      );
    }
    if (title.includes('pelanggan baru') || title.includes('pelanggan')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0 shadow-sm">
          <UserPlus size={22} />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">
        <Bell size={22} />
      </div>
    );
  };

  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHr < 24) return `${diffHr} jam yang lalu`;
      return `${diffDay} hari yang lalu`;
    } catch (e) {
      return 'Baru saja';
    }
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notif.pesan.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'unread') return matchesSearch && !notif.is_read;
    if (activeTab === 'read') return matchesSearch && notif.is_read;
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="w-full space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e3a5f] tracking-tight">Pusat Notifikasi</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola semua riwayat aktivitas operasional laundry Anda.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4FD1D9]/10 text-[#259b9f] hover:bg-[#4FD1D9]/20 transition-all font-bold text-sm rounded-xl"
          >
            <CheckCheck size={18} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Area Kontrol (Search & Tabs) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Cari notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#4FD1D9] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto relative">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'unread', label: 'Belum Dibaca' },
            { id: 'read', label: 'Sudah Dibaca' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-initial px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 ${
                  isActive 
                    ? 'text-[#1e3a5f]' 
                    : 'text-slate-500 hover:text-[#1e3a5f]'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab.label}
                  {tab.id === 'unread' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeNotifTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Notifikasi */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[450px]">
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-medium space-y-3">
            <div className="w-8 h-8 border-4 border-[#4FD1D9] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Memuat data notifikasi...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Bell size={36} />
            </div>
            <div>
              <h3 className="font-bold text-[#1e3a5f] text-base">Tidak ada notifikasi</h3>
              <p className="text-xs text-slate-400 mt-1">Tidak ditemukan notifikasi baru yang sesuai dengan filter atau kata kunci pencarian Anda.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id_notifikasi}
                onClick={async () => {
                  setSelectedNotif(notif);
                  setSelectedOrder(null);

                  // Cari kode order berformat WW-XXXXXX (misal WW-DA36CX)
                  const match = notif.pesan.match(/WW-[A-Z0-9]+/i);
                  if (match) {
                    const orderKode = match[0];
                    setLoadingOrder(true);
                    try {
                      const res = await orderService.getByKode(orderKode);
                      if (res.success && res.data) {
                        setSelectedOrder(res.data);
                      }
                    } catch (error) {
                      console.error("Gagal mengambil detail pesanan:", error);
                    } finally {
                      setLoadingOrder(false);
                    }
                  }

                  if (!notif.is_read) {
                    handleMarkAsRead(notif.id_notifikasi);
                  }
                }}
                className={`p-5 flex gap-4 transition-all cursor-pointer relative group rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#4FD1D9]/30 ${
                  !notif.is_read ? 'bg-blue-50/20' : 'bg-white'
                }`}
              >
                {/* Status Indicator Bar */}
                {!notif.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-500 rounded-l-2xl"></div>
                )}

                {getNotifIcon(notif.judul)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-sm sm:text-base text-[#1e3a5f] ${
                      !notif.is_read ? 'font-black' : 'font-bold'
                    }`}>
                      {notif.judul}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {getRelativeTime(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
                    {notif.pesan}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-3 font-semibold uppercase tracking-wider">
                    <Info size={12} />
                    <span>{getFormattedDate(notif.created_at)}</span>
                  </div>
                </div>

                {/* Mark as read helper dot */}
                {!notif.is_read && (
                  <div className="flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Notifikasi */}
      {selectedNotif && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300"
          onClick={() => setSelectedNotif(null)}
        >
          <motion.div 
            initial={{ scale: 0.93, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[28px] border border-slate-100/80 p-6.5 shadow-[0_20px_50px_rgba(8,112,184,0.1)] max-w-md w-full space-y-5.5 relative overflow-hidden"
          >
             {/* Close Button */}
            <button 
              onClick={() => setSelectedNotif(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[#1e3a5f] transition-colors font-bold text-lg p-1"
            >
              &times;
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3.5">
              {getNotifIcon(selectedNotif.judul)}
              <div>
                <h3 className="font-black text-[#1e3a5f] text-lg leading-tight">
                  {selectedNotif.judul}
                </h3>
                <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                  {getRelativeTime(selectedNotif.created_at)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Detail Pesan / Detail Order */}
            {loadingOrder ? (
              <div className="py-10 text-center text-slate-400 font-medium space-y-3">
                <div className="w-8 h-8 border-4 border-[#4FD1D9] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-slate-400/80">Memuat detail pesanan...</p>
              </div>
            ) : selectedOrder ? (
              <div className="space-y-4 text-xs bg-slate-50/70 p-5 rounded-[22px] border border-slate-100/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.015)]">
                {/* Status & Code */}
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Kode Pesanan</span>
                    <p className="text-xs font-black text-[#1e3a5f] tracking-tight mt-0.5">{selectedOrder.kode_order}</p>
                  </div>
                  <div>
                    {(() => {
                      const rawStatus = getLatestStatus(selectedOrder);
                      const style = getStatusStyle(rawStatus);
                      return (
                        <span className={`px-2 py-0.5 font-extrabold text-[10px] rounded-lg shadow-sm ${style.className}`}>
                          {style.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 max-h-[44vh] overflow-y-auto pr-1 custom-scrollbar">
                  {/* Pelanggan */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                      <User size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Pelanggan</span>
                      <p className="font-bold text-[#1e3a5f] truncate text-xs">{selectedOrder.Pelanggan?.nama_lengkap || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{selectedOrder.Pelanggan?.no_telp || '-'}</p>
                    </div>
                  </div>

                  {/* Layanan */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-100/60 flex items-center justify-center text-teal-500 shrink-0 shadow-sm">
                      <ShoppingBag size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Layanan</span>
                      <p className="font-bold text-[#1e3a5f] text-xs">
                        {selectedOrder.Layanan?.nama_layanan}
                        {selectedOrder.PaketLayanan?.nama_paket && ` (${selectedOrder.PaketLayanan.nama_paket})`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Parfum: {selectedOrder.Parfum?.nama_parfum || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Tipe Pemesanan */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
                      {selectedOrder.id_alamat_pengambilan && selectedOrder.id_alamat_pengambilan !== 0
                        ? <Smartphone size={13} className="stroke-[2.5]" />
                        : <Store size={13} className="stroke-[2.5]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Tipe Pemesanan</span>
                      <p className="font-bold text-[#1e3a5f] text-xs">
                        {selectedOrder.id_alamat_pengambilan && selectedOrder.id_alamat_pengambilan !== 0
                          ? 'Online (Aplikasi)'
                          : 'Walk-in (Di Toko)'}
                      </p>
                    </div>
                  </div>

                  {/* Tanggal Pesanan */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-100/60 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                      <Calendar size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Tanggal Pesanan</span>
                      <p className="font-bold text-[#1e3a5f] text-xs">{getFormattedDate(selectedOrder.tgl_pesanan)}</p>
                    </div>
                  </div>

                  {/* Tanggal & Alamat Penjemputan (jika online) */}
                  {selectedOrder.id_alamat_pengambilan && selectedOrder.id_alamat_pengambilan !== 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100/60 flex items-center justify-center text-violet-500 shrink-0 shadow-sm">
                          <Calendar size={13} className="stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Tanggal Penjemputan</span>
                          <p className="font-bold text-[#1e3a5f] text-xs">
                            {selectedOrder.jadwal_pickup ? getFormattedDate(selectedOrder.jadwal_pickup) : 'Menunggu Penjemputan'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100/60 flex items-center justify-center text-violet-500 shrink-0 shadow-sm">
                          <MapPin size={13} className="stroke-[2.5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Alamat Penjemputan</span>
                          <p className="font-bold text-[#1e3a5f] text-xs leading-relaxed">{selectedOrder.AlamatPengambilan?.alamat_lengkap || '-'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Tipe Logistik */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-100/60 flex items-center justify-center text-sky-500 shrink-0 shadow-sm">
                      <Truck size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Tipe Logistik</span>
                      <p className="font-bold text-[#1e3a5f] text-xs">
                        {selectedOrder.tipe_logistik === 'Drop-off'
                          ? 'Ambil Sendiri di Toko (Drop-off)'
                          : 'Pengantaran Kurir'}
                      </p>
                    </div>
                  </div>

                  {/* Estimasi Selesai */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
                      <Clock size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">Estimasi Selesai</span>
                      <p className="font-bold text-[#1e3a5f] text-xs">{getEstSelesaiDate(selectedOrder)}</p>
                    </div>
                  </div>

                  {/* Alamat Pengantaran / Toko */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100/60 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                      <MapPin size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black text-slate-400/80 uppercase tracking-widest block mb-0.5">
                        {selectedOrder.tipe_logistik === 'Drop-off' ? 'Alamat Toko (Drop-off)' : 'Alamat Pengantaran'}
                      </span>
                      <p className="font-bold text-[#1e3a5f] text-xs leading-relaxed text-slate-700">
                        {selectedOrder.tipe_logistik === 'Drop-off'
                          ? 'WishWash Laundry Utama - Jalan Raya Laundry No. 99, Tembalang, Semarang'
                          : selectedOrder.AlamatPenyerahan?.alamat_lengkap || '-'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Catatan / Instruksi Khusus */}
                  {selectedOrder.catatan_order && (
                    <div className="bg-amber-50/50 border border-dashed border-amber-200 p-3 rounded-xl shadow-[0_2px_6px_rgba(245,158,11,0.02)]">
                      <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block mb-1">Instruksi Khusus</span>
                      <p className="text-xs text-slate-600 font-semibold italic">"{selectedOrder.catatan_order}"</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              (() => {
                const isNewCustomer = selectedNotif.judul.toLowerCase().includes('pelanggan baru');
                if (isNewCustomer) {
                  const match = selectedNotif.pesan.match(/bernama (.*?) \(@(.*?)\)/);
                  const fullName = match ? match[1] : 'Pelanggan Baru';
                  const username = match ? match[2] : '';
                  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-[22px] text-center space-y-4 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)]">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-purple-500/10 border-4 border-white">
                        {initials || 'PL'}
                      </div>
                      
                      {/* Name & Username */}
                      <div>
                        <h4 className="font-extrabold text-[#1e3a5f] text-base leading-tight">{fullName}</h4>
                        {username && <p className="text-xs text-purple-600 font-bold mt-1">@{username}</p>}
                      </div>

                      {/* Welcome Banner */}
                      <div className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 text-[9px] font-black tracking-wider uppercase rounded-full shadow-sm">
                        🎉 Member Baru Terdaftar
                      </div>

                      {/* Message Box */}
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                        Selamat bergabung di WishWash! Akun pelanggan telah aktif dan dapat digunakan untuk melakukan pesanan.
                      </p>
                    </div>
                  );
                }

                // Default fallback for other notification types
                return (
                  <div className="space-y-2">
                    <h4 className="text-[8px] font-black uppercase tracking-wider text-slate-400">Detail Pesan</h4>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50 p-4.5 rounded-2xl border border-slate-100 shadow-[inset_0_1px_4px_rgba(0,0,0,0.015)]">
                      {selectedNotif.pesan}
                    </p>
                  </div>
                );
              })()
            )}

            {/* Timestamp Info */}
            <div className="flex items-center gap-2.5 text-[10px] text-[#259b9f] font-bold bg-[#4FD1D9]/5 p-3 rounded-xl border border-[#4FD1D9]/10 shadow-[inset_0_1px_2px_rgba(79,209,217,0.02)]">
              <Info size={14} className="text-[#4FD1D9] shrink-0" />
              <span>Diterima pada {getFormattedDate(selectedNotif.created_at)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setSelectedNotif(null)}
                className="w-full py-3.5 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 hover:shadow-lg hover:shadow-blue-900/10 text-white font-extrabold text-xs rounded-xl transition-all duration-300 shadow-sm tracking-wide uppercase"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
