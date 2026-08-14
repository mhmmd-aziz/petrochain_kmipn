import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiDroplet, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function OperatorStockUpdate({ spbu, stocks }: any) {
    const updateStock = (stockId: number, status: string) => {
        router.post(route('operator.stock.update'), {
            stock_id: stockId,
            status: status
        }, {
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title={`Update Stok - ${spbu?.name || 'Operator'}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Manajemen Stok BBM</h2>
                    <p className="text-gray-500 mt-1 text-sm">Perbarui ketersediaan stok BBM di SPBU Anda secara real-time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stocks.map((stock: any, index: number) => (
                        <motion.div 
                            key={stock.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                                        stock.fuel_type === 'pertalite' ? 'bg-green-500' :
                                        stock.fuel_type === 'solar' ? 'bg-gray-800' :
                                        stock.fuel_type === 'pertamax' ? 'bg-blue-600' : 'bg-red-600'
                                    }`}>
                                        <FiDroplet size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 capitalize text-lg">{stock.fuel_type.replace('_', ' ')}</h3>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Update Terakhir: {stock.last_updated_at ? new Date(stock.last_updated_at).toLocaleString('id-ID') : 'Belum pernah'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                        stock.status === 'available' ? 'bg-green-100 text-green-700' : 
                                        stock.status === 'empty' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {stock.status === 'available' ? <FiCheckCircle /> : <FiAlertCircle />}
                                        {stock.status === 'available' ? 'Tersedia' : stock.status === 'empty' ? 'Habis' : 'Terbatas'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => updateStock(stock.id, 'available')}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        stock.status === 'available' 
                                            ? 'bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2' 
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    Tersedia
                                </button>
                                <button
                                    onClick={() => updateStock(stock.id, 'empty')}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        stock.status === 'empty' 
                                            ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-2' 
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    Habis
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {stocks.length === 0 && (
                        <div className="col-span-full p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">Belum ada data stok bahan bakar yang diatur untuk SPBU ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

OperatorStockUpdate.layout = (page: any) => <AppLayout title="Update Stok BBM">{page}</AppLayout>;
