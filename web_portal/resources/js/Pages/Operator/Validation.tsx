import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiCamera, FiCheck, FiX, FiRefreshCcw, FiAlertTriangle, 
    FiActivity, FiDroplet, FiZap, FiCheckCircle, FiShield,
    FiVolume2, FiVolumeX, FiCpu, FiHash, FiClock, FiDollarSign
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export default function OperatorValidation({ spbu }: any) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [scannedQR, setScannedQR] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Form state for submission
    const [fuelType, setFuelType] = useState('Pertalite');
    const [volume, setVolume] = useState('15');
    
    // Simulation states
    const [simulatedAI, setSimulatedAI] = useState<any>(null);

    // Fuel Prices for Dispenser Display
    const fuelPrices: Record<string, number> = {
        'Pertalite': 10000,
        'Solar': 6800,
        'Pertamax': 12950
    };

    const currentPrice = fuelPrices[fuelType] || 10000;
    const totalCost = Number(volume || 0) * currentPrice;

    // Audio synthesizer for POS dispenser beeps
    const playTerminalBeep = (type: 'beep' | 'success' | 'alert') => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            } else if (type === 'alert') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, ctx.currentTime);
                osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            // Audio context handled
        }
    };

    const simulateScan = () => {
        setIsScanning(true);
        playTerminalBeep('beep');
        setTimeout(() => {
            setScannedQR('PETRO-MYPERTAMINA-TOKEN-9942');
            setIsScanning(false);
            playTerminalBeep('success');
            setStep(2);
        }, 1200);
    };

    const simulateYoloAndOcr = () => {
        setIsScanning(true);
        playTerminalBeep('beep');
        setTimeout(() => {
            const isMatch = Math.random() > 0.2; // 80% match
            const isMotor = Math.random() > 0.5;
            
            const plate = isMatch ? 'BL 1234 AB' : 'BL 9999 XX';
            const vehicleClass = isMotor ? 'motorcycle' : 'car';
            const capacityCheck = isMotor ? (Math.random() > 0.2 ? 'UNDER_250CC' : 'OVER_250CC') : 'N/A';
            
            setSimulatedAI({
                plate,
                vehicleClass,
                confidence: (Math.random() * (0.99 - 0.88) + 0.88).toFixed(2),
                capacityCheck,
                isMatch
            });
            setIsScanning(false);
            if (isMatch) {
                playTerminalBeep('success');
            } else {
                playTerminalBeep('alert');
            }
            setStep(3);
        }, 1500);
    };

    const submitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        playTerminalBeep('success');
        router.post(route('operator.validation.process'), {
            qr_code: scannedQR,
            fuel_type: fuelType,
            volume: volume,
            mock_plate: simulatedAI?.plate || '',
            mock_yolo_class: simulatedAI?.vehicleClass || '',
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Head title={`POS Terminal Dispenser - ${spbu?.name || 'Operator'}`} />

            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-[#7a0b0d] to-[#980f12] text-white border border-red-900/30 shadow-xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold text-red-200 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            DISPENSER NOZZLE #01 • {spbu?.name || 'SPBU 14.201.001'}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FiDroplet className="text-yellow-300" />
                            Terminal POS Dispenser SPBU
                        </h2>
                        <p className="text-red-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                            Validasi token QR MyPertamina secara otomatis disinkronkan dengan kamera ANPR plat nomor & kuota blockchain.
                        </p>
                    </div>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="self-start sm:self-auto p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center gap-2 text-xs font-bold transition-colors"
                    >
                        {soundEnabled ? <FiVolume2 className="text-emerald-400 text-lg" /> : <FiVolumeX className="text-gray-400 text-lg" />}
                        <span>Audio POS: {soundEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </motion.div>

            {/* Digital Dispenser Hardware Screen (LCD Mockup) */}
            <div className="bg-gray-950 rounded-3xl p-6 border-4 border-gray-800 shadow-2xl relative overflow-hidden">
                {/* LCD Ambient Glow */}
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>

                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        TERMINAL ONLINE • VERSI 3.4
                    </span>
                    <span>KUOTA HARIAN: 4,250L / 5,000L</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                    {/* LCD Segment 1: Rupiah Total */}
                    <div className="bg-black/80 rounded-2xl p-4 border border-emerald-500/30 text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">TOTAL RUPIAH (RP)</div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-wider mt-1 drop-shadow-[0_0_10px_#10b981]">
                            Rp {totalCost.toLocaleString('id-ID')}
                        </div>
                    </div>

                    {/* LCD Segment 2: Volume Liter */}
                    <div className="bg-black/80 rounded-2xl p-4 border border-emerald-500/30 text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">VOLUME (LITER)</div>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-wider mt-1 drop-shadow-[0_0_10px_#10b981]">
                            {Number(volume || 0).toFixed(2)} L
                        </div>
                    </div>

                    {/* LCD Segment 3: Harga Per Liter */}
                    <div className="bg-black/80 rounded-2xl p-4 border border-emerald-500/30 text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">HARGA / LITER ({fuelType})</div>
                        <div className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-wider mt-1 drop-shadow-[0_0_10px_#eab308]">
                            Rp {currentPrice.toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Progress Indicators */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { s: 1, label: '1. Scan QR Barcode', icon: FiCamera },
                    { s: 2, label: '2. Verifikasi Kamera ANPR', icon: FiCpu },
                    { s: 3, label: '3. Eksekusi Pengisian', icon: FiCheckCircle },
                ].map((item) => {
                    const StepIcon = item.icon;
                    const isDone = step > item.s;
                    const isCurrent = step === item.s;
                    return (
                        <div 
                            key={item.s} 
                            className={`p-3.5 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 ${
                                isCurrent 
                                    ? 'bg-[#980f12] text-white font-bold border-red-900 shadow-md scale-102' 
                                    : isDone 
                                    ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-200' 
                                    : 'bg-white text-gray-400 font-medium border-gray-100'
                            }`}
                        >
                            <StepIcon className={isCurrent ? 'text-yellow-300' : isDone ? 'text-emerald-600' : 'text-gray-400'} size={16} />
                            <span className="text-xs truncate">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Validation Steps Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                
                {/* STEP 1: Scan QR Code */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-6">
                        <div className="w-24 h-24 rounded-3xl bg-red-50 text-[#980f12] flex items-center justify-center mx-auto text-4xl shadow-inner border border-red-100">
                            <FiCamera />
                        </div>
                        <div className="max-w-md mx-auto">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">Arahkan Scanner ke Barcode QR Pelanggan</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                Gunakan 2D barcode scanner optik dispenser atau klik tombol simulasi di bawah untuk demonstrasi.
                            </p>
                        </div>

                        <button
                            onClick={simulateScan}
                            disabled={isScanning}
                            className="bg-[#980f12] hover:bg-red-800 disabled:opacity-40 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                            {isScanning ? <FiRefreshCcw className="animate-spin" /> : <FiZap className="text-yellow-300" />}
                            {isScanning ? 'Membaca Token QR...' : 'Simulasi Scan Barcode QR'}
                        </button>
                    </motion.div>
                )}

                {/* STEP 2: ANPR & Physical Verification */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-6">
                        <div className="w-24 h-24 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-4xl shadow-inner border border-blue-100">
                            <FiCpu />
                        </div>
                        <div className="max-w-md mx-auto">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">Pencocokan Kamera CCTV Dispenser</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                AI ANPR Dual Vision akan membaca plat nomor fisik dan memeriksa jenis kendaraan vs token QR.
                            </p>
                            <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs text-gray-700 font-bold inline-block">
                                Token QR: {scannedQR}
                            </div>
                        </div>

                        <button
                            onClick={simulateYoloAndOcr}
                            disabled={isScanning}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                            {isScanning ? <FiRefreshCcw className="animate-spin" /> : <FiCamera />}
                            {isScanning ? 'Memproses Kamera & ANPR OCR...' : 'Proses Verifikasi AI Kamera'}
                        </button>
                    </motion.div>
                )}

                {/* STEP 3: Fuel Injection Detail & Final Confirmation */}
                {step === 3 && simulatedAI && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        {/* Result Verdict Box */}
                        <div className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 ${
                            simulatedAI.isMatch 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                                : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs flex-shrink-0 ${
                                    simulatedAI.isMatch ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                    {simulatedAI.isMatch ? <FiCheck /> : <FiX />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Hasil Pencocokan AI</div>
                                    <h4 className="text-xl font-black mt-0.5">
                                        {simulatedAI.isMatch ? 'VALID: Plat & Token Sesuai (Match)' : 'MISMATCH: Plat Kendaraan Berbeda!'}
                                    </h4>
                                    <div className="text-xs mt-0.5 text-gray-600">
                                        Plat ANPR: <strong>{simulatedAI.plate}</strong> • AI Confidence: {(simulatedAI.confidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fuel Pump Form */}
                        <form onSubmit={submitTransaction} className="space-y-6 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pilih Jenis BBM</label>
                                    <select 
                                        className="w-full rounded-2xl border-gray-200 shadow-2xs font-bold text-sm focus:border-[#980f12] focus:ring-[#980f12] p-3.5"
                                        value={fuelType}
                                        onChange={e => setFuelType(e.target.value)}
                                        required
                                    >
                                        <option value="Pertalite">Pertalite (Subsidi) - Rp 10.000 / Liter</option>
                                        <option value="Solar">Biosolar (Subsidi) - Rp 6.800 / Liter</option>
                                        <option value="Pertamax">Pertamax (Non-Subsidi) - Rp 12.950 / Liter</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Volume Pengisian (Liter)</label>
                                    <input 
                                        type="number"
                                        step="0.1"
                                        className="w-full rounded-2xl border-gray-200 shadow-2xs font-mono font-black text-base focus:border-[#980f12] focus:ring-[#980f12] p-3.5"
                                        value={volume}
                                        onChange={e => setVolume(e.target.value)}
                                        placeholder="Contoh: 15"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Quick Volume Preset Chips */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shortcut Volume Cepat</label>
                                <div className="flex flex-wrap gap-2">
                                    {['5', '10', '15', '20', '30', '40'].map((vol) => (
                                        <button
                                            key={vol}
                                            type="button"
                                            onClick={() => setVolume(vol)}
                                            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                                                volume === vol 
                                                    ? 'bg-[#980f12] text-white shadow-xs' 
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {vol} Liter
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setScannedQR('');
                                        setSimulatedAI(null);
                                    }}
                                    className="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
                                >
                                    Batal / Reset
                                </button>

                                <button
                                    type="submit"
                                    className="px-8 py-3.5 rounded-2xl bg-[#980f12] hover:bg-red-800 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                >
                                    <FiCheckCircle size={16} /> Konfirmasi & Buka Nozzle Dispenser
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

OperatorValidation.layout = (page: any) => <AppLayout title="Terminal POS Dispenser">{page}</AppLayout>;
