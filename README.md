<p align="center">
  <img src="public/logo.png" alt="WishWash Logo" width="120" />
</p>

# 👑 WishWash Web Dashboard
**Next.js Admin Dashboard for WishWash Laundry Management System**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescript.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-docker-deployment)

Repositori ini berisi kode sumber untuk **Web Admin Dashboard** WishWash. Web ini dirancang khusus untuk mempermudah pemilik/pengelola laundry (Admin) dalam memantau operasional harian, melacak transaksi real-time, mengelola master data pengguna, serta menganalisis laporan omset bulanan.

---

## 🚀 Fitur Utama Web Dashboard

*   **Manajemen Transaksi Terpadu**: Pantau pesanan masuk secara real-time, perbarui status pembayaran, serta tinjau riwayat pelacakan pesanan secara visual (*interactive stepper*).
*   **Manajemen Master Data (CRUD)**: Kelola data pelanggan, kurir/karyawan, ragam layanan laundry, paket durasi, jenis parfum, dan metode pembayaran.
*   **Pemberitahuan & Notifikasi**: Menerima notifikasi langsung saat ada pesanan baru masuk dan fitur "Hapus Semua" untuk membersihkan riwayat pesan pemberitahuan.
*   **Analitik & Laporan Pendapatan**: Tampilan bagan statistik interaktif berbasis SVG untuk memantau omset bulanan, transaksi harian, hari puncak pemesanan, dan transaksi terlaris.
*   **Manajemen Promo**: Buat voucher diskon dengan batas minimal pemesanan dan potongan harga dinamis untuk dipasang pada aplikasi pelanggan.

---

## 📂 Struktur Folder Web

```text
WishWash-Web/
├── public/              # Aset statis (gambar, logo, ikon)
├── src/
│   ├── app/             # Routing Next.js App Router (Dashboard Pages & Layouts)
│   ├── components/      # Komponen UI modular (Sidebar, Header, Alert, Dialog)
│   ├── services/        # Service modul penghubung API ke Backend (Axios Client)
│   └── utils/           # Fungsi pembantu (format uang, helper gambar, formatter)
├── next.config.ts       # Konfigurasi Next.js Compiler
├── tsconfig.json        # Konfigurasi Aturan TypeScript
├── package.json         # Daftar dependensi & script Node.js
└── README.md            # Dokumentasi utama repositori Web
```

---

## 🛠️ Panduan Memulai (Quick Start)

### 1. Prasyarat Sistem
*   **Node.js** (Versi 18 ke atas)
*   **npm** atau **yarn**

### 2. Konfigurasi Environment (`.env.local`)
Buat berkas bernama `.env.local` di dalam folder root `WishWash-Web/` dan isi konfigurasinya:
```env
# Alamat server backend API Go (WishWash-Backend)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Instalasi Dependensi & Menjalankan Web Dev Server
Buka terminal di folder root web, lalu jalankan perintah:
```bash
# Menginstal modul npm yang dibutuhkan
npm install

# Menjalankan server dalam mode development
npm run dev
```
*Buka browser Anda dan akses halaman admin di `http://localhost:3000`.*

---

## 📦 Build untuk Production

Untuk melakukan build kompilasi siap rilis (produksi):
```bash
# Melakukan build kompilasi Next.js
npm run build

# Menjalankan server Next.js siap rilis
npm run start
```

---

## 🐳 Docker Deployment

Repositori ini juga mendukung deployment menggunakan Docker:

1.  **Build Docker Image**:
    ```bash
    docker build -t wishwash-web .
    ```
2.  **Run Docker Container**:
    ```bash
    docker run -p 3000:3000 wishwash-web
    ```

---

<div align="center">
  <b>PBL Kelompok 6 - WishWash Laundry</b><br>
  Teknologi Rekayasa Komputer, Politeknik Negeri Semarang
</div>
