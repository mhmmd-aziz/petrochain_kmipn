import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiClock, FiCheck, FiX, FiInfo, 
    FiTruck, FiCheckCircle, FiAlertTriangle, 
    FiEye, FiDownload, FiShare2, FiZap, FiShield
} from 'react-icons/fi';
import { FaMotorcycle, FaQrcode } from 'react-icons/fa';

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
        case 'approved': return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: FiCheckCircle, label: 'Disetujui (Aktif)' };
        case 'rejected': return { bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: FiX, label: 'Ditolak' };
        case 'needs_reupload': return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: FiAlertTriangle, label: 'Perlu Re-Upload Foto' };
        default: return { bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: FiClock, label: 'Menunggu Verifikasi AI' };
    }
};

export default function Index({ applications = [] }: { applications: Application[] }) {
    const [selectedQRPass, setSelectedQRPass] = useState<Application | null>(null);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <Head title="Kendaraan & QR Pass Subsidi - Petrochain" />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-[#7a0b0d] to-[#980f12] text-white border border-red-900/30 shadow-xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-red-200 mb-2">
                            <FiShield className="text-emerald-400" /> PASSPORT SUBSIDI MYPERTAMINA & BLOCKCHAIN
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FiTruck className="text-yellow-300" />
                            Kendaraan Saya & QR Barcode Subsidi
                        </h2>
                        <p className="text-red-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                            Kelola pendaftaran kendaraan, status verifikasi STNK AI, dan unduh QR Barcode untuk pengisian di SPBU.
                        </p>
                    </div>

                    <Link
                        href="/registrations/create"
                        className="bg-white text-[#980f12] hover:bg-gray-100 px-6 py-3 rounded-2xl font-black text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 self-start sm:self-auto"
                    >
                        <FiPlus size={16} /> Daftarkan Kendaraan Baru
                    </Link>
                </div>
            </motion.div>

            {/* Vehicles Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app, idx) => {
                    const st = statusColor(app.status);
                    const StatusIcon = st.icon;
                    const isApproved = app.status === 'approved';
                    const isMotor = app.vehicle.vehicle_type?.toLowerCase().includes('motor');

                    return (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-lg hover:border-gray-200 transition-all flex flex-col justify-between space-y-5 group"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                                        {isMotor ? <FaMotorcycle /> : <FiTruck />}
                                    </div>

                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                                        <StatusIcon size={12} /> {st.label}
                                    </span>
                                </div>

                                <div className="font-mono text-2xl font-black text-gray-900 tracking-wider">
                                    {app.vehicle.plate_number}
                                </div>
                                <div className="text-sm font-bold text-gray-600 mt-1">
                                    {app.vehicle.brand} {app.vehicle.model}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5 capitalize">
                                    Tipe: {app.vehicle.vehicle_type} • Diajukan: {new Date(app.submitted_at).toLocaleDateString('id-ID')}
                                </div>

                                {app.admin_notes && (
                                    <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                        <strong>Catatan:</strong> {app.admin_notes}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                {isApproved ? (
                                    <button
                                        onClick={() => setSelectedQRPass(app)}
                                        className="w-full bg-[#980f12] hover:bg-red-800 text-white py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
                                    >
                                        <FaQrcode size={14} /> Tampilkan QR Barcode
                                    </button>
                                ) : (
                                    <div className="text-xs font-medium text-gray-400 italic">
                                        QR Barcode aktif setelah verifikasi admin
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {applications.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
                        <FiTruck size={48} className="mx-auto mb-3 text-gray-300" />
                        <h4 className="text-gray-900 font-extrabold text-base mb-1">Belum Ada Kendaraan Terdaftar</h4>
                        <p className="text-xs max-w-sm mx-auto mb-6">
                            Daftarkan plat nomor kendaraan Anda dan upload foto STNK untuk menikmati kuota BBM subsidi.
                        </p>
                        <Link
                            href="/registrations/create"
                            className="inline-flex items-center gap-2 bg-[#980f12] hover:bg-red-800 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all"
                        >
                            <FiPlus /> Daftarkan Sekarang
                        </Link>
                    </div>
                )}
            </div>

            {/* QR Pass Modal */}
            <AnimatePresence>
                {selectedQRPass && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center relative space-y-6"
                        >
                            <button
                                onClick={() => setSelectedQRPass(null)}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold"
                            >
                                <FiX size={18} />
                            </button>

                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                                    <FiCheckCircle size={12} /> QR PASS VALID
                                </span>
                                <h3 className="text-2xl font-black text-gray-900 font-mono tracking-wider">
                                    {selectedQRPass.vehicle.plate_number}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedQRPass.vehicle.brand} {selectedQRPass.vehicle.model}
                                </p>
                            </div>

                            {/* Stylized QR Code Mock */}
                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl inline-block shadow-inner">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PETROCHAIN-${selectedQRPass.vehicle.plate_number}`}
                                    alt="QR Pass Subsidi"
                                    className="w-48 h-48 mx-auto rounded-xl"
                                />
                            </div>

                            <p className="text-[11px] text-gray-400">
                                Tunjukkan QR ini ke petugas dispenser SPBU saat pengisian BBM subsidi.
                            </p>

                            <button
                                onClick={() => setSelectedQRPass(null)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold text-xs transition-colors"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

Index.layout = (page: any) => <AppLayout title="Kendaraan Saya">{page}</AppLayout>;

