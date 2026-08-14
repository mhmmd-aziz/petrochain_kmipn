import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function Users({ users }: any) {
    return (
        <>
            <Head title="Manajemen Pengguna" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola data akun admin, operator, auditor, dan masyarakat.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nama atau email..." 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full md:w-64"
                        />
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 text-sm">
                        <FiPlus /> Tambah User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-4">Nama</th>
                                <th className="px-5 py-4">Email / NIK</th>
                                <th className="px-5 py-4">Role</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-gray-900">{u.name}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div>{u.email}</div>
                                        <div className="text-xs text-gray-400 font-mono">NIK: {u.nik || '-'}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            u.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                                            u.role === 'auditor' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {u.status}
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
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Tidak ada user</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Users.layout = (page: any) => <AppLayout title="Manajemen Pengguna">{page}</AppLayout>;
