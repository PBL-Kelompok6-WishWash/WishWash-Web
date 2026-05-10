// src/services/auth.ts

const BASE_URL = 'http://localhost:8080/api/v1';

export const loginAdmin = async (username: string, password: string) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        token: data.token,
        id_role: data.id_role,
        display_name: data.display_name,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.error || 'Login gagal',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Gagal terhubung ke server backend.',
    };
  }
};

export const logoutAdmin = () => {
  // Hapus token dari browser
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('id_role');
  window.location.href = '/auth'; // Arahkan kembali ke login
};