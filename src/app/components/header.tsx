"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, User, LogOut, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // 💡 Tambah usePathname

export default function Header() {
    const [username, setUsername] = useState("Admin");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname(); // 💡 Ambil path URL saat ini

    // Cek apakah user sedang berada di halaman /profile
    const isProfilePage = pathname.startsWith('/profile');

    useEffect(() => {
        const fetchUsername = () => {
            const savedName = localStorage.getItem("nama_user");
            if (savedName) {
                setUsername(savedName);
            }
        };

        // 1. Ambil nama saat pertama kali halaman dimuat
        fetchUsername();

        // 2. Pasang "telinga" untuk mendengarkan Custom Event bernama "profileUpdated"
        window.addEventListener("profileUpdated", fetchUsername);

        // 3. Bersihkan "telinga" saat komponen dihancurkan (best practice)
        return () => window.removeEventListener("profileUpdated", fetchUsername);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("id_role");
        router.replace("/auth");
    };

    return (
        <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-40 shrink-0">

            {/* Kiri: Teks Welcome */}
            <div>
                <p className="text-sm text-slate-500 font-medium mb-0.5">Welcome 👋</p>
                <h2 className="text-xl font-black text-[#1e3a5f] capitalize tracking-tight leading-none">
                    {username}
                </h2>
            </div>

            {/* Kanan: Notifikasi & Profil */}
            <div className="flex items-center gap-6">

                {/* Tombol Lonceng Notifikasi */}
                <button className="relative text-slate-400 hover:text-[#4FD1D9] transition-colors p-2">
                    <Bell size={22} />
                    <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>

                {/* Garis Pembatas Vertikal */}
                <div className="w-[1px] h-8 bg-slate-200"></div>

                {/* Wrapper Profil & Dropdown */}
                <div className="relative" ref={dropdownRef}>

                    {/* Tombol Profil */}
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                    >
                        {/* Teks Nama & Role */}
                        <div className="text-right hidden sm:block">
                            {/* 💡 Logika Teks Nama: Cyan jika Open, Hover, ATAU sedang di halaman Profile */}
                            <p className={`text-sm font-bold capitalize leading-none transition-colors duration-200 group-hover:text-[#4FD1D9] ${
                                isDropdownOpen || isProfilePage ? 'text-[#4FD1D9]' : 'text-[#1e3a5f]'
                            }`}>
                                {username}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Administrator</p>
                        </div>

                        {/* Foto Profil */}
                        {/* 💡 Logika Border Foto: Cyan jika Open, Hover, ATAU sedang di halaman Profile */}
                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors duration-200 bg-slate-50 group-hover:border-[#4FD1D9] ${
                            isDropdownOpen || isProfilePage ? 'border-[#4FD1D9]' : 'border-slate-100'
                        }`}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 💡 Logika Chevron: Cyan jika Open, Hover, ATAU sedang di halaman Profile */}
                        <ChevronDown
                            size={16}
                            className={`transition-all duration-200 group-hover:text-[#4FD1D9] ${
                                isDropdownOpen ? 'rotate-180' : ''
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
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors font-medium border-b border-slate-50 ${
                                        isProfilePage ? 'text-[#4FD1D9] bg-slate-50 font-bold' : 'text-[#1e3a5f]'
                                    }`}
                                >
                                    <User size={18} className={isProfilePage ? 'text-[#4FD1D9]' : 'text-slate-400'} />
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
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
        </header>
    );
}