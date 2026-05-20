// src/utils/imageHelper.ts

const BACKEND_URL = "http://localhost:8080";

/**
 * Mengubah path gambar dari backend (/uploads/...) menjadi URL penuh
 * yang bisa diakses oleh browser.
 * 
 * - Jika sudah berupa base64 (data:image/...) → kembalikan apa adanya
 * - Jika sudah berupa URL penuh (http/https) → kembalikan apa adanya
 * - Jika berupa path relatif (/uploads/...) → tambahkan prefix backend URL
 * - Jika kosong/null → kembalikan string kosong
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";

  // Sudah berupa data URI (base64) → tampilkan langsung
  if (path.startsWith("data:")) return path;

  // Sudah berupa URL lengkap → tampilkan langsung
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Path relatif dari backend → tambahkan prefix
  if (path.startsWith("/uploads/")) {
    return `${BACKEND_URL}${path}`;
  }

  // Fallback: path lainnya (misal assets/ legacy)
  return path;
}

/**
 * Mengubah File menjadi base64 string (data URL).
 * Berguna untuk preview gambar sebelum diupload.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as base64"));
      }
    };
    reader.onerror = (e) => reject(e);
  });
}
