export interface NotifikasiDTO {
  id_notifikasi: number;
  id_user: number;
  judul: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
}

const BASE_URL = 'http://localhost:8080/api/v1/admin/notifikasi';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const notifikasiService = {
  getAll: async (): Promise<{ success: boolean; data: NotifikasiDTO[] }> => {
    const res = await fetch(BASE_URL, { method: "GET", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data notifikasi");
    return result;
  },

  markAsRead: async (id: number): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/${id}/read`, { method: "PUT", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal memperbarui status notifikasi");
    return result;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/read-all`, { method: "PUT", headers: getAuthHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal memperbarui semua status notifikasi");
    return result;
  },
};
