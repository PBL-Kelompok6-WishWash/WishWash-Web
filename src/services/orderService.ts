// src/services/orderService.ts

const BASE_URL = "http://localhost:8080/api/v1/order";

// Helper untuk mengambil header + token
const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const orderService = {
  // Ambil semua data order
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data pesanan");
    return res.json();
  },

  // Ambil detail by ID
  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengambil data pesanan");
    return result;
  },

  // Update order (status, kuantitas, total_bayar, status_pembayaran, metode_bayar)
  update: async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal mengupdate pesanan");
    return result;
  },

  // Ambil ringkasan pendapatan & statistik
  getRevenueSummary: async (month?: number, year?: number) => {
    let url = `${BASE_URL}/revenue`;
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil ringkasan pendapatan");
    return res.json();
  }
};
