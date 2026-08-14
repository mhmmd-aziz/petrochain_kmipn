import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiCheck, FiX, FiInfo, FiEye, FiSearch } from 'react-icons/fi';

interface User {
    name: string;
    email: string;
    nik: string | null;
}

interface Vehicle {
    id: number;
    plate_number: string;
    vehicle_type: string;
    brand: string;
    model: string;
    engine_capacity_cc: number;
}

interface Application {
    id: number;
    status: string;
    stnk_file: string;
    vehicle_photo: string;
    submitted_at: string;
    admin_notes: string | null;
    vehicle: Vehicle;
    user: User;
    ocrResults?: any[];
}

export default function AdminRegistrations({ applications }: { applications: Application[] }) {
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        status: 'approved',
        admin_notes: '',
    });

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp) return;
        post(`/admin/registrations/${selectedApp.id}/review`, {
            onSuccess: () => {
                setSelectedApp(null);
                reset();
            }
        });
    };

    const pendingApps = applications.filter(a => a.status === 'pending_review');
    const processedApps = applications.filter(a => a.status !== 'pending_review');

    const getAiConclusion = (app: Application) => {
        if (!app.ocrResults || app.ocrResults.length === 0) return null;
        const result = app.ocrResults[0];
        return {
            conclusion: result.comparison_result, // SAMA, TIDAK SAMA, BURAM
            stnk_plate: app.ocrResults.find(r => r.source_type === 'stnk')?.extracted_plate,
            car_plate: app.ocrResults.find(r => r.source_type === 'vehicle_photo')?.extracted_plate,
        };
    };

    return (
        <AppLayout title="Review Pendaftaran">
            <Head title="Review Pendaftaran" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Pendaftaran Subsidi</h2>
                <p className="text-gray-500 text-sm mt-1">Daftar pengajuan kendaraan untuk subsidi BBM yang butuh review admin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Menunggu Review ({pendingApps.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Pemilik</th>
                                        <th className="px-4 py-3">Pelat</th>
                                        <th className="px-4 py-3">Kendaraan</th>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingApps.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{app.user.name}</div>
                                                <div className="text-xs text-gray-500">{app.user.nik || app.user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold">{app.vehicle.plate_number}</td>
                                            <td className="px-4 py-3 capitalize">{app.vehicle.brand} {app.vehicle.model}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(app.submitted_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button 
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center gap-1 text-primary hover:bg-red-50 px-2 py-1 rounded"
                                                >
                                                    <FiEye /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingApps.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-500">Tidak ada pengajuan pending.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Review Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Panel Review</h3>
                        
                        {!selectedApp ? (
                            <div className="text-center py-10 text-gray-400">
                                <FiSearch className="mx-auto text-3xl mb-2" />
                                <p className="text-sm">Pilih pengajuan untuk di-review</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(() => {
                                    const ai = getAiConclusion(selectedApp);
                                    if (!ai) return null;
                                    
                                    const isMatch = ai.conclusion === 'SAMA';
                                    return (
                                        <div className={`p-3 rounded-lg border text-sm ${isMatch ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <div className="font-bold mb-1 flex items-center gap-1">
                                                {isMatch ? <FiCheck className="text-green-600"/> : <FiX className="text-red-600"/>}
                                                AI Rekomendasi: {ai.conclusion}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                                                <div>
                                                    <span className="block opacity-75">OCR STNK:</span>
                                                    <strong className="font-mono">{ai.stnk_plate || '-'}</strong>
                                                </div>
                                                <div>
                                                    <span className="block opacity-75">OCR Fisik:</span>
                                                    <strong className="font-mono">{ai.car_plate || '-'}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs">Nomor Pelat</div>
                                        <div className="font-mono font-bold">{selectedApp.vehicle.plate_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Pemilik</div>
                                        <div className="font-medium">{selectedApp.user.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Kapasitas Mesin</div>
                                        <div className="font-medium">{selectedApp.vehicle.engine_capacity_cc} CC</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Tipe</div>
                                        <div className="font-medium capitalize">{selectedApp.vehicle.vehicle_type}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="text-sm font-medium text-gray-700">Dokumen STNK</div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                        {selectedApp.stnk_file ? (
                                            <a href={`/storage/${selectedApp.stnk_file}`} target="_blank" rel="noreferrer">
                                                <img src={`/storage/${selectedApp.stnk_file}`} className="w-full h-32 object-cover hover:opacity-80 transition" alt="STNK" />
                                            </a>
                                        ) : <div className="p-4 text-center text-xs text-gray-400">Tidak ada file</div>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Foto Fisik Kendaraan</div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                        {selectedApp.vehicle_photo ? (
                                            <a href={`/storage/${selectedApp.vehicle_photo}`} target="_blank" rel="noreferrer">
                                                <img src={`/storage/${selectedApp.vehicle_photo}`} className="w-full h-32 object-cover hover:opacity-80 transition" alt="Kendaraan" />
                                            </a>
                                        ) : <div className="p-4 text-center text-xs text-gray-400">Tidak ada file</div>}
                                    </div>
                                </div>

                                <form onSubmit={handleReview} className="pt-4 border-t border-gray-100 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Keputusan</label>
                                        <select 
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded focus:border-primary focus:ring focus:ring-primary/20"
                                        >
                                            <option value="approved">Setujui (Valid)</option>
                                            <option value="rejected">Tolak (Tidak Valid)</option>
                                            <option value="needs_reupload">Minta Re-Upload (Burem)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                        <textarea 
                                            value={data.admin_notes}
                                            onChange={e => setData('admin_notes', e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded focus:border-primary focus:ring focus:ring-primary/20"
                                            rows={2}
                                            placeholder="Misal: Foto STNK blur..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedApp(null)}
                                            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={processing}
                                            className="px-3 py-1.5 text-sm bg-primary text-white hover:bg-primary/90 rounded disabled:opacity-50"
                                        >
                                            Kirim Review
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
