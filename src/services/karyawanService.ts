// src/services/karyawanService.ts

const BASE_URL = "http://localhost:8080/api/v1/admin/karyawan";

// Helper untuk mengambil header + token
const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const karyawanService = {
  // Ambil semua data
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data karyawan");
    return res.json();
  },

  // Hapus data
  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus data karyawan");
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menambah karyawan");
    return result;
  },

  update: async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengupdate karyawan");
    return result;
  },

  // Ambil detail by ID (untuk halaman edit)
  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data");
    return result;
  },
};
