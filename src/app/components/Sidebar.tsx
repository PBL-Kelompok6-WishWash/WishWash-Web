"use client"; // Pindahkan direktif ini ke sini

import { 
  LayoutDashboard, ClipboardList, Database, Users, 
  MessageSquare, Settings 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Data Transaksi', icon: <ClipboardList size={20} />, path: '/datatransaksi' },
    { name: 'Master Data', icon: <Database size={20} />, path: '/masterdata_layanan' },
    { name: 'Manajemen Pengguna', icon: <Users size={20} />, path: '/manajemenpengguna' },
    { name: 'Pesan', icon: <MessageSquare size={20} />, path: '/pesan' },
    { name: 'Pengaturan', icon: <Settings size={20} />, path: '/pengaturan' },
  ];

  return (
    <aside className="w-64 bg-[#4FD1D9] text-[#1e3a5f] flex flex-col p-6 sticky top-0 h-screen shadow-lg">
      <div className="flex flex-col items-center mb-8 mt-10">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm overflow-hidden p-3">
          <Image 
            src="/logo.png" 
            alt="Logo WishWash" 
            width={100} 
            height={100} 
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-black italic text-[#1e3a5f]">Wish Wash</h1>
      </div>

<nav className="flex-1 flex flex-col justify-center space-y-3">
        {menuItems.map((item) => {
          // PERUBAHAN DI SINI
          // Jika path-nya adalah '/master-data' (atau apapun path utama Master Data-mu), 
          // kita cek apakah pathname saat ini MENGANDUNG kata 'masterdata'.
          // Untuk menu lain, tetap gunakan pencocokan persis (===).
          
          const isActive = 
            item.name === 'Master Data' 
              ? pathname.includes('/masterdata') 
              : pathname === item.path;

          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out transform active:scale-95 ${
                isActive 
                  ? 'border-2 border-white bg-white/30 text-white font-bold shadow-sm' 
                  : 'text-[#1e3a5f] hover:bg-white/20 hover:translate-x-1'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-[#1e3a5f]'}>
                {item.icon}
              </div>
              <span className="text-lg">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}