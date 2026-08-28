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
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#980f12] selection:text-white flex flex-col justify-between">
            <Head title="Informasi Ketersediaan Stok BBM SPBU - PETROCHAIN" />

            {/* Top Navigation Bar Matching Landing Page */}
            <div>
                <nav className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-6 lg:px-10 xl:px-14 sticky top-0 z-40 shadow-xs">
                    <div className="flex justify-between items-center gap-4">
                        {/* Logos & Brand */}
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                            <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-2xl border border-gray-200 bg-gray-100/90">
                                <img src="/images/logos/tut_wuri.png?v=2" alt="Tut Wuri" className="h-6 sm:h-7 w-auto object-contain" />
                                <img src="/images/logos/kemendikti.png" alt="Kemendikti" className="h-6 sm:h-7 w-auto object-contain" />
                                <img src="/images/logos/pnl.png" alt="PNL" className="h-6 sm:h-7 w-auto object-contain" />
                                <img src="/images/logos/kmipn.png" alt="KMIPN" className="h-6 sm:h-7 w-auto object-contain" />
                            </div>
                            <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#980f12] p-1.5 flex items-center justify-center text-white shadow-xs">
                                    <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="font-extrabold text-base sm:text-lg text-gray-950 tracking-wide leading-none">
                                        PETROCHAIN
                                    </span>
                                    <p className="text-[9px] text-gray-500 font-medium leading-tight mt-0.5 hidden lg:block">
                                        Intelligent Fuel Subsidy Ecosystem
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Return to Home CTA */}
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 hover:text-white bg-gray-100 hover:bg-[#980f12] border border-gray-200 hover:border-[#980f12] px-4 py-2 rounded-none transition-all shadow-2xs cursor-pointer"
                        >
                            <FiArrowLeft size={16} /> Kembali ke Beranda
                        </Link>
                    </div>
                </nav>

                {/* Section Header: Matching Landing Page Aesthetic (Image 2 style) */}
                <div className="w-full text-left py-10 px-4 sm:px-6 lg:px-10 xl:px-14 border-b border-gray-200 bg-white">
                    <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                        Monitoring Publik Terbuka
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight">
                                Ketersediaan Stok BBM SPBU
                            </h1>
                            <p className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                                Pantau status real-time stok Pertalite, Solar, dan BBM Subsidi di seluruh stasiun SPBU terdaftar secara transparan sebelum melakukan perjalanan.
                            </p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-none flex items-center gap-2.5 text-xs font-bold text-emerald-800 self-start md:self-auto shrink-0 shadow-2xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Live Data Sinkronisasi</span>
                        </div>
                    </div>
                </div>

                {/* Main Content & Filter */}
                <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-8">
                    
                    {/* Search & Filter Toolbar: Console Box (rounded-none, border-gray-200) */}
                    <div className="bg-white p-5 sm:p-6 rounded-none shadow-2xs border border-gray-200 mb-8 space-y-4">
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <FiSearch size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari nama SPBU, kode stasiun, kota, atau alamat..." 
                                className="w-full pl-11 pr-4 py-3.5 rounded-none border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#980f12] focus:border-[#980f12] transition-all"
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
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                            
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-700 font-bold flex items-center gap-1 mr-1 uppercase tracking-wider text-[11px]">
                                    <FiFilter /> BBM:
                                </span>
                                <button
                                    onClick={() => setSelectedFuel('all')}
                                    className={`px-3.5 py-1.5 rounded-none font-bold transition-all cursor-pointer ${
                                        selectedFuel === 'all' 
                                            ? 'bg-[#980f12] text-white shadow-xs' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    Semua Jenis
                                </button>
                                <button
                                    onClick={() => setSelectedFuel('pertalite')}
                                    className={`px-3.5 py-1.5 rounded-none font-bold transition-all cursor-pointer ${
                                        selectedFuel === 'pertalite' 
                                            ? 'bg-emerald-600 text-white shadow-xs' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    Pertalite
                                </button>
                                <button
                                    onClick={() => setSelectedFuel('solar')}
                                    className={`px-3.5 py-1.5 rounded-none font-bold transition-all cursor-pointer ${
                                        selectedFuel === 'solar' 
                                            ? 'bg-gray-900 text-white shadow-xs' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    Solar
                                </button>
                            </div>

                            {/* Availability toggle */}
                            <button
                                onClick={() => setOnlyAvailable(!onlyAvailable)}
                                className={`px-3.5 py-1.5 rounded-none font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    onlyAvailable 
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                            >
                                <FiCheckCircle className={onlyAvailable ? 'text-emerald-600' : 'text-gray-400'} />
                                Hanya SPBU Tersedia
                            </button>
                        </div>
                    </div>

                    {/* SPBU Cards Grid: Monolithic, Edge-Aligned, Straight Corners */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSpbus.map((spbu: any, index: number) => (
                            <motion.div 
                                key={spbu.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white rounded-none p-6 sm:p-7 border border-gray-200 shadow-2xs hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between"
                            >
                                <div>
                                    {/* SPBU Header Card */}
                                    <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-none bg-red-50 text-[#980f12] border border-red-100 flex items-center justify-center shrink-0 font-bold">
                                            <FiMapPin size={22} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-950 truncate tracking-tight">
                                                    {spbu.name}
                                                </h3>
                                                <span className="text-[11px] font-mono font-bold bg-red-50 text-[#980f12] px-2.5 py-1 rounded-none border border-red-100 shrink-0">
                                                    {spbu.code}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug font-medium">
                                                {spbu.address}, <strong className="text-gray-900">{spbu.city}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stock Status List */}
                                    <div className="space-y-2.5 mb-6">
                                        <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                                            Status Tangki BBM:
                                        </div>

                                        {spbu.fuel_stocks?.length > 0 ? spbu.fuel_stocks.map((stock: any) => {
                                            const isAvailable = stock.status === 'available';
                                            const isPertalite = stock.fuel_type === 'pertalite';
                                            
                                            return (
                                                <div 
                                                    key={stock.id} 
                                                    className="flex items-center justify-between p-3.5 rounded-none bg-gray-50 border border-gray-200 hover:bg-gray-100/70 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-none flex items-center justify-center text-white text-xs ${
                                                            isPertalite ? 'bg-emerald-600' :
                                                            stock.fuel_type === 'solar' ? 'bg-gray-800' : 'bg-blue-600'
                                                        }`}>
                                                            <FiDroplet />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm text-gray-950 capitalize block">
                                                                {stock.fuel_type.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 font-mono">
                                                                Subsidi Terverifikasi
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-bold ${
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
                                            <div className="text-center p-4 text-xs text-gray-400 italic bg-gray-50 rounded-none border border-gray-200">
                                                Data stok belum diperbarui oleh operator.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Action Footer */}
                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                        <FiRefreshCw className="text-gray-400" /> Terverifikasi SPBU
                                    </span>

                                    <a
                                        href={getGoogleMapsUrl(spbu)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-bold text-[#980f12] bg-red-50 hover:bg-[#980f12] hover:text-white border border-red-100 transition-all shadow-2xs"
                                    >
                                        <FiNavigation /> Buka Google Maps <FiExternalLink size={12} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                        
                        {filteredSpbus.length === 0 && (
                            <div className="col-span-full text-center py-16 bg-white rounded-none border border-gray-200 p-8 shadow-2xs">
                                <FiMapPin className="mx-auto text-red-400 mb-4" size={44} />
                                <h4 className="text-lg font-bold text-gray-900">SPBU Tidak Ditemukan</h4>
                                <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
                                    Tidak ada SPBU yang cocok dengan kata kunci <strong>"{searchTerm}"</strong> atau filter bahan bakar yang dipilih.
                                </p>
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedFuel('all'); setOnlyAvailable(false); }}
                                    className="mt-4 px-5 py-2 rounded-none text-xs font-bold bg-[#980f12] text-white shadow-xs hover:bg-red-800 transition-colors"
                                >
                                    Reset Filter Pencarian
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Clean Modern Footer */}
            <footer className="bg-white text-gray-700 py-8 border-t border-gray-200 px-4 sm:px-6 lg:px-10 xl:px-14 mt-12">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>&copy; 2026 PETROCHAIN - TIMBERAPA Politeknik Negeri Lhokseumawe. All rights reserved.</p>
                    <p>Sistem Pendukung Ekosistem MyPertamina &amp; BPH Migas.</p>
                </div>
            </footer>
        </div>
    );
}
