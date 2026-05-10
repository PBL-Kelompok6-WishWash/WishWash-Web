// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Cek token dan role dari localStorage (brankas browser)
    const token = localStorage.getItem("jwt_token");
    const roleId = localStorage.getItem("id_role");

    // Kalau token ada dan dia adalah Admin (role 1), arahkan ke dashboard
    if (token && roleId === "1") {
      router.replace("/dashboard");
    } else {
      // Kalau belum login atau tiketnya tidak valid, arahkan ke halaman login
      router.replace("/auth");
    }
  }, [router]);

  // Tampilkan loading spinner animasi muter-muter saat proses pengecekan berlangsung (biasanya cuma sekian milidetik)
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#42C6D4]"></div>
    </div>
  );
}