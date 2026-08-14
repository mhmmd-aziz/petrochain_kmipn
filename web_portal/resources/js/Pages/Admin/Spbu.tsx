import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiMapPin, FiCheckCircle, FiAlertCircle, FiDroplet } from 'react-icons/fi';

export default function AdminSpbu({ spbus }: any) {
    return (
        <>
            <Head title="Manajemen SPBU" />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen SPBU</h2>
                    <p className="text-gray-500 mt-1 text-sm">Pantau daftar SPBU terdaftar dan status stok BBM.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {spbus.map((spbu: any) => (
                    <div key={spbu.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-red-50 text-[#980f12] flex items-center justify-center">
                                    <FiMapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{spbu.name}</h3>
                                    <div className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-block mt-1">Kode: {spbu.code}</div>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">{spbu.address}, {spbu.city}, {spbu.province}</p>
                            
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-gray-700">Operator Bertugas:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {spbu.operators?.length > 0 ? spbu.operators.map((op: any) => (
                                    <span key={op.id} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                                        {op.user?.name}
                                    </span>
                                )) : (
                                    <span className="text-xs text-gray-400 italic">Belum ada operator</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <FiDroplet className="text-gray-400" /> Status Stok BBM
                            </h4>
                            <div className="space-y-2">
                                {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => (
                                    <div key={stock.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-sm">
                                        <span className="font-semibold text-gray-800 capitalize">{stock.fuel_type.replace('_', ' ')}</span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                                            stock.status === 'available' ? 'bg-green-100 text-green-700' : 
                                            stock.status === 'empty' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {stock.status === 'available' ? <FiCheckCircle size={12}/> : <FiAlertCircle size={12}/>}
                                            {stock.status === 'available' ? 'Tersedia' : stock.status === 'empty' ? 'Habis' : 'Terbatas'}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4">Data stok tidak tersedia.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {spbus.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">Belum ada data SPBU.</p>
                    </div>
                )}
            </div>
        </>
    );
}

AdminSpbu.layout = (page: any) => <AppLayout title="Manajemen SPBU">{page}</AppLayout>;
