"use client";

import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, GripVertical, Save, ClipboardList, Tag, Image as ImageIcon, Package, Clock, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { layananService } from '@/services/layananService';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStatusItem({ id, index, status, onRemove, onChange }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-3 bg-slate-50 p-3 rounded-xl border-2 shadow-sm transition-colors ${
        isDragging ? 'border-[#4FD1D9] scale-105 shadow-md bg-white opacity-90' : 'border-slate-100 hover:border-[#4FD1D9]'
      }`}
    >
      <div 
        className="text-slate-300 cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded" 
        {...attributes} 
        {...listeners}
      >
         <GripVertical size={20} />
      </div>
      <div className="w-8 h-8 shrink-0 bg-[#1e3a5f] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-inner">
         {index + 1}
      </div>
      <input 
         type="text"
         value={status}
         onChange={(e) => onChange(index, e.target.value)}
         className="flex-1 bg-transparent outline-none font-bold text-[#1e3a5f]"
         placeholder={`Nama status ke-${index + 1}`}
      />
      <button 
         type="button"
         onClick={() => onRemove(index)}
         className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
      >
         <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function TambahLayananPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_layanan: '',
    gambar_layanan: '',
    jenis_satuan: 'Kg',
    harga_per_satuan: '',
    status_layanan: 'Aktif'
  });
  
  const [statuses, setStatuses] = useState<{id: string, value: string}[]>([
    { id: 'id-1', value: 'Pesanan Diterima' },
    { id: 'id-2', value: 'Penjemputan' },
    { id: 'id-3', value: 'Proses Timbang' },
    { id: 'id-4', value: 'Proses Cuci' },
    { id: 'id-5', value: 'Proses Setrika' },
    { id: 'id-6', value: 'Siap Diantar' },
    { id: 'id-7', value: 'Selesai' },
  ]);

  const [pakets, setPakets] = useState<{id: string, nama_paket: string, durasi_jam: string, biaya_tambahan: string}[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatCurrency = (val: string) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(val, 10));
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({...formData, harga_per_satuan: rawValue});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert("Ukuran file terlalu besar! Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setFormData({ ...formData, gambar_layanan: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFoto = () => {
    setPreview(null);
    setFormData({ ...formData, gambar_layanan: "" });
    const fileInput = document.getElementById('gambar_upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleAddStatus = () => {
    setStatuses([...statuses, { id: `id-${Date.now()}`, value: 'Tahap Baru' }]);
  };

  const handleRemoveStatus = (index: number) => {
    const newStatuses = [...statuses];
    newStatuses.splice(index, 1);
    setStatuses(newStatuses);
  };

  const handleStatusChange = (index: number, val: string) => {
    const newStatuses = [...statuses];
    newStatuses[index].value = val;
    setStatuses(newStatuses);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddPaket = () => {
    setPakets([...pakets, { id: `pkt-${Date.now()}`, nama_paket: '', durasi_jam: '', biaya_tambahan: '' }]);
  };

  const handleRemovePaket = (index: number) => {
    const newPakets = [...pakets];
    newPakets.splice(index, 1);
    setPakets(newPakets);
  };

  const handlePaketChange = (index: number, field: string, value: string) => {
    const newPakets = [...pakets];
    if (field === 'biaya_tambahan') {
       value = value.replace(/\D/g, '');
    }
    newPakets[index] = { ...newPakets[index], [field]: value };
    setPakets(newPakets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_layanan || !formData.harga_per_satuan) {
      setErrorMsg("Mohon isi semua field yang wajib!");
      return;
    }
    
    if (statuses.length === 0) {
      setErrorMsg("Mohon tambahkan minimal 1 status layanan!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await layananService.create({
        nama_layanan: formData.nama_layanan,
        gambar_layanan: formData.gambar_layanan,
        jenis_satuan: formData.jenis_satuan,
        harga_per_satuan: parseFloat(formData.harga_per_satuan),
        status_layanan: formData.status_layanan,
        referensi_status: statuses.map(s => s.value).filter(v => v.trim() !== ""),
        paket_layanan: pakets.map(p => ({
           nama_paket: p.nama_paket || 'Tanpa Nama',
           durasi_jam: parseInt(p.durasi_jam) || 0,
           biaya_tambahan: parseFloat(p.biaya_tambahan) || 0
        }))
      });
      sessionStorage.setItem('layanan_notif', `Berhasil menambah layanan ${formData.nama_layanan}!`);
      router.push('/layanan');
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal menyimpan layanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative pb-10">
      
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/layanan"
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#4FD1D9] hover:border-[#4FD1D9] hover:bg-[#4FD1D9]/10 transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h2 className="text-3xl font-black text-[#1e3a5f] tracking-wider uppercase">
          Tambah Layanan Baru
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <ClipboardList size={24} className="text-[#4FD1D9]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold leading-tight">Formulir Data Layanan</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
               Tentukan jenis layanan, urutan status pesanan, beserta variasi paket untuk layanan ini.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 font-medium rounded-r-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            
            <div className="space-y-6">
              <h2 className="text-lg font-black text-[#1e3a5f] border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                 <Tag size={18} className="text-[#4FD1D9]" /> Informasi Dasar
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Nama Layanan <span className="text-red-500">*</span></label>
                <div className="relative">
                   <input 
                     type="text" 
                     required
                     value={formData.nama_layanan}
                     onChange={(e) => setFormData({...formData, nama_layanan: e.target.value})}
                     placeholder="Contoh: Wash & Ironing" 
                     className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Jenis Satuan <span className="text-red-500">*</span></label>
                <select 
                  value={formData.jenis_satuan}
                  onChange={(e) => setFormData({...formData, jenis_satuan: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] bg-white text-[#1e3a5f] font-medium cursor-pointer transition-all"
                >
                  <option value="Kg">Kg</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Meter">Meter</option>
                  <option value="Pasang">Pasang</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Status Layanan</label>
                <div className="relative">
                  <select 
                    value={formData.status_layanan}
                    onChange={(e) => setFormData({...formData, status_layanan: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all appearance-none bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Harga per Satuan <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <div className="bg-slate-100 border-2 border-r-0 border-slate-100 px-4 py-3 rounded-l-xl text-slate-500 font-bold">
                    Rp
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.harga_per_satuan ? formatCurrency(formData.harga_per_satuan) : ''}
                    onChange={handleHargaChange}
                    placeholder="10.000" 
                    className="flex-1 px-4 py-3 rounded-r-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">Gambar Layanan</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <ImageIcon size={18} className="text-slate-400" />
                   </div>
                   <input
                     id="gambar_upload"
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-sm font-medium transition-all text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1e3a5f]/10 file:text-[#1e3a5f] hover:file:bg-[#1e3a5f]/20 cursor-pointer"
                   />
                </div>
                {preview && (
                  <div className="mt-3 relative w-32 h-32 rounded-2xl border-4 border-slate-100 overflow-hidden shadow-sm">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={removeFoto}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                 <h2 className="text-lg font-black text-[#1e3a5f] flex items-center gap-2">
                    <ClipboardList size={18} className="text-[#4FD1D9]" /> Alur Status Layanan
                 </h2>
                 <button 
                   type="button" 
                   onClick={handleAddStatus}
                   className="flex items-center gap-1 text-sm bg-[#4FD1D9]/10 text-[#1e9a9f] px-4 py-2 rounded-lg font-bold hover:bg-[#4FD1D9]/20 transition-colors shadow-md border border-[#1e9a9f]/30"
                 >
                   <Plus size={16} /> Tambah Tahap
                 </button>
              </div>
              
              <div className="space-y-3">
                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                   <SortableContext items={statuses.map(s => s.id)} strategy={verticalListSortingStrategy}>
                     {statuses.map((status, index) => (
                       <SortableStatusItem 
                         key={status.id}
                         id={status.id}
                         index={index}
                         status={status.value}
                         onRemove={handleRemoveStatus}
                         onChange={handleStatusChange}
                       />
                     ))}
                   </SortableContext>
                 </DndContext>
                 
                 {statuses.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                       <p className="text-sm font-medium text-slate-400">Belum ada tahapan status.</p>
                    </div>
                 )}
              </div>
            </div>

          </div>

          <div className="mt-12 space-y-6 pt-6 border-t-2 border-slate-100">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
                 <h2 className="text-lg font-black text-[#1e3a5f] flex items-center gap-2">
                    <Package size={18} className="text-[#4FD1D9]" /> Paket Layanan
                 </h2>
                 <button 
                   type="button" 
                   onClick={handleAddPaket}
                   className="flex items-center gap-1 text-sm bg-[#4FD1D9]/10 text-[#1e9a9f] px-5 py-2.5 rounded-lg font-bold hover:bg-[#4FD1D9]/20 transition-colors shadow-md border border-[#1e9a9f]/30"
                 >
                   <Plus size={16} /> Tambah Paket
                 </button>
              </div>

              {pakets.length === 0 ? (
                 <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Package size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-400">Tidak ada paket tambahan khusus untuk layanan ini.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {pakets.map((paket, index) => (
                        <div key={paket.id} className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#4FD1D9]/50 transition-all duration-300 group">
                           {/* Header Card */}
                           <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5288] p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-white">
                                 <Package size={18} className="text-[#4FD1D9]" />
                                 <span className="font-bold text-sm tracking-wide">PAKET #{index + 1}</span>
                              </div>
                              <button 
                                 type="button"
                                 onClick={() => handleRemovePaket(index)}
                                 className="text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                           
                           <div className="p-5 space-y-5">
                              <div>
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Nama Paket</label>
                                 <input 
                                    type="text"
                                    placeholder="Misal: Express"
                                    value={paket.nama_paket}
                                    onChange={(e) => handlePaketChange(index, 'nama_paket', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4FD1D9] focus:ring-4 focus:ring-[#4FD1D9]/10 outline-none text-[#1e3a5f] font-bold transition-all"
                                 />
                              </div>

                              <div className="flex gap-4">
                                 <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-1">
                                       <Clock size={12} /> Durasi
                                    </label>
                                    <div className="relative">
                                       <input 
                                          type="number"
                                          placeholder="24"
                                          value={paket.durasi_jam}
                                          onChange={(e) => handlePaketChange(index, 'durasi_jam', e.target.value)}
                                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4FD1D9] focus:ring-4 focus:ring-[#4FD1D9]/10 outline-none text-[#1e3a5f] font-bold transition-all"
                                       />
                                       <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-xs font-bold text-slate-400">
                                          Jam
                                       </div>
                                    </div>
                                 </div>
                                 
                                 <div className="flex-[1.5]">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Biaya Tambahan</label>
                                    <div className="relative">
                                       <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-sm font-bold text-slate-400">
                                          Rp
                                       </div>
                                       <input 
                                          type="text"
                                          placeholder="0"
                                          value={paket.biaya_tambahan ? formatCurrency(paket.biaya_tambahan) : ''}
                                          onChange={(e) => handlePaketChange(index, 'biaya_tambahan', e.target.value)}
                                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4FD1D9] focus:ring-4 focus:ring-[#4FD1D9]/10 outline-none text-[#1e3a5f] font-bold transition-all"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                 </div>
              )}
          </div>

          <div className="mt-12 flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Link 
              href="/layanan"
              className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#122640] text-white px-10 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-[#1e3a5f]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}