import React from 'react';
import { 
  ChevronLeft, 
  MoreVertical, 
  Plus, 
  Send,
  Search
} from 'lucide-react';

export default function PesanPage() {
  const chatList = [
    { name: 'Jibran Kagabuming', msg: 'titidije, bos', time: '11:11 am', active: false },
    { name: 'Sugeng Saklar', msg: 'sdh di dpan qq', time: '11:11 am', active: false },
    { name: 'Dika Acikiwir', msg: 'Y, ok', time: '11:11 am', active: false },
    { name: 'Mingyu Sefentin', msg: 'wjar boi, atmint jg mnusia', time: '11:11 am', active: true },
  ];

  return (
    <div className="flex flex-1 h-full bg-white">
      {/* SISI KIRI: DAFTAR CHAT */}
      <div className="w-[350px] border-r border-slate-200 flex flex-col">
        {/* Search Bar di Kiri */}
        <div className="p-6">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-4">PESAN</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari pesan..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4FD1D9]"
            />
          </div>
        </div>

        {/* List Chat */}
        <div className="flex-1 overflow-y-auto px-2">
          {chatList.map((chat, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all mb-1 ${
                chat.active ? 'bg-[#4FD1D926]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden shrink-0 border border-slate-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt="avatar" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className={`truncate text-sm ${chat.active ? 'font-bold text-[#1e3a5f]' : 'font-semibold text-slate-700'}`}>
                    {chat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SISI KANAN: JENDELA CHAT (FULL) */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Header Chat */}
        <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4FD1D9]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mingyu" alt="Mingyu" />
            </div>
            <div>
              <h4 className="font-bold text-[#1e3a5f]">Mingyu Sefentin</h4>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] text-slate-400 font-medium">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Search size={20} className="cursor-pointer hover:text-[#1e3a5f]" />
            <MoreVertical size={20} className="cursor-pointer hover:text-[#1e3a5f]" />
          </div>
        </div>

        {/* Area Pesan */}
        <div className="flex-1 p-10 space-y-6 overflow-y-auto">
          {/* Bubble Pesan Kanan */}
          <div className="flex flex-col items-end gap-1">
            <div className="bg-[#4FD1D9] text-white p-4 rounded-2xl rounded-tr-none max-w-md shadow-md text-sm leading-relaxed">
              Bang kayanya ketuker pesanan punya Kak Ajeng sama Kak Mark.
            </div>
            <span className="text-[10px] text-slate-400 mr-1">11:11 am</span>
          </div>

          {/* Bubble Pesan Kiri */}
          <div className="flex flex-col items-start gap-1">
            <div className="bg-white text-[#1e3a5f] p-4 rounded-2xl rounded-tl-none max-w-md border border-slate-200 shadow-sm text-sm leading-relaxed">
              Waduh, siap boi! Segera admin cek ya. Maaf ya admin juga manusia, kadang suka ngelamun dikit hehe.
            </div>
            <span className="text-[10px] text-slate-400 ml-1">11:12 am</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-8 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-100 p-2 pl-6 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4FD1D9] transition-all">
            <input 
              type="text" 
              placeholder="Tulis pesan..." 
              className="flex-1 bg-transparent outline-none text-[#1e3a5f] text-sm font-medium"
            />
            <button className="p-2 text-slate-400 hover:text-[#4FD1D9]">
              <Plus size={24} />
            </button>
            <button className="bg-[#4FD1D9] p-3 rounded-xl text-white hover:bg-[#3bb9c0] shadow-md transition-all active:scale-95">
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}