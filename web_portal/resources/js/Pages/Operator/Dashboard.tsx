import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { 
    FiCamera, FiDroplet, FiClock, FiCheck, FiX, 
    FiActivity, FiCheckCircle, FiAlertTriangle,
    FiMapPin, FiTruck, FiRepeat, FiZap, FiPlusCircle,
    FiLayers, FiChevronRight, FiShield
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export default function OperatorDashboard({ spbu, recent_transactions, stats }: any) {
    if (!spbu) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-2xl flex-shrink-0">
                        <FiX />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base">Akses Ditolak</h3>
                        <p className="text-xs mt-0.5">Akun Anda belum terhubung dengan SPBU manapun. Silakan hubungi administrator.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Head title={`Dashboard Operator - ${spbu.name}`} />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden min-h-[200px] flex flex-col justify-end p-6 sm:p-8 shadow-lg border border-red-950/20 bg-gradient-to-r from-[#7a0b0d] via-[#980f12] to-[#b91c1c] text-white"
            >
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-red-100 mb-2 backdrop-blur-xs">
                        <FiMapPin className="text-yellow-300" /> {spbu.name} • Kode: {spbu.code}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Pos Dispenser & Validasi Lapangan
                    </h2>
                    <p className="text-red-100 text-xs sm:text-sm leading-relaxed mt-1 max-w-2xl">
                        Lokasi: {spbu.address}, {spbu.city}, {spbu.province}
                    </p>
                </div>
            </motion.div>

            {/* Quick Action Shortcuts (Outline Icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href={route('operator.validation')}
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-red-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FiCamera />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-[#980f12] transition-colors">
                            Validasi Mobil & QR
                        </div>
                        <div className="text-[11px] text-gray-500">Scan Barcode Subsidi</div>
                    </div>
                </Link>

                <Link
                    href="/operator/validation-motor"
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FaMotorcycle />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Validasi Motor (AI YOLO)
                        </div>
                        <div className="text-[11px] text-gray-500">Klasifikasi CC Otomatis</div>
                    </div>
                </Link>

                <Link
                    href={route('operator.stock')}
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FiDroplet />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            Update Stok Tangki BBM
                        </div>
                        <div className="text-[11px] text-gray-500">Status Tersedia/Menipis</div>
                    </div>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-2xl shadow-2xs">
                            <FiActivity />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaksi Hari Ini</div>
                            <div className="text-3xl font-black text-gray-900 mt-0.5">{stats.today_transactions || 0} <span className="text-xs font-medium text-gray-400">kendaraan</span></div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                        ⚡ Real-time
                    </span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl shadow-2xs">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">QR Code Berhasil Scan</div>
                            <div className="text-3xl font-black text-gray-900 mt-0.5">{stats.qr_scanned || 0} <span className="text-xs font-medium text-gray-400">scan</span></div>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        ✓ Lolos Validasi
                    </span>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center">
                            <FiClock size={16} />
                        </div>
                        Riwayat Transaksi Terbaru di SPBU Ini
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Plat Nomor (AI)</th>
                                <th className="px-6 py-4">Jenis Kendaraan</th>
                                <th className="px-6 py-4">BBM / Volume</th>
                                <th className="px-6 py-4">Status QR</th>
                                <th className="px-6 py-4">Status Transaksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recent_transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-red-50/20 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            <FiClock size={11} />
                                            {new Date(tx.transacted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                                            {tx.plate_result}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 capitalize font-medium whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            {tx.yolo_result?.includes('motor') ? <FaMotorcycle className="text-blue-600" /> : <FiTruck className="text-emerald-600" />}
                                            {tx.yolo_result || 'Mobil'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-[#980f12]">
                                            <FiDroplet size={13} /> {tx.fuel_type}
                                        </span>
                                        <span className="text-gray-400 font-mono font-normal ml-1.5 text-xs">({tx.volume}L)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-bold border ${
                                            tx.qr_result === 'qr_match' 
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                : 'bg-rose-50 text-rose-800 border-rose-200'
                                        }`}>
                                            {tx.qr_result === 'qr_match' ? <><FiCheckCircle size={12} /> Match</> : <><FiAlertTriangle size={12} /> Mismatch</>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${
                                            tx.transaction_status === 'validated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            tx.transaction_status === 'manual_review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {tx.transaction_status === 'validated' ? 'Valid' :
                                             tx.transaction_status === 'manual_review' ? 'Perlu Review' : 'Ditolak'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recent_transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <FiTruck size={36} className="mx-auto mb-2 text-gray-300" />
                                        Belum ada transaksi tervalidasi hari ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

OperatorDashboard.layout = (page: any) => <AppLayout title="Operator Dashboard">{page}</AppLayout>;

