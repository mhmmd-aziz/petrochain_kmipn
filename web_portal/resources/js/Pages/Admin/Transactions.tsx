import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiSearch, FiDownload, FiFileText } from 'react-icons/fi';

interface Transaction {
    id: number;
    vehicle_id: number;
    spbu_id: number;
    operator_id: number;
    fuel_type: string;
    volume: number;
    qr_result: string;
    plate_result: string | null;
    plate_confidence: number;
    yolo_result: string | null;
    yolo_confidence: number;
    transaction_status: string;
    blockchain_reference: string | null;
    transacted_at: string;
    vehicle: {
        id: number;
        plate_number: string;
        vehicle_type: string;
        brand: string;
        model: string;
    };
    spbu: {
        id: number;
        code: string;
        name: string;
        location: string;
    };
    operator: {
        id: number;
        user: {
            name: string;
        };
    };
}

export default function Transactions({ transactions, filters = {} }: { transactions: Transaction[], filters?: any }) {
    
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get('/transactions', { search, start_date: startDate, end_date: endDate, status }, { preserveState: true });
    };

    const handleExport = (type: 'pdf' | 'csv') => {
        const query = new URLSearchParams({ search, start_date: startDate, end_date: endDate, status }).toString();
        window.open(`/transactions/export/${type}?${query}`, '_blank');
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'validated':
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center gap-1 w-max"><FiCheckCircle /> Valid</span>;
            case 'rejected':
            case 'failed':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold flex items-center gap-1 w-max"><FiXCircle /> Ditolak</span>;
            case 'manual_review':
            case 'flagged':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold flex items-center gap-1 w-max"><FiAlertTriangle /> Review</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold w-max">{status}</span>;
        }
    };

    return (
        <>
            <Head title="Transaksi SPBU" />

            <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
                    <p className="text-gray-500 text-sm mt-1">Pemantauan real-time validasi kendaraan dan penyaluran BBM bersubsidi.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                        <FiDownload /> Excel (CSV)
                    </button>
                    <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                        <FiFileText /> PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cari Plat Nomor</label>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={handleFilter}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Contoh: BL 1234 AB" 
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary w-full"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onBlur={handleFilter} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onBlur={handleFilter} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status Audit</label>
                    <select value={status} onChange={e => { setStatus(e.target.value); setTimeout(handleFilter, 100); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary">
                        <option value="all">Semua Status</option>
                        <option value="valid">Valid (Disetujui)</option>
                        <option value="review">Manual Review</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>
                <button onClick={handleFilter} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition">
                    Terapkan
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-4">Waktu</th>
                                <th className="px-5 py-4">Lokasi & Petugas</th>
                                <th className="px-5 py-4">Kendaraan</th>
                                <th className="px-5 py-4">BBM & Volume</th>
                                <th className="px-5 py-4 text-center">AI Match</th>
                                <th className="px-5 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map(trx => {
                                const isMatch = trx.qr_result === 'qr_match' && trx.transaction_status === 'validated';
                                
                                return (
                                <tr key={trx.id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {new Date(trx.transacted_at).toLocaleDateString('id-ID')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(trx.transacted_at).toLocaleTimeString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-gray-900">{trx.spbu?.name || 'SPBU Unknown'}</div>
                                        <div className="text-xs text-gray-500">Opr: {trx.operator?.user?.name || '-'}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="font-mono font-bold text-gray-900">{trx.vehicle?.plate_number}</div>
                                        <div className="text-xs text-gray-500 capitalize">{trx.vehicle?.brand} {trx.vehicle?.model}</div>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{trx.fuel_type}</div>
                                        <div className="text-xs text-gray-500">{trx.volume} Liter</div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {isMatch ? (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" title="QR & OCR Cocok">
                                                <FiCheckCircle size={14} />
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600" title="Tidak Cocok / Flagged">
                                                <FiXCircle size={14} />
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {getStatusBadge(trx.transaction_status)}
                                    </td>
                                </tr>
                            )})}
                            
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                                        Belum ada riwayat transaksi yang sesuai kriteria pencarian.
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

Transactions.layout = (page: any) => <AppLayout title="Transaksi SPBU">{page}</AppLayout>;

