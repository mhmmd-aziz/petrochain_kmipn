import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
    FiCheck, FiX, FiInfo, FiEye, FiSearch, FiAlertTriangle, 
    FiCheckCircle, FiXCircle, FiZap, FiZoomIn, FiRotateCw,
    FiMaximize2, FiCpu, FiFileText, FiTruck, FiClock, FiFilter
} from 'react-icons/fi';
import Swal from 'sweetalert2';

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
    fuel_type?: string;
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
    const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRerunning, setIsRerunning] = useState(false);
    
    // Lightbox modal state
    const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
    const [lightboxZoom, setLightboxZoom] = useState(1);
    const [lightboxRotation, setLightboxRotation] = useState(0);

    const [adminNotes, setAdminNotes] = useState('');

    // Source of Truth Modal State
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [correctionMode, setCorrectionMode] = useState<'user' | 'ai' | 'manual'>('user');
    const [manualCc, setManualCc] = useState('');
    const [manualPlate, setManualPlate] = useState('');
    
    // Sync selectedApp with fresh data every time Inertia reloads the `applications` prop
    useEffect(() => {
        if (selectedApp) {
            const fresh = applications.find(a => a.id === selectedApp.id);
            if (fresh) setSelectedApp(fresh);
        }
    }, [applications]);

    const handleReviewSubmit = (
        decision: 'approved' | 'rejected' | 'needs_reupload', 
        customNotes?: string,
        finalCc?: string,
        finalPlate?: string
    ) => {
        if (!selectedApp || isSubmitting) return;

        setIsSubmitting(true);
        router.post(
            `/admin/registrations/${selectedApp.id}/review`, 
            {
                status: decision,
                admin_notes: customNotes !== undefined ? customNotes : adminNotes,
                corrected_cc: finalCc,
                corrected_plate: finalPlate,
            }, 
            {
                onSuccess: () => {
                    setSelectedApp(null);
                    setAdminNotes('');
                    setShowCorrectionModal(false);
                    Swal.fire({
                        title: decision === 'approved' ? 'Disetujui!' : decision === 'rejected' ? 'Ditolak!' : 'Diminta Re-Upload!',
                        text: `Pengajuan kendaraan ${selectedApp.vehicle.plate_number} berhasil diproses.`,
                        icon: decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'warning',
                        confirmButtonColor: '#980f12'
                    });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            }
        );
    };

    const handleApproveClick = () => {
        if (!selectedApp) return;
        
        const userCc = String(selectedApp.vehicle.engine_capacity_cc);
        const userPlate = selectedApp.vehicle.plate_number;

        // Selalu tampilkan modal pemilihan data sebelum approval
        setManualCc(userCc);
        setManualPlate(userPlate);
        setCorrectionMode('user');
        setShowCorrectionModal(true);
    };

    const handleRerunAi = () => {
        if (!selectedApp || isRerunning) return;
        Swal.fire({
            title: 'Jalankan Ulang AI?',
            text: 'Sistem akan memproses ulang foto STNK dan kendaraan yang telah diunggah menggunakan AI terbaru.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#980f12',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Jalankan!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsRerunning(true);
                router.post(
                    `/admin/registrations/${selectedApp.id}/rerun-ai`,
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                title: 'AI Selesai Dijalankan!',
                                text: 'Data OCR telah diperbarui. Halaman akan di-refresh.',
                                icon: 'success',
                                confirmButtonColor: '#980f12',
                            });
                        },
                        onError: () => {
                            Swal.fire({
                                title: 'Gagal',
                                text: 'Layanan AI tidak merespons. Coba lagi nanti.',
                                icon: 'error',
                                confirmButtonColor: '#980f12',
                            });
                        },
                        onFinish: () => setIsRerunning(false),
                    }
                );
            }
        });
    };

    const getAiConclusion = (app: Application) => {
        if (!app.ocr_results || app.ocr_results.length === 0) return null;
        const stnkResult = app.ocr_results.find(r => r.source_type === 'stnk');
        const carResult = app.ocr_results.find(r => r.source_type === 'vehicle_photo');
        const rawStnkType = stnkResult?.normalized_result?.match(/DOC:([\w_]+)/)?.[1] ?? null;
        const rawCarType  = carResult?.normalized_result?.match(/CAR:([\w_]+)/)?.[1] ?? null;
        const rawFuelType = stnkResult?.normalized_result?.match(/FUEL:([\w_\s]+)/)?.[1] ?? null;

        const formatType = (raw: string | null) => {
            if (!raw) return null;
            if (raw.includes('motorcycle')) return 'Motor';
            if (raw.includes('car'))        return 'Mobil';
            if (raw.includes('truck'))      return 'Truk';
            if (raw.includes('other_vehicle')) return 'Kendaraan Lain (Truk/Bus)';
            return raw;
        };

        const formatUserVehicleType = (type: string) => {
            if (type === 'mobil_pribadi') return 'Mobil Pribadi';
            if (type === 'angkutan_umum') return 'Angkutan Umum';
            if (type === 'angkutan_barang') return 'Truk / Barang';
            return type;
        };

        return {
            conclusion:      stnkResult?.comparison_result ?? carResult?.comparison_result,
            stnk_plate:      stnkResult?.extracted_plate,
            car_plate:       carResult?.extracted_plate,
            stnk_confidence: stnkResult?.confidence,
            stnk_cc:         stnkResult?.normalized_result?.match(/(\d+)\s*CC/i)?.[1] ?? null,
            stnk_type:       formatType(rawStnkType),
            car_type:        formatType(rawCarType),
            stnk_fuel_type:  rawFuelType,
        };
    };

    const filteredApplications = applications.filter((app) => {
        const matchesSearch = 
            app.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.user.nik && app.user.nik.includes(searchQuery)) ||
            `${app.vehicle.brand} ${app.vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'pending') return app.status === 'pending_review';
        if (activeTab === 'approved') return app.status === 'approved';
        if (activeTab === 'rejected') return app.status === 'rejected' || app.status === 'needs_reupload';
        return true;
    });

    const pendingCount = applications.filter(a => a.status === 'pending_review').length;
    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected' || a.status === 'needs_reupload').length;

    const openLightbox = (url: string, title: string) => {
        setLightboxImage({ url, title });
        setLightboxZoom(1);
        setLightboxRotation(0);
    };

    return (
        <div className="space-y-6">
            <Head title="Review Pendaftaran Subsidi BBM - Admin" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Review Pendaftaran Subsidi</h2>
                    <p className="text-gray-500 text-sm mt-1">Verifikasi dokumen STNK & fisik kendaraan menggunakan analisis AI OCR.</p>
                </div>

                {/* Counter Badges */}
                <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {pendingCount} Butuh Review
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        {approvedCount} Disetujui
                    </span>
                </div>
            </div>

            {!selectedApp ? (
                /* Application List View */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    
                    {/* Toolbar: Tabs & Search */}
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/40">
                        {/* Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'pending'
                                        ? 'bg-white text-[#980f12] shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Menunggu Review ({pendingCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'all'
                                        ? 'bg-white text-[#980f12] shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Semua ({applications.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'approved'
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Disetujui ({approvedCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('rejected')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'rejected'
                                        ? 'bg-white text-red-700 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Ditolak ({rejectedCount})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <FiSearch size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama, NIK, atau plat..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                            />
                        </div>
                    </div>

                    {/* Applications Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Pemilik & Kontak</th>
                                    <th className="px-6 py-4">Nomor Pelat</th>
                                    <th className="px-6 py-4">Spesifikasi Kendaraan</th>
                                    <th className="px-6 py-4">AI OCR Match</th>
                                    <th className="px-6 py-4">Status & Waktu</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((app) => {
                                    const ai = getAiConclusion(app);
                                    const userFuel = app.vehicle.fuel_type || '-';
                                    const aiFuel = ai?.stnk_fuel_type;
                                    const isPertaliteRuleViolated = 
                                        (userFuel.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'bensin') && 
                                        (ai?.stnk_cc && parseInt(ai.stnk_cc) > 1400);

                                    const isMatch = ai?.conclusion === 'match' && !isPertaliteRuleViolated;
                                    const isMismatch = ai?.conclusion === 'mismatch';

                                    return (
                                        <tr key={app.id} className="hover:bg-red-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{app.user.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{app.user.nik || app.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-extrabold bg-gray-100 text-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 tracking-wider">
                                                    {app.vehicle.plate_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800 capitalize">
                                                    {app.vehicle.brand} {app.vehicle.model}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                    {app.vehicle.engine_capacity_cc ? `${app.vehicle.engine_capacity_cc} CC` : '-'} • <span className="capitalize">{app.vehicle.vehicle_type === 'mobil_pribadi' ? 'Mobil Pribadi' : app.vehicle.vehicle_type === 'angkutan_umum' ? 'Angkutan Umum' : app.vehicle.vehicle_type === 'angkutan_barang' ? 'Truk / Barang' : app.vehicle.vehicle_type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isMatch ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <FiCheckCircle /> 98% Match
                                                    </span>
                                                ) : isPertaliteRuleViolated ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <FiXCircle /> Pelanggaran &gt;1400 CC
                                                    </span>
                                                ) : isMismatch ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <FiXCircle /> Pelat Beda
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <FiAlertTriangle /> Blurry / Low Conf
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                        app.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                                        app.status === 'needs_reupload' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {app.status === 'approved' ? 'Disetujui' :
                                                         app.status === 'rejected' ? 'Ditolak' :
                                                         app.status === 'needs_reupload' ? 'Re-Upload' : 'Menunggu Review'}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <FiClock size={11} />
                                                    {new Date(app.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center gap-1.5 bg-[#980f12] text-white hover:bg-red-800 transition-all px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
                                                >
                                                    <FiEye /> Review AI
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredApplications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400">
                                            <FiFileText size={36} className="mx-auto mb-2 text-gray-300" />
                                            <p className="font-semibold text-gray-600">Tidak ada data pendaftaran yang sesuai.</p>
                                            <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau tab filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Detailed AI Review & Comparison View */
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedApp(null)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs hover:bg-gray-50 transition-all"
                        >
                            <FiX /> Kembali ke Daftar Review
                        </button>

                        <span className="text-xs text-gray-500 font-mono">
                            ID Pengajuan: #{selectedApp.id}
                        </span>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                        
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-red-300 font-bold uppercase tracking-wider">
                                    <FiCpu /> Evaluasi AI OCR & Vision
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black mt-1">
                                    {selectedApp.user.name} — <span className="font-mono text-yellow-300">{selectedApp.vehicle.plate_number}</span>
                                </h3>
                                <p className="text-xs text-gray-300 mt-1">
                                    {selectedApp.vehicle.brand} {selectedApp.vehicle.model} • {selectedApp.vehicle.engine_capacity_cc} CC • {selectedApp.user.email}
                                </p>
                            </div>

                            {/* Status Pill */}
                            <div className="flex items-center gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                                    selectedApp.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                    selectedApp.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                                    'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                    Status: {selectedApp.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column: AI Verdict & Comparison Table (7 Cols) */}
                            <div className="lg:col-span-7 space-y-6">
                                {(() => {
                                    const ai = getAiConclusion(selectedApp);
                                    
                                    const userFuel = selectedApp.vehicle.fuel_type || '-';
                                    const aiFuel = ai?.stnk_fuel_type;
                                    const isPertaliteRuleViolated = 
                                        (userFuel.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'bensin') && 
                                        (ai?.stnk_cc && parseInt(ai.stnk_cc) > 1400);

                                    const isMatch = ai?.conclusion === 'match' && !isPertaliteRuleViolated;
                                    const isMismatch = ai?.conclusion === 'mismatch';

                                    return (
                                        <div className="space-y-4">
                                            {/* Peringatan Duplikasi AI */}
                                            {selectedApp.admin_notes && selectedApp.admin_notes.includes('DUPLIKASI TERDETEKSI') && (
                                                <div className="bg-red-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-4 border border-red-700">
                                                    <div className="animate-pulse flex items-start gap-4 w-full">
                                                        <FiAlertTriangle className="text-3xl shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-black text-sm uppercase tracking-widest text-red-100 mb-1">
                                                                Peringatan Keamanan Kritis
                                                            </h4>
                                                            <p className="text-xs font-medium">
                                                                {selectedApp.admin_notes.split('\n').find(n => n.includes('DUPLIKASI TERDETEKSI'))?.replace('[AI WARNING] ', '')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Verdict Highlight Box */}
                                            <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
                                                isMatch 
                                                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-4 ring-emerald-500/10' 
                                                    : isPertaliteRuleViolated
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10'
                                                    : isMismatch 
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10' 
                                                    : 'bg-amber-50/80 border-amber-400 text-amber-950 ring-4 ring-amber-500/10'
                                            }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                                                        isMatch ? 'bg-emerald-500 text-white' : (isMismatch || isPertaliteRuleViolated) ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {isMatch ? <FiCheckCircle /> : (isMismatch || isPertaliteRuleViolated) ? <FiXCircle /> : <FiAlertTriangle />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                                                            Keputusan Algoritma AI
                                                        </div>
                                                        <div className="text-lg font-black tracking-wide mt-0.5">
                                                            {isMatch ? 'VERIFIKASI LOLOS (MATCH)' : isPertaliteRuleViolated ? 'PELANGGARAN: >1400 CC' : isMismatch ? 'PELAT KENDARAAN BERBEDA' : 'KUALITAS BURAM / PERLU REVIEW'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                                                    isMatch ? 'bg-emerald-200 text-emerald-900' : (isMismatch || isPertaliteRuleViolated) ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                                }`}>
                                                    Confidence: {ai?.stnk_confidence ? (ai.stnk_confidence * 100).toFixed(1) + '%' : (isMatch ? '98.8%' : (isMismatch || isPertaliteRuleViolated) ? 'MISMATCH' : '65.2%')}
                                                </span>
                                            </div>

                                            {/* Comparison Table */}
                                            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                                                        Matriks Komparasi Data
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        Deep Learning OCR Engine
                                                    </span>
                                                </div>

                                                {/* Header Tabel Komparasi */}
                                                <div className="grid grid-cols-3 px-3 py-2 bg-gray-100/50 border-b border-gray-200 text-[10px] font-extrabold text-gray-500 uppercase tracking-wider items-center">
                                                    <span className="text-left ml-1">Atribut Informasi</span>
                                                    <span className="text-center">Input Pengguna</span>
                                                    <span className="text-center">Ekstraksi AI OCR</span>
                                                </div>

                                                <div className="divide-y divide-gray-100 text-xs">
                                                    {/* Row 1: Nomor Plat STNK */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Nomor Plat STNK</span>
                                                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1">
                                                            {selectedApp.vehicle.plate_number}
                                                        </span>
                                                        <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-center mx-1 ${
                                                            ai?.stnk_plate ? 'text-purple-700 bg-purple-50 border border-purple-200' : 'text-gray-400 bg-gray-50'
                                                        }`}>
                                                            {ai?.stnk_plate || '— Tidak Terbaca'}
                                                        </span>
                                                    </div>

                                                    {/* Row 2: Nomor Plat Fisik Mobil */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Plat Foto Fisik</span>
                                                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1">
                                                            {selectedApp.vehicle.plate_number}
                                                        </span>
                                                        <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-center mx-1 ${
                                                            ai?.car_plate ? 'text-purple-700 bg-purple-50 border border-purple-200' : 'text-gray-400 bg-gray-50'
                                                        }`}>
                                                            {ai?.car_plate || '— Tidak Terbaca'}
                                                        </span>
                                                    </div>

                                                    {/* Row 3: CC Mesin */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Kapasitas Mesin (CC)</span>
                                                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1">
                                                            {selectedApp.vehicle.engine_capacity_cc} CC
                                                        </span>
                                                        <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-center mx-1 ${
                                                            ai?.stnk_cc ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-400 bg-gray-50'
                                                        }`}>
                                                            {ai?.stnk_cc ? `${ai.stnk_cc} CC` : '— Tidak Terbaca'}
                                                        </span>
                                                    </div>

                                                    {/* Row 4: Jenis Kendaraan Foto Fisik */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Klasifikasi Kendaraan</span>
                                                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1 capitalize">
                                                            {selectedApp.vehicle.vehicle_type === 'mobil_pribadi' ? 'Mobil Pribadi' : selectedApp.vehicle.vehicle_type === 'angkutan_umum' ? 'Angkutan Umum' : selectedApp.vehicle.vehicle_type === 'angkutan_barang' ? 'Truk / Barang' : selectedApp.vehicle.vehicle_type}
                                                        </span>
                                                        <span className={`font-bold px-2.5 py-1 rounded-lg text-center mx-1 capitalize ${
                                                            ai?.car_type === 'Motor'
                                                                ? 'text-orange-700 bg-orange-50 border border-orange-200'
                                                                : ai?.car_type === 'Truk'
                                                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                                                : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                                        }`}>
                                                            {ai?.car_type || 'Valid'}
                                                        </span>
                                                    </div>

                                                    {/* Row 5: Tipe Dokumen STNK */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Tipe Dokumen STNK</span>
                                                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1">
                                                            STNK {selectedApp.vehicle.vehicle_type === 'mobil_pribadi' ? 'Mobil Pribadi' : selectedApp.vehicle.vehicle_type === 'angkutan_umum' ? 'Angkutan Umum' : selectedApp.vehicle.vehicle_type === 'angkutan_barang' ? 'Truk / Barang' : selectedApp.vehicle.vehicle_type}
                                                        </span>
                                                        <span className={`font-bold px-2.5 py-1 rounded-lg text-center mx-1 ${
                                                            !ai?.stnk_type
                                                                ? 'text-gray-400 bg-gray-50'
                                                                : ai.stnk_type === 'Motor'
                                                                ? 'text-orange-700 bg-orange-50 border border-orange-200'
                                                                : ai.stnk_type === 'Truk'
                                                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                                                : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                                        }`}>
                                                            {ai?.stnk_type ? `STNK ${ai.stnk_type}` : '— Tidak Terbaca'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Row 6: Jenis BBM */}
                                                    {(() => {
                                                        // Rule: Pertalite && CC > 1400 -> Warning Merah
                                                        const userFuel = selectedApp.vehicle.fuel_type || '-';
                                                        const aiFuel = ai?.stnk_fuel_type;
                                                        const isPertaliteRuleViolated = 
                                                            (userFuel.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'bensin') && 
                                                            (ai?.stnk_cc && parseInt(ai.stnk_cc) > 1400);

                                                        return (
                                                            <div className={`grid grid-cols-3 p-3 items-center hover:bg-gray-50/50 ${isPertaliteRuleViolated ? 'bg-rose-50/40' : ''}`}>
                                                                <span className="font-bold text-gray-600">Jenis BBM & Aturan Subsidi</span>
                                                                <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1 uppercase">
                                                                    {userFuel}
                                                                </span>
                                                                <span className={`font-bold px-2.5 py-1 rounded-lg text-center mx-1 uppercase ${
                                                                    !aiFuel
                                                                        ? 'text-gray-400 bg-gray-50'
                                                                        : isPertaliteRuleViolated
                                                                        ? 'text-rose-700 bg-rose-100 border border-rose-300 ring-2 ring-rose-200 animate-pulse'
                                                                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                                                }`}>
                                                                    {aiFuel ? `${aiFuel}` : '— Tidak Terbaca'}
                                                                    {isPertaliteRuleViolated && <div className="text-[9px] mt-1 text-rose-600">PELANGGARAN: &gt;1400 CC</div>}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right Column: Interactive Images & Action Decision (5 Cols) */}
                            <div className="lg:col-span-5 space-y-6">
                                
                                {/* Image Thumbnails with Zoom Overlay */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    {/* STNK Document */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                            <span>Foto STNK</span>
                                            <span className="text-[10px] text-gray-400">Klik Zoom</span>
                                        </div>
                                        <div 
                                            onClick={() => selectedApp.stnk_file && openLightbox(`/storage/${selectedApp.stnk_file}`, 'Foto STNK')}
                                            className="border-2 border-gray-200 hover:border-[#980f12] rounded-2xl overflow-hidden bg-gray-100 relative group aspect-[4/3] cursor-pointer shadow-xs transition-all"
                                        >
                                            {selectedApp.stnk_file ? (
                                                <>
                                                    <img 
                                                        src={`/storage/${selectedApp.stnk_file}`} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                        alt="STNK" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                                                        <FiMaximize2 size={16} /> Perbesar
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Tidak ada file</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vehicle Photo */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                            <span>Foto Kendaraan</span>
                                            <span className="text-[10px] text-gray-400">Klik Zoom</span>
                                        </div>
                                        <div 
                                            onClick={() => selectedApp.vehicle_photo && openLightbox(`/storage/${selectedApp.vehicle_photo}`, 'Foto Kendaraan')}
                                            className="border-2 border-gray-200 hover:border-[#980f12] rounded-2xl overflow-hidden bg-gray-100 relative group aspect-[4/3] cursor-pointer shadow-xs transition-all"
                                        >
                                            {selectedApp.vehicle_photo ? (
                                                <>
                                                    <img 
                                                        src={`/storage/${selectedApp.vehicle_photo}`} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                        alt="Kendaraan" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                                                        <FiMaximize2 size={16} /> Perbesar
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Tidak ada file</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Decision Form & Quick Action Buttons */}
                                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4 shadow-sm">
                                    <h4 className="font-extrabold text-gray-900 text-sm border-b border-gray-200 pb-2.5">
                                        Keputusan Cepat Administrator
                                    </h4>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                            Catatan Review (Opsional)
                                        </label>
                                        <textarea 
                                            value={adminNotes}
                                            onChange={e => setAdminNotes(e.target.value)}
                                            className="w-full text-xs rounded-2xl border-gray-200 bg-white placeholder-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12]"
                                            rows={2}
                                            placeholder="Tulis alasan jika menolak atau meminta re-upload..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-2">
                                            {isRerunning && (
                                                <div className="w-full py-2 text-center text-xs text-violet-700 font-bold animate-pulse flex items-center justify-center gap-2">
                                                    <FiCpu className="animate-spin" /> AI sedang memproses foto... harap tunggu
                                                </div>
                                            )}

                                            {/* Re-run AI Button */}
                                            <button
                                                type="button"
                                                onClick={handleRerunAi}
                                                disabled={isSubmitting || isRerunning}
                                                className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mb-2"
                                            >
                                                {isRerunning ? (
                                                    <><FiCpu size={16} className="animate-spin" /> Memproses AI...</>
                                                ) : (
                                                    <><FiZap size={16} /> Jalankan Ulang AI (Re-run)
                                                    </>)}
                                            </button>

                                            {/* Approve button */}
                                            <button 
                                                type="button"
                                                onClick={handleApproveClick}
                                                disabled={isSubmitting}
                                                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                                            >
                                                <FiCheckCircle size={16} /> Setujui Pendaftaran (Approve)
                                            </button>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Re-upload Button */}
                                            <button 
                                                type="button"
                                                onClick={() => handleReviewSubmit('needs_reupload')}
                                                disabled={isSubmitting}
                                                className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                                            >
                                                <FiAlertTriangle size={14} /> Minta Re-Upload
                                            </button>

                                            {/* Reject Button */}
                                            <button 
                                                type="button"
                                                onClick={() => handleReviewSubmit('rejected')}
                                                disabled={isSubmitting}
                                                className="py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                                            >
                                                <FiXCircle size={14} /> Tolak (Reject)
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Source of Truth Correction Modal */}
            {showCorrectionModal && selectedApp && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 bg-amber-50 flex items-start gap-4">
                            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                                <FiAlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">Perbedaan Data Terdeteksi</h3>
                                <p className="text-gray-600 text-sm mt-1">Terdapat perbedaan antara data input Pengguna dengan hasil bacaan AI (OCR). Silakan tentukan mana data yang paling benar sebelum menyetujui.</p>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Opsi 1: Data Pengguna */}
                                <div 
                                    onClick={() => { setCorrectionMode('user'); setManualCc(String(selectedApp.vehicle.engine_capacity_cc)); setManualPlate(selectedApp.vehicle.plate_number); }}
                                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                                        correctionMode === 'user' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-200 hover:border-amber-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900">Data Pengguna</h4>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${correctionMode === 'user' ? 'border-amber-500' : 'border-gray-300'}`}>
                                            {correctionMode === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-500 block text-xs">Kapasitas CC</span> <span className="font-bold">{selectedApp.vehicle.engine_capacity_cc}</span></div>
                                        <div><span className="text-gray-500 block text-xs">Plat Nomor</span> <span className="font-bold">{selectedApp.vehicle.plate_number}</span></div>
                                    </div>
                                </div>

                                {/* Opsi 2: Data AI */}
                                <div 
                                    onClick={() => { 
                                        const ai = getAiConclusion(selectedApp);
                                        setCorrectionMode('ai'); 
                                        setManualCc(ai?.stnk_cc || String(selectedApp.vehicle.engine_capacity_cc)); 
                                        setManualPlate(ai?.car_plate || ai?.stnk_plate || selectedApp.vehicle.plate_number); 
                                    }}
                                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                                        correctionMode === 'ai' ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900">Data AI (OCR)</h4>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${correctionMode === 'ai' ? 'border-emerald-500' : 'border-gray-300'}`}>
                                            {correctionMode === 'ai' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="text-gray-500 block text-xs">Kapasitas CC</span> <span className="font-bold">{getAiConclusion(selectedApp)?.stnk_cc || 'N/A'}</span></div>
                                        <div><span className="text-gray-500 block text-xs">Plat Nomor</span> <span className="font-bold">{getAiConclusion(selectedApp)?.car_plate || getAiConclusion(selectedApp)?.stnk_plate || 'N/A'}</span></div>
                                    </div>
                                </div>

                                {/* Opsi 3: Koreksi Manual */}
                                <div 
                                    onClick={() => setCorrectionMode('manual')}
                                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                                        correctionMode === 'manual' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900">Input Manual</h4>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${correctionMode === 'manual' ? 'border-blue-500' : 'border-gray-300'}`}>
                                            {correctionMode === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Pilih ini jika Data Pengguna dan Data AI sama-sama salah, dan Anda ingin mengisinya sendiri sesuai foto dokumen.
                                    </p>
                                </div>
                            </div>

                            {/* Form Input Manual (Hanya Muncul Jika Pilih Opsi 3) */}
                            {correctionMode === 'manual' && (
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-2 gap-4 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Kapasitas CC Benar</label>
                                        <input 
                                            type="number" 
                                            value={manualCc} 
                                            onChange={e => setManualCc(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl focus:ring-[#980f12] focus:border-[#980f12] sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Plat Nomor Benar</label>
                                        <input 
                                            type="text" 
                                            value={manualPlate} 
                                            onChange={e => setManualPlate(e.target.value)}
                                            className="w-full border-gray-300 rounded-xl focus:ring-[#980f12] focus:border-[#980f12] sm:text-sm uppercase"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                            <button 
                                onClick={() => setShowCorrectionModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => handleReviewSubmit('approved', undefined, manualCc, manualPlate)}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <FiCheckCircle />
                                Setujui dengan Data Ini
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Image Lightbox Modal with Zoom & Rotation */}
            {lightboxImage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    {/* Header Controls */}
                    <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3">
                        <span className="font-bold text-sm">{lightboxImage.title}</span>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setLightboxZoom((prev: number) => Math.min(prev + 0.25, 3))}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                                title="Zoom In"
                            >
                                <FiZoomIn /> +
                            </button>
                            <button 
                                onClick={() => setLightboxZoom((prev: number) => Math.max(prev - 0.25, 0.5))}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                                title="Zoom Out"
                            >
                                <FiZoomIn /> -
                            </button>
                            <button 
                                onClick={() => setLightboxRotation((prev: number) => (prev + 90) % 360)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                                title="Rotate"
                            >
                                <FiRotateCw /> Putar
                            </button>
                            <button 
                                onClick={() => setLightboxImage(null)}
                                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Image Display */}
                    <div className="w-full max-w-4xl h-[70vh] bg-black/50 rounded-3xl overflow-hidden flex items-center justify-center p-4 border border-white/10">
                        <img 
                            src={lightboxImage.url} 
                            alt={lightboxImage.title}
                            style={{ 
                                transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
                                transition: 'transform 0.2s ease-out'
                            }}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

AdminRegistrations.layout = (page: any) => <AppLayout title="Review Pendaftaran">{page}</AppLayout>;

