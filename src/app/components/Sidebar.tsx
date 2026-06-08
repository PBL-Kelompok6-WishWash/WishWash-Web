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
import { motion } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isManajemenOpen, setIsManajemenOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);



  useEffect(() => {
    if (['/layanan', '/parfum', '/metode-pembayaran', '/promo'].some(path => pathname.startsWith(path))) {
      setIsMasterDataOpen(true);
    }
    if (['/pelanggan', '/karyawan'].some(path => pathname.startsWith(path))) {
      setIsManajemenOpen(true);
    }
    // Close mobile sidebar on route change
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    window.addEventListener('toggleSidebarMobile', handleToggle);
    return () => window.removeEventListener('toggleSidebarMobile', handleToggle);
  }, []);

  const handleLogoutClick = () => {
    window.dispatchEvent(new Event("triggerLogoutConfirm"));
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
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 flex flex-col h-screen border-r border-slate-200 bg-white
        transition-all duration-300 ease-in-out
        z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-64 shrink-0
      `}>

        {/* 1. Header Sidebar */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-200 shrink-0">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3 overflow-hidden py-1">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              <h1 className="text-xl font-black italic text-[#1e3a5f] tracking-tight pr-1 pt-0.5">Wish Wash</h1>
            </div>
          )}
          
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:block text-slate-400 hover:text-[#4FD1D9] transition-colors p-1 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            <Menu size={24} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-[#4FD1D9] transition-colors p-1"
          >
            <X size={24} />
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
                  className={`relative flex items-center justify-between p-3 rounded-xl cursor-pointer overflow-hidden transition-colors duration-300 ${isAnyChildActive
                      ? 'text-white font-bold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f]'
                    }`}
                >
                  {isAnyChildActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-[#4FD1D9] rounded-xl shadow-md shadow-[#4FD1D9]/20 z-0 pointer-events-none"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={isAnyChildActive ? 'text-white' : 'text-slate-400'}>{item.icon}</div>
                    {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className={`transition-transform duration-200 relative z-10 ${isAnyChildActive ? 'text-white' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`}>
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
                          className={`relative flex items-center gap-3 p-2.5 rounded-lg text-sm overflow-hidden transition-all duration-250 ${isSubActive
                              ? 'text-[#11848c] font-bold shadow-sm'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f] hover:translate-x-1'
                            }`}
                        >
                          {isSubActive && (
                            <motion.div
                              layoutId="sub-active-pill"
                              className="absolute inset-0 bg-[#4FD1D9]/15 rounded-lg z-0 pointer-events-none"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <div className={`relative z-10 transition-colors duration-300 ${isSubActive ? 'text-[#11848c]' : 'text-slate-300'}`}>{sub.icon}</div>
                          <span className="relative z-10">{sub.name}</span>
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
              className={`relative flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer overflow-hidden transition-colors duration-300 ${isActive
                  ? 'text-white font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#1e3a5f]'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#4FD1D9] rounded-xl shadow-md shadow-[#4FD1D9]/20 z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}>{item.icon}</div>
              {!isCollapsed && <span className="relative z-10 text-[15px] transition-colors duration-300">{item.name}</span>}
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </aside>
  </>
  );
}