"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const roleId = localStorage.getItem("id_role");

    if (!token || roleId !== "1") {
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#4FD1D9]"></div>
      </div>
    );
  }

  return (
    // Background utama dashboard dibuat agak abu-abu (#f8fafc) agar panel putihnya terlihat menonjol
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar Kiri */}
      <Sidebar />
      
      {/* Area Kanan (Header + Konten) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header nempel di atas tanpa padding */}
        <Header />
        
        {/* Konten Utama (Scrollable) */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
      </main>
    </div>
  );
}