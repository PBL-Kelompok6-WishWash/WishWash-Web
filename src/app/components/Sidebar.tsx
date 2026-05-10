"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardList, Database, Users, 
  LogOut, ChevronDown, ChevronRight, Menu,
  Droplets, Tag, CreditCard, Gift, UserCircle, Briefcase
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk dropdown
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isManajemenOpen, setIsManajemenOpen] = useState(false);
  
  // State untuk Collapse (menyembunyikan) Sidebar - Nanti bisa kita hubungkan ke Global State kalau mau
  const [isCollapsed, setIsCollapsed] = useState(false); 

  useEffect(() => {
    if (['/layanan', '/parfum', '/metode_bayar', '/promo'].some(path => pathname.startsWith(path))) {
      setIsMasterDataOpen(true);
    }
    if (['/pelanggan', '/karyawan'].some(path => pathname.startsWith(path))) {
      setIsManajemenOpen(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("id_role");
    router.replace("/auth");
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Data Transaksi', icon: <ClipboardList size={20} />, path: '/datatransaksi' },
    { 
      name: 'Master Data', 
      icon: <Database size={20} />, 
      subItems: [
        { name: 'Layanan', path: '/layanan', icon: <Droplets size={16} /> },
        { name: 'Parfum', path: '/parfum', icon: <Tag size={16} /> },
        { name: 'Pembayaran', path: '/metode_bayar', icon: <CreditCard size={16} /> },
        { name: 'Promo', path: '/promo', icon: <Gift size={16} /> },
      ]
    },
    { 
      name: 'Manaj. Pengguna', 
      icon: <Users size={20} />, 
      subItems: [
        { name: 'Pelanggan', path: '/pelanggan', icon: <UserCircle size={16} /> },
        { name: 'Karyawan', path: '/karyawan', icon: <Briefcase size={16} /> },
      ]
    }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white flex flex-col sticky top-0 h-screen border-r border-slate-200 transition-all duration-300 ease-in-out z-50`}>
      
      {/* 1. Header Sidebar (Logo & Toggle) */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <h1 className="text-xl font-black italic text-[#1e3a5f] tracking-tight truncate">Wish Wash</h1>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-slate-400 hover:text-[#4FD1D9] transition-colors p-1 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 2. Menu Navigasi */}
      <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto custom-scrollbar">
        {/* Teks "SYSTEM" kecil (Opsional, seperti di referensi) */}
        {!isCollapsed && <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 mt-2 px-2">Menu Utama</p>}

        {menuItems.map((item) => {
          
          // --- LOGIKA DROPDOWN ---
          if (item.subItems) {
            const isAnyChildActive = item.subItems.some(sub => pathname.startsWith(sub.path));
            const isOpen = item.name === 'Master Data' ? isMasterDataOpen : isManajemenOpen;
            const toggleOpen = () => {
              if (isCollapsed) setIsCollapsed(false); // Buka sidebar dulu kalau lagi ketutup
              if (item.name === 'Master Data') setIsMasterDataOpen(!isMasterDataOpen);
              else setIsManajemenOpen(!isManajemenOpen);
            };

            return (
              <div key={item.name} className="flex flex-col mb-1">
                <button 
                  onClick={toggleOpen}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isAnyChildActive 
                      ? 'bg-[#4FD1D9]/10 text-[#2dbbc5] font-bold' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isAnyChildActive ? 'text-[#2dbbc5]' : 'text-slate-400'}>{item.icon}</div>
                    {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className={`transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  )}
                </button>

                {/* Sub Menu */}
                {isOpen && !isCollapsed && (
                  <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-slate-100 pl-3">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.path);
                      return (
                        <Link 
                          key={sub.name} 
                          href={sub.path}
                          className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-all ${
                            isSubActive 
                              ? 'text-[#2dbbc5] font-bold bg-[#4FD1D9]/5' 
                              : 'text-slate-500 hover:text-[#1e3a5f] hover:translate-x-1'
                          }`}
                        >
                          <div className={isSubActive ? 'text-[#2dbbc5]' : 'text-slate-300'}>{sub.icon}</div>
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // --- LOGIKA MENU BIASA ---
          const isActive = pathname.startsWith(item.path!);
          return (
            <Link
              key={item.name}
              href={item.path!}
              className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-[#4FD1D9] text-white font-bold shadow-md shadow-[#4FD1D9]/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f]'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
              {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. Tombol Logout di Bawah */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-[15px]">Logout</span>}
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}