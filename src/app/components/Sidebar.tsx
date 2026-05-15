"use client";

import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ClipboardList, Database, Users,
  LogOut, ChevronDown, ChevronRight, Menu, X,
  Shirt, SprayCan, CreditCard, TicketPercent, UserCircle, Briefcase, BarChart3
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isManajemenOpen, setIsManajemenOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (['/layanan', '/parfum', '/metode-pembayaran', '/promo'].some(path => pathname.startsWith(path))) {
      setIsMasterDataOpen(true);
    }
    if (['/pelanggan', '/karyawan'].some(path => pathname.startsWith(path))) {
      setIsManajemenOpen(true);
    }
  }, [pathname]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const executeLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("id_role");
    localStorage.removeItem("nama_user");
    router.replace("/auth");
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Data Transaksi', icon: <ClipboardList size={20} />, path: '/datatransaksi' },
    { name: 'Laporan', icon: <BarChart3 size={20} />, path: '/laporan' },
    {
      name: 'Master Data',
      icon: <Database size={20} />,
      subItems: [
        { name: 'Layanan', path: '/layanan', icon: <Shirt size={16} /> },
        { name: 'Parfum', path: '/parfum', icon: <SprayCan size={16} /> },
        { name: 'Metode Pembayaran', path: '/metode-pembayaran', icon: <CreditCard size={16} /> },
        { name: 'Promo', path: '/promo', icon: <TicketPercent size={16} /> },
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white flex flex-col sticky top-0 h-screen border-r border-slate-200 transition-all duration-300 ease-in-out ${showLogoutConfirm ? 'z-[100]' : 'z-50'
      }`}>

      {/* 1. Header Sidebar */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden py-1">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <h1 className="text-xl font-black italic text-[#1e3a5f] tracking-tight pr-1 pt-0.5">Wish Wash</h1>
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
      <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto custom-scrollbar pt-6">

        {menuItems.map((item) => {
          if (item.subItems) {
            const isAnyChildActive = item.subItems.some(sub => pathname.startsWith(sub.path));
            const isOpen = item.name === 'Master Data' ? isMasterDataOpen : isManajemenOpen;
            const toggleOpen = () => {
              if (isCollapsed) setIsCollapsed(false);
              if (item.name === 'Master Data') setIsMasterDataOpen(!isMasterDataOpen);
              else setIsManajemenOpen(!isManajemenOpen);
            };

            return (
              <div key={item.name} className="flex flex-col mb-1">
                <button
                  onClick={toggleOpen}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${isAnyChildActive
                      ? 'bg-[#4FD1D9] text-white font-bold shadow-md shadow-[#4FD1D9]/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isAnyChildActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
                    {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className={`transition-transform duration-200 ${isAnyChildActive ? 'text-white' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  )}
                </button>

                {isOpen && !isCollapsed && (
                  <div className="flex flex-col gap-1 mt-1.5 ml-4 border-l-2 border-slate-100 pl-3">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.path);
                      return (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          // 💡 PERBAIKAN DI SINI: Kasih background halus & padding yang sedikit lebih lega
                          className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 ${isSubActive
                              ? 'bg-[#4FD1D9]/15 text-[#11848c] font-bold shadow-sm'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f] hover:translate-x-1'
                            }`}
                        >
                          {/* 💡 Warna icon ngikutin warna teks yang dipertajam */}
                          <div className={isSubActive ? 'text-[#11848c]' : 'text-slate-300'}>{sub.icon}</div>
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname.startsWith(item.path!);
          return (
            <Link
              key={item.name}
              href={item.path!}
              className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${isActive
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

      {/* 3. Tombol Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogoutClick}
          className={`flex items-center gap-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-[15px]">Logout</span>}
        </button>
      </div>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3a5f]/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[slideUpFade_0.3s_ease-out]">
            <div className="p-8 text-center">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} className="text-red-500 ml-1" />
              </div>
              <h3 className="text-xl font-black text-[#1e3a5f] mb-2">Konfirmasi Keluar</h3>
              <p className="text-slate-500 font-medium text-sm mb-8">
                Apakah Anda yakin ingin keluar? Sesi Anda akan berakhir sekarang.
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </aside>
  );
}