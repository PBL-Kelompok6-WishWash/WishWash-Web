"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [username, setUsername] = useState("Admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mengambil nama user
  useEffect(() => {
    const savedName = localStorage.getItem("remembered_username");
    if (savedName) {
      setUsername(savedName);
    }
  }, []);

  // Logika untuk menutup dropdown kalau user ngeklik di luar area kotak profil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("id_role");
    router.replace("/auth");
  };

  return (
    <header className="flex justify-between items-center mb-10 relative">
      <h2 className="text-4xl font-bold text-[#1e3a5f] leading-tight capitalize">
        Hi, {username}!
      </h2>
      
      {/* Wrapper Profil & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        
        {/* Tombol Profil */}
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 bg-white p-2 px-4 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors h-fit select-none"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FD1D9] bg-slate-100">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
              alt="Admin" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[#1e3a5f] capitalize">{username}</span>
          <ChevronDown 
            size={18} 
            className={`text-[#1e3a5f] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </div>

        {/* Kotak Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-[slideUpFade_0.2s_ease-out]">
            <div className="flex flex-col">
              <Link 
                href="/pengaturan" 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-[#1e3a5f] hover:bg-slate-50 transition-colors font-medium border-b border-slate-50"
              >
                <Settings size={18} className="text-[#4FD1D9]" />
                Pengaturan
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
    </header>
  );
}