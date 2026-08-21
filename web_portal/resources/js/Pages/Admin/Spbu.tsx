import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiMapPin, FiCheckCircle, FiAlertCircle, FiDroplet, FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiImage } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/Components/LoadingOverlay';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function AdminSpbu({ spbus }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpbu, setEditingSpbu] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm<any>({
        code: '',
        name: '',
        address: '',
        city: '',
        province: '',
        status: 'active',
        latitude: -6.200000,
        longitude: 106.816666,
        image: null,
        _method: 'post'
    });

    const openAddModal = () => {
        setEditingSpbu(null);
        reset();
        
        // Auto-generate realistic SPBU code (Format: 14.201.XXX)
        const randomSequence = Math.floor(100 + Math.random() * 899).toString().padStart(3, '0');
        const generatedCode = `14.201.${randomSequence}`;
        
        setData({
            code: generatedCode,
            name: '',
            address: '',
            city: '',
            province: '',
            status: 'active',
            latitude: -6.200000,
            longitude: 106.816666,
            image: null,
            _method: 'post'
        });
        
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (spbu: any) => {
        setEditingSpbu(spbu);
        setData({
            code: spbu.code,
            name: spbu.name,
            address: spbu.address,
            city: spbu.city,
            province: spbu.province,
            status: spbu.status,
            latitude: spbu.latitude ? parseFloat(spbu.latitude) : -6.200000,
            longitude: spbu.longitude ? parseFloat(spbu.longitude) : 106.816666,
            image: null,
            _method: 'put'
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingSpbu) {
            post(route('admin.spbu.update', editingSpbu.id), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Data SPBU berhasil diperbarui.', icon: 'success', confirmButtonColor: '#980f12' });
                },
                forceFormData: true
            });
        } else {
            post(route('admin.spbu.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'SPBU baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#980f12' });
                },
                forceFormData: true
            });
        }
    };

    const handleDelete = (spbu: any) => {
        Swal.fire({
            title: 'Hapus SPBU?',
            text: `Yakin ingin menghapus SPBU ${spbu.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#980f12',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.spbu.destroy', spbu.id), {
                    onSuccess: () => Swal.fire({ title: 'Terhapus!', text: 'SPBU berhasil dihapus.', icon: 'success', confirmButtonColor: '#980f12' })
                });
            }
        });
    };

    const filteredSpbus = spbus.filter((spbu: any) => {
        const matchesSearch = 
            spbu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spbu.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spbu.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            spbu.province.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (statusFilter === 'active') return spbu.status === 'active';
        if (statusFilter === 'inactive') return spbu.status !== 'active';
        return true;
    });

    return (
        <div className="space-y-6">
            <Head title="Manajemen SPBU - Admin" />
            <LoadingOverlay isVisible={processing} text="Menyimpan data SPBU..." />

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manajemen SPBU</h2>
                    <p className="text-gray-500 mt-1 text-sm">Pantau daftar SPBU terdaftar, operator dispenser, dan status stok BBM real-time.</p>
                </div>
                <button 
                    onClick={openAddModal} 
                    className="bg-[#980f12] text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-red-800 transition flex items-center justify-center gap-2 text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    <FiPlus size={16} /> Tambah SPBU Baru
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-2xl">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'all' ? 'bg-white text-[#980f12] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Semua ({spbus.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Aktif ({spbus.filter((s: any) => s.status === 'active').length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('inactive')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'inactive' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Non-Aktif ({spbus.filter((s: any) => s.status !== 'active').length})
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiSearch size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama, kode, atau kota SPBU..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                    />
                </div>
            </div>

            {/* SPBU Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredSpbus.map((spbu: any) => (
                    <div 
                        key={spbu.id} 
                        className="bg-white rounded-3xl border border-gray-100 hover:border-red-200 shadow-xs hover:shadow-lg transition-all duration-300 p-6 flex flex-col lg:flex-row gap-6 relative group"
                    >
                        {/* Action Buttons Top Right */}
                        <div className="absolute top-5 right-5 flex gap-1.5">
                            <button 
                                onClick={() => openEditModal(spbu)} 
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs" 
                                title="Edit SPBU"
                            >
                                <FiEdit2 size={15} />
                            </button>
                            <button 
                                onClick={() => handleDelete(spbu)} 
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-2xs" 
                                title="Hapus SPBU"
                            >
                                <FiTrash2 size={15} />
                            </button>
                        </div>

                        {/* Left Side: SPBU Details */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3.5 mb-3">
                                {spbu.image_url ? (
                                    <img src={spbu.image_url} alt={spbu.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0 border border-gray-100" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
                                        <FiMapPin />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">{spbu.name}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            spbu.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {spbu.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md inline-block mt-1 font-semibold">
                                        Kode: {spbu.code}
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
                                {spbu.address}, {spbu.city}, {spbu.province}
                            </p>
                            
                            <div className="mb-2">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Operator Bertugas:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {spbu.operators?.length > 0 ? spbu.operators.map((op: any) => (
                                    <span key={op.id} className="text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200">
                                        👤 {op.user?.name}
                                    </span>
                                )) : (
                                    <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                        Belum ada operator terdaftar
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Side: Fuel Stock Status */}
                        <div className="lg:w-80 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FiDroplet className="text-[#980f12]" /> Status Stok Tangki BBM
                                </h4>
                                <div className="space-y-2">
                                    {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => (
                                        <div key={stock.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs text-xs">
                                            <span className="font-bold text-gray-800 capitalize">{stock.fuel_type.replace('_', ' ')}</span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                                stock.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 
                                                stock.status === 'empty' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {stock.status === 'available' ? <FiCheckCircle size={12}/> : <FiAlertCircle size={12}/>}
                                                {stock.status === 'available' ? 'Tersedia' : stock.status === 'empty' ? 'Habis' : 'Menipis'}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 italic text-center py-4">Data stok tangki belum diisi.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredSpbus.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-xs">
                        <FiMapPin size={36} className="mx-auto mb-2 text-gray-300" />
                        <p className="font-bold text-gray-700">Tidak ada SPBU yang sesuai dengan filter.</p>
                        <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau status operasional.</p>
                    </div>
                )}
            </div>

            {/* Modal Tambah/Edit SPBU */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 shrink-0">
                            <h3 className="text-base font-extrabold text-gray-900">{editingSpbu ? 'Edit Data SPBU' : 'Tambah SPBU Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"><FiX size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Kode SPBU (Misal: 31.123.01)</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                {errors.code && <p className="text-red-500 text-[11px] mt-1">{errors.code}</p>}
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Nama SPBU</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" rows={2} required></textarea>
                                {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Kota/Kabupaten</label>
                                    <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                    {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Provinsi</label>
                                    <input type="text" value={data.province} onChange={e => setData('province', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                    {errors.province && <p className="text-red-500 text-[11px] mt-1">{errors.province}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Status Operasional</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border-gray-200 rounded-xl py-2.5 pl-3 pr-10 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20 font-semibold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat">
                                    <option value="active">Aktif (Melayani)</option>
                                    <option value="inactive">Non-Aktif (Tutup/Maintenance)</option>
                                </select>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <label className="block font-bold text-gray-700 mb-2">Koordinat Peta</label>
                                <p className="text-gray-500 text-[10px] mb-2">Geser peta atau klik pada lokasi untuk menentukan koordinat SPBU.</p>
                                <div className="h-48 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0 relative">
                                    <MapContainer center={[data.latitude, data.longitude]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[data.latitude, data.longitude]} />
                                        <MapEvents onLocationSelect={(lat, lng) => { setData('latitude', lat); setData('longitude', lng); }} />
                                    </MapContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Latitude</label>
                                        <input type="number" step="any" value={data.latitude} onChange={e => setData('latitude', parseFloat(e.target.value))} className="w-full border-gray-200 rounded-lg p-1.5 text-xs" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500">Longitude</label>
                                        <input type="number" step="any" value={data.longitude} onChange={e => setData('longitude', parseFloat(e.target.value))} className="w-full border-gray-200 rounded-lg p-1.5 text-xs" />
                                    </div>
                                </div>
                                {errors.latitude && <p className="text-red-500 text-[11px] mt-1">{errors.latitude}</p>}
                                {errors.longitude && <p className="text-red-500 text-[11px] mt-1">{errors.longitude}</p>}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <label className="block font-bold text-gray-700 mb-2">Gambar SPBU (Opsional)</label>
                                <input type="file" accept="image/*" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                                {errors.image && <p className="text-red-500 text-[11px] mt-1">{errors.image}</p>}
                            </div>
                            
                            <div className="sticky bottom-0 bg-white mt-6 flex justify-end gap-2.5 pt-4 border-t border-gray-100 pb-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 font-bold text-white bg-[#980f12] hover:bg-red-800 rounded-xl transition-colors disabled:opacity-50 shadow-md">
                                    {processing ? 'Menyimpan...' : 'Simpan Data SPBU'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

AdminSpbu.layout = (page: any) => <AppLayout title="Manajemen SPBU">{page}</AppLayout>;

