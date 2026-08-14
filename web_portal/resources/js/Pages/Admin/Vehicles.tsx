import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { FiTruck, FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function Vehicles({ vehicles }: any) {
    return (
        <>
            <Head title="Manajemen Kendaraan" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Data Kendaraan Terdaftar</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola data kendaraan yang berhak mendapatkan BBM bersubsidi.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari pelat atau nama..." 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full md:w-64"
                        />
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 text-sm">
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
                                        <div className="capitalize font-medium">{v.vehicle_type}</div>
                                        <div className="text-xs text-gray-500">{v.brand} {v.model} &bull; {v.engine_capacity_cc}cc</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            v.registration_status === 'approved' ? 'bg-green-100 text-green-700' :
                                            v.registration_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {v.registration_status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><FiEdit2 /></button>
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><FiTrash2 /></button>
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
        </>
    );
}

Vehicles.layout = (page: any) => <AppLayout title="Data Kendaraan">{page}</AppLayout>;
