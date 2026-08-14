import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiCamera, FiDroplet, FiClock, FiCheck, FiX, FiActivity } from 'react-icons/fi';

export default function OperatorDashboard({ spbu, recent_transactions, stats }: any) {
    if (!spbu) {
        return (
            <>
                <div className="p-6">
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                        <FiX size={24} />
                        <div>
                            <h3 className="font-bold">Akses Ditolak</h3>
                            <p className="text-sm">Akun Anda belum terhubung dengan SPBU manapun.</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Dashboard - ${spbu.name}`} />

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Operator</h2>
                    <p className="text-gray-500 mt-1 text-sm font-medium">
                        {spbu.name} &bull; {spbu.code} &bull; {spbu.city}
                    </p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                    <Link
                        href={route('operator.stock')}
                        className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiDroplet /> Update Stok BBM
                    </Link>
                    <Link
                        href={route('operator.validation')}
                        className="bg-[#980f12] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-red-800 flex items-center gap-2"
                    >
                        <FiCamera /> Validasi Kendaraan (Scan QR)
                    </Link>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <FiActivity />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Transaksi Hari Ini</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.today_transactions} <span className="text-xs font-medium text-gray-400 font-normal">kendaraan</span></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                        <FiCheck />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">QR Code Berhasil Scan</div>
                        <div className="text-2xl font-extrabold text-gray-900">{stats.qr_scanned} <span className="text-xs font-medium text-gray-400 font-normal">scan</span></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FiClock className="text-gray-400" /> Riwayat Transaksi Terbaru
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Waktu</th>
                                <th className="px-6 py-4 font-semibold">Plat Nomor (AI)</th>
                                <th className="px-6 py-4 font-semibold">Jenis Kendaraan</th>
                                <th className="px-6 py-4 font-semibold">BBM / Volume</th>
                                <th className="px-6 py-4 font-semibold">Status QR</th>
                                <th className="px-6 py-4 font-semibold">Status Transaksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recent_transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(tx.transacted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{tx.plate_result}</td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">{tx.yolo_result || '-'}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {tx.fuel_type} <span className="text-gray-400 font-normal ml-1">{tx.volume}L</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${tx.qr_result === 'qr_match' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.qr_result === 'qr_match' ? <><FiCheck /> Match</> : <><FiX /> Mismatch</>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                                            tx.transaction_status === 'validated' ? 'bg-green-50 text-green-700' :
                                            tx.transaction_status === 'manual_review' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {tx.transaction_status === 'validated' ? 'Valid' :
                                             tx.transaction_status === 'manual_review' ? 'Perlu Review' : 'Ditolak'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recent_transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada transaksi hari ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

OperatorDashboard.layout = (page: any) => <AppLayout title="Operator Dashboard">{page}</AppLayout>;
