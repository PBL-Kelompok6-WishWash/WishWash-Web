<p align="center">
  <img src="public/logo.png" alt="WishWash Logo" width="120" style="background: white; border-radius: 24px; padding: 10px;" />
</p>

<h3 align="center">WishWash Web Admin Dashboard</h3>
<p align="center">Next.js Admin Dashboard for WishWash Laundry Management System</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="#-docker-deployment"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" /></a>
</p>

---

## 📋 Deskripsi

Repositori ini berisi kode sumber **Web Admin Dashboard** WishWash, sebuah antarmuka web yang dirancang untuk pemilik dan pengelola bisnis laundry (Admin). Dashboard ini memungkinkan admin untuk memantau operasional harian, mengelola seluruh data master pengguna dan layanan, melacak transaksi pesanan secara real-time, serta menganalisis laporan omset dan tren pendapatan bulanan melalui visualisasi grafik interaktif.

---

## 🚀 Fitur Utama

*   **Dashboard Ringkasan** — Ringkasan statistik jumlah pesanan, pelanggan, karyawan, dan omset pendapatan dalam satu tampilan.
*   **Manajemen Transaksi** — Pantau pesanan masuk secara real-time, tinjau timeline status pesanan (*interactive stepper*), serta perbarui status pembayaran.
*   **Manajemen Master Data (CRUD)** — Kelola data pelanggan, kurir/karyawan, ragam layanan laundry, paket durasi, jenis parfum, dan referensi status layanan secara dinamis.
*   **Analitik & Laporan Pendapatan** — Bagan statistik interaktif berbasis SVG (*custom-built*) untuk memantau omset bulanan, rata-rata pendapatan harian, dan hari puncak pemesanan.
*   **Pusat Notifikasi** — Menerima pemberitahuan langsung saat ada pesanan baru, dengan fitur "Tandai Semua Dibaca" dan "Hapus Semua".
*   **Manajemen Promo** — Buat voucher diskon dengan batas minimal pemesanan, persentase potongan, dan masa berlaku.
*   **Manajemen Karyawan** — Kelola profil kurir/operator lengkap dengan data plat nomor kendaraan, jenis kendaraan, dan status keaktifan.

---

## 📂 Struktur Folder

```text
WishWash-Web/
├── public/              # Aset statis (logo, animasi Lottie, ikon)
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Halaman autentikasi (Login)
│   │   ├── (dashboard)/ # Halaman-halaman dashboard admin
│   │   │   ├── dashboard/         # Halaman ringkasan utama
│   │   │   ├── datatransaksi/     # Manajemen transaksi & detail pesanan
│   │   │   ├── laporan/           # Laporan & analitik pendapatan
│   │   │   ├── notifikasi/        # Pusat pemberitahuan
│   │   │   ├── (masterdata)/      # CRUD layanan, paket, parfum
│   │   │   └── (manajemenpengguna)/ # CRUD pelanggan & karyawan
│   │   ├── globals.css  # Styling global & tema warna aplikasi
│   │   └── layout.tsx   # Root layout dengan Sidebar & Header
│   ├── components/      # Komponen UI modular (Sidebar, Header, Dialog, Alert)
│   ├── services/        # Service layer penghubung API ke Backend (fetch client)
│   └── utils/           # Fungsi pembantu (format mata uang, helper gambar)
├── next.config.ts       # Konfigurasi Next.js (image domains, dsb.)
├── tsconfig.json        # Konfigurasi aturan TypeScript
├── Dockerfile           # Konfigurasi containerisasi Docker
├── package.json         # Daftar dependensi & script Node.js
└── README.md            # Dokumentasi repositori ini
```

---

## 🛠️ Panduan Memulai (Quick Start)

### 1. Prasyarat Sistem
| Software | Versi Minimum |
| :--- | :--- |
| [Node.js](https://nodejs.org/) | v18+ |
| npm | v9+ (bawaan Node.js) |

### 2. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` di folder root `WishWash-Web/`:
```env
# Alamat server backend API Go (WishWash-Backend)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Instalasi Dependensi & Menjalankan Dev Server
```bash
# Menginstal seluruh modul npm
npm install

# Menjalankan server dalam mode development
npm run dev
```
Buka browser dan akses halaman admin di **`http://localhost:3000`**.

---

## 📦 Build untuk Production

```bash
# Kompilasi build produksi
npm run build

# Menjalankan server produksi
npm run start
```

---

## 🐳 Docker Deployment

```bash
# Build Docker Image
docker build -t wishwash-web .

# Run Docker Container
docker run -p 3000:3000 wishwash-web
```

---

## 📚 Dependensi Utama

| Package | Fungsi |
| :--- | :--- |
| `next` v16 | Framework React full-stack dengan App Router |
| `react` v19 | Library UI rendering komponen |
| `tailwindcss` v4 | Utility-first CSS framework untuk styling |
| `framer-motion` | Animasi transisi halaman & komponen |
| `lucide-react` | Koleksi ikon SVG modern |
| `lottie-react` | Render animasi Lottie JSON |
| `@dnd-kit` | Drag-and-drop untuk pengurutan data interaktif |

---

## 🔗 Repositori Terkait

| Repositori | Deskripsi |
| :--- | :--- |
| [WishWash-Backend](https://github.com/PBL-Kelompok6-WishWash/WishWash-Backend) | Backend API Server (Go / Gin / GORM) |
| [WishWash-Mobile](https://github.com/PBL-Kelompok6-WishWash/WishWash-Mobile) | Aplikasi Mobile Pelanggan & Karyawan (Flutter) |

---

## 👥 Tim Pengembang

| Nama | NIM | Peran |
| :--- | :--- | :--- |
| Muhammad Rafa Enrico | 4.33.24.2.15 | Full-Stack Developer |
| Annisa Naelil Izati | 4.33.24.2.03 | Full-Stack Developer |
| Devi Ibnu Nabila | 4.33.24.2.06 | Full-Stack Developer |
| Siti Miftahus Sa'diyah | 4.33.24.2.21 | Full-Stack Developer |

---

## 👨‍🏫 Dosen Pembimbing

*   **Suko Tyas Pernanda, S.ST., M.Cs** (Dosen Pembimbing Utama)
*   **Wiktasari, S.T., M.Kom** (Dosen Pembimbing Pendamping)

---

<div align="center">
  <b>PBL Kelompok 6 — WishWash Laundry</b><br>
  Program Studi D4 Teknologi Rekayasa Komputer<br>
  Jurusan Elektro<br>
  Politeknik Negeri Semarang<br>
  Semester Genap 2025/2026
</div>
