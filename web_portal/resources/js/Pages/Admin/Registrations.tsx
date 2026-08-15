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
    ocr_results?: any[];
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
        if (!app.ocr_results || app.ocr_results.length === 0) return null;
        const stnkResult = app.ocr_results.find(r => r.source_type === 'stnk');
        const carResult = app.ocr_results.find(r => r.source_type === 'vehicle_photo');
        return {
            conclusion: stnkResult?.comparison_result ?? carResult?.comparison_result,
            stnk_plate: stnkResult?.extracted_plate,
            car_plate: carResult?.extracted_plate,
            // CC is stored in normalized_result on the stnk row if it contains 'CC'
            stnk_cc: stnkResult?.normalized_result?.match(/(\d+)\s*CC/i)?.[1] ?? null,
            stnk_type: stnkResult?.normalized_result?.match(/DOC:([\w_]+)/)?.[1] ?? null,
            car_type: carResult?.normalized_result?.match(/CAR:([\w_]+)/)?.[1] ?? null,
        };
    };

    return (
        <>
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
                                    
                                    const isMatch = ai?.conclusion === 'match';
                                    const isLowConf = ai?.conclusion === 'low_confidence' || !ai;
                                    
                                    let conclusionLabel = "Belum Diproses";
                                    let conclusionStyle = "bg-gray-50 border-gray-200 text-gray-600";
                                    if (ai?.conclusion === 'match') { conclusionLabel = "✓ PELAT SAMA"; conclusionStyle = "bg-green-50 border-green-300 text-green-800"; }
                                    if (ai?.conclusion === 'mismatch') { conclusionLabel = "✗ PELAT TIDAK SAMA"; conclusionStyle = "bg-red-50 border-red-300 text-red-800"; }
                                    if (ai?.conclusion === 'low_confidence') { conclusionLabel = "⚠ BURAM / KURANG JELAS"; conclusionStyle = "bg-yellow-50 border-yellow-300 text-yellow-800"; }

                                    return (
                                        <div className="space-y-3">
                                            {/* AI Validation Warning */}
                                            {selectedApp.admin_notes && selectedApp.admin_notes.includes('[AI WARNING]') && (
                                                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-sm font-medium flex items-start gap-2">
                                                    <span className="text-red-600 mt-0.5">⚠️</span>
                                                    <div>
                                                        <div className="font-bold mb-1">PERINGATAN AI: Tidak Memenuhi Syarat</div>
                                                        <ul className="text-xs list-disc list-inside space-y-1">
                                                            {selectedApp.admin_notes.split('\n')
                                                                .filter((note: string) => note.includes('[AI WARNING]'))
                                                                .map((note: string, idx: number) => (
                                                                    <li key={idx}>{note.replace('[AI WARNING] ', '')}</li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Verdict Banner */}
                                            <div className={`p-2.5 rounded-lg border text-sm font-bold text-center ${conclusionStyle}`}>
                                                Hasil AI: {conclusionLabel}
                                            </div>

                                            {/* Comparison Table */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <th className="px-2 py-1.5 text-left text-gray-500 font-medium w-1/3">Data</th>
                                                            <th className="px-2 py-1.5 text-center text-blue-600 font-semibold">Input User</th>
                                                            <th className="px-2 py-1.5 text-center text-purple-600 font-semibold">OCR AI</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {/* Plate from STNK */}
                                                        <tr>
                                                            <td className="px-2 py-2 text-gray-500">Pelat (STNK)</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                    {selectedApp.vehicle.plate_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${ai?.stnk_plate ? 'text-purple-700 bg-purple-50' : 'text-gray-400 italic'}`}>
                                                                    {ai?.stnk_plate || 'tdk terbaca'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {/* Plate from Car Photo */}
                                                        <tr>
                                                            <td className="px-2 py-2 text-gray-500">Pelat (Fisik)</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                    {selectedApp.vehicle.plate_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${ai?.car_plate ? 'text-purple-700 bg-purple-50' : 'text-gray-400 italic'}`}>
                                                                    {ai?.car_plate || 'tdk terbaca'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        {/* CC */}
                                                        <tr className="bg-gray-50/50">
                                                            <td className="px-2 py-2 text-gray-500">CC Mesin</td>
                                                            <td className="px-2 py-2 text-center">
                                                                <span className="text-gray-400 italic text-xs">tidak diinput</span>
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                {ai?.stnk_cc ? (
                                                                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                                                                        {ai.stnk_cc} CC
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-xs">tdk terbaca</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {/* Owner */}
                                                        <tr>
                                                            <td className="px-2 py-2 text-gray-500">Pemilik</td>
                                                            <td colSpan={2} className="px-2 py-2 text-center font-medium text-gray-700">
                                                                {selectedApp.user.name}
                                                            </td>
                                                        </tr>
                                                        {/* Jenis STNK */}
                                                        <tr className="bg-gray-50/50">
                                                            <td className="px-2 py-2 text-gray-500">Jenis Dok. STNK</td>
                                                            <td className="px-2 py-2 text-center font-medium text-blue-700">
                                                                {selectedApp.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                {ai?.stnk_type === 'car_stnk' ? (
                                                                    <span className="text-green-700 font-semibold text-xs px-2 py-1 rounded bg-green-100 border border-green-200">Mobil</span>
                                                                ) : ai?.stnk_type === 'motorcycle_stnk' ? (
                                                                    <span className="text-red-700 font-semibold text-xs px-2 py-1 rounded bg-red-100 border border-red-200">Motor</span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-xs">tdk terdeteksi</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {/* Tipe Fisik (YOLO) */}
                                                        <tr>
                                                            <td className="px-2 py-2 text-gray-500">Tipe Fisik (YOLO)</td>
                                                            <td className="px-2 py-2 text-center font-medium text-blue-700">
                                                                {selectedApp.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                {ai?.car_type === 'car' ? (
                                                                    <span className="text-green-700 font-semibold text-xs px-2 py-1 rounded bg-green-100 border border-green-200">Mobil</span>
                                                                ) : ai?.car_type === 'motorcycle' ? (
                                                                    <span className="text-red-700 font-semibold text-xs px-2 py-1 rounded bg-red-100 border border-red-200">Motor</span>
                                                                ) : ai?.car_type ? (
                                                                    <span className="text-yellow-700 font-semibold text-xs px-2 py-1 rounded bg-yellow-100 border border-yellow-200 capitalize">{ai.car_type.replace('_', ' ')}</span>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-xs">tdk terdeteksi</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="space-y-2 mt-4">
                                    <div className="text-sm font-medium text-gray-700">Dokumen STNK <span className="text-xs text-gray-400">(klik untuk perbesar)</span></div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                        {selectedApp.stnk_file ? (
                                            <a href={`/storage/${selectedApp.stnk_file}`} target="_blank" rel="noreferrer">
                                                <img src={`/storage/${selectedApp.stnk_file}`} className="w-full h-32 object-cover hover:opacity-80 transition" alt="STNK" />
                                            </a>
                                        ) : <div className="p-4 text-center text-xs text-gray-400">Tidak ada file</div>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Foto Fisik Kendaraan <span className="text-xs text-gray-400">(klik untuk perbesar)</span></div>
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
                                            Simpan Keputusan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminRegistrations.layout = (page: any) => <AppLayout title="Review Pendaftaran">{page}</AppLayout>;
