import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function Users({ users, spbus }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'public',
        spbu_id: ''
    });

    const openAddModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '', // Leave empty unless changing
            role: user.role,
            spbu_id: user.operator?.spbu_id || ''
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
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Data pengguna berhasil diperbarui.', icon: 'success', confirmButtonColor: '#980f12' });
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ title: 'Berhasil!', text: 'Pengguna baru berhasil ditambahkan.', icon: 'success', confirmButtonColor: '#980f12' });
                },
            });
        }
    };

    const handleDelete = (user: any) => {
        Swal.fire({
            title: 'Hapus Pengguna?',
            text: `Yakin ingin menghapus ${user.name}? Semua data terkait operator juga akan terhapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#980f12',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('users.destroy', user.id), {
                    onSuccess: () => Swal.fire({ title: 'Terhapus!', text: 'Pengguna berhasil dihapus.', icon: 'success', confirmButtonColor: '#980f12' })
                });
            }
        });
    };

    return (
        <>
            <Head title="Manajemen Pengguna" />
            <LoadingOverlay isVisible={processing} text="Menyimpan data pengguna..." />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola data akun admin, operator, auditor, dan masyarakat.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 text-sm">
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
                                <th className="px-5 py-4">Email / Info</th>
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
                                        {u.role === 'operator' && u.operator?.spbu && (
                                            <div className="text-xs text-blue-600 font-medium mt-1">
                                                SPBU: {u.operator.spbu.name} ({u.operator.spbu.code})
                                            </div>
                                        )}
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
                                            <button onClick={() => openEditModal(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><FiEdit2 /></button>
                                            <button onClick={() => handleDelete(u)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><FiTrash2 /></button>
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

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required={!editingUser} />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                        <option value="public">Masyarakat (Public)</option>
                                        <option value="operator">Operator SPBU</option>
                                        <option value="admin">Administrator Pertamina</option>
                                        <option value="auditor">Auditor / Pemerintah</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>

                                {data.role === 'operator' && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Tugaskan ke SPBU</label>
                                        <select value={data.spbu_id} onChange={e => setData('spbu_id', e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required={data.role === 'operator'}>
                                            <option value="">-- Pilih SPBU --</option>
                                            {spbus && spbus.map((s: any) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                        {errors.spbu_id && <p className="text-red-500 text-xs mt-1">{errors.spbu_id}</p>}
                                        <p className="text-xs text-blue-700 mt-2">Operator hanya dapat mengakses dan mengupdate data stok pada SPBU yang dipilih di atas.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 disabled:opacity-50">
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

Users.layout = (page: any) => <AppLayout title="Manajemen Pengguna">{page}</AppLayout>;
