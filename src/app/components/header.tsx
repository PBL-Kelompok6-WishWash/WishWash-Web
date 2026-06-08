"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, User, LogOut, Bell, X, Menu, ShoppingBag, CreditCard, Rocket, UserPlus, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { notifikasiService, NotifikasiDTO } from '../../services/notifikasiService';

export default function Header() {
    const [username, setUsername] = useState("Admin");
    const [avatarSeed, setAvatarSeed] = useState("Admin");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 💡 State untuk Modal Konfirmasi Logout
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // 🔔 State untuk Notifikasi
    const [notifications, setNotifications] = useState<NotifikasiDTO[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const isProfilePage = pathname.startsWith('/profile');
    const isNotifPage = pathname.startsWith('/notifikasi');

    const loadNotifications = async () => {
        try {
            const res = await notifikasiService.getAll();
            if (res.success) {
                setNotifications(res.data || []);
            }
        } catch (error) {
            console.error("Gagal memuat notifikasi:", error);
        }
    };

    useEffect(() => {
        const fetchUsername = () => {
            const savedName = localStorage.getItem("nama_user");
            if (savedName) {
                setUsername(savedName);
            }
            const savedSeed = localStorage.getItem("avatar_seed") || savedName || "Admin";
            setAvatarSeed(savedSeed);
        };

        fetchUsername();
        loadNotifications();

        window.addEventListener("profileUpdated", fetchUsername);
        
        const handleShowLogout = () => setShowLogoutConfirm(true);
        window.addEventListener("triggerLogoutConfirm", handleShowLogout);
        
        // Polling notifikasi setiap 20 detik
        const interval = setInterval(loadNotifications, 20000);

        // Clicks outside handler
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("profileUpdated", fetchUsername);
            window.removeEventListener("triggerLogoutConfirm", handleShowLogout);
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 💡 Fungsi eksekusi logout asli
    const executeLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("id_role");
        localStorage.removeItem("nama_user");
        router.replace("/auth");
    };

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

    const getNotifIcon = (judul: string) => {
        const title = judul.toLowerCase();
        if (title.includes('pesanan baru') || title.includes('masuk')) {
            return (
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <ShoppingBag size={18} />
                </div>
            );
        }
        if (title.includes('pembayaran') || title.includes('bayar')) {
            return (
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                    <CreditCard size={18} />
                </div>
            );
        }
        if (title.includes('selesai')) {
            return (
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                    <Rocket size={18} />
                </div>
            );
        }
        if (title.includes('pelanggan baru') || title.includes('pelanggan')) {
            return (
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                    <UserPlus size={18} />
                </div>
            );
        }
        return (
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <Bell size={18} />
            </div>
        );
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <header className={`h-[72px] bg-white border-b border-slate-200 px-4 sm:px-8 flex justify-between items-center sticky top-0 shrink-0 transition-all ${showLogoutConfirm ? 'z-[100]' : 'z-45'
            }`}>
            {/* Kiri: Teks Welcome & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.dispatchEvent(new Event('toggleSidebarMobile'))}
                    className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-[#4FD1D9] transition-all"
                >
                    <Menu size={22} />
                </button>
                <div>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-medium mb-0.5 leading-tight">Welcome 👋</p>
                    <h2 className="text-base sm:text-xl font-black text-[#1e3a5f] capitalize tracking-tight leading-none">
                        {username}
                    </h2>
                </div>
            </div>

            {/* Kanan: Notifikasi & Profil */}
            <div className="flex items-center gap-6">

                {/* Tombol Lonceng Notifikasi & Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative transition-colors p-2 ${
                            isNotifPage ? 'text-[#4FD1D9]' : 'text-slate-400 hover:text-[#4FD1D9]'
                        }`}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown Notifikasi */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-[slideUpFade_0.2s_ease-out]">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-[#1e3a5f] text-sm sm:text-base">Notifikasi</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-[11px] text-slate-400 font-medium">{unreadCount} belum dibaca</p>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs font-bold text-[#4FD1D9] hover:text-[#3dbec5] transition-colors flex items-center gap-1"
                                    >
                                        <CheckCheck size={14} />
                                        Tandai semua dibaca
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        <Bell className="mx-auto mb-2 text-slate-300" size={32} />
                                        Tidak ada notifikasi baru
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div 
                                            key={notif.id_notifikasi}
                                            onClick={() => {
                                                if (!notif.is_read) {
                                                    handleMarkAsRead(notif.id_notifikasi);
                                                }
                                            }}
                                            className={`p-4 flex gap-3 cursor-pointer transition-colors relative hover:bg-slate-50/80 ${
                                                !notif.is_read ? 'bg-blue-50/5' : ''
                                            }`}
                                        >
                                            {getNotifIcon(notif.judul)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-1">
                                                    <p className={`text-xs sm:text-sm text-[#1e3a5f] truncate ${
                                                        !notif.is_read ? 'font-bold' : 'font-medium'
                                                    }`}>
                                                        {notif.judul}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">
                                                    {notif.pesan}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                    {getRelativeTime(notif.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
                                <Link 
                                    href="/notifikasi"
                                    onClick={() => setIsNotifOpen(false)}
                                    className="text-xs font-bold text-[#4FD1D9] hover:text-[#3dbec5] transition-colors block w-full py-1"
                                >
                                    Lihat Semua Notifikasi
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Garis Pembatas Vertikal */}
                <div className="w-[1px] h-8 bg-slate-200"></div>

                {/* Wrapper Profil & Dropdown */}
                <div className="relative" ref={dropdownRef}>

                    {/* Tombol Profil */}
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className={`text-sm font-bold capitalize leading-none transition-colors duration-200 group-hover:text-[#4FD1D9] ${isDropdownOpen || isProfilePage ? 'text-[#4FD1D9]' : 'text-[#1e3a5f]'
                                }`}>
                                {username}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Administrator</p>
                        </div>

                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors duration-200 bg-slate-50 group-hover:border-[#4FD1D9] ${isDropdownOpen || isProfilePage ? 'border-[#4FD1D9]' : 'border-slate-100'
                            }`}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <ChevronDown
                            size={16}
                            className={`transition-all duration-200 group-hover:text-[#4FD1D9] ${isDropdownOpen ? 'rotate-180' : ''
                                } ${isDropdownOpen || isProfilePage ? 'text-[#4FD1D9]' : 'text-slate-400'}`}
                        />
                    </div>

                    {/* Kotak Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-[slideUpFade_0.2s_ease-out]">
                            <div className="flex flex-col">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors font-medium border-b border-slate-50 ${isProfilePage ? 'text-[#4FD1D9] bg-slate-50 font-bold' : 'text-[#1e3a5f]'
                                        }`}
                                >
                                    <User size={18} className={isProfilePage ? 'text-[#4FD1D9]' : 'text-slate-400'} />
                                    Profile
                                </Link>
                                <button
                                    // 💡 Pemicu modal konfirmasi
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setShowLogoutConfirm(true);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium text-left w-full"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 💡 MODAL KONFIRMASI LOGOUT */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1e3a5f]/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[slideUpFade_0.3s_ease-out]">
                        <div className="p-8 text-center">
                            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut size={32} className="text-red-500 ml-1" />
                            </div>
                            <h3 className="text-xl font-black text-[#1e3a5f] mb-2">Konfirmasi Keluar</h3>
                            <p className="text-slate-500 font-medium text-sm mb-8 px-2">
                                Apakah Anda yakin ingin mengakhiri sesi ini? Anda perlu login kembali untuk mengakses sistem.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executeLogout}
                                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                                >
                                    Ya, Keluar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}