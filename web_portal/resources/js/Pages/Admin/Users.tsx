import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiPlus, FiX, FiShield, FiUserCheck, FiFilter } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function Users({ users, spbus }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'operator' | 'auditor' | 'public'>('all');

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

    const filteredUsers = users.filter((u: any) => {
        const matchesSearch = 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.operator?.spbu?.name && u.operator.spbu.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        return true;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="px-3 py-1 rounded-full text-xs font-black bg-red-50 text-[#980f12] border border-red-200 uppercase tracking-wider">ADMIN</span>;
            case 'operator':
                return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">OPERATOR</span>;
            case 'auditor':
                return <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">AUDITOR</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">MASYARAKAT</span>;
        }
    };

    return (
        <div className="space-y-6">
            <Head title="Manajemen Pengguna - Admin" />
            <LoadingOverlay isVisible={processing} text="Menyimpan data pengguna..." />

            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola data akun administrator, operator SPBU, auditor BPH Migas, dan masyarakat umum.</p>
                </div>
                <button 
                    onClick={openAddModal} 
                    className="bg-[#980f12] text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-red-800 transition flex items-center justify-center gap-2 text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    <FiPlus size={16} /> Tambah User Baru
                </button>
            </div>

            {/* Search & Role Filter Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl">
                    <button
                        onClick={() => setRoleFilter('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            roleFilter === 'all' ? 'bg-white text-[#980f12] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Semua ({users.length})
                    </button>
                    <button
                        onClick={() => setRoleFilter('admin')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            roleFilter === 'admin' ? 'bg-white text-[#980f12] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Admin ({users.filter((u: any) => u.role === 'admin').length})
                    </button>
                    <button
                        onClick={() => setRoleFilter('operator')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            roleFilter === 'operator' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Operator ({users.filter((u: any) => u.role === 'operator').length})
                    </button>
                    <button
                        onClick={() => setRoleFilter('auditor')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            roleFilter === 'auditor' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Auditor ({users.filter((u: any) => u.role === 'auditor').length})
                    </button>
                    <button
                        onClick={() => setRoleFilter('public')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            roleFilter === 'public' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Masyarakat ({users.filter((u: any) => u.role === 'public').length})
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FiSearch size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama, email, atau SPBU..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Email & Penugasan</th>
                                <th className="px-6 py-4">Peran (Role)</th>
                                <th className="px-6 py-4">Status Akun</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((u: any) => (
                                <tr key={u.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#980f12] text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                                                {u.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="font-bold text-gray-900">{u.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-700 text-xs font-mono">{u.email}</div>
                                        {u.role === 'operator' && u.operator?.spbu && (
                                            <div className="text-[11px] text-blue-700 font-bold mt-1 inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                📍 SPBU: {u.operator.spbu.name} ({u.operator.spbu.code})
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(u.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            u.status === 'active' || !u.status 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {u.status === 'active' || !u.status ? 'Aktif' : u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button 
                                                onClick={() => openEditModal(u)} 
                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs" 
                                                title="Edit Akun"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(u)} 
                                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-2xs" 
                                                title="Hapus Akun"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        <FiUsers size={36} className="mx-auto mb-2 text-gray-300" />
                                        <p className="font-bold text-gray-700">Tidak ada data pengguna yang sesuai.</p>
                                        <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau tab filter peranan.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit User */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
                            <h3 className="text-base font-extrabold text-gray-900">{editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"><FiX size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Alamat Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required />
                                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">{editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Kata Sandi (Password)'}</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20" required={!editingUser} />
                                {errors.password && <p className="text-red-500 text-[11px] mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Peran / Hak Akses (Role)</label>
                                <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full border-gray-200 rounded-xl p-2.5 focus:border-[#980f12] focus:ring-2 focus:ring-[#980f12]/20 font-semibold">
                                    <option value="public">👤 Masyarakat Umum (Pengguna BBM Subsidi)</option>
                                    <option value="operator">⛽ Operator SPBU (Scanner & Validasi)</option>
                                    <option value="admin">🔴 Administrator Pertamina (Pusat & Review)</option>
                                    <option value="auditor">🟣 Auditor BPH Migas / Pemerintah (Ledger Blockchain)</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-[11px] mt-1">{errors.role}</p>}
                            </div>

                            {data.role === 'operator' && (
                                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200">
                                    <label className="block font-bold text-blue-900 mb-1.5">Tugaskan ke Lokasi SPBU</label>
                                    <select value={data.spbu_id} onChange={e => setData('spbu_id', e.target.value)} className="w-full border-blue-200 rounded-xl p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white font-medium" required={data.role === 'operator'}>
                                        <option value="">-- Pilih Lokasi SPBU --</option>
                                        {spbus && spbus.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                    {errors.spbu_id && <p className="text-red-500 text-[11px] mt-1">{errors.spbu_id}</p>}
                                    <p className="text-[11px] text-blue-700 mt-2">Operator hanya dapat mengakses dan memvalidasi transaksi pada SPBU yang dipilih.</p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 font-bold text-white bg-[#980f12] hover:bg-red-800 rounded-xl transition-colors disabled:opacity-50 shadow-md">
                                    {processing ? 'Menyimpan...' : 'Simpan Data Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

Users.layout = (page: any) => <AppLayout title="Manajemen Pengguna">{page}</AppLayout>;

