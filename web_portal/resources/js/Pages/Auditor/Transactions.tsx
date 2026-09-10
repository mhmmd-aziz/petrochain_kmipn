import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { 
    FiCheck, FiX, FiClock, FiSearch, FiShield, 
    FiCheckCircle, FiAlertTriangle, FiMapPin, FiDroplet,
    FiHash, FiLink, FiDownload, FiFilter
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export default function AuditorTransactions({ transactions }: any) {
    const txList = transactions?.data || transactions || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'validated' | 'manual_review' | 'rejected'>('all');

    // Load price config
    const [bbmPrice, setBbmPrice] = useState(10000);
    React.useEffect(() => {
        const savedPrice = localStorage.getItem('petrochain_bbm_price');
        if (savedPrice) setBbmPrice(parseInt(savedPrice));
    }, []);

    const filteredList = txList.filter((tx: any) => {
        const matchesStatus = statusFilter === 'all' || tx.transaction_status === statusFilter;
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            (tx.plate_result && tx.plate_result.toLowerCase().includes(query)) ||
            (tx.spbu?.name && tx.spbu.name.toLowerCase().includes(query)) ||
            (tx.fuel_type && tx.fuel_type.toLowerCase().includes(query)) ||
            (tx.blockchain_reference && tx.blockchain_reference.toLowerCase().includes(query));
        
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <Head title="Audit Log Transaksi - BPH Migas" />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-purple-950 to-[#980f12] text-white border border-purple-900/30 shadow-xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-purple-200 mb-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                            AUDIT TRAIL READ-ONLY • BPH MIGAS & KEMENKEU
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FiShield className="text-emerald-400" />
                            Log Audit Transaksi Penyaluran BBM
                        </h2>
                        <p className="text-purple-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                            Monitoring integritas setiap liter BBM bersubsidi yang tersalurkan di seluruh SPBU nasional.
                        </p>
                    </div>

                    <Link
                        href="/blockchain"
                        className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
                    >
                        <FiLink className="text-emerald-400" /> Buka Blockchain Explorer
                    </Link>
                </div>
            </motion.div>

            {/* Filter Toolbar & Search */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { key: 'all', label: 'Semua Transaksi' },
                            { key: 'validated', label: '✓ Valid (Disetujui)' },
                            { key: 'manual_review', label: '⚠ Manual Review' },
                            { key: 'rejected', label: '✗ Ditolak' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key as any)}
                                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                                    statusFilter === tab.key
                                        ? 'bg-[#980f12] text-white shadow-xs'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Instant Search Bar */}
                    <div className="relative w-full md:w-80">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Plat, SPBU, atau Hash..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:border-[#980f12] focus:ring-[#980f12] shadow-2xs"
                        />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/75 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Waktu Transaksi</th>
                                <th className="px-6 py-4">Titik SPBU</th>
                                <th className="px-6 py-4">Kendaraan (ANPR)</th>
                                <th className="px-6 py-4">BBM Subsidi & Volume</th>
                                <th className="px-6 py-4 text-emerald-800">Nilai Subsidi (Rp)</th>
                                <th className="px-6 py-4">Status QR</th>
                                <th className="px-6 py-4">Audit Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredList.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-red-50/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-mono">
                                        <div className="flex items-center gap-1.5">
                                            <FiClock className="text-gray-400" size={13} />
                                            {tx.transacted_at ? new Date(tx.transacted_at).toLocaleString('id-ID') : '2026-08-20 21:15'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1">
                                            <FiMapPin className="text-gray-400" size={13} />
                                            {tx.spbu?.name || 'SPBU 14.201.001'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                                            {tx.plate_result || 'BL 1234 DEMO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-bold whitespace-nowrap">
                                        {tx.original_volume && (tx.volume != tx.original_volume || tx.fuel_type !== (tx.original_fuel_type || tx.fuel_type)) ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-red-500 line-through opacity-80" title="Data Manipulasi">
                                                    <span className="inline-flex items-center gap-1 text-[#980f12]">
                                                        <FiDroplet size={13} /> {tx.fuel_type}
                                                    </span>
                                                    <span className="font-mono font-normal ml-1 text-xs">({tx.volume}L)</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-700" title="Data Asli On-Chain">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiDroplet size={13} /> {tx.original_fuel_type || tx.fuel_type}
                                                    </span>
                                                    <span className="font-mono font-bold ml-1 text-xs">({tx.original_volume}L) Asli</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center gap-1 text-[#980f12]">
                                                    <FiDroplet size={13} /> {tx.fuel_type}
                                                </span>
                                                <span className="text-gray-400 font-mono font-normal ml-1 text-xs">({tx.volume}L)</span>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-black text-emerald-700">
                                            Rp {(tx.volume * bbmPrice).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                            tx.qr_result === 'qr_match' 
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                                : 'bg-rose-50 text-rose-800 border-rose-200'
                                        }`}>
                                            {tx.qr_result === 'qr_match' ? <><FiCheckCircle size={12} /> Match</> : <><FiAlertTriangle size={12} /> Mismatch</>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                            tx.transaction_status === 'validated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            tx.transaction_status === 'manual_review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {tx.transaction_status === 'validated' ? '✓ Valid' :
                                             tx.transaction_status === 'manual_review' ? '⚠ Perlu Review' : '✗ Ditolak'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <FiShield size={36} className="mx-auto mb-2 text-gray-300" />
                                        Tidak ada log audit transaksi yang cocok dengan filter.
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

AuditorTransactions.layout = (page: any) => <AppLayout title="Audit Log Transaksi">{page}</AppLayout>;

