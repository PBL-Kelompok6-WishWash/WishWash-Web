"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";
import SplashScreen from "@/app/components/SplashScreen"; // 👈 Import Splash Screen

// Definisikan tipe data untuk Gelembung
interface Bubble {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(""); // Kosongkan pesan error setelah 3 detik
      }, 3000);
      return () => clearTimeout(timer); // Bersihkan timer jika komponen ditutup
    }
  }, [errorMsg]);

  useEffect(() => {
    document.title = "Sign In - WishWash";
    const savedUsername = localStorage.getItem("remembered_username");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }

    const generateBubbles = () => {
      const newBubbles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * (120 - 15) + 15, 
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: Math.random() * (25 - 10) + 10,
      }));
      setBubbles(newBubbles);
    };
    generateBubbles();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    // TAMPILKAN SPLASH SCREEN
    setIsLoading(true);
    
    const result = await loginAdmin(username, password) as any;

    if (result.success) {
      if (result.id_role === 1) {
        localStorage.setItem("jwt_token", result.token);
        localStorage.setItem("id_role", result.id_role.toString());
        if (result.display_name) {
          localStorage.setItem("nama_user", result.display_name);
        }
        if (rememberMe) {
          localStorage.setItem("remembered_username", username);
        } else {
          localStorage.removeItem("remembered_username");
        }
        // Kita kasih delay dikit ke dashboard biar splash screen-nya sempat dinikmati matanya
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        setIsLoading(false); // Matikan splash screen kalau gagal
        setErrorMsg("Akses Ditolak! Hanya Admin yang bisa login. 🛑");
      }
    } else {
      setIsLoading(false); // Matikan splash screen kalau gagal
      setErrorMsg(result.message);
    }
  };

  return (
    <>
      {/* 💡 MUNCULKAN SPLASH SCREEN KALAU isLoading TRUE */}
      {isLoading && <SplashScreen />}

      <div className="min-h-screen relative bg-[#f0f9fa] flex flex-col items-center justify-center overflow-hidden font-sans px-4">
        
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#42C6D4] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#25d3e3] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 pointer-events-none"></div>

        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full border border-white/70 bg-white/10 backdrop-blur-sm shadow-[inset_0_0_15px_rgba(255,255,255,0.5)] pointer-events-none animate-bubble-float opacity-0"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              bottom: '-150px',
              left: `${bubble.left}%`,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
            }}
          />
        ))}

        <div className="z-10 w-full max-w-[450px] p-6 sm:p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(66,198,212,0.2)] border border-white/60 ring-1 ring-white/40">
          
          <div className="flex items-center mb-6">
            <img src="/logo.png" alt="Logo WishWash" className="mr-4 object-contain w-[50px] h-[50px]" />
            <h1 className="text-3xl font-bold text-[#0F2F53]">Sign In</h1>
          </div>
          <p className="text-gray-500 text-sm mb-8">Welcome! Please sign in to the Admin Panel.</p>

          {/* Kotak Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-r-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#42C6D4] border border-white/50 transition shadow-inner"
                placeholder="Username"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#42C6D4] border border-white/50 transition shadow-inner"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42C6D4] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center mt-2">
              <label className="flex items-center cursor-pointer group relative">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 mr-3 rounded-md border-2 border-white/80 bg-white/50 backdrop-blur-sm transition-all duration-300 ease-bounce peer-checked:bg-[#42C6D4] peer-checked:border-[#42C6D4] group-hover:border-[#42C6D4] flex items-center justify-center shadow-sm">
                    <svg className={`w-3.5 h-3.5 text-white pointer-events-none transition-transform duration-300 origin-center ${rememberMe ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className={`text-sm select-none transition-colors duration-300 ${rememberMe ? 'text-[#0F2F53] font-semibold' : 'text-gray-500 font-medium group-hover:text-gray-700'}`}>
                  Remember me
                </span>
              </label>
            </div>

            {/* Tombol kembali bersih tanpa loading spinner */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-8 bg-gradient-to-r from-[#42C6D4] to-[#25d3e3] hover:from-[#3ab5c2] hover:to-[#1faebf] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(66,198,212,0.3)] hover:shadow-[0_10px_25px_rgba(66,198,212,0.5)] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 font-medium mt-8">Secure Login &bull; WishWash Admin Dashboard</p>
        </div>
      </div>
    </>
  );
}