import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiCamera, FiCheck, FiX, FiRefreshCcw, FiAlertTriangle } from 'react-icons/fi';

export default function OperatorValidation({ spbu }: any) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [scannedQR, setScannedQR] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    
    // Form state for submission
    const [fuelType, setFuelType] = useState('Pertalite');
    const [volume, setVolume] = useState('');
    
    // Simulation states
    const [simulatedAI, setSimulatedAI] = useState<any>(null);

    const simulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setScannedQR('TOKEN_MOCK_QR_123');
            setIsScanning(false);
            setStep(2);
        }, 1500);
    };

    const simulateYoloAndOcr = () => {
        setIsScanning(true);
        setTimeout(() => {
            // Determine result deterministically or randomly for demo
            const isMatch = Math.random() > 0.3; // 70% match chance for demo
            const isMotor = Math.random() > 0.5;
            
            const plate = isMatch ? 'BL 1234 DEMO' : 'BL 5678 FAKE';
            const vehicleClass = isMotor ? 'motorcycle' : 'car';
            const capacityCheck = isMotor ? (Math.random() > 0.2 ? 'UNDER_250CC' : 'OVER_250CC') : 'N/A';
            
            setSimulatedAI({
                plate,
                vehicleClass,
                confidence: (Math.random() * (0.99 - 0.85) + 0.85).toFixed(2),
                capacityCheck,
                isMatch
            });
            setIsScanning(false);
            setStep(3);
        }, 2000);
    };

    const submitTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('operator.validation.process'), {
            qr_code: scannedQR,
            fuel_type: fuelType,
            volume: volume,
            mock_plate: simulatedAI?.plate || '',
            mock_yolo_class: simulatedAI?.vehicleClass || '',
        });
    };

    return (
        <>
            <Head title={`Validasi - ${spbu?.name || 'Operator'}`} />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Validasi Kendaraan (Demo Mode)</h2>
                    <p className="text-gray-500 mt-1 text-sm">Alur pemindaian QR dan validasi fisik melalui YOLO & OCR.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                            step >= s ? 'bg-[#980f12] text-white shadow-lg shadow-red-900/20' : 'bg-white text-gray-400 border border-gray-200'
                        }`}>
                            {step > s ? <FiCheck size={18} /> : s}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                                <FiCamera className="text-gray-400" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code MyPertamina</h3>
                            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">Arahkan kamera ke QR Code pelanggan. Dalam mode demo, klik tombol di bawah untuk simulasi scan.</p>
                            <button
                                onClick={simulateScan}
                                disabled={isScanning}
                                className="bg-[#980f12] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-red-800 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {isScanning ? <FiRefreshCcw className="animate-spin" /> : <FiCamera />}
                                {isScanning ? 'Membaca QR...' : 'Simulasi Scan QR'}
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                <FiActivity className="text-blue-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Deteksi Fisik Kendaraan</h3>
                            <p className="text-gray-500 text-sm mb-4">Sistem YOLO akan mendeteksi jenis kendaraan, dan OCR akan membaca plat nomor untuk dicocokkan dengan data QR.</p>
                            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm font-mono text-gray-600 inline-block">
                                QR Data: {scannedQR}
                            </div>
                            <br />
                            <button
                                onClick={simulateYoloAndOcr}
                                disabled={isScanning}
                                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {isScanning ? <FiRefreshCcw className="animate-spin" /> : <FiCamera />}
                                {isScanning ? 'Memproses AI (YOLO + OCR)...' : 'Simulasi Kamera CCTV'}
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && simulatedAI && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-xl ${simulatedAI.isMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {simulatedAI.isMatch ? <FiCheck size={24} /> : <FiX size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Hasil Validasi: {simulatedAI.isMatch ? 'MATCH (Cocok)' : 'MISMATCH (Tidak Cocok)'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Confidence OCR: {simulatedAI.confidence * 100}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Plat Nomor (OCR)</div>
                                    <div className="text-lg font-mono font-bold text-gray-900">{simulatedAI.plate}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Jenis Kendaraan (YOLO)</div>
                                    <div className="text-lg font-bold text-gray-900 capitalize">{simulatedAI.vehicleClass}</div>
                                </div>
                            </div>

                            {simulatedAI.vehicleClass === 'motorcycle' && (
                                <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
                                    simulatedAI.capacityCheck === 'OVER_250CC' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-green-50 border-green-200 text-green-800'
                                }`}>
                                    <FiAlertTriangle className="mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <div className="font-bold">Pengecekan Kapasitas Mesin Motor</div>
                                        <div className="text-sm mt-1">
                                            Hasil estimasi database spesifikasi: <strong>{simulatedAI.capacityCheck === 'OVER_250CC' ? 'Di Atas 250cc' : 'Di Bawah 250cc'}</strong>.
                                            {simulatedAI.capacityCheck === 'OVER_250CC' && ' Motor di atas 250cc tidak berhak menerima BBM Subsidi.'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submitTransaction} className="space-y-6 border-t border-gray-100 pt-6">
                                <h4 className="font-bold text-gray-900">Detail Pengisian BBM</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis BBM</label>
                                        <select 
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            value={fuelType}
                                            onChange={e => setFuelType(e.target.value)}
                                            required
                                        >
                                            <option value="Pertalite">Pertalite</option>
                                            <option value="Solar">Solar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Volume (Liter)</label>
                                        <input 
                                            type="number" step="0.1" min="1"
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            value={volume}
                                            onChange={e => setVolume(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Batal / Ulangi
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#980f12] text-white py-3 rounded-full font-bold shadow-md hover:bg-red-800 transition-colors"
                                    >
                                        Selesaikan Transaksi
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}

OperatorValidation.layout = (page: any) => <AppLayout title="Validasi Kendaraan">{page}</AppLayout>;
