"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardList, Database, Users, 
  LogOut, ChevronDown, ChevronRight,
  Droplets, Tag, CreditCard, Gift, UserCircle, Briefcase
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol dropdown terbuka/tertutup
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isManajemenOpen, setIsManajemenOpen] = useState(false);

  // Otomatis buka dropdown jika user sedang berada di dalam halamannya
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
      name: 'Manajemen Pengguna', 
      icon: <Users size={20} />, 
      subItems: [
        { name: 'Pelanggan', path: '/pelanggan', icon: <UserCircle size={16} /> },
        { name: 'Karyawan', path: '/karyawan', icon: <Briefcase size={16} /> },
      ]
    }
    // Menu Pengaturan sudah dihapus dari sini! 🧹
  ];

  return (
    <aside className="w-64 bg-[#4FD1D9] text-[#1e3a5f] flex flex-col p-6 sticky top-0 h-screen shadow-lg overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm overflow-hidden p-3">
          <Image src="/logo.png" alt="Logo WishWash" width={100} height={100} className="object-contain" />
        </div>
        <h1 className="text-2xl font-black italic text-[#1e3a5f]">Wish Wash</h1>
      </div>

      <nav className="flex-1 flex flex-col space-y-2">
        {menuItems.map((item) => {
          
          // --- LOGIKA KHUSUS MENU DROPDOWN ---
          if (item.subItems) {
            const isAnyChildActive = item.subItems.some(sub => pathname.startsWith(sub.path));
            
            // Tentukan state mana yang dipakai berdasarkan nama item
            const isOpen = item.name === 'Master Data' ? isMasterDataOpen : isManajemenOpen;
            const toggleOpen = () => {
              if (item.name === 'Master Data') setIsMasterDataOpen(!isMasterDataOpen);
              else setIsManajemenOpen(!isManajemenOpen);
            };

            return (
              <div key={item.name} className="flex flex-col">
                <button 
                  onClick={toggleOpen}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isAnyChildActive ? 'bg-white/30 text-white font-bold' : 'text-[#1e3a5f] hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={isAnyChildActive ? 'text-white' : 'text-[#1e3a5f]'}>{item.icon}</div>
                    <span className="text-lg">{item.name}</span>
                  </div>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {/* Sub Menu Item */}
                {isOpen && (
                  <div className="flex flex-col gap-1 mt-1 ml-4 border-l-2 border-white/40 pl-2 overflow-hidden">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname.startsWith(sub.path);
                      return (
                        <Link 
                          key={sub.name} 
                          href={sub.path}
                          className={`flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all ${
                            isSubActive 
                              ? 'bg-white text-[#4FD1D9] font-extrabold shadow-sm' 
                              : 'text-[#1e3a5f] hover:bg-white/40 font-medium'
                          }`}
                        >
                          {sub.icon}
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
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 transform active:scale-95 ${
                isActive
                  ? 'border-2 border-white bg-white/30 text-white font-bold shadow-sm'
                  : 'text-[#1e3a5f] hover:bg-white/20 hover:translate-x-1'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-[#1e3a5f]'}>{item.icon}</div>
              <span className="text-lg">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-8 flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold"
      >
        <LogOut size={20} />
        <span className="text-lg">Logout</span>
      </button>

      {/* CSS untuk menyembunyikan scrollbar agar rapi tapi tetap bisa di-scroll */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}