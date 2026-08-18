import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiMapPin, FiCheckCircle, FiAlertCircle, FiDroplet, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function AdminSpbu({ spbus }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpbu, setEditingSpbu] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        address: '',
        city: '',
        province: '',
        status: 'active'
    });

    const openAddModal = () => {
        setEditingSpbu(null);
        reset();
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
            status: spbu.status
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
            put(route('admin.spbu.update', editingSpbu.id), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Data SPBU berhasil diperbarui.', icon: 'success', confirmButtonColor: '#980f12' });
                },
            });
        } else {
            post(route('admin.spbu.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'SPBU baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#980f12' });
                },
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

    return (
        <>
            <Head title="Manajemen SPBU" />
            <LoadingOverlay isVisible={processing} text="Menyimpan data SPBU..." />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen SPBU</h2>
                    <p className="text-gray-500 mt-1 text-sm">Pantau daftar SPBU terdaftar dan status stok BBM.</p>
                </div>
                <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 text-sm">
                    <FiPlus /> Tambah SPBU
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {spbus.map((spbu: any) => (
                    <div key={spbu.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 relative group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(spbu)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Edit"><FiEdit2 /></button>
                            <button onClick={() => handleDelete(spbu)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Hapus"><FiTrash2 /></button>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-red-50 text-[#980f12] flex items-center justify-center">
                                    <FiMapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{spbu.name}</h3>
                                    <div className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-block mt-1">Kode: {spbu.code}</div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">{spbu.address}, {spbu.city}, {spbu.province}</p>
                            
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-gray-700">Operator Bertugas:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {spbu.operators?.length > 0 ? spbu.operators.map((op: any) => (
                                    <span key={op.id} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                                        {op.user?.name}
                                    </span>
                                )) : (
                                    <span className="text-xs text-gray-400 italic">Belum ada operator</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <FiDroplet className="text-gray-400" /> Status Stok BBM
                            </h4>
                            <div className="space-y-2">
                                {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => (
                                    <div key={stock.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-sm">
                                        <span className="font-semibold text-gray-800 capitalize">{stock.fuel_type.replace('_', ' ')}</span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                                            stock.status === 'available' ? 'bg-green-100 text-green-700' : 
                                            stock.status === 'empty' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {stock.status === 'available' ? <FiCheckCircle size={12}/> : <FiAlertCircle size={12}/>}
                                            {stock.status === 'available' ? 'Tersedia' : stock.status === 'empty' ? 'Habis' : 'Terbatas'}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4">Data stok tidak tersedia.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {spbus.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">Belum ada data SPBU.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingSpbu ? 'Edit SPBU' : 'Tambah SPBU'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode SPBU (Pasti Pas)</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama SPBU</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" rows={2} required></textarea>
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kota/Kabupaten</label>
                                    <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                                    <input type="text" value={data.province} onChange={e => setData('province', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Operasional</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm">
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

AdminSpbu.layout = (page: any) => <AppLayout title="Manajemen SPBU">{page}</AppLayout>;
