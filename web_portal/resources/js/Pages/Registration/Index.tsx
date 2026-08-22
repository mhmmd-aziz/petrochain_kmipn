import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiClock, FiCheck, FiX, FiInfo, 
    FiTruck, FiCheckCircle, FiAlertTriangle, 
    FiEye, FiDownload, FiShare2, FiZap, FiShield,
    FiRefreshCw, FiDroplet, FiLock, FiCalendar
} from 'react-icons/fi';
import { FaMotorcycle, FaCar, FaQrcode } from 'react-icons/fa';

interface Application {
    id: number;
    status: string;
    submitted_at: string;
    vehicle: {
        plate_number: string;
        vehicle_type: string;
        brand: string;
        model: string;
        engine_capacity_cc?: number;
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
    const [otpCountdown, setOtpCountdown] = useState<number>(60);
    const [dynamicOtp, setDynamicOtp] = useState<string>('849 201');

    // Dynamic 60s countdown timer for anti-replay OTP
    useEffect(() => {
        if (!selectedQRPass) return;
        const interval = setInterval(() => {
            setOtpCountdown(prev => {
                if (prev <= 1) {
                    // Generate new 6-digit OTP
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setDynamicOtp(`${newOtp.slice(0, 3)} ${newOtp.slice(3)}`);
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [selectedQRPass]);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-16">
            <Head title="Kendaraan & QR Pass Subsidi - PETROCHAIN" />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-[#7a0b0d] to-[#980f12] text-white border border-red-900/30 shadow-xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-red-200 mb-2">
                            <FiShield className="text-emerald-400" /> PASSPORT SUBSIDI MYPERTAMINA & BLOCKCHAIN
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FiTruck className="text-yellow-300" />
                            Kendaraan Saya & QR Pass Subsidi
                        </h1>
                        <p className="text-red-100/90 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                            Pantau status verifikasi STNK AI, kelola kuota bahan bakar bersubsidi harian, dan gunakan Dynamic QR Pass saat pengisian di SPBU.
                        </p>
                    </div>

                    <Link
                        href="/registrations/create"
                        className="bg-white text-[#980f12] hover:bg-gray-100 px-6 py-3 rounded-2xl font-black text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
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
                    const maxQuota = isMotor ? 10.0 : 30.0;
                    const remainingQuota = isApproved ? (isMotor ? 8.5 : 22.0) : 0;
                    const quotaPct = Math.round((remainingQuota / maxQuota) * 100);

                    return (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all flex flex-col justify-between space-y-5 group"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform border border-red-100">
                                        {isMotor ? <FaMotorcycle /> : <FaCar />}
                                    </div>

                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                                        <StatusIcon size={12} /> {st.label}
                                    </span>
                                </div>

                                <div className="font-mono text-2xl font-black text-gray-900 tracking-wider">
                                    {app.vehicle.plate_number}
                                </div>
                                <div className="text-sm font-bold text-gray-700 mt-1">
                                    {app.vehicle.brand} {app.vehicle.model}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 capitalize font-mono">
                                    Kategori: {isMotor ? 'Sepeda Motor' : 'Mobil Pribadi'} • Diajukan: {new Date(app.submitted_at).toLocaleDateString('id-ID')}
                                </div>

                                {/* Quota Progress Bar for Approved Vehicles */}
                                {isApproved && (
                                    <div className="mt-4 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                                        <div className="flex items-center justify-between text-xs font-mono">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <FiDroplet className="text-emerald-600" /> Sisa Kuota Hari Ini:
                                            </span>
                                            <strong className="text-gray-900 font-bold">
                                                {remainingQuota} / {maxQuota} L
                                            </strong>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                style={{ width: `${quotaPct}%` }}
                                                className="h-full bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono text-right">
                                            Reset otomatis pukul 00:00 WIB
                                        </div>
                                    </div>
                                )}

                                {app.admin_notes && (
                                    <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                        <strong>Catatan Admin:</strong> {app.admin_notes}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                {isApproved ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedQRPass(app)}
                                        className="w-full bg-[#980f12] hover:bg-red-800 text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-red-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                                    >
                                        <FaQrcode size={15} /> Tampilkan Dynamic QR Pass
                                    </button>
                                ) : (
                                    <div className="text-xs font-medium text-gray-500 italic bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                                        QR Pass aktif otomatis setelah verifikasi AI Samsat
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {applications.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-200 shadow-xs">
                        <FiTruck size={48} className="mx-auto mb-3 text-red-300" />
                        <h4 className="text-gray-900 font-black text-lg mb-1">Belum Ada Kendaraan Terdaftar</h4>
                        <p className="text-xs max-w-sm mx-auto mb-6 text-gray-500">
                            Daftarkan plat nomor kendaraan Anda dan unggah foto STNK untuk menikmati alokasi kuota BBM bersubsidi.
                        </p>
                        <Link
                            href="/registrations/create"
                            className="inline-flex items-center gap-2 bg-[#980f12] hover:bg-red-800 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                            <FiPlus /> Daftarkan Sekarang
                        </Link>
                    </div>
                )}
            </div>

            {/* Dynamic Anti-Replay QR Pass Modal */}
            <AnimatePresence>
                {selectedQRPass && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 text-center relative space-y-6 overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedQRPass(null)}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition-colors cursor-pointer"
                            >
                                <FiX size={18} />
                            </button>

                            {/* Header info */}
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                                    <FiShield size={12} className="text-emerald-600" /> ANTI-REPLAY ACTIVE • ZERO FRAUD
                                </span>
                                <h3 className="text-2xl font-black text-gray-950 font-mono tracking-wider">
                                    {selectedQRPass.vehicle.plate_number}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {selectedQRPass.vehicle.brand} {selectedQRPass.vehicle.model}
                                </p>
                            </div>

                            {/* Stylized Dynamic QR Code Mockup */}
                            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl inline-block shadow-inner relative">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PETROCHAIN-${selectedQRPass.vehicle.plate_number}-${dynamicOtp}`}
                                    alt="Dynamic QR Pass"
                                    className="w-48 h-48 mx-auto rounded-xl shadow-xs"
                                />
                            </div>

                            {/* 60s Countdown Bar & Dynamic Token */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 text-white font-mono text-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <FiRefreshCw className="animate-spin text-cyan-400" /> Token Dinamis:
                                    </span>
                                    <span className="text-amber-400 font-bold text-sm tracking-widest">{dynamicOtp}</span>
                                </div>

                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        style={{ width: `${(otpCountdown / 60) * 100}%` }}
                                        className="h-full bg-cyan-400 transition-all duration-1000 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Berlaku 60 detik (Anti-Screenshot)</span>
                                    <span className="text-cyan-300 font-bold">{otpCountdown}s</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Tunjukkan QR dinamis ini ke pemindai CCTV / operator dispenser SPBU. Sistem akan menolak jika QR dibagikan via tangkapan layar.
                            </p>

                            <button
                                onClick={() => setSelectedQRPass(null)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                            >
                                Tutup QR Pass
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

Index.layout = (page: any) => <AppLayout title="Kendaraan Saya">{page}</AppLayout>;
