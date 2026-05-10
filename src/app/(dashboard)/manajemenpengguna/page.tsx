import React from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from 'lucide-react';

export default function ManajemenPenggunaPage() {
  // Data dummy sesuai gambar desain
  const users = [
    { 
      id: 'UA001', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark', 
      role: 'Pelanggan', 
      nama: 'Mark Lee', 
      telp: '081234567890', 
      email: 'markeu@gmail.com' 
    },
    { 
      id: 'UA002', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ajeng', 
      role: 'Pelanggan', 
      nama: 'Ajeng Fatimah', 
      telp: '089127836488', 
      email: 'ajeng@gmail.com' 
    },
    { 
      id: 'UA003', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dadang', 
      role: 'Karyawan', 
      nama: 'Dadang Korneto', 
      telp: '085179487655', 
      email: 'dadang@gmail.com' 
    },
    { 
      id: 'UA004', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susi', 
      role: 'Pelanggan', 
      nama: 'Susi Cibaduyut', 
      telp: '081856377811', 
      email: 'susi@gmail.com' 
    },
  ];

  return (
    <div className="w-full">
      {/* Judul Halaman - Ukuran Besar Sesuai Desain */}
      <h2 className="text-4xl font-black text-[#1e3a5f] uppercase mb-10 tracking-wider">
        Manajemen Pengguna
      </h2>

      {/* Kartu Daftar Pengguna */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header di dalam Kartu */}
        <div className="p-6 flex justify-between items-center bg-white">
          <h3 className="text-2xl font-bold text-[#1e3a5f]">Daftar Pengguna</h3>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#123b6b] hover:bg-[#0c284a] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={18} />
              Tambah Pengguna Baru
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Pengguna..." 
                className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#4FD1D9] w-64 text-[#1e3a5f]"
              />
            </div>
          </div>
        </div>

        {/* Tabel Pengguna */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center text-[#1e3a5f]">
            <thead className="bg-[#e2e8f0] text-sm font-bold text-[#1e3a5f]">
              <tr>
                <th className="px-6 py-4 text-left flex items-center gap-1">
                  ID <span className="text-[10px] text-slate-400">▲</span>
                </th>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">No Telp</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index === users.length - 1 ? 'border-none' : ''}`}
                >
                  <td className="px-6 py-4 text-left font-medium text-slate-500">{user.id}</td>
                  <td className="px-6 py-4 flex justify-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                      <img src={user.foto} alt={user.nama} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1 rounded-lg font-bold text-xs inline-block w-28 border ${
                      user.role === 'Pelanggan' 
                        ? 'bg-[#fff9c4] text-[#fbc02d] border-[#fff176]' 
                        : 'bg-[#e3f2fd] text-[#1e88e5] border-[#bbdefb]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">{user.nama}</td>
                  <td className="px-6 py-4 text-blue-900">{user.telp}</td>
                  <td className="px-6 py-4 underline text-blue-800 cursor-pointer">{user.email}</td>
                  <td className="px-6 py-4">
                    <button className="text-slate-600 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 flex justify-end items-center gap-2 text-[#1e3a5f] bg-white border-t border-slate-200">
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronLeft size={18} /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 text-[#1e3a5f] font-bold text-xs">1</button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronRight size={18} /></button>
          <button className="p-1 text-slate-400 hover:text-[#1e3a5f] transition-colors"><ChevronsRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}