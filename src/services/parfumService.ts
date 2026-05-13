export interface ParfumDTO {
  nama_parfum: string;
  keterangan: string;
}

const BASE_URL = 'http://localhost:8080/api/v1/admin/parfum';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const parfumService = {
  getAll: async () => {
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  getById: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  create: async (data: ParfumDTO) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  update: async (id: number, data: ParfumDTO) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  },

  delete: async (id: number) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw result;
    return result;
  }
};
