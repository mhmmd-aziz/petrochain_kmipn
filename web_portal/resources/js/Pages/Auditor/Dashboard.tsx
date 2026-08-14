import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiMap, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function AuditorDashboard({ stats }: any) {
    return (
        <>
            <Head title="Auditor Dashboard" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Pengawasan</h2>
                <p className="text-gray-500 mt-1 text-sm">Pemantauan distribusi BBM bersubsidi secara nasional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                            <FiTrendingUp />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats?.total_transactions?.toLocaleString() || 0}</div>
                    <div className="text-sm font-medium text-gray-500">Total Transaksi</div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                            <FiMap />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats?.total_spbu || 0}</div>
                    <div className="text-sm font-medium text-gray-500">Titik SPBU Terdaftar</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                            <FiShield />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats?.compliance_rate || 0}%</div>
                    <div className="text-sm font-medium text-gray-500">Tingkat Kepatuhan Validasi</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm bg-red-50/30">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-xl">
                            <FiAlertTriangle />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-red-600 mb-1">{stats?.audit_alerts || 0}</div>
                    <div className="text-sm font-medium text-red-700">Anomali & Audit Alert</div>
                </motion.div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                <FiShield className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Audit Log Sistem</h3>
                <p className="max-w-md mx-auto mb-6">Sebagai auditor (BPH Migas / Kemenkeu), Anda dapat meninjau log integritas setiap transaksi yang telah diverifikasi oleh AI PETROCHAIN.</p>
                <Link href={route('auditor.transactions')} className="inline-flex bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-black transition-colors">
                    Lihat Laporan Transaksi Lengkap
                </Link>
            </div>
        </>
    );
}

AuditorDashboard.layout = (page: any) => <AppLayout title="Executive & Auditor Dashboard">{page}</AppLayout>;
