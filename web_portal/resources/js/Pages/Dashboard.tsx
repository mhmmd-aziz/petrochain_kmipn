import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { 
    FiMapPin, FiRepeat, FiFileText, 
    FiTruck, FiCheckCircle, FiUsers,
    FiActivity, FiChevronRight, FiCheck, FiX,
    FiCpu, FiCamera, FiLink, FiShield, FiTrendingUp,
    FiPlusSquare, FiUserPlus, FiEye, FiDatabase,
    FiDroplet, FiClock, FiAlertTriangle, FiZap,
    FiLayers, FiArrowUpRight, FiHardDrive
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Stats {
    total_spbu: number;
    daily_transactions: number;
    pending_registrations: number;
    registered_vehicles: number;
    qr_match_rate: number;
    active_operators: number;
}

interface RecentTransaction {
    id: number;
    plate_number: string;
    spbu_name: string;
    fuel_type: string;
    qr_result: string;
    status: string;
    transacted_at: string;
}

interface Props {
    stats: Stats;
    recent_transactions: RecentTransaction[];
}

const StatCard = ({
    label, value, icon: Icon, sub, color, delay, trend
}: {
    label: string; value: string | number; icon: any; sub?: string; color: string; delay: number; trend?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35 }}
        className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-lg hover:border-gray-200 transition-all duration-300 relative group overflow-hidden"
    >
        {/* Subtle Background Icon Watermark */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
            <Icon size={110} />
        </div>

        <div className="flex items-start justify-between mb-4">
            {/* Outline Icon Badge */}
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-transform duration-300 group-hover:scale-110"
                style={{ 
                    background: `${color}12`, 
                    color: color,
                    border: `1.5px solid ${color}30`
                }}
            >
                <Icon />
            </div>

            {trend ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <FiTrendingUp size={12} /> {trend}
                </span>
            ) : (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-gray-100 text-gray-500 flex items-center gap-1">
                    <FiClock size={11} /> Real-time
                </span>
            )}
        </div>

        <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">{value}</div>
        <div className="text-xs sm:text-sm font-bold text-gray-500">{label}</div>
        {sub && (
            <div className="text-xs mt-3 font-semibold flex items-center gap-1.5" style={{ color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></span>
                {sub}
            </div>
        )}
    </motion.div>
);

const statusBadge = (status: string) => {
    const map: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
        validated: { label: 'Valid', icon: FiCheckCircle, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
        rejected: { label: 'Ditolak', icon: FiX, color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
        manual_review: { label: 'Review', icon: FiAlertTriangle, color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
        pending: { label: 'Pending', icon: FiClock, color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
    };
    const s = map[status] ?? map['pending'];
    const Icon = s.icon;
    return (
        <span 
            className="text-xs px-2.5 py-1 rounded-xl font-bold inline-flex items-center gap-1.5 border" 
            style={{ color: s.color, background: s.bg, borderColor: s.border }}
        >
            <Icon size={12} />
            {s.label}
        </span>
    );
};

const qrBadge = (result: string) => {
    const isMatch = result === 'qr_match';
    return (
        <span 
            className={`text-xs px-2.5 py-1 rounded-xl font-bold inline-flex items-center gap-1.5 border ${
                isMatch ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
            {isMatch ? <FiCheckCircle size={12} /> : <FiAlertTriangle size={12} />}
            {isMatch ? 'Match' : 'Mismatch'}
        </span>
    );
};

const defaultStats: Stats = {
    total_spbu: 12,
    daily_transactions: 348,
    pending_registrations: 23,
    registered_vehicles: 1204,
    qr_match_rate: 96.4,
    active_operators: 28,
};

const defaultTransactions: RecentTransaction[] = [
    { id: 1, plate_number: 'BL 1234 AB', spbu_name: 'SPBU 14.201.001', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-20 21:15' },
    { id: 2, plate_number: 'BL 5678 CD', spbu_name: 'SPBU 14.201.002', fuel_type: 'Solar', qr_result: 'qr_not_match', status: 'rejected', transacted_at: '2026-08-20 21:02' },
    { id: 3, plate_number: 'BL 9012 EF', spbu_name: 'SPBU 14.201.001', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-20 20:58' },
    { id: 4, plate_number: 'BL 3456 GH', spbu_name: 'SPBU 14.201.003', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'manual_review', transacted_at: '2026-08-20 20:43' },
    { id: 5, plate_number: 'BL 7890 IJ', spbu_name: 'SPBU 14.201.002', fuel_type: 'Solar', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-20 20:30' },
];

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        y: { beginAtZero: true, border: { display: false }, grid: { color: '#f1f5f9' } },
        x: { border: { display: false }, grid: { display: false } },
    },
};

const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
        {
            fill: true,
            label: 'Transaksi Divalidasi',
            data: [120, 190, 150, 220, 180, 250, 210],
            borderColor: '#980f12',
            backgroundColor: 'rgba(152, 15, 18, 0.08)',
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#980f12',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        },
    ],
};

export default function Dashboard({ stats = defaultStats, recent_transactions = defaultTransactions }: Partial<Props>) {
    const s = stats ?? defaultStats;
    const transactions = recent_transactions ?? defaultTransactions;

    return (
        <div className="space-y-8">
            <Head title="Dashboard Utama - Petrochain" />

            {/* Header Banner with Icons */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden min-h-[220px] flex flex-col justify-end p-6 sm:p-8 shadow-lg border border-red-950/20 bg-gradient-to-r from-[#7a0b0d] via-[#980f12] to-[#b91c1c] text-white"
            >
                {/* Decorative Background Icon Patterns */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 flex gap-6 pointer-events-none hidden md:flex">
                    <FiShield size={140} />
                    <FiLink size={140} />
                </div>

                <div className="relative z-10 w-full lg:w-3/4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-red-100 mb-3 backdrop-blur-xs">
                        <FiZap className="text-yellow-300" /> Pusat Kendali & Pengawasan Distribusi BBM
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Selamat Datang di Portal Petrochain
                    </h2>
                    <p className="text-red-100 text-xs sm:text-sm leading-relaxed mt-2 max-w-2xl">
                        Pantau ringkasan performa subsidi BBM, verifikasi dual AI (YOLO & PaddleOCR), serta integritas transaksi blockchain secara real-time di seluruh SPBU.
                    </p>
                </div>
            </motion.div>

            {/* Quick Action Strip (Icon Shortcuts) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { href: '/admin/registrations', label: 'Review STNK', icon: FiEye, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', count: s.pending_registrations },
                    { href: '/admin/spbu', label: 'Manajemen SPBU', icon: FiMapPin, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                    { href: '/users', label: 'Kelola Pengguna', icon: FiUserPlus, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                    { href: '/blockchain', label: 'Ledger Chain', icon: FiLink, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                    { href: '/vehicles', label: 'Database Kendaraan', icon: FiTruck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { href: '/transactions', label: 'Semua Transaksi', icon: FiRepeat, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-gray-100 hover:${item.border} hover:shadow-md transition-all group relative overflow-hidden`}
                        >
                            <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-lg mb-2 shadow-2xs group-hover:scale-110 transition-transform`}>
                                <Icon />
                            </div>
                            <span className="text-xs font-extrabold text-gray-800 text-center leading-tight">
                                {item.label}
                            </span>
                            {item.count !== undefined && item.count > 0 && (
                                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                                    {item.count}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* 6 Key Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard label="Total SPBU Aktif" value={s.total_spbu} icon={FiMapPin} color="#980f12" delay={0.05} trend="+2 Baru" sub="Titik SPBU Terhubung" />
                <StatCard label="Transaksi Hari Ini" value={s.daily_transactions} icon={FiRepeat} color="#2563eb" delay={0.1} trend="+14.2%" sub="Diproses Otomatis AI" />
                <StatCard label="Pendaftaran Pending" value={s.pending_registrations} icon={FiFileText} color="#d97706" delay={0.15} sub="Perlu Review Admin" />
                <StatCard label="Kendaraan Terdaftar" value={s.registered_vehicles.toLocaleString()} icon={FiTruck} color="#7c3aed" delay={0.2} trend="Aktif" sub="Mobil & Motor Lolos" />
                <StatCard label="Akurasi QR & YOLO" value={`${s.qr_match_rate}%`} icon={FiCheckCircle} color="#059669" delay={0.25} trend="Tinggi" sub="Zero Fraud Metric" />
                <StatCard label="Operator SPBU" value={s.active_operators} icon={FiUsers} color="#db2777" delay={0.3} sub="Petugas Siaga di Dispenser" />
            </div>

            {/* Chart & Live AI Services Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                
                {/* Left: Weekly Trend Chart (2 Cols) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center">
                                <FiTrendingUp size={16} />
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-extrabold text-base">Tren Transaksi Distribusi BBM</h3>
                                <p className="text-xs text-gray-400">Volume transaksi berhasil per hari (Minggu Terakhir)</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full pt-2">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </motion.div>

                {/* Right: AI Microservices & Edge Nodes (1 Col) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4"
                >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <FiCpu size={16} />
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-extrabold text-sm">Status AI & Edge Node</h3>
                                <p className="text-[10px] text-gray-400">Inference Real-Time</p>
                            </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    
                    <div className="space-y-2.5">
                        {[
                            { name: 'YOLO Motor Classifier', icon: FaMotorcycle, port: 5001, desc: 'Under/Over 250cc Detection', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { name: 'PaddleOCR STNK Engine', icon: FiFileText, port: 5002, desc: 'STNK Matcher & NIK Parsing', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { name: 'Dual ANPR Dispenser', icon: FiCamera, port: 5003, desc: 'CCTV Plate Recognition', color: 'text-amber-600', bg: 'bg-amber-50' },
                            { name: 'Hyperledger Fabric Peer', icon: FiLink, port: 7051, desc: 'Distributed Ledger Consensus', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        ].map((svc) => {
                            const SvcIcon = svc.icon;
                            return (
                                <div key={svc.port} className="p-3 rounded-2xl border border-gray-100 bg-gray-50/70 hover:border-red-200 hover:bg-red-50/20 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${svc.bg} ${svc.color} flex items-center justify-center text-sm shadow-2xs flex-shrink-0`}>
                                            <SvcIcon />
                                        </div>
                                        <div>
                                            <div className="text-xs font-extrabold text-gray-800 leading-tight">{svc.name}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">{svc.desc}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-lg shadow-2xs">
                                        :{svc.port}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Recent Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center">
                            <FiRepeat size={16} />
                        </div>
                        <div>
                            <h3 className="text-gray-900 font-extrabold text-base">Aktivitas Transaksi SPBU Terkini</h3>
                            <p className="text-xs text-gray-400">Verifikasi otomatis kamera dispenser & QR barcode</p>
                        </div>
                    </div>
                    <Link href="/transactions" className="text-xs font-bold text-[#980f12] hover:text-red-800 flex items-center gap-1 bg-red-50 px-3.5 py-2 rounded-xl transition-colors">
                        Lihat Semua Transaksi <FiChevronRight />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nomor Pelat</th>
                                <th className="px-6 py-4">Lokasi SPBU</th>
                                <th className="px-6 py-4">BBM Subsidi</th>
                                <th className="px-6 py-4">Hasil QR</th>
                                <th className="px-6 py-4">Status Transaksi</th>
                                <th className="px-6 py-4 text-right">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx, i) => (
                                <tr key={tx.id} className="hover:bg-red-50/20 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                                            {tx.plate_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-semibold whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            <FiMapPin className="text-gray-400" size={13} /> {tx.spbu_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-bold capitalize whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-[#980f12]">
                                            <FiDroplet size={13} /> {tx.fuel_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{qrBadge(tx.qr_result)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(tx.status)}</td>
                                    <td className="px-6 py-4 text-gray-400 text-xs font-mono text-right whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            <FiClock size={11} /> {tx.transacted_at}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}

Dashboard.layout = (page: any) => <AppLayout title="Dashboard">{page}</AppLayout>;

