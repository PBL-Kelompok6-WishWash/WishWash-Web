export interface PromoDTO {
  kode_promo: string;
  nama_promo: string;
  deskripsi: string;
  tipe_promo: string;
  nominal_potongan: number;
  minimal_order: number;
  maksimal_potongan: number;
  tgl_mulai: string;
  tgl_berakhir: string;
  status_promo: string;
  gambar_promo: string;
}

const BASE_URL = 'http://localhost:8080/api/v1/admin/promo';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const promoService = {
  getAll: async () => {
    const res = await fetch(BASE_URL, { method: "GET", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data promo");
    return result;
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "GET", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil detail promo");
    return result;
  },

  create: async (data: PromoDTO) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menyimpan promo");
    return result;
  },

  update: async (id: number, data: PromoDTO) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal memperbarui promo");
    return result;
  },

  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menghapus promo");
    return result;
  },
};
