import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { 
    FiTrendingUp, FiMapPin, FiShield, FiAlertTriangle, 
    FiLink, FiFileText, FiActivity, FiCheckCircle,
    FiLock, FiCpu, FiEye, FiClock, FiDatabase
} from 'react-icons/fi';

export default function AuditorDashboard({ stats }: any) {
    return (
        <div className="space-y-8">
            <Head title="Auditor & Executive Dashboard - Petrochain" />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden min-h-[220px] flex flex-col justify-end p-6 sm:p-8 shadow-lg border border-purple-950/20 bg-gradient-to-r from-gray-900 via-purple-950 to-[#980f12] text-white"
            >
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block pointer-events-none">
                    <FiShield size={150} />
                </div>

                <div className="relative z-10 w-full lg:w-3/4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-purple-200 mb-2 backdrop-blur-xs">
                        <FiLock className="text-yellow-300" /> Pengawasan Nasional BPH Migas & Kemenkeu
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Executive Audit & Blockchain Explorer
                    </h2>
                    <p className="text-purple-100 text-xs sm:text-sm leading-relaxed mt-1 max-w-2xl">
                        Audit otomatis atas setiap transaksi kuota subsidi BBM, verifikasi cryptographic hash Hyperledger Fabric, dan deteksi anomali kuota ganda.
                    </p>
                </div>
            </motion.div>

            {/* Quick Action Shortcuts (Auditor) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href={route('auditor.transactions')}
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FiFileText />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors">
                            Audit Transaksi Lengkap
                        </div>
                        <div className="text-[11px] text-gray-500">Log Verifikasi & Anomali</div>
                    </div>
                </Link>

                <Link
                    href="/blockchain"
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FiLink />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            Hyperledger Blockchain
                        </div>
                        <div className="text-[11px] text-gray-500">Ledger Immutability Explorer</div>
                    </div>
                </Link>

                <Link
                    href={route('public.stock')}
                    className="p-5 rounded-3xl bg-white border border-gray-100 hover:border-red-300 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <FiMapPin />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 group-hover:text-[#980f12] transition-colors">
                            Peta Sebaran SPBU
                        </div>
                        <div className="text-[11px] text-gray-500">Monitoring Stok Nasional</div>
                    </div>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                            <FiTrendingUp />
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">Nasional</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{stats?.total_transactions?.toLocaleString() || 0}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Transaksi Subsidi</div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                            <FiMapPin />
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">Active Nodes</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{stats?.total_spbu || 0}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titik SPBU Terdaftar</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                            <FiShield />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Zero-Fraud</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{stats?.compliance_rate || 0}%</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tingkat Kepatuhan Validasi</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-rose-200 bg-rose-50/30 shadow-xs relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
                            <FiAlertTriangle />
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">Early Warning</span>
                    </div>
                    <div className="text-3xl font-black text-rose-600 mb-1">{stats?.audit_alerts || 0}</div>
                    <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Anomali Kuota / Alert</div>
                </motion.div>
            </div>

            {/* Audit Log Banner */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-8 text-center text-gray-600 max-w-3xl mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
                    <FiShield />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Audit Log & Distributed Ledger System</h3>
                <p className="text-xs text-gray-500 max-w-lg mx-auto mb-6 leading-relaxed">
                    Sebagai otoritas pengawas (BPH Migas / Kemenkeu), Anda memiliki visibilitas penuh terhadap log cryptographic hash transaksi yang tercatat permanen di blockchain.
                </p>
                <Link 
                    href={route('auditor.transactions')} 
                    className="inline-flex items-center gap-2 bg-[#980f12] hover:bg-red-800 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    <FiFileText /> Buka Panel Laporan Transaksi Lengkap
                </Link>
            </div>
        </div>
    );
}

AuditorDashboard.layout = (page: any) => <AppLayout title="Executive & Auditor Dashboard">{page}</AppLayout>;

