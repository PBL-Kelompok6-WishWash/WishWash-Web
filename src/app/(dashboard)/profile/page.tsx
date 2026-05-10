"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, Key, X, Check, Pencil, AlertCircle } from 'lucide-react'; // 💡 Tambah icon AlertCircle

export default function ProfilePage() {
  const [displayData, setDisplayData] = useState({
    namaAdmin: "Loading...",
  });

  const [formData, setFormData] = useState({
    username: "Loading...",
    namaAdmin: "Loading...",
    email: "Loading...",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordCard, setShowPasswordCard] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 💡 [STATE UI BARU] Untuk Notifikasi Elegan
  const [passwordError, setPasswordError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  
  const avatarTemplates = ["Admin", "Felix", "Aneka", "Mimi", "Jack", "Oliver", "Jasper", "Bella", "Lucky"];
  const [avatarIndex, setAvatarIndex] = useState(0);

  useEffect(() => {
    const savedName = localStorage.getItem("nama_user") || "Admin WishWash";
    const savedUsername = localStorage.getItem("remembered_username") || "admin_utama";
    
    setDisplayData({ namaAdmin: savedName });
    
    setFormData({
      username: savedUsername,
      namaAdmin: savedName,
      email: `${savedUsername.toLowerCase()}@wishwash.com`,
    });
  }, []);

  const handleSwapAvatar = () => {
    setAvatarIndex((prev) => (prev + 1) % avatarTemplates.length);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // 💡 [FUNGSI HELPER] Memunculkan Toast sukses (hijau) 3 detik
  const showSuccessToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  // 💡 [FUNGSI HELPER] Memunculkan Error password (merah) 3 detik
  const showPasswordError = (message: string) => {
    setPasswordError(message);
    setTimeout(() => {
      setPasswordError("");
    }, 3000);
  };

  const handleUpdatePassword = async () => {
    // Validasi awal (Pakai showPasswordError bukan alert)
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showPasswordError("Harap isi semua kolom password!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showPasswordError("Password Baru dan Konfirmasi tidak cocok!");
      return;
    }

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch("http://localhost:8080/api/v1/protected/password/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showPasswordError(data.error || "Password saat ini salah!");
      } else {
        // 💡 Sukses! Munculkan Toast Hijau, reset form, tutup modal
        showSuccessToast("Password berhasil diperbarui!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordCard(false);
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      showPasswordError("Gagal terhubung ke server.");
    }
  };

  const toggleEditMode = async () => {
    if (isEditing) {
      // 💡 1. Cek apakah benar-benar ada perubahan data
      const isChanged = formData.namaAdmin !== displayData.namaAdmin; 
      // (Bisa kamu tambahkan pengecekan username/email di sini jika diperlukan)

      // 💡 2. Kalau gak ada yang diubah, langsung tutup mode edit & hentikan fungsi
      if (!isChanged) {
        setIsEditing(false);
        return;
      }

      // --- Sisa kodemu di bawah ini tetap sama ---
      setDisplayData({ namaAdmin: formData.namaAdmin });
      localStorage.setItem("nama_user", formData.namaAdmin);
      
      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch("http://localhost:8080/api/v1/protected/profile/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            nama: formData.namaAdmin,
          })
        });
        
        if (!response.ok) {
          console.error("Gagal menyimpan ke Database");
        } else {
          window.dispatchEvent(new Event("profileUpdated"));
          showSuccessToast("Profil berhasil disimpan!");
        }
      } catch (error) {
        console.error("Terjadi kesalahan koneksi:", error);
      }
      
      window.dispatchEvent(new Event("storage"));
    }
    
    setIsEditing(!isEditing); 
  };

  return (
    <div className="w-full relative">

      {/* 💡 TOAST NOTIFICATION (Muncul di pojok kanan bawah header) */}
      {toastMsg && (
        <div className="fixed top-[90px] right-8 z-50 bg-emerald-500 text-white px-6 py-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] font-bold flex items-center gap-3 transition-all duration-300 translate-y-0 opacity-100">
          <div className="bg-white/20 p-1 rounded-full"><Check size={16} /></div>
          {toastMsg}
        </div>
      )}

      <h2 className="text-3xl font-black text-[#1e3a5f] uppercase mb-8 tracking-wider text-center">
        PROFILE
      </h2>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-4 border-[#4FD1D9] overflow-hidden shadow-lg bg-slate-50 transition-all duration-300">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarTemplates[avatarIndex]}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {isEditing && (
              <button 
                onClick={handleSwapAvatar}
                className="absolute bottom-1 right-1 bg-[#1e3a5f] p-2.5 rounded-full text-white border-4 border-white shadow-md hover:bg-[#4FD1D9] hover:rotate-180 transition-all duration-500 z-10"
              >
                <RefreshCw size={18} />
              </button>
            )}
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-2xl font-black text-[#1e3a5f] capitalize">{displayData.namaAdmin}</h3>
            <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Administrator</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 focus:outline-none ${isEditing ? 'border-slate-200 focus:border-[#4FD1D9] text-[#1e3a5f] bg-white' : 'border-transparent bg-slate-50 text-slate-600'}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-200 focus:outline-none ${isEditing ? 'border-slate-200 focus:border-[#4FD1D9] text-[#1e3a5f] bg-white' : 'border-transparent bg-slate-50 text-slate-600'}`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Admin</label>
              <input
                type="text"
                name="namaAdmin"
                value={formData.namaAdmin}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 rounded-xl border-2 font-bold text-sm capitalize transition-all duration-200 focus:outline-none ${isEditing ? 'border-slate-200 focus:border-[#4FD1D9] text-[#1e3a5f] bg-white' : 'border-transparent bg-slate-50 text-slate-600'}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <button 
                onClick={() => setShowPasswordCard(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
              >
                <Key size={16} /> Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 ${isEditing ? 'bg-[#4FD1D9] hover:bg-[#3bb8c0] text-white' : 'bg-slate-200 hover:bg-slate-300 text-[#1e3a5f]'}`}
          >
            {isEditing ? <Check size={18} /> : <Pencil size={16} />}
            {isEditing ? 'Simpan Perubahan' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* MODAL GANTI PASSWORD */}
      {showPasswordCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3a5f]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <div className="bg-[#1e3a5f] p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg"><Key size={18} /></div>
                <h3 className="text-lg font-bold">Ganti Password</h3>
              </div>
              <button 
                onClick={() => {
                  setShowPasswordCard(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" }); 
                  setPasswordError(""); // Bersihkan error jika diclose
                }} 
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* 💡 PESAN ERROR MUNCUL DI SINI (Di atas Password Sekarang) */}
              {passwordError && (
                <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} />
                  {passwordError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Password Sekarang</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan password lama" 
                  className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none text-[#1e3a5f] text-sm font-medium ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-[#4FD1D9]'}`} 
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Password Baru</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan password baru" 
                  className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none text-[#1e3a5f] text-sm font-medium ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-[#4FD1D9]'}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Ulangi password baru" 
                  className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none text-[#1e3a5f] text-sm font-medium ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-[#4FD1D9]'}`}
                />
              </div>
              
              <button 
                onClick={handleUpdatePassword} 
                className="w-full mt-4 bg-[#4FD1D9] hover:bg-[#3bb8c0] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
              >
                Update Password
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}