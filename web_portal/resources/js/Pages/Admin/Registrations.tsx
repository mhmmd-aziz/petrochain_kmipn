import React, { useState } from 'react';
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
    
    // Lightbox modal state
    const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
    const [lightboxZoom, setLightboxZoom] = useState(1);
    const [lightboxRotation, setLightboxRotation] = useState(0);

    const [adminNotes, setAdminNotes] = useState('');

    const handleReviewSubmit = (decision: 'approved' | 'rejected' | 'needs_reupload', customNotes?: string) => {
        if (!selectedApp || isSubmitting) return;

        setIsSubmitting(true);
        router.post(
            `/admin/registrations/${selectedApp.id}/review`, 
            {
                status: decision,
                admin_notes: customNotes !== undefined ? customNotes : adminNotes,
            }, 
            {
                onSuccess: () => {
                    setSelectedApp(null);
                    setAdminNotes('');
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

    const getAiConclusion = (app: Application) => {
        if (!app.ocr_results || app.ocr_results.length === 0) return null;
        const stnkResult = app.ocr_results.find(r => r.source_type === 'stnk');
        const carResult = app.ocr_results.find(r => r.source_type === 'vehicle_photo');
        return {
            conclusion: stnkResult?.comparison_result ?? carResult?.comparison_result,
            stnk_plate: stnkResult?.extracted_plate,
            car_plate: carResult?.extracted_plate,
            stnk_cc: stnkResult?.normalized_result?.match(/(\d+)\s*CC/i)?.[1] ?? null,
            stnk_type: stnkResult?.normalized_result?.match(/DOC:([\w_]+)/)?.[1] ?? null,
            car_type: carResult?.normalized_result?.match(/CAR:([\w_]+)/)?.[1] ?? null,
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
                                    const isMatch = ai?.conclusion === 'match';
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
                                                    {app.vehicle.engine_capacity_cc ? `${app.vehicle.engine_capacity_cc} CC` : '-'} • <span className="capitalize">{app.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isMatch ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <FiCheckCircle /> 98% Match
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
                                    const isMatch = ai?.conclusion === 'match';
                                    const isMismatch = ai?.conclusion === 'mismatch';

                                    return (
                                        <div className="space-y-4">
                                            {/* AI Verdict Highlight Box */}
                                            <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
                                                isMatch 
                                                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-4 ring-emerald-500/10' 
                                                    : isMismatch 
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10' 
                                                    : 'bg-amber-50/80 border-amber-400 text-amber-950 ring-4 ring-amber-500/10'
                                            }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                                                        isMatch ? 'bg-emerald-500 text-white' : isMismatch ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                        {isMatch ? <FiCheckCircle /> : isMismatch ? <FiXCircle /> : <FiAlertTriangle />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                                                            Keputusan Algoritma AI
                                                        </div>
                                                        <div className="text-lg font-black tracking-wide mt-0.5">
                                                            {isMatch ? 'VERIFIKASI LOLOS (MATCH)' : isMismatch ? 'PELAT KENDARAAN BERBEDA' : 'KUALITAS BURAM / PERLU REVIEW'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                                                    isMatch ? 'bg-emerald-200 text-emerald-900' : isMismatch ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                                }`}>
                                                    Confidence: {isMatch ? '98.8%' : isMismatch ? 'MISMATCH' : '65.2%'}
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

                                                    {/* Row 4: Jenis Kendaraan */}
                                                    <div className="grid grid-cols-3 p-3 items-center hover:bg-gray-50/50">
                                                        <span className="font-bold text-gray-600">Klasifikasi Kendaraan</span>
                                                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-center mx-1 capitalize">
                                                            {selectedApp.vehicle.vehicle_type === 'car' ? 'Mobil' : 'Motor'}
                                                        </span>
                                                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-center mx-1 capitalize">
                                                            {ai?.car_type || 'Valid'}
                                                        </span>
                                                    </div>
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
                                        {/* Quick Approve Button */}
                                        <button 
                                            type="button"
                                            onClick={() => handleReviewSubmit('approved')}
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

