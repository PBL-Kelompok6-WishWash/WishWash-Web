"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Search, CheckCheck, ShoppingBag, CreditCard, Rocket, UserPlus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { notifikasiService, NotifikasiDTO } from '../../../services/notifikasiService';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<NotifikasiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

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
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
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
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id_notifikasi}
                onClick={() => {
                  if (!notif.is_read) {
                    handleMarkAsRead(notif.id_notifikasi);
                  }
                }}
                className={`p-5 flex gap-4 transition-all cursor-pointer relative group hover:bg-slate-50/80 ${
                  !notif.is_read ? 'bg-blue-50/5' : ''
                }`}
              >
                {/* Status Indicator Bar */}
                {!notif.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-500 rounded-r-md"></div>
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
    </div>
  );
}
