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

const handleResponse = async (res: Response, defaultError: string) => {
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("id_role");
    localStorage.removeItem("nama_user");
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
  }
  if (!res.ok) {
    let errorMsg = defaultError;
    try {
      const result = await res.json();
      errorMsg = result.error || defaultError;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
};

export const orderService = {
  // Ambil semua data order
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res, "Gagal mengambil data pesanan");
  },

  // Ambil detail by ID
  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res, "Gagal mengambil data pesanan");
  },

  // Ambil detail by Kode Order
  getByKode: async (kode: string) => {
    const res = await fetch(`${BASE_URL}/by-kode/${kode}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(res, "Gagal mengambil data pesanan");
  },

  // Update order (status, kuantitas, total_bayar, status_pembayaran, metode_bayar)
  update: async (id: number, data: any) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, "Gagal mengupdate pesanan");
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
    return handleResponse(res, "Gagal mengambil ringkasan pendapatan");
  }
};
