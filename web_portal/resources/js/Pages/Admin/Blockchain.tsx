import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { FiLink, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiHash } from 'react-icons/fi';
import { ethers } from 'ethers';
import PetrochainAuditABI from '@/lib/PetrochainAudit.json';

export default function Blockchain({ transactions }: { transactions: any[] }) {
    const [verificationStatus, setVerificationStatus] = useState<Record<string, { status: 'loading' | 'matched' | 'tampered' | 'not_found' | 'error', onChainHash?: string }>>({});

    const verifyTransaction = async (tx: any) => {
        setVerificationStatus(prev => ({ ...prev, [tx.id]: { status: 'loading' } }));
        try {
            const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
            const contract = new ethers.Contract(PetrochainAuditABI.address, PetrochainAuditABI.abi, provider);
            
            // Generate what the hash SHOULD be based on DB data
            const spbuCode = tx.spbu?.code || 'UNKNOWN';
            const dataString = `${tx.id}|${tx.plate_result}|${tx.fuel_type}|${tx.volume}|${spbuCode}`;
            
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(dataString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Fetch from blockchain
            const onChainData = await contract.verifyTransaction(tx.id.toString());
            const onChainHash = onChainData.dataHash;

            if (!onChainHash) {
                setVerificationStatus(prev => ({ ...prev, [tx.id]: { status: 'not_found' } }));
                return;
            }

            if (calculatedHash === onChainHash) {
                setVerificationStatus(prev => ({ ...prev, [tx.id]: { status: 'matched', onChainHash } }));
            } else {
                setVerificationStatus(prev => ({ ...prev, [tx.id]: { status: 'tampered', onChainHash } }));
            }
        } catch (error) {
            console.error("Verification error:", error);
            setVerificationStatus(prev => ({ ...prev, [tx.id]: { status: 'error' } }));
        }
    };

    return (
        <div className="p-6">
            <Head title="Blockchain Audit" />
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Audit Trail Blockchain</h2>
                <p className="text-gray-500">Immutable Ledger untuk mendeteksi manipulasi data subsidi.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
                        <tr>
                            <th className="px-6 py-4">ID Transaksi</th>
                            <th className="px-6 py-4">Kendaraan</th>
                            <th className="px-6 py-4">Volume</th>
                            <th className="px-6 py-4">Status Blockchain</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                <td className="px-6 py-4 font-medium text-gray-900">#{tx.id}</td>
                                <td className="px-6 py-4">{tx.plate_result}</td>
                                <td className="px-6 py-4">{tx.volume}L <span className="uppercase text-xs font-bold text-gray-500 ml-1">{tx.fuel_type}</span></td>
                                <td className="px-6 py-4">
                                    {tx.blockchain_reference ? (
                                        <div className="flex items-center gap-2 text-xs">
                                            <FiHash className="text-gray-400" />
                                            <span className="font-mono text-gray-600 truncate max-w-[120px]" title={tx.blockchain_reference}>
                                                {tx.blockchain_reference}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Belum Dicatat</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!tx.blockchain_reference ? (
                                        <span className="text-gray-400 text-xs">N/A</span>
                                    ) : (
                                        <button 
                                            onClick={() => verifyTransaction(tx)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            {verificationStatus[tx.id]?.status === 'loading' ? (
                                                <><FiRefreshCw className="animate-spin" /> Memeriksa...</>
                                            ) : verificationStatus[tx.id]?.status === 'matched' ? (
                                                <span className="text-green-600 flex items-center gap-2"><FiCheckCircle /> Data Valid</span>
                                            ) : verificationStatus[tx.id]?.status === 'tampered' ? (
                                                <span className="text-red-600 flex items-center gap-2"><FiAlertTriangle /> Dimanipulasi!</span>
                                            ) : verificationStatus[tx.id]?.status === 'error' ? (
                                                <span className="text-orange-600 flex items-center gap-2"><FiAlertTriangle /> Node Offline</span>
                                            ) : (
                                                <>Verifikasi Integritas</>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    Belum ada transaksi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Blockchain.layout = (page: any) => <AppLayout title="Blockchain Audit">{page}</AppLayout>;
