import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FiMapPin, FiSearch, FiArrowLeft, FiDroplet, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function PublicStock({ spbus }: any) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSpbus = spbus.filter((spbu: any) => 
        spbu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        spbu.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Head title="Informasi Stok BBM SPBU" />

            {/* Header */}
            <div className="bg-[#980f12] text-white pt-10 pb-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://laravel.com/assets/img/welcome/background.svg')] bg-cover bg-center"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-red-200 hover:text-white transition-colors mb-6 text-sm font-semibold">
                        <FiArrowLeft /> Kembali ke Beranda
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4">Ketersediaan Stok BBM</h1>
                    <p className="text-red-100 text-lg max-w-2xl">Pantau status stok bahan bakar di seluruh SPBU secara real-time yang dilaporkan langsung oleh operator.</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 pb-20">
                {/* Search */}
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex items-center mb-10">
                    <div className="pl-4 text-gray-400"><FiSearch size={20} /></div>
                    <input 
                        type="text" 
                        placeholder="Cari nama SPBU atau kota..." 
                        className="w-full border-none focus:ring-0 bg-transparent py-3 px-4 text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSpbus.map((spbu: any, index: number) => (
                        <motion.div 
                            key={spbu.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-50 text-[#980f12] flex items-center justify-center flex-shrink-0">
                                    <FiMapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900">{spbu.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{spbu.address}, {spbu.city}</p>
                                    <span className="inline-block mt-2 text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">Kode: {spbu.code}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => (
                                    <div key={stock.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                                                stock.fuel_type === 'pertalite' ? 'bg-green-500' :
                                                stock.fuel_type === 'solar' ? 'bg-gray-800' : 'bg-blue-600'
                                            }`}>
                                                <FiDroplet />
                                            </div>
                                            <span className="font-bold text-gray-900 capitalize">{stock.fuel_type.replace('_', ' ')}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            stock.status === 'available' ? 'bg-green-100 text-green-700' : 
                                            stock.status === 'empty' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {stock.status === 'available' ? <FiCheckCircle /> : <FiAlertCircle />}
                                            {stock.status === 'available' ? 'Tersedia' : stock.status === 'empty' ? 'Habis' : 'Terbatas'}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center p-4 text-sm text-gray-500 italic bg-gray-50 rounded-xl border border-gray-100">
                                        Data stok belum tersedia untuk SPBU ini.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    
                    {filteredSpbus.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            <FiMapPin className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-lg">Tidak menemukan SPBU dengan kata kunci tersebut.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
