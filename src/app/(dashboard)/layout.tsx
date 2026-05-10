// src/app/(dashboard)/layout.tsx
import Sidebar from "../components/Sidebar"; // Sesuaikan path ini dengan posisi komponenmu

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar hanya ada di grup dashboard */}
      <Sidebar />
      
      {/* Konten dashboard dengan padding 10 (40px) */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}