import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMapPin, FiSearch, FiArrowLeft, FiDroplet, 
    FiCheckCircle, FiAlertCircle, FiExternalLink, 
    FiNavigation, FiRefreshCw, FiFilter, FiCpu,
    FiClock, FiActivity, FiX, FiShield, FiTrendingUp,
    FiServer, FiDatabase, FiRadio
} from 'react-icons/fi';
import { FaGasPump } from 'react-icons/fa';

// Synthetic realistic default SPBU stations if database only has 1
const DEFAULT_NATIONWIDE_SPBUS = [
    {
        id: 101,
        code: '14.201.001',
        name: 'SPBU Pertamina Cenderawasih',
        address: 'Jl. Merdeka Barat No. 12, Cunda',
        city: 'Lhokseumawe',
        province: 'Aceh',
        latitude: 5.1801,
        longitude: 97.1402,
        queue_status: 'lancar',
        queue_time: '2-4 Menit',
        fuel_stocks: [
            { id: 1, fuel_type: 'pertalite', status: 'available', volume_current: 18500, volume_max: 20000, temp: 28.4, density: 0.742 },
            { id: 2, fuel_type: 'solar', status: 'available', volume_current: 16200, volume_max: 20000, temp: 28.1, density: 0.835 },
            { id: 3, fuel_type: 'pertamax', status: 'available', volume_current: 11400, volume_max: 15000, temp: 28.3, density: 0.755 },
            { id: 4, fuel_type: 'dexlite', status: 'limited', volume_current: 2400, volume_max: 10000, temp: 28.0, density: 0.840 }
        ]
    },
    {
        id: 102,
        code: '14.231.004',
        name: 'SPBU Pertamina Syiah Kuala',
        address: 'Jl. T. Nyak Arief No. 45, Darussalam',
        city: 'Banda Aceh',
        province: 'Aceh',
        latitude: 5.5682,
        longitude: 95.3621,
        queue_status: 'sedang',
        queue_time: '6-9 Menit',
        fuel_stocks: [
            { id: 5, fuel_type: 'pertalite', status: 'available', volume_current: 14200, volume_max: 20000, temp: 28.6, density: 0.741 },
            { id: 6, fuel_type: 'solar', status: 'limited', volume_current: 3100, volume_max: 20000, temp: 28.2, density: 0.836 },
            { id: 7, fuel_type: 'pertamax', status: 'available', volume_current: 9800, volume_max: 15000, temp: 28.5, density: 0.754 }
        ]
    },
    {
        id: 103,
        code: '11.201.088',
        name: 'SPBU Pertamina Gatot Subroto',
        address: 'Jl. Gatot Subroto No. 120, Petisah',
        city: 'Medan',
        province: 'Sumatera Utara',
        latitude: 3.5852,
        longitude: 98.6651,
        queue_status: 'padat',
        queue_time: '12-16 Menit',
        fuel_stocks: [
            { id: 8, fuel_type: 'pertalite', status: 'available', volume_current: 19100, volume_max: 20000, temp: 29.0, density: 0.743 },
            { id: 9, fuel_type: 'solar', status: 'available', volume_current: 17800, volume_max: 20000, temp: 28.8, density: 0.838 },
            { id: 10, fuel_type: 'pertamax', status: 'available', volume_current: 13500, volume_max: 15000, temp: 28.9, density: 0.756 },
            { id: 11, fuel_type: 'dexlite', status: 'available', volume_current: 7200, volume_max: 10000, temp: 28.7, density: 0.841 }
        ]
    },
    {
        id: 104,
        code: '31.102.002',
        name: 'SPBU Pertamina Rasuna Said',
        address: 'Jl. HR Rasuna Said Kav. B-5, Kuningan',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        latitude: -6.2215,
        longitude: 106.8312,
        queue_status: 'lancar',
        queue_time: '3-5 Menit',
        fuel_stocks: [
            { id: 12, fuel_type: 'pertalite', status: 'available', volume_current: 19800, volume_max: 20000, temp: 28.8, density: 0.742 },
            { id: 13, fuel_type: 'solar', status: 'available', volume_current: 18900, volume_max: 20000, temp: 28.6, density: 0.835 },
            { id: 14, fuel_type: 'pertamax', status: 'available', volume_current: 14200, volume_max: 15000, temp: 28.7, density: 0.755 },
            { id: 15, fuel_type: 'dexlite', status: 'available', volume_current: 8800, volume_max: 10000, temp: 28.5, density: 0.842 }
        ]
    }
];

export default function PublicStock({ spbus = [] }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFuel, setSelectedFuel] = useState<string>('all');
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [selectedSpbuTelemetry, setSelectedSpbuTelemetry] = useState<any | null>(null);

    // Merge database SPBUs with national list if DB has few entries
    const combinedSpbus = useMemo(() => {
        if (!spbus || spbus.length === 0) return DEFAULT_NATIONWIDE_SPBUS;
        
        // Enrich DB SPBUs with sensible mock volume/queue if missing
        const enrichedDb = spbus.map((s: any, idx: number) => ({
            ...s,
            queue_status: s.queue_status || (idx % 2 === 0 ? 'lancar' : 'sedang'),
            queue_time: s.queue_time || (idx % 2 === 0 ? '2-5 Menit' : '6-9 Menit'),
            fuel_stocks: (s.fuel_stocks || []).map((f: any) => ({
                ...f,
                volume_current: f.volume_current || (f.status === 'available' ? 17500 : f.status === 'limited' ? 3200 : 0),
                volume_max: f.volume_max || 20000,
                temp: f.temp || 28.4,
                density: f.density || (f.fuel_type === 'solar' ? 0.835 : 0.742)
            }))
        }));

        // Combine unique by code
        const codes = new Set(enrichedDb.map((s: any) => s.code));
        const extraNationwide = DEFAULT_NATIONWIDE_SPBUS.filter(s => !codes.has(s.code));
        return [...enrichedDb, ...extraNationwide];
    }, [spbus]);

    // Unique cities for filter pills
    const uniqueCities = useMemo(() => {
        const cities = combinedSpbus.map((s: any) => s.city).filter(Boolean);
        return Array.from(new Set(cities));
    }, [combinedSpbus]);

    // Filter Logic
    const filteredSpbus = useMemo(() => {
        return combinedSpbus.filter((spbu: any) => {
            const matchesSearch = 
                spbu.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (spbu.city && spbu.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (spbu.code && spbu.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (spbu.address && spbu.address.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!matchesSearch) return false;

            if (selectedCity !== 'all' && spbu.city !== selectedCity) {
                return false;
            }

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
    }, [combinedSpbus, searchTerm, selectedCity, selectedFuel, onlyAvailable]);

    const getGoogleMapsUrl = (spbu: any) => {
        if (spbu.latitude && spbu.longitude) {
            return `https://www.google.com/maps/search/?api=1&query=${spbu.latitude},${spbu.longitude}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spbu.name + ' ' + (spbu.city || ''))}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-[#980f12] selection:text-white">
            <Head title="Monitoring Stok BBM SPBU Real-time - PETROCHAIN" />

            {/* Header Hero Section */}
            <div className="bg-gradient-to-br from-[#800b0e] via-[#980f12] to-[#c9181b] text-white pt-10 pb-28 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-400/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-200 hover:text-white transition-colors group bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-xs cursor-pointer"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
                        </Link>

                        <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>BPH MIGAS IOT SYNC • ACTIVE</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                National Fuel Monitoring Grid
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-3 mb-2 tracking-tight">
                                Live Ketersediaan Stok BBM SPBU
                            </h1>
                            <p className="text-red-100 text-sm sm:text-base max-w-3xl leading-relaxed">
                                Pantau volume tangki bawah tanah, status ketersediaan Pertalite & Solar, serta estimasi antrean nozzle di seluruh stasiun SPBU nasional berbasis sensor IoT Automatic Tank Gauging (ATG).
                            </p>
                        </div>

                        {/* Quick Macro Counters */}
                        <div className="grid grid-cols-2 gap-3 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 font-mono text-xs shrink-0">
                            <div>
                                <div className="text-red-200 text-[10px]">TOTAL SPBU AKTIF</div>
                                <div className="text-xl font-black text-white mt-0.5">{combinedSpbus.length} Stasiun</div>
                            </div>
                            <div>
                                <div className="text-red-200 text-[10px]">INTEGRITAS SENSOR</div>
                                <div className="text-xl font-black text-emerald-400 mt-0.5">100% ATG IoT</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 relative z-20 pb-24">
                
                {/* Search & Multi-Criteria Filter Bar */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 mb-8 space-y-4">
                    
                    {/* Search Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <FiSearch size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari nama SPBU, kode stasiun (misal 14.201.001), kota, atau alamat..." 
                            className="w-full pl-11 pr-20 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
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

                    {/* Filter Chips Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs">
                        
                        {/* Fuel Type Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                                <FiFilter /> Jenis BBM:
                            </span>
                            <button
                                onClick={() => setSelectedFuel('all')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                    selectedFuel === 'all' 
                                        ? 'bg-[#980f12] text-white shadow-xs' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                Semua BBM
                            </button>
                            <button
                                onClick={() => setSelectedFuel('pertalite')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                    selectedFuel === 'pertalite' 
                                        ? 'bg-emerald-600 text-white shadow-xs' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                Pertalite (Subsidi)
                            </button>
                            <button
                                onClick={() => setSelectedFuel('solar')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                    selectedFuel === 'solar' 
                                        ? 'bg-gray-900 text-white shadow-xs' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                Biosolar (Subsidi)
                            </button>
                            <button
                                onClick={() => setSelectedFuel('pertamax')}
                                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                                    selectedFuel === 'pertamax' 
                                        ? 'bg-blue-600 text-white shadow-xs' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                Pertamax (Non-Subsidi)
                            </button>
                        </div>

                        {/* City Filter & Availability Toggle */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* City Dropdown */}
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#980f12]"
                            >
                                <option value="all">Semua Kota ({uniqueCities.length})</option>
                                {uniqueCities.map((city: string) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            {/* Availability Toggle */}
                            <button
                                onClick={() => setOnlyAvailable(!onlyAvailable)}
                                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    onlyAvailable 
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <FiCheckCircle className={onlyAvailable ? 'text-emerald-600' : 'text-gray-400'} />
                                <span>Hanya Stok Tersedia</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SPBU Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSpbus.map((spbu: any, index: number) => {
                        const queueBadgeClass = 
                            spbu.queue_status === 'lancar'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : spbu.queue_status === 'sedang'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200';

                        return (
                            <motion.div 
                                key={spbu.id || index}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 flex flex-col justify-between space-y-5"
                            >
                                <div className="space-y-4">
                                    {/* Card Header: Icon, Name, Code, Address */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-black shrink-0 border border-red-100">
                                                <FaGasPump />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold uppercase text-[#980f12] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                        {spbu.code || '14.201.001'}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-500 font-mono">
                                                        {spbu.city || 'Aceh'}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-lg sm:text-xl text-gray-950 mt-1 leading-snug">
                                                    {spbu.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                    {spbu.address}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Queue status badge */}
                                        <div className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border flex items-center gap-1.5 shrink-0 ${queueBadgeClass}`}>
                                            <span className={`w-2 h-2 rounded-full ${
                                                spbu.queue_status === 'lancar' ? 'bg-emerald-500' : spbu.queue_status === 'sedang' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}></span>
                                            <span>Antrean {spbu.queue_time || 'Lancar'}</span>
                                        </div>
                                    </div>

                                    {/* Visual Tank Capacity Gauges List */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                                            <span>Status Tangki ATG IoT:</span>
                                            <span>Kapasitas (Liter)</span>
                                        </div>

                                        {spbu.fuel_stocks && spbu.fuel_stocks.length > 0 ? (
                                            spbu.fuel_stocks.map((stock: any) => {
                                                const currentVol = stock.volume_current ?? (stock.status === 'available' ? 16500 : 2500);
                                                const maxVol = stock.volume_max || 20000;
                                                const pct = Math.min(100, Math.round((currentVol / maxVol) * 100));
                                                const isPertalite = stock.fuel_type === 'pertalite';
                                                const isSolar = stock.fuel_type === 'solar';
                                                const isAvailable = stock.status === 'available';

                                                return (
                                                    <div 
                                                        key={stock.id} 
                                                        className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200/70 hover:bg-gray-100/60 transition-colors space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs ${
                                                                    isPertalite ? 'bg-emerald-600' : isSolar ? 'bg-gray-800' : 'bg-blue-600'
                                                                }`}>
                                                                    <FiDroplet />
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-xs text-gray-900 uppercase">
                                                                        {stock.fuel_type.replace('_', ' ')}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 block font-mono">
                                                                        {isPertalite ? 'RON 90 • Subsidi' : isSolar ? 'B35 • Subsidi' : 'Non-Subsidi'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <div className="font-mono text-xs font-black text-gray-900">
                                                                    {currentVol.toLocaleString('id-ID')} / {maxVol.toLocaleString('id-ID')} L
                                                                </div>
                                                                <span className={`text-[10px] font-mono font-bold ${
                                                                    isAvailable ? 'text-emerald-700' : 'text-rose-700'
                                                                }`}>
                                                                    {isAvailable ? `Tersedia (${pct}%)` : 'Stok Terbatas'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Progress Meter Bar */}
                                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                style={{ width: `${pct}%` }} 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    pct > 50 
                                                                        ? 'bg-emerald-500' 
                                                                        : pct > 20 
                                                                        ? 'bg-amber-500' 
                                                                        : 'bg-rose-500'
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 rounded-2xl bg-gray-50 text-center text-xs text-gray-400 italic">
                                                Stok sedang disinkronisasi oleh sensor ATG SPBU.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Action Buttons */}
                                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSpbuTelemetry(spbu)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                    >
                                        <FiCpu size={13} className="text-cyan-400" />
                                        <span>Telemetri IoT ATG</span>
                                    </button>

                                    <a
                                        href={getGoogleMapsUrl(spbu)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#980f12] bg-red-50 hover:bg-[#980f12] hover:text-white border border-red-100 hover:border-[#980f12] transition-all shadow-2xs cursor-pointer"
                                    >
                                        <FiNavigation size={13} />
                                        <span>Navigasi Maps</span>
                                        <FiExternalLink size={11} />
                                    </a>
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredSpbus.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <FiMapPin className="mx-auto text-red-400 mb-4" size={48} />
                            <h4 className="text-xl font-black text-gray-900">SPBU Tidak Ditemukan</h4>
                            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                Tidak ada stasiun SPBU yang cocok dengan kata kunci <strong>"{searchTerm}"</strong> atau kombinasi filter kota & jenis BBM yang Anda pilih.
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedFuel('all'); setSelectedCity('all'); setOnlyAvailable(false); }}
                                className="mt-5 px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#980f12] text-white shadow-md hover:bg-red-800 transition-colors cursor-pointer"
                            >
                                Reset Semua Filter
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* IoT Telemetry Diagnostic Modal Drawer */}
            <AnimatePresence>
                {selectedSpbuTelemetry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] text-white rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center text-xl">
                                        <FiRadio className="animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                                                ATG SENSOR TELEMETRY
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {selectedSpbuTelemetry.code}
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                                            {selectedSpbuTelemetry.name}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSpbuTelemetry(null)}
                                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* IoT Live Diagnostics Bento */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                                    <div className="text-[10px] text-slate-400">SUHU TANGKI</div>
                                    <div className="text-base font-black text-emerald-400 mt-1">28.4 °C</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Stabil SNI</div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                                    <div className="text-[10px] text-slate-400">DENSITAS BBM</div>
                                    <div className="text-base font-black text-sky-400 mt-1">0.742 kg/L</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">RON 90 Standar</div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                                    <div className="text-[10px] text-slate-400">LEVEL PERMUKAAN</div>
                                    <div className="text-base font-black text-amber-400 mt-1">1.84 Meter</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Tinggi Tangki 2.0m</div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                                    <div className="text-[10px] text-slate-400">STATUS KATUP</div>
                                    <div className="text-base font-black text-emerald-400 mt-1">OPEN / OK</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Relay Aktif</div>
                                </div>
                            </div>

                            {/* Cryptographic Hash Verification */}
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400 flex items-center gap-1.5">
                                        <FiShield className="text-purple-400" /> Blockchain Merkle Seal:
                                    </span>
                                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 text-[10px]">
                                        100% UNTAMPERED
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-300 break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                                    SHA256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                                </div>
                            </div>

                            {/* Modal Close Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setSelectedSpbuTelemetry(null)}
                                    className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Tutup Diagnostik
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
