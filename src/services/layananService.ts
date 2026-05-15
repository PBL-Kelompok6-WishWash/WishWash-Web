// src/services/layananService.ts
export interface PaketLayananDTO {
  nama_paket: string;
  durasi_jam: number;
  biaya_tambahan: number;
}

export interface LayananDTO {
  nama_layanan: string;
  gambar_layanan?: string;
  jenis_satuan: string;
  harga_per_satuan: number;
  referensi_status: string[];
  paket_layanan?: PaketLayananDTO[];
  status_layanan: string;
}

const BASE_URL = 'http://localhost:8080/api/v1/admin/layanan';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const layananService = {
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data layanan");
    return res.json();
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data layanan");
    return result;
  },

  create: async (data: LayananDTO) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menyimpan layanan");
    return result;
  },

  update: async (id: number, data: LayananDTO) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengupdate layanan");
    return result;
  },

  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menghapus layanan");
    return result;
  }
};
