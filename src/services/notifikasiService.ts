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
    try {
      const res = await fetch(BASE_URL, { method: "GET", headers: getAuthHeaders() });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, data: [] };
      }
      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      console.error("Error in getAll notifications:", error);
      return { success: false, data: [] };
    }
  },

  markAsRead: async (id: number): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`${BASE_URL}/${id}/read`, { method: "PUT", headers: getAuthHeaders() });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false };
      }
      return { success: true };
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return { success: false };
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`${BASE_URL}/read-all`, { method: "PUT", headers: getAuthHeaders() });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false };
      }
      return { success: true };
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return { success: false };
    }
  },
};
