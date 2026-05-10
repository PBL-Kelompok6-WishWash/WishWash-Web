// src/app/components/SplashScreen.tsx
"use client";

import React from 'react';
import Lottie from 'lottie-react';
import laundryAnimation from '../../../public/animations/laundry_loading.json'; // Pastikan path ini sesuai jika folder public-mu berbeda tingkat

export default function SplashScreen() {
  return (
    // Background putih bersih dengan efek fade-in pelan
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-[fadeIn_0.5s_ease-in-out]">
      
      {/* Container untuk Lottie Animation */}
      <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex justify-center items-center">
        {/* Lingkaran Cyan yang membesar (efek dari Fase 1 Flutter) */}
        <div className="absolute inset-0 bg-[#42C6D4]/10 rounded-full animate-ping opacity-50 scale-150"></div>
        
        {/* Animasi Mesin Cuci Lottie */}
        <Lottie 
          animationData={laundryAnimation} 
          loop={true} 
          className="w-full h-full z-10 drop-shadow-xl"
        />
      </div>

      {/* Teks "Wish Wash" Muncul (Fase 4 Flutter) */}
      <div className="mt-8 flex flex-col items-center opacity-0 animate-[slideUpFade_0.8s_ease-out_1s_forwards]">
        <h1 className="text-4xl sm:text-5xl font-black italic text-[#0F2F53] tracking-tight mb-2">
          Wish Wash
        </h1>
        <p className="text-[#42C6D4] font-bold tracking-widest uppercase text-sm">
          Admin Dashboard
        </p>
      </div>

      {/* Tailwind Custom Animations Injector (Hanya untuk komponen ini) */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpFade {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>

    </div>
  );
}