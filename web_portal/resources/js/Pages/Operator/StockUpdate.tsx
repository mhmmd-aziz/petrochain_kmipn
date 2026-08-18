import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiDroplet, FiCheckCircle, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi';
import { useState } from 'react';

export default function OperatorStockUpdate({ spbu, stocks }: any) {
    const allFuelTypes = [
        { value: 'pertalite', label: 'Pertalite' },
        { value: 'solar', label: 'Solar' },
        { value: 'pertamax', label: 'Pertamax' },
        { value: 'pertamax_turbo', label: 'Pertamax Turbo' },
        { value: 'dex', label: 'Dex' },
        { value: 'dexlite', label: 'Dexlite' }
    ];
    
    // Filter available fuels
    const existingFuels = stocks.map((s: any) => s.fuel_type);
    const availableFuels = allFuelTypes.filter(f => !existingFuels.includes(f.value));

    const [newFuelType, setNewFuelType] = useState(availableFuels.length > 0 ? availableFuels[0].value : '');
    const [isAdding, setIsAdding] = useState(false);

    const updateStock = (stockId: number, status: string) => {
        router.post(route('operator.stock.update'), {
            stock_id: stockId,
            status: status
        }, {
            preserveScroll: true
        });
    };

    const deleteStock = (stockId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jenis bahan bakar ini?')) {
            router.delete(route('operator.stock.destroy', stockId), {
                preserveScroll: true
            });
        }
    };

    const addStock = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('operator.stock.store'), {
            fuel_type: newFuelType,
            status: 'available'
        }, {
            preserveScroll: true,
            onSuccess: () => setIsAdding(false)
        });
    };

    return (
        <>
            <Head title={`Update Stok - ${spbu?.name || 'Operator'}`} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manajemen Stok BBM</h2>
                        <p className="text-gray-500 mt-1 text-sm">Kelola daftar dan status ketersediaan stok BBM di SPBU Anda.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (availableFuels.length > 0) {
                                setNewFuelType(availableFuels[0].value);
                            }
                            setIsAdding(!isAdding);
                        }}
                        disabled={availableFuels.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
                            availableFuels.length === 0 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <FiPlus /> {availableFuels.length === 0 ? 'Semua BBM Tersedia' : 'Tambah BBM'}
                    </button>
                </div>

                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
                    >
                        <h3 className="font-bold text-gray-900 mb-4">Tambah Jenis BBM Baru</h3>
                        <form onSubmit={addStock} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bahan Bakar</label>
                                <select 
                                    value={newFuelType}
                                    onChange={(e) => setNewFuelType(e.target.value)}
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {availableFuels.map(fuel => (
                                        <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors">
                                Simpan
                            </button>
                            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                Batal
                            </button>
                        </form>
                    </motion.div>
                )}

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
                                <div className="text-right flex flex-col items-end gap-2">
                                    <button 
                                        onClick={() => deleteStock(stock.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                        title="Hapus BBM"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
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
