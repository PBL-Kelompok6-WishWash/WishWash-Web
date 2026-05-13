"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, GripVertical, Save, ClipboardList, Tag, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditLayananPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [formData, setFormData] = useState({
    nama_layanan: '',
    gambar_layanan: '',
    jenis_satuan: 'Kg',
    harga_per_satuan: '' 
  });
  
  const [statuses, setStatuses] = useState<{id: string, value: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const res = await layananService.getById(id);
        const data = res.data;
        setFormData({
          nama_layanan: data.nama_layanan,
          gambar_layanan: data.gambar_layanan || '',
          jenis_satuan: data.jenis_satuan,
          harga_per_satuan: data.harga_per_satuan.toString()
        });
        
        if (data.referensi_status && data.referensi_status.length > 0) {
           setStatuses(data.referensi_status.map((s: any, i: number) => ({ id: `s-${i}`, value: s.nama_status })));
        } else {
           setStatuses([
             { id: '1', value: 'Pickup' },
             { id: '2', value: 'Wash' },
             { id: '3', value: 'Delivery' },
             { id: '4', value: 'Success' },
           ]);
        }
      } catch (error) {
        console.error("Gagal memuat data layanan", error);
        alert("Gagal memuat data layanan. Kembali ke halaman sebelumnya.");
        router.push('/layanan');
      } finally {
        setIsLoading(false);
      }
    };

    if(id) fetchLayanan();
  }, [id, router]);

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
      await layananService.update(id, {
        nama_layanan: formData.nama_layanan,
        gambar_layanan: formData.gambar_layanan,
        jenis_satuan: formData.jenis_satuan,
        harga_per_satuan: parseFloat(formData.harga_per_satuan),
        referensi_status: statuses.map(s => s.value).filter(v => v.trim() !== "")
      });
      sessionStorage.setItem('layanan_notif', `Berhasil memperbarui layanan ${formData.nama_layanan}!`);
      router.push('/layanan');
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal mengupdate layanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat data...</div>;
  }

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
          Edit Layanan
        </h2>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        <div className="bg-[#1e3a5f] p-5 text-white flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            <ClipboardList size={24} className="text-[#4FD1D9]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold leading-tight">Formulir Edit Layanan</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
               Perbarui jenis layanan dan urutan status pesanan.
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
                <label className="text-sm font-bold text-[#1e3a5f] ml-1">URL Gambar (Opsional)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <ImageIcon size={18} className="text-slate-400" />
                   </div>
                   <input 
                     type="text" 
                     value={formData.gambar_layanan}
                     onChange={(e) => setFormData({...formData, gambar_layanan: e.target.value})}
                     placeholder="https://..." 
                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:outline-none focus:border-[#4FD1D9] text-[#1e3a5f] font-medium transition-all"
                   />
                </div>
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
                   className="flex items-center gap-1 text-sm bg-[#4FD1D9]/10 text-[#1e9a9f] px-3 py-1.5 rounded-lg font-bold hover:bg-[#4FD1D9]/20 transition-colors"
                 >
                   <Plus size={16} /> Tambah Tahap
                 </button>
              </div>
              
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                 <p className="text-xs font-medium text-blue-800 leading-relaxed">
                    Tentukan urutan status pesanan. Tahan dan geser icon di sebelah kiri untuk mengubah urutan secara profesional.
                 </p>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}