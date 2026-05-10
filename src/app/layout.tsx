// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WishWash",
  description: "Laundry Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-black m-0 p-0 antialiased">
        {/* Children di sini akan berisi layout (auth) atau (dashboard) */}
        {children}
      </body>
    </html>
  );
}