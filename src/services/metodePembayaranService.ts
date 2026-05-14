const BASE_URL = 'http://localhost:8080/api/v1/admin/metode-pembayaran';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const metodePembayaranService = {
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data metode pembayaran");
    return result;
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil detail metode pembayaran");
    return result;
  },

  create: async (data: any) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menyimpan metode pembayaran");
    return result;
  },

  update: async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal memperbarui metode pembayaran");
    return result;
  },

  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal menghapus metode pembayaran");
    return result;
  }
};
