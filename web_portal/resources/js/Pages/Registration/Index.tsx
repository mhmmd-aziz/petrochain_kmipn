import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiPlus, FiClock, FiCheck, FiX, FiInfo } from 'react-icons/fi';

interface Application {
    id: number;
    status: string;
    submitted_at: string;
    vehicle: {
        plate_number: string;
        vehicle_type: string;
        brand: string;
        model: string;
    };
    admin_notes: string | null;
}

const statusColor = (status: string) => {
    switch(status) {
        case 'approved': return { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheck, label: 'Disetujui' };
        case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', icon: FiX, label: 'Ditolak' };
        case 'needs_reupload': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: FiInfo, label: 'Perlu Re-upload' };
        default: return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock, label: 'Menunggu Review' };
    }
}

export default function Index({ applications }: { applications: Application[] }) {
    return (
        <AppLayout title="Pendaftaran Kendaraan">
            <Head title="Pendaftaran Kendaraan" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Kendaraan Saya</h2>
                    <p className="text-gray-500 text-sm mt-1">Daftar kendaraan yang telah didaftarkan untuk subsidi.</p>
                </div>
                <Link
                    href="/registrations/create"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                    <FiPlus /> Daftar Baru
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {applications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Belum ada kendaraan yang didaftarkan.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Nomor Pelat</th>
                                <th className="px-6 py-4">Tipe Kendaraan</th>
                                <th className="px-6 py-4">Merek/Model</th>
                                <th className="px-6 py-4">Tanggal Pengajuan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map(app => {
                                const st = statusColor(app.status);
                                const Icon = st.icon;
                                return (
                                    <tr key={app.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                            {app.vehicle.plate_number}
                                        </td>
                                        <td className="px-6 py-4 capitalize">{app.vehicle.vehicle_type}</td>
                                        <td className="px-6 py-4">
                                            {app.vehicle.brand} {app.vehicle.model}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(app.submitted_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${st.bg} ${st.text}`}>
                                                <Icon size={12} /> {st.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {app.admin_notes || '-'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </AppLayout>
    );
}
