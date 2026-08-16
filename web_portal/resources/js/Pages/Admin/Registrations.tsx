import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiCheck, FiX, FiInfo, FiEye, FiSearch, FiAlertTriangle, FiCheckCircle, FiXCircle, FiZap } from 'react-icons/fi';

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

            {!selectedApp ? (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Menunggu Review ({pendingApps.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-4 rounded-tl-lg">Pemilik</th>
                                        <th className="px-5 py-4">Pelat</th>
                                        <th className="px-5 py-4">Kendaraan</th>
                                        <th className="px-5 py-4">Waktu</th>
                                        <th className="px-5 py-4 rounded-tr-lg">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingApps.map(app => (
                                        <tr key={app.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-0">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-gray-900">{app.user.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{app.user.nik || app.user.email}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-700 tracking-wide">{app.vehicle.plate_number}</span>
                                            </td>
                                            <td className="px-5 py-4 capitalize font-medium text-gray-700">{app.vehicle.brand} {app.vehicle.model}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 font-medium">
                                                {new Date(app.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button 
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center gap-1.5 bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-all px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md"
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
            ) : (
                <div className="space-y-6">
                    <button 
                        onClick={() => setSelectedApp(null)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <FiX /> Kembali ke Daftar
                    </button>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-6xl mx-auto">
                        <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg">Detail Komparasi & Review</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                {(() => {
                                    const ai = getAiConclusion(selectedApp);
                                    
                                    const isMatch = ai?.conclusion === 'match';
                                    const isLowConf = ai?.conclusion === 'low_confidence' || !ai;
                                    
                                    let conclusionLabel = "Belum Diproses";
                                    let conclusionStyle = "bg-gray-100 border-gray-300 text-gray-700";
                                    if (ai?.conclusion === 'match') { conclusionLabel = "PELAT COCOK"; conclusionStyle = "bg-green-50 border-green-400 text-green-800"; }
                                    if (ai?.conclusion === 'mismatch') { conclusionLabel = "PELAT TIDAK SAMA"; conclusionStyle = "bg-red-50 border-red-400 text-red-800"; }
                                    if (ai?.conclusion === 'low_confidence') { conclusionLabel = "KURANG JELAS / BURAM"; conclusionStyle = "bg-yellow-50 border-yellow-400 text-yellow-800"; }

                                    return (
                                        <div className="space-y-3">
                                            {/* AI Validation Warning */}
                                            {selectedApp.admin_notes && selectedApp.admin_notes.includes('[AI WARNING]') && (
                                                <div className="rounded-xl overflow-hidden border border-orange-200 shadow-sm">
                                                    <div className="bg-orange-500 px-4 py-2.5 flex items-center gap-2">
                                                        <FiAlertTriangle className="text-white flex-shrink-0" size={15} />
                                                        <span className="text-white font-bold text-xs uppercase tracking-wider">Peringatan AI</span>
                                                    </div>
                                                    <div className="bg-orange-50 px-4 py-3">
                                                        <ul className="space-y-1.5">
                                                            {selectedApp.admin_notes.split('\n')
                                                                .filter((note: string) => note.includes('[AI WARNING]'))
                                                                .map((note: string, idx: number) => (
                                                                    <li key={idx} className="text-xs text-orange-900 flex items-start gap-2">
                                                                        <FiX className="flex-shrink-0 mt-0.5 text-orange-600" size={12} />
                                                                        <span>{note.replace('[AI WARNING] ', '')}</span>
                                                                    </li>
                                                                ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Verdict Banner */}
                                            <div className={`rounded-xl border-l-4 shadow-sm font-bold flex items-center gap-3 px-4 py-3.5 ${conclusionStyle}`}>
                                                <div className="flex-shrink-0 p-1.5 rounded-lg bg-white/60">
                                                    {ai?.conclusion === 'match'
                                                        ? <FiCheckCircle size={18} />
                                                        : ai?.conclusion === 'mismatch'
                                                        ? <FiXCircle size={18} />
                                                        : <FiAlertTriangle size={18} />
                                                    }
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium opacity-70 uppercase tracking-widest">Hasil Verifikasi AI</div>
                                                    <div className="text-sm tracking-wide">{conclusionLabel}</div>
                                                </div>
                                            </div>

                                            {/* Premium Comparison Cards */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                                <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-2.5 border-b border-gray-100">
                                                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                                                        Detail Komparasi
                                                    </h4>
                                                </div>
                                                {/* Header row */}
                                                <div className="grid grid-cols-3 gap-0 text-xs font-bold uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                                                    <div className="px-3 py-2 text-gray-500">Atribut</div>
                                                    <div className="px-3 py-2 text-center text-blue-600 bg-blue-50/40 border-x border-gray-100">Input User</div>
                                                    <div className="px-3 py-2 text-center text-purple-600 bg-purple-50/40">OCR AI</div>
                                                </div>
                                                {/* Data rows */}
                                                {[
                                                    {
                                                        label: 'Pelat STNK',
                                                        user: <span className="font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{selectedApp.vehicle.plate_number}</span>,
                                                        ai: ai?.stnk_plate
                                                            ? <span className="font-mono font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{ai.stnk_plate}</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap">— tdk terbaca</span>,
                                                    },
                                                    {
                                                        label: 'Pelat Fisik',
                                                        user: <span className="font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{selectedApp.vehicle.plate_number}</span>,
                                                        ai: ai?.car_plate
                                                            ? <span className="font-mono font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{ai.car_plate}</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap">— tdk terbaca</span>,
                                                    },
                                                    {
                                                        label: 'CC Mesin',
                                                        user: selectedApp.vehicle.engine_capacity_cc
                                                            ? <span className="font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{selectedApp.vehicle.engine_capacity_cc} CC</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap italic">tdk diinput</span>,
                                                        ai: ai?.stnk_cc
                                                            ? <span className="font-mono font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded text-xs whitespace-nowrap">{ai.stnk_cc} CC</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap">— tdk terbaca</span>,
                                                    },
                                                    {
                                                        label: 'Tipe Bensin',
                                                        user: selectedApp.vehicle.fuel_type
                                                            ? <span className="font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-xs whitespace-nowrap uppercase">{selectedApp.vehicle.fuel_type}</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap italic">tdk diinput</span>,
                                                        ai: <span className="text-gray-400 text-xs whitespace-nowrap">— tidak dicek</span>,
                                                    },
                                                    {
                                                        label: 'Pemilik',
                                                        user: null,
                                                        ai: null,
                                                        full: <span className="font-semibold text-gray-800 text-xs col-span-2">{selectedApp.user.name}</span>,
                                                    },
                                                    {
                                                        label: 'Jenis STNK',
                                                        user: <span className={`font-bold border px-2 py-0.5 rounded text-xs whitespace-nowrap ${selectedApp.vehicle.vehicle_type === 'car' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                                            {selectedApp.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}
                                                        </span>,
                                                        ai: ai?.stnk_type === 'car_stnk'
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"><FiCheck className="flex-shrink-0" />Mobil</span>
                                                            : ai?.stnk_type === 'motorcycle_stnk'
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"><FiAlertTriangle className="flex-shrink-0" />Motor</span>
                                                            : ai?.stnk_type === 'unverified'
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"><FiInfo className="flex-shrink-0" />Blurry?</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap">— gagal</span>,
                                                    },
                                                    {
                                                        label: 'Tipe Fisik',
                                                        user: <span className={`font-bold border px-2 py-0.5 rounded text-xs whitespace-nowrap ${selectedApp.vehicle.vehicle_type === 'car' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                                            {selectedApp.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}
                                                        </span>,
                                                        ai: ai?.car_type === 'car'
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"><FiCheck className="flex-shrink-0" />Mobil</span>
                                                            : ai?.car_type === 'motorcycle'
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-xs whitespace-nowrap"><FiAlertTriangle className="flex-shrink-0" />Motor</span>
                                                            : ai?.car_type
                                                            ? <span className="inline-flex items-center gap-1 font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded text-xs whitespace-nowrap capitalize"><FiInfo className="flex-shrink-0" />{ai.car_type.replace('_',' ')}</span>
                                                            : <span className="text-gray-400 text-xs whitespace-nowrap">— gagal</span>,
                                                    },
                                                ].map((row, idx) => (
                                                    <div key={idx} className={`grid grid-cols-3 gap-0 items-center border-b border-gray-50 last:border-0 text-xs ${idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                                                        <div className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">{row.label}</div>
                                                        {row.full ? (
                                                            <div className="px-3 py-2.5 text-center col-span-2 border-l border-gray-100">{row.full}</div>
                                                        ) : (
                                                            <>
                                                                <div className="px-3 py-2.5 text-center border-x border-gray-100 bg-blue-50/20 flex justify-center items-center">{row.user}</div>
                                                                <div className="px-3 py-2.5 text-center bg-purple-50/20 flex justify-center items-center">{row.ai}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold text-gray-700">Dokumen STNK</div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 relative group aspect-[4/3]">
                                            {selectedApp.stnk_file ? (
                                                <a href={`/storage/${selectedApp.stnk_file}`} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                    <img src={`/storage/${selectedApp.stnk_file}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in" alt="STNK" />
                                                </a>
                                            ) : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Tidak ada file</div>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold text-gray-700">Fisik Kendaraan</div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 relative group aspect-[4/3]">
                                            {selectedApp.vehicle_photo ? (
                                                <a href={`/storage/${selectedApp.vehicle_photo}`} target="_blank" rel="noreferrer" className="block w-full h-full">
                                                    <img src={`/storage/${selectedApp.vehicle_photo}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-zoom-in" alt="Kendaraan" />
                                                </a>
                                            ) : <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Tidak ada file</div>}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleReview} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                                    <h4 className="font-bold text-gray-800 text-sm border-b border-gray-200 pb-2 mb-2">Keputusan Admin</h4>
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
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

AdminRegistrations.layout = (page: any) => <AppLayout title="Review Pendaftaran">{page}</AppLayout>;
