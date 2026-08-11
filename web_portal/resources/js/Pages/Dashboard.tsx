import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { 
    FiMapPin, FiRepeat, FiFileText, 
    FiTruck, FiCheckCircle, FiUsers,
    FiActivity, FiChevronRight, FiCheck, FiX
} from 'react-icons/fi';

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
    label, value, icon: Icon, sub, color, delay
}: {
    label: string; value: string | number; icon: any; sub?: string; color: string; delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="card p-6"
    >
        <div className="flex items-start justify-between mb-4">
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${color}15`, color: color }}
            >
                <Icon />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                Hari ini
            </span>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        {sub && <div className="text-xs mt-3 font-medium" style={{ color }}>{sub}</div>}
    </motion.div>
);

const statusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
        validated: { label: 'Valid', color: '#166534', bg: '#dcfce7' },
        rejected: { label: 'Ditolak', color: '#991b1b', bg: '#fee2e2' },
        manual_review: { label: 'Manual Review', color: '#854d0e', bg: '#fef3c7' },
        pending: { label: 'Pending', color: '#475569', bg: '#f1f5f9' },
    };
    const s = map[status] ?? map['pending'];
    return (
        <span className="text-xs px-2.5 py-1 rounded-md font-semibold" style={{ color: s.color, background: s.bg }}>
            {s.label}
        </span>
    );
};

const qrBadge = (result: string) => {
    const isMatch = result === 'qr_match';
    return (
        <span className="text-xs px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1.5"
            style={{
                color: isMatch ? '#166534' : '#991b1b',
                background: isMatch ? '#dcfce7' : '#fee2e2',
            }}
        >
            {isMatch ? <FiCheck size={12} /> : <FiX size={12} />}
            {isMatch ? 'Match' : 'Mismatch'}
        </span>
    );
};

// Default/dummy data for when backend hasn't provided data yet
const defaultStats: Stats = {
    total_spbu: 12,
    daily_transactions: 348,
    pending_registrations: 23,
    registered_vehicles: 1204,
    qr_match_rate: 96.4,
    active_operators: 28,
};

const defaultTransactions: RecentTransaction[] = [
    { id: 1, plate_number: 'BL 1234 AB', spbu_name: 'SPBU 14.201.001', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-11 22:15' },
    { id: 2, plate_number: 'BL 5678 CD', spbu_name: 'SPBU 14.201.002', fuel_type: 'Solar', qr_result: 'qr_not_match', status: 'rejected', transacted_at: '2026-08-11 22:02' },
    { id: 3, plate_number: 'BL 9012 EF', spbu_name: 'SPBU 14.201.001', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-11 21:58' },
    { id: 4, plate_number: 'BL 3456 GH', spbu_name: 'SPBU 14.201.003', fuel_type: 'Pertalite', qr_result: 'qr_match', status: 'manual_review', transacted_at: '2026-08-11 21:43' },
    { id: 5, plate_number: 'BL 7890 IJ', spbu_name: 'SPBU 14.201.002', fuel_type: 'Solar', qr_result: 'qr_match', status: 'validated', transacted_at: '2026-08-11 21:30' },
];

export default function Dashboard({ stats = defaultStats, recent_transactions = defaultTransactions }: Partial<Props>) {
    const s = stats ?? defaultStats;
    const transactions = recent_transactions ?? defaultTransactions;

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, Admin</h2>
                <p className="text-gray-500 mt-1 text-sm">Platform PETROCHAIN — Monitoring Distribusi BBM Bersubsidi</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total SPBU Aktif" value={s.total_spbu} icon={FiMapPin} color="#980f12" delay={0.05} sub={`↑ +2 bulan ini`} />
                <StatCard label="Transaksi Hari Ini" value={s.daily_transactions} icon={FiRepeat} color="#2563eb" delay={0.1} sub={`Diproses otomatis`} />
                <StatCard label="Pendaftaran Pending" value={s.pending_registrations} icon={FiFileText} color="#d97706" delay={0.15} sub={`Menunggu review`} />
                <StatCard label="Kendaraan Terdaftar" value={s.registered_vehicles.toLocaleString()} icon={FiTruck} color="#7c3aed" delay={0.2} sub={`Total aktif`} />
                <StatCard label="QR Match Rate" value={`${s.qr_match_rate}%`} icon={FiCheckCircle} color="#059669" delay={0.25} sub={`Akurasi verifikasi`} />
                <StatCard label="Operator SPBU" value={s.active_operators} icon={FiUsers} color="#db2777" delay={0.3} sub={`Online hari ini`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card col-span-2 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="text-gray-900 font-bold text-base">Transaksi Terbaru</h3>
                        <a href="/transactions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            Lihat semua <FiChevronRight />
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    {['Plat Nomor', 'SPBU', 'BBM', 'QR Check', 'Status', 'Waktu'].map((h) => (
                                        <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((tx, i) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.06 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{tx.plate_number}</td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{tx.spbu_name}</td>
                                        <td className="px-6 py-4 text-gray-500 capitalize">{tx.fuel_type}</td>
                                        <td className="px-6 py-4">{qrBadge(tx.qr_result)}</td>
                                        <td className="px-6 py-4">{statusBadge(tx.status)}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">{tx.transacted_at}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* AI Services Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="card p-6 self-start"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-gray-900 font-bold text-base">Status AI Services</h3>
                        <FiActivity className="text-gray-400" size={20} />
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            { name: 'Klasifikasi Motor', port: 5001, desc: 'Under/Over 250cc' },
                            { name: 'OCR Mobile', port: 5002, desc: 'Verifikasi STNK' },
                            { name: 'OCR SPBU', port: 5003, desc: 'Deteksi Plat Nomor' },
                        ].map((svc) => (
                            <div key={svc.port} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-red-100 hover:bg-red-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-800">{svc.name}</span>
                                    <span className="flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                </div>
                                <div className="text-xs font-medium text-gray-500 mb-2">{svc.desc}</div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-200 text-xs font-mono text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Port: {svc.port}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
