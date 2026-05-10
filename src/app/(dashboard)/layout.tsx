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
    // Cek token dan role dari localStorage
    const token = localStorage.getItem("jwt_token");
    const roleId = localStorage.getItem("id_role");

    // Kalau tidak ada token ATAU role-nya bukan Admin (1), tendang ke Login!
    if (!token || roleId !== "1") {
      router.replace("/auth");
    } else {
      // Kalau aman, izinkan masuk
      setIsAuthenticated(true);
    }
  }, [router]);

  // Selama masih ngecek token (sekian milidetik), tampilkan layar putih agar UI dashboard tidak bocor duluan
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#42C6D4]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto">
        <Header />
        {children}
      </main>
    </div>
  );
}