import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    FiMapPin, FiSearch, FiArrowLeft, FiDroplet, 
    FiCheckCircle, FiAlertCircle, FiExternalLink, 
    FiNavigation, FiRefreshCw, FiFilter 
} from 'react-icons/fi';

export default function PublicStock({ spbus }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFuel, setSelectedFuel] = useState<string>('all');
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    const filteredSpbus = spbus.filter((spbu: any) => {
        const matchesSearch = 
            spbu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            spbu.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spbu.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spbu.address.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (onlyAvailable) {
            const hasAvailable = spbu.fuel_stocks?.some((s: any) => s.status === 'available');
            if (!hasAvailable) return false;
        }

        if (selectedFuel !== 'all') {
            const hasFuel = spbu.fuel_stocks?.some((s: any) => s.fuel_type.toLowerCase() === selectedFuel.toLowerCase());
            if (!hasFuel) return false;
        }

        return true;
    });

    const getGoogleMapsUrl = (spbu: any) => {
        if (spbu.latitude && spbu.longitude) {
            return `https://www.google.com/maps/search/?api=1&query=${spbu.latitude},${spbu.longitude}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spbu.name + ' ' + spbu.city)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#980f12] selection:text-white">
            <Head title="Informasi Ketersediaan Stok BBM SPBU - PETROCHAIN" />

            {/* Header */}
            <div className="bg-gradient-to-br from-[#800b0e] via-[#980f12] to-[#c9181b] text-white pt-10 pb-28 px-4 sm:px-6 relative overflow-hidden">
                {/* Decorative background circles */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-400/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-200 hover:text-white transition-colors mb-6 group bg-black/15 px-3.5 py-1.5 rounded-full border border-white/10"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-red-200 bg-white/10 px-3 py-1 rounded-full">
                                Monitoring Publik Terbuka
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-3 mb-2 tracking-tight">
                                Ketersediaan Stok BBM SPBU
                            </h1>
                            <p className="text-red-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                                Pantau status real-time stok Pertalite, Solar, dan BBM Subsidi di seluruh stasiun SPBU terdaftar secara transparan sebelum melakukan perjalanan.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-medium self-start md:self-auto">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Live Data Sinkronisasi</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content & Filter */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-14 relative z-20 pb-24">
                
                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 space-y-4">
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <FiSearch size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari nama SPBU, kode stasiun, kota, atau alamat..." 
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-gray-400 hover:text-gray-600"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-500 font-semibold flex items-center gap-1">
                                <FiFilter /> BBM:
                            </span>
                            <button
                                onClick={() => setSelectedFuel('all')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                    selectedFuel === 'all' 
                                        ? 'bg-[#980f12] text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Semua Jenis
                            </button>
                            <button
                                onClick={() => setSelectedFuel('pertalite')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                    selectedFuel === 'pertalite' 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Pertalite
                            </button>
                            <button
                                onClick={() => setSelectedFuel('solar')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                                    selectedFuel === 'solar' 
                                        ? 'bg-gray-900 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Solar
                            </button>
                        </div>

                        {/* Availability toggle */}
                        <button
                            onClick={() => setOnlyAvailable(!onlyAvailable)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                                onlyAvailable 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FiCheckCircle className={onlyAvailable ? 'text-emerald-600' : 'text-gray-400'} />
                            Hanya SPBU Tersedia
                        </button>
                    </div>
                </div>

                {/* SPBU Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSpbus.map((spbu: any, index: number) => (
                        <motion.div 
                            key={spbu.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* SPBU Header Card */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center flex-shrink-0 font-bold">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                                                {spbu.name}
                                            </h3>
                                            <span className="text-[11px] font-mono font-bold bg-red-50 text-[#980f12] px-2.5 py-1 rounded-lg flex-shrink-0">
                                                {spbu.code}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-snug">
                                            {spbu.address}, <strong className="text-gray-700">{spbu.city}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Stock Status List */}
                                <div className="space-y-2.5 mb-6">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Status Tangki BBM:
                                    </div>

                                    {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => {
                                        const isAvailable = stock.status === 'available';
                                        const isPertalite = stock.fuel_type === 'pertalite';
                                        
                                        return (
                                            <div 
                                                key={stock.id} 
                                                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs ${
                                                        isPertalite ? 'bg-emerald-600' :
                                                        stock.fuel_type === 'solar' ? 'bg-gray-800' : 'bg-blue-600'
                                                    }`}>
                                                        <FiDroplet />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-gray-900 capitalize block">
                                                            {stock.fuel_type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            Subsidi Terverifikasi
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                                    isAvailable 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                        : stock.status === 'empty' 
                                                        ? 'bg-red-100 text-red-700 border border-red-200' 
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                    {isAvailable ? (
                                                        <>
                                                            <FiCheckCircle className="text-emerald-600" /> Tersedia
                                                        </>
                                                    ) : stock.status === 'empty' ? (
                                                        <>
                                                            <FiAlertCircle className="text-red-600" /> Habis
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiAlertCircle className="text-amber-600" /> Terbatas
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center p-4 text-xs text-gray-400 italic bg-gray-50 rounded-2xl border border-gray-100">
                                            Data stok belum diperbarui oleh operator.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Action Footer */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <FiRefreshCw className="text-gray-400" /> Terverifikasi SPBU
                                </span>

                                <a
                                    href={getGoogleMapsUrl(spbu)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#980f12] bg-red-50 hover:bg-[#980f12] hover:text-white transition-all shadow-sm"
                                >
                                    <FiNavigation /> Buka Google Maps <FiExternalLink size={12} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                    
                    {filteredSpbus.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <FiMapPin className="mx-auto text-red-300 mb-4" size={48} />
                            <h4 className="text-lg font-bold text-gray-800">SPBU Tidak Ditemukan</h4>
                            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                Tidak ada SPBU yang cocok dengan kata kunci <strong>"{searchTerm}"</strong> atau filter bahan bakar yang dipilih.
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedFuel('all'); setOnlyAvailable(false); }}
                                className="mt-4 px-5 py-2 rounded-full text-xs font-bold bg-[#980f12] text-white shadow-md hover:bg-red-800 transition-colors"
                            >
                                Reset Filter Pencarian
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

