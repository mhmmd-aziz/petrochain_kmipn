import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiTruck, FiSearch, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function Vehicles({ vehicles, users }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        plate_number: '',
        vehicle_type: 'mobil_pribadi',
        fuel_type: 'pertalite',
        brand: '',
        model: '',
        engine_capacity_cc: '',
        registration_status: 'approved'
    });

    const openAddModal = () => {
        setEditingVehicle(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle: any) => {
        setEditingVehicle(vehicle);
        setData({
            user_id: vehicle.user_id,
            plate_number: vehicle.plate_number,
            vehicle_type: vehicle.vehicle_type,
            fuel_type: vehicle.fuel_type || 'pertalite',
            brand: vehicle.brand,
            model: vehicle.model,
            engine_capacity_cc: vehicle.engine_capacity_cc,
            registration_status: vehicle.registration_status
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
        if (editingVehicle) {
            put(route('vehicles.update', editingVehicle.id), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Data kendaraan berhasil diperbarui.', icon: 'success', confirmButtonColor: '#980f12' });
                },
            });
        } else {
            post(route('vehicles.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Kendaraan baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#980f12' });
                },
            });
        }
    };

    const handleDelete = (vehicle: any) => {
        Swal.fire({
            title: 'Hapus Kendaraan?',
            text: `Yakin ingin menghapus plat nomor ${vehicle.plate_number}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#980f12',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('vehicles.destroy', vehicle.id), {
                    onSuccess: () => Swal.fire({ title: 'Terhapus!', text: 'Kendaraan berhasil dihapus.', icon: 'success', confirmButtonColor: '#980f12' })
                });
            }
        });
    };

    return (
        <>
            <Head title="Manajemen Kendaraan" />
            <LoadingOverlay isVisible={processing} text="Menyimpan data kendaraan..." />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Data Kendaraan Terdaftar</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola data kendaraan yang berhak mendapatkan BBM bersubsidi.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 text-sm">
                        <FiPlus /> Tambah
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-4">Pemilik</th>
                                <th className="px-5 py-4">Plat Nomor</th>
                                <th className="px-5 py-4">Tipe & Kapasitas</th>
                                <th className="px-5 py-4">Status Registrasi</th>
                                <th className="px-5 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vehicles.map((v: any) => (
                                <tr key={v.id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-gray-900">{v.user?.name || 'Unknown'}</div>
                                    </td>
                                    <td className="px-5 py-4 font-mono font-bold">{v.plate_number}</td>
                                    <td className="px-5 py-4">
                                        <div className="capitalize font-medium">{v.vehicle_type} - {v.fuel_type}</div>
                                        <div className="text-xs text-gray-500">{v.brand} {v.model} &bull; {v.engine_capacity_cc}cc</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            v.registration_status === 'approved' ? 'bg-green-100 text-green-700' :
                                            v.registration_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {v.registration_status}
                                        </span>
                                        {v.registration_status === 'approved' && v.max_quota !== undefined && (
                                            <div className="mt-2 text-xs font-mono w-32">
                                                {v.max_quota > 1000 ? (
                                                    <div className="text-gray-500">Kuota: Tanpa Batas</div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between text-gray-500 mb-1 text-[10px]">
                                                            <span>Sisa: {v.remaining_quota}L</span>
                                                            <span>{v.max_quota}L</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    (v.remaining_quota / v.max_quota) < 0.2 ? 'bg-red-500' : 'bg-emerald-500'
                                                                }`}
                                                                style={{ width: `${Math.max(0, Math.min(100, (v.remaining_quota / v.max_quota) * 100))}%` }}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><FiEdit2 /></button>
                                            <button onClick={() => handleDelete(v)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Tidak ada kendaraan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form id="vehicleForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pemilik Kendaraan (Akun Public)</label>
                                    <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required>
                                        <option value="">-- Pilih Pemilik --</option>
                                        {users && users.map((u: any) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Plat Nomor</label>
                                        <input type="text" value={data.plate_number} onChange={e => setData('plate_number', e.target.value.toUpperCase())} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm font-mono uppercase" required />
                                        {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mesin (CC)</label>
                                        <input type="number" value={data.engine_capacity_cc} onChange={e => setData('engine_capacity_cc', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                        {errors.engine_capacity_cc && <p className="text-red-500 text-xs mt-1">{errors.engine_capacity_cc}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                                        <input type="text" value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="Contoh: Toyota" className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <input type="text" value={data.model} onChange={e => setData('model', e.target.value)} placeholder="Contoh: Avanza" className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm" required />
                                        {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kendaraan</label>
                                        <select value={data.vehicle_type} onChange={e => setData('vehicle_type', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm">
                                            <option value="mobil_pribadi">Mobil Pribadi</option>
                                            <option value="angkutan_umum">Angkutan Umum</option>
                                            <option value="angkutan_barang">Angkutan Barang (Truk/Pickup)</option>
                                            <option value="motor">Motor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis BBM Subsidi</label>
                                        <select value={data.fuel_type} onChange={e => setData('fuel_type', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm">
                                            <option value="pertalite">Pertalite</option>
                                            <option value="solar">Solar (Biosolar)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Verifikasi</label>
                                    <select value={data.registration_status} onChange={e => setData('registration_status', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm">
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                            <button type="submit" form="vehicleForm" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Vehicles.layout = (page: any) => <AppLayout title="Data Kendaraan">{page}</AppLayout>;
