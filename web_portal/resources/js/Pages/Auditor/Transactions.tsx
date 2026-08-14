import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

export default function AuditorTransactions({ transactions }: any) {
    return (
        <>
            <Head title="Audit Transaksi" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Log Transaksi (Auditor)</h2>
                <p className="text-gray-500 mt-1 text-sm">Pemantauan transaksi untuk tujuan audit dan pengawasan (Read-Only).</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">SPBU</th>
                                <th className="px-6 py-4">Kendaraan (Plat)</th>
                                <th className="px-6 py-4">BBM / Vol</th>
                                <th className="px-6 py-4">AI Scan</th>
                                <th className="px-6 py-4">Status Transaksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.data.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <FiClock className="text-gray-400"/>
                                            {new Date(tx.transacted_at).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{tx.spbu?.name || '-'}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                        {tx.plate_result}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {tx.fuel_type} <span className="text-gray-400 font-normal">({tx.volume}L)</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${tx.qr_result === 'qr_match' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tx.qr_result === 'qr_match' ? <><FiCheck/> Match</> : <><FiX/> Mismatch</>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                            tx.transaction_status === 'validated' ? 'bg-green-50 text-green-700' :
                                            tx.transaction_status === 'manual_review' ? 'bg-yellow-50 text-yellow-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {tx.transaction_status === 'validated' ? 'Valid' :
                                             tx.transaction_status === 'manual_review' ? 'Manual Review' : 'Ditolak'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada log transaksi.
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

AuditorTransactions.layout = (page: any) => <AppLayout title="Audit Log Transaksi">{page}</AppLayout>;
