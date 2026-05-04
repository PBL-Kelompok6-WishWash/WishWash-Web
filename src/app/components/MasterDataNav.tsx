"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MasterDataNav() {
  const pathname = usePathname();

  // Variabel 'tabs' harus didefinisikan di sini agar bisa dibaca oleh .map()
  const tabs = [
    { name: 'Layanan', path: '/masterdata_layanan' },
    { name: 'Parfum', path: '/masterdata_parfum' },
    { name: 'Metode Pembayaran', path: '/masterdata_metodepembayaran' },
    { name: 'Manajemen Promo', path: '/masterdata_manajemenpromo' },
  ];

  return (
    <div className="flex w-full items-center gap-4">
      {tabs.map((tab) => {
        // Cek apakah halaman yang dibuka sekarang sama dengan path menu
        const isActive = pathname === tab.path;

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex-1 px-6 py-2.5 rounded-lg font-bold text-sm transition-all text-center border-2 ${
              isActive 
                ? 'bg-[#1e9a9f] border-[#1e9a9f] text-white shadow-md' // Aktif (Ijo)
                : 'bg-white border-[#4FD1D9] text-[#1e9a9f] hover:bg-slate-50' // Tidak Aktif
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}