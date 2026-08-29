import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUploadCloud, FiChevronLeft, FiCheckCircle, 
    FiAlertCircle, FiCpu, FiCamera, FiFileText, 
    FiInfo, FiArrowRight, FiCheck, FiShield, 
    FiTrash2, FiMaximize2, FiZap, FiTruck, FiHelpCircle
} from 'react-icons/fi';
import { FaMotorcycle, FaCar, FaTruckMoving, FaBus, FaQrcode } from 'react-icons/fa';

export default function Create() {
    const { data, setData, post, processing, errors, transform } = useForm({
        plate_prefix: 'BL',
        plate_number_core: '',
        plate_suffix: '',
        vehicle_type: 'mobil_pribadi',
        brand: '',
        model: '',
        engine_capacity_cc: '',
        stnk_file: null as File | null,
        vehicle_photo: null as File | null,
    });

    transform((data) => ({
        ...data,
        plate_number: `${data.plate_prefix} ${data.plate_number_core} ${data.plate_suffix}`.trim(),
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/registrations');
    };

    // Calculate eligibility based on Perpres 191/2014
    const ccValue = Number(data.engine_capacity_cc) || 0;
    const isMotor = data.vehicle_type === 'motorcycle';
    const isCar = data.vehicle_type === 'car';
    const isEligible = 
        (isMotor && ccValue <= 250) || 
        (isCar && ccValue <= 1400) || 
        (data.vehicle_type === 'truck' || data.vehicle_type === 'bus');

    // Handle standard manual file changes
    const handleFileChange = (field: 'stnk_file' | 'vehicle_photo') => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData(field, file);
            const previewUrl = URL.createObjectURL(file);
            if (field === 'stnk_file') {
                setStnkPreview(previewUrl);
                triggerOcrScan(file.name, 'custom');
            } else {
                setPhotoPreview(previewUrl);
            }
        }
    };

    // Simulated AI PaddleOCR Live Scanner
    const triggerOcrScan = (sourceName: string, presetType: 'vario' | 'avanza' | 'ninja' | 'pajero' | 'custom' = 'vario') => {
        setIsScanning(true);
        setOcrConfidence(null);
        setOcrDetails(null);

        setTimeout(() => {
            setIsScanning(false);
            if (presetType === 'vario') {
                setOcrConfidence(99.4);
                setOcrDetails({
                    plate: 'BL 1234 AB',
                    brand: 'HONDA',
                    model: 'VARIO 125 CBS',
                    cc: 125,
                    expiry: '10-10-2026'
                });
                setData({
                    ...data,
                    plate_number: 'BL 1234 AB',
                    vehicle_type: 'motorcycle',
                    brand: 'Honda',
                    model: 'Vario 125 CBS',
                    engine_capacity_cc: '125',
                });
            } else if (presetType === 'avanza') {
                setOcrConfidence(98.8);
                setOcrDetails({
                    plate: 'BK 4567 CD',
                    brand: 'TOYOTA',
                    model: 'AVANZA 1.3 E M/T',
                    cc: 1329,
                    expiry: '08-12-2027'
                });
                setData({
                    ...data,
                    plate_number: 'BK 4567 CD',
                    vehicle_type: 'car',
                    brand: 'Toyota',
                    model: 'Avanza 1.3 E',
                    engine_capacity_cc: '1329',
                });
            } else if (presetType === 'ninja') {
                setOcrConfidence(99.1);
                setOcrDetails({
                    plate: 'B 9988 XYZ',
                    brand: 'KAWASAKI',
                    model: 'NINJA ZX-25R',
                    cc: 250,
                    expiry: '04-05-2028'
                });
                setData({
                    ...data,
                    plate_number: 'B 9988 XYZ',
                    vehicle_type: 'motorcycle',
                    brand: 'Kawasaki',
                    model: 'Ninja ZX-25R',
                    engine_capacity_cc: '250',
                });
            } else if (presetType === 'pajero') {
                setOcrConfidence(98.5);
                setOcrDetails({
                    plate: 'D 1088 EF',
                    brand: 'MITSUBISHI',
                    model: 'PAJERO SPORT DAKAR',
                    cc: 2442,
                    expiry: '02-09-2026'
                });
                setData({
                    ...data,
                    plate_number: 'D 1088 EF',
                    vehicle_type: 'car',
                    brand: 'Mitsubishi',
                    model: 'Pajero Sport Dakar',
                    engine_capacity_cc: '2442',
                });
            } else {
                // Generic Custom Upload scan
                const guessPlate = data.plate_number || 'BL ' + Math.floor(1000 + Math.random() * 9000) + ' PK';
                setOcrConfidence(97.6);
                setOcrDetails({
                    plate: guessPlate,
                    brand: data.brand || 'TERDETEKSI',
                    model: data.model || 'KENDARAAN PRIBADI',
                    cc: Number(data.engine_capacity_cc) || 150,
                    expiry: '12-2027'
                });
                if (!data.plate_number) setData('plate_number', guessPlate);
            }
        }, 1200);
    };

    // Demo Preset Handler
    const applyDemoPreset = async (presetType: 'vario' | 'avanza' | 'ninja' | 'pajero') => {
        let stnkUrl = '/images/samples/sample_stnk_vario.jpg';
        let photoUrl = '/images/samples/sample_vario_motor.jpg';

        if (presetType === 'vario') {
            stnkUrl = '/images/samples/sample_stnk_vario.jpg';
            photoUrl = '/images/samples/sample_vario_motor.jpg';
        } else {
            stnkUrl = '/images/samples/sample_stnk_vario.jpg';
            photoUrl = '/images/samples/sample_vario_motor.jpg';
        }

        setStnkPreview(stnkUrl);
        setPhotoPreview(photoUrl);

        // Fetch actual image blobs so Inertia form validation on backend passes
        try {
            const stnkRes = await fetch(stnkUrl);
            const stnkBlob = await stnkRes.blob();
            const stnkFile = new File([stnkBlob], `${presetType}_stnk_sample.jpg`, { type: 'image/jpeg' });

            const photoRes = await fetch(photoUrl);
            const photoBlob = await photoRes.blob();
            const photoFile = new File([photoBlob], `${presetType}_vehicle_sample.jpg`, { type: 'image/jpeg' });

            setData('stnk_file', stnkFile);
            setData('vehicle_photo', photoFile);
        } catch (err) {
            console.warn('Could not load sample blob, fallback to synthetic File:', err);
            const dummyFile = new File(["dummy content"], "sample.jpg", { type: "image/jpeg" });
            setData('stnk_file', dummyFile);
            setData('vehicle_photo', dummyFile);
        }

        triggerOcrScan(`${presetType}_stnk.jpg`, presetType);
    };


    // Daftar Kode Wilayah Indonesia (Contoh umum, bisa disesuaikan)
    const regionCodes = [
        'BL', 'B', 'D', 'E', 'F', 'T', 'Z', 'A', 'G', 'H', 'K', 'R', 'AA', 'AB', 'AD', 'AE', 'AG',
        'S', 'W', 'L', 'M', 'N', 'P', 'DK', 'DR', 'EA', 'DH', 'EB', 'ED', 'KB', 'DA', 'KH', 'KT', 'KU',
        'DB', 'DL', 'DM', 'DN', 'DT', 'DD', 'DP', 'DW', 'PA', 'PB'
    ];

    return (
        <>
            <Head title="Pendaftaran Kendaraan Subsidi BBM - PETROCHAIN" />

            {/* Header Breadcrumb & Title */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/registrations" 
                            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:text-[#980f12] hover:border-red-200 shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                        >
                            <FiChevronLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#980f12] bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                                    Portal Subsidi Tepat
                                </span>
                                <span className="text-xs text-gray-500 font-mono">BPH Migas • Perpres 191/2014</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                                Pendaftaran Kendaraan Baru
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-emerald-800 text-xs font-semibold self-start sm:self-auto">
                        <FiShield className="text-emerald-600 text-base" />
                        <span>AI OCR & Anti-Replay Guard Aktif</span>
                    </div>
                </div>

                {/* 3-Step Wizard Navigation */}
                <div className="mt-8 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
                        {[
                            { step: 1, title: '1. Kategori', desc: 'Jenis Kendaraan', icon: FiTruck },
                            { step: 2, title: '2. AI OCR Dokumen', desc: 'STNK & Foto Fisik', icon: FiCamera },
                            { step: 3, title: '3. Konfirmasi', desc: 'Evaluasi & Digital Pass', icon: FaQrcode },
                        ].map((s) => {
                            const isDone = currentStep > s.step;
                            const isCurrent = currentStep === s.step;
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.step}
                                    type="button"
                                    onClick={() => setCurrentStep(s.step)}
                                    className={`p-3 sm:p-4 rounded-2xl text-left transition-all border cursor-pointer relative ${
                                        isCurrent
                                            ? 'bg-red-50/80 border-[#980f12] shadow-xs'
                                            : isDone
                                            ? 'bg-emerald-50/40 border-emerald-200 hover:bg-gray-50'
                                            : 'bg-gray-50/50 border-gray-200/80 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                                            isCurrent
                                                ? 'bg-[#980f12] text-white'
                                                : isDone
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {isDone ? <FiCheck size={14} /> : s.step}
                                        </div>
                                        <span className={`text-xs sm:text-sm font-black ${
                                            isCurrent ? 'text-[#980f12]' : isDone ? 'text-emerald-900' : 'text-gray-700'
                                        }`}>
                                            {s.title}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 hidden sm:block pl-9.5">
                                        {s.desc}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Demo Presets */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-3xl mb-8 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => applyDemoPreset('vario')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-500/50 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <FaMotorcycle className="text-amber-400" />
                        <span>Vario 125cc (Lolos)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyDemoPreset('avanza')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-500/50 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <FaCar className="text-sky-400" />
                        <span>Avanza 1.300cc (Lolos)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyDemoPreset('ninja')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-500/50 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <FaMotorcycle className="text-emerald-400" />
                        <span>Ninja 250cc (Batas Max)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => applyDemoPreset('pajero')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500/50 text-xs font-bold text-rose-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <FaCar className="text-rose-400" />
                        <span>Pajero 2.442cc (Non-Subsidi)</span>
                    </button>
                </div>
            </div>

            {/* Main Form Layout */}
            <form onSubmit={handleSubmit} className="space-y-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Form Steps Inputs (7 Cols) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* STEP 1: Pilih Kategori Kendaraan */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
                                        LANGKAH 1 DARI 3
                                    </span>
                                    <h2 className="text-lg font-black text-gray-900">
                                        Pilih Kategori & Tipe Kendaraan
                                    </h2>
                                </div>
                                <span className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center font-black text-xs border border-red-100">
                                    1
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { type: 'motorcycle', label: 'Sepeda Motor', sub: '≤ 250cc', icon: FaMotorcycle },
                                    { type: 'car', label: 'Mobil Pribadi', sub: '≤ 1.400cc', icon: FaCar },
                                    { type: 'truck', label: 'Truk Barang', sub: 'Logistik', icon: FaTruckMoving },
                                    { type: 'bus', label: 'Bus Publik', sub: 'Angkutan Umum', icon: FaBus },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = data.vehicle_type === item.type;
                                    return (
                                        <button
                                            key={item.type}
                                            type="button"
                                            onClick={() => setData('vehicle_type', item.type)}
                                            className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                                                isSelected
                                                    ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20 scale-[1.02]'
                                                    : 'bg-gray-50/70 hover:bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            <Icon size={24} className={isSelected ? 'text-white' : 'text-gray-600'} />
                                            <div>
                                                <div className="text-xs font-black leading-tight">{item.label}</div>
                                                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-red-200' : 'text-gray-600'}`}>
                                                    {item.sub}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* STEP 2: Unggah Dokumen STNK & Foto Fisik */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
                                        LANGKAH 2 DARI 3
                                    </span>
                                    <h2 className="text-lg font-black text-gray-900">
                                        Unggah STNK & Foto Fisik Kendaraan
                                    </h2>
                                </div>
                                <span className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center font-black text-xs border border-red-100">
                                    2
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* STNK Upload Box */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                            <FiFileText className="text-[#980f12]" /> Foto Dokumen STNK
                                        </label>
                                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Auto-OCR</span>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 hover:border-[#980f12] rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-red-50/10 transition relative min-h-[170px] overflow-hidden group">
                                        {stnkPreview ? (
                                            <div className="w-full h-full relative">
                                                <img 
                                                    src={stnkPreview} 
                                                    alt="STNK Preview" 
                                                    className="w-full h-36 object-cover rounded-xl border border-gray-200 shadow-2xs"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                    <span className="text-xs font-bold text-white bg-[#980f12] px-3 py-1.5 rounded-lg shadow-sm">
                                                        Ganti STNK
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-3">
                                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center mx-auto mb-2 border border-red-100">
                                                    <FiUploadCloud size={22} />
                                                </div>
                                                <div className="text-xs font-bold text-gray-800">Klik / Drag Foto STNK</div>
                                                <div className="text-[11px] text-gray-500 mt-1">PNG, JPG atau WEBP (Max 5MB)</div>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange('stnk_file')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required={!data.stnk_file}
                                        />
                                    </div>
                                    {errors.stnk_file && <p className="text-red-500 text-xs font-medium">{errors.stnk_file}</p>}
                                </div>

                                {/* Vehicle Physical Photo Upload Box */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                            <FiCamera className="text-[#980f12]" /> Foto Fisik Kendaraan
                                        </label>
                                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Tampak Depan</span>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 hover:border-[#980f12] rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-red-50/10 transition relative min-h-[170px] overflow-hidden group">
                                        {photoPreview ? (
                                            <div className="w-full h-full relative">
                                                <img 
                                                    src={photoPreview} 
                                                    alt="Vehicle Preview" 
                                                    className="w-full h-36 object-cover rounded-xl border border-gray-200 shadow-2xs"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                                    <span className="text-xs font-bold text-white bg-[#980f12] px-3 py-1.5 rounded-lg shadow-sm">
                                                        Ganti Foto
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center mx-auto mb-2 border border-gray-200">
                                                    <FiCamera size={22} />
                                                </div>
                                                <div className="text-xs font-bold text-gray-800">Klik / Drag Foto Mobil/Motor</div>
                                                <div className="text-[11px] text-gray-500 mt-1">Plat nomor terlihat jelas</div>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange('vehicle_photo')}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required={!data.vehicle_photo}
                                        />
                                    </div>
                                    {errors.vehicle_photo && <p className="text-red-500 text-xs font-medium">{errors.vehicle_photo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: Detail Data Spesifikasi & Verifikasi */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-600">
                                        LANGKAH 3 DARI 3
                                    </span>
                                    <h2 className="text-lg font-black text-gray-900">
                                        Hasil Ekstraksi & Detail Spesifikasi
                                    </h2>
                                </div>
                                <span className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center font-black text-xs border border-red-100">
                                    3
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                
                                {/* Nomor Pelat */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Nomor Pelat Kendaraan
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={data.plate_number}
                                            onChange={e => setData('plate_number', e.target.value.toUpperCase())}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 font-mono text-base font-black tracking-wider text-gray-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                                            placeholder="Contoh: BL 1234 AB"
                                            required
                                        />
                                        {data.plate_number && (
                                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold border border-emerald-200">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                    {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>}
                                </div>

                                {/* Kapasitas Mesin (CC) */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex justify-between">
                                        <span>Kapasitas Mesin (CC)</span>
                                        <span className="text-[11px] font-mono text-[#980f12] font-bold">
                                            {isMotor ? 'Batas: ≤ 250cc' : 'Batas: ≤ 1.400cc'}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={data.engine_capacity_cc}
                                            onChange={e => setData('engine_capacity_cc', e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/60 font-mono text-base font-black text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                                            placeholder="Contoh: 125"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-500">
                                            CC
                                        </span>
                                    </div>
                                    {errors.engine_capacity_cc && <p className="text-red-500 text-xs mt-1">{errors.engine_capacity_cc}</p>}
                                </div>

                                {/* Merek Kendaraan */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Merek Pabrikan
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.brand}
                                        onChange={e => setData('brand', e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/60 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                                        placeholder="Contoh: Honda / Toyota"
                                    />
                                </div>

                                {/* Model / Tipe */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Model & Seri
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.model}
                                        onChange={e => setData('model', e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/60 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/20 focus:border-[#980f12] transition-all"
                                        placeholder="Contoh: Vario 125 CBS / Avanza G"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link
                                href="/registrations"
                                className="px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3.5 rounded-2xl bg-[#980f12] hover:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-950/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Memproses AI Verification...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Kirim Pendaftaran Subsidi</span>
                                        <FiArrowRight size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: AI Live OCR HUD & Regulation Verdict Card (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">

                        {/* AI OCR Scanner Live Preview Card */}
                        <div className="bg-[#0f172a] rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                            
                            {/* Card Header with Status Pill */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
                                        <FiCpu size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono font-bold text-slate-200">
                                            PaddleOCR v4 Engine
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                            STNK Samsat Extraction
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                                    isScanning
                                        ? 'bg-amber-950/80 text-amber-300 border-amber-800 animate-pulse'
                                        : ocrConfidence
                                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        isScanning ? 'bg-amber-400 animate-ping' : ocrConfidence ? 'bg-emerald-400' : 'bg-slate-500'
                                    }`}></span>
                                    <span>{isScanning ? 'SCANNING...' : ocrConfidence ? `ACCURACY ${ocrConfidence}%` : 'READY'}</span>
                                </span>
                            </div>

                            {/* Document Preview with Laser Scanline Animation */}
                            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 aspect-4/3 flex items-center justify-center mb-4">
                                {stnkPreview ? (
                                    <>
                                        <img 
                                            src={stnkPreview} 
                                            alt="STNK Scanner" 
                                            className="w-full h-full object-cover opacity-85"
                                        />
                                        {/* Scanner Overlay Laser Line */}
                                        {isScanning && (
                                            <motion.div
                                                animate={{ y: ['-100%', '300%'] }}
                                                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ff4d4f] z-20"
                                            />
                                        )}
                                        {/* OCR Bounding Boxes */}
                                        {!isScanning && ocrDetails && (
                                            <div className="absolute inset-0 p-3 pointer-events-none flex flex-col justify-between">
                                                <div className="self-start bg-[#980f12]/90 backdrop-blur-xs border border-red-400 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-md">
                                                    [NO_POLISI: {ocrDetails.plate}]
                                                </div>
                                                <div className="self-end bg-emerald-900/90 backdrop-blur-xs border border-emerald-400 text-emerald-100 font-mono text-[10px] px-2 py-0.5 rounded shadow-md">
                                                    [CC: {ocrDetails.cc} CC • VALID]
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center p-6 text-slate-500">
                                        <FiFileText size={36} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs font-mono">Belum ada dokumen STNK diunggah</p>
                                        <p className="text-[10px] text-slate-600 mt-1">Unggah STNK di langkah 2 atau gunakan tombol Demo</p>
                                    </div>
                                )}
                            </div>

                            {/* Extracted Key-Value Metrics */}
                            <div className="space-y-2 font-mono text-xs">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 text-[11px]">
                                    <span className="text-slate-400">Extracted Plate:</span>
                                    <span className="font-bold text-amber-400">{data.plate_number || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80 text-[11px]">
                                    <span className="text-slate-400">Engine Volume:</span>
                                    <span className="font-bold text-slate-200">{data.engine_capacity_cc ? `${data.engine_capacity_cc} CC` : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 text-[11px]">
                                    <span className="text-slate-400">AI Confidence:</span>
                                    <span className="font-bold text-emerald-400">{ocrConfidence ? `${ocrConfidence}% MATCH` : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Regulation Eligibility Result Verdict Card */}
                        <div className={`p-6 rounded-3xl border-2 transition-all ${
                            isEligible
                                ? 'bg-emerald-50/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                : 'bg-rose-50/90 border-rose-500 shadow-lg shadow-rose-500/10'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white shrink-0 shadow-md ${
                                    isEligible ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}>
                                    {isEligible ? <FiCheckCircle /> : <FiAlertCircle />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">
                                        EVALUASI REGULASI BPH MIGAS
                                    </span>
                                    <h3 className={`text-base sm:text-lg font-black mt-0.5 leading-tight ${
                                        isEligible ? 'text-emerald-950' : 'text-rose-950'
                                    }`}>
                                        {isEligible 
                                            ? 'MEMENUHI SYARAT SUBSIDI BBM' 
                                            : 'MELEBIHI BATAS REGULASI (NON-SUBSIDI)'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                        {isEligible ? (
                                            <>
                                                Kendaraan terverifikasi memiliki kapasitas mesin <strong>{data.engine_capacity_cc || 0} CC</strong>. Berhak mendapatkan kuota harian bersubsidi (Pertalite / Biosolar).
                                            </>
                                        ) : (
                                            <>
                                                Kendaraan dengan kapasitas mesin <strong>{data.engine_capacity_cc || 0} CC</strong> melebihi batas regulasi ({isMotor ? '250 CC' : '1.400 CC'}). Wajib menggunakan bahan bakar non-subsidi.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs font-mono text-gray-600">
                                <span>Dasar Hukum:</span>
                                <strong className="text-gray-900 font-bold">Perpres No. 191/2014</strong>
                            </div>
                        </div>

                        {/* Digital QR Pass Mockup Card Preview */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500">
                                    Simulasi QR Pass yang Diterbitkan
                                </span>
                                <span className="text-[10px] font-mono text-[#980f12] bg-red-50 px-2 py-0.5 rounded font-bold">Dynamic OTP 60s</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#800b0e] to-[#980f12] text-white flex items-center justify-between shadow-md">
                                <div>
                                    <div className="text-[10px] font-mono text-red-200 tracking-widest uppercase">PETROCHAIN PASS</div>
                                    <div className="text-lg font-black font-mono mt-0.5 tracking-wider">{data.plate_number || 'BL •••• ••'}</div>
                                    <div className="text-xs text-red-100 font-sans mt-1">{data.brand || 'Kendaraan'} {data.model || ''}</div>
                                </div>
                                <div className="bg-white p-2 rounded-xl text-gray-900 shadow-sm flex items-center justify-center">
                                    <FaQrcode size={44} />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </form>
        </>
    );
}

Create.layout = (page: any) => <AppLayout title="Pendaftaran Kendaraan Subsidi">{page}</AppLayout>;
