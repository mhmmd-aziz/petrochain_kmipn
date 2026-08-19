import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion } from 'framer-motion';
import { FiCamera, FiCheck, FiX, FiRefreshCcw, FiAlertTriangle, FiActivity, FiVideo, FiImage } from 'react-icons/fi';

export default function ValidationMotor({ spbu }: any) {
    const [step, setStep] = useState<1 | 2>(1);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    
    // Ref for aborting fetch
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // Simulation states
    const [aiResult, setAiResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            setStep(1);
            setAiResult(null);
        }
    };

    const processMediaAI = async () => {
        if (!mediaFile) {
            alert('Silakan pilih file foto atau video terlebih dahulu!');
            return;
        }

        setIsScanning(true);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const formData = new FormData();
            formData.append('file', mediaFile);

            const response = await fetch('http://127.0.0.1:5001/api/classify', {
                method: 'POST',
                body: formData,
                signal: abortController.signal
            });

            const result = await response.json();

            if (result.status === 'success') {
                const data = result.data;
                const capacityCheck = data.detected_class === 'under_250cc' ? 'UNDER_250CC' : 'OVER_250CC';
                
                setAiResult({
                    confidence: data.confidence,
                    capacityCheck,
                    eligibility: data.eligibility_result,
                    mediaUrl: data.media_url,
                    resultMediaType: data.media_type
                });
                setStep(2);
            } else {
                alert('AI Error: ' + result.message);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Deteksi AI dibatalkan oleh pengguna');
            } else {
                console.error("Fetch error:", error);
                alert('Gagal terhubung ke AI Server. Pastikan Flask API berjalan di port 5001.');
            }
        } finally {
            setIsScanning(false);
            abortControllerRef.current = null;
        }
    };

    const stopProcessing = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsScanning(false);
    };

    return (
        <>
            <Head title={`Validasi Motor (AI) - ${spbu?.name || 'Operator'}`} />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Validasi Motor AI (Demo IoT)</h2>
                    <p className="text-gray-500 mt-1 text-sm">Upload foto/video motor untuk deteksi kapasitas mesin via AI YOLO.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    {/* INPUT SECTION */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Input Media dari CCTV / Kamera</h3>
                        <p className="text-gray-500 text-sm mb-6">Sistem AI akan mengecek fisik kendaraan secara otomatis.</p>
                        
                        <div className="max-w-md mx-auto mb-6">
                            {mediaPreview && step === 1 && (
                                <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative">
                                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10 flex items-center gap-1">
                                        {mediaType === 'video' ? <FiVideo /> : <FiImage />} Preview Asli
                                    </div>
                                    {mediaType === 'video' ? (
                                        <video src={mediaPreview} controls className="w-full h-auto object-cover max-h-80" />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-auto object-cover max-h-80" />
                                    )}
                                </div>
                            )}
                            
                            {step === 1 && (
                                <label className="block w-full cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-600 hover:bg-gray-100 hover:border-blue-400 transition">
                                    <span className="font-bold text-sm block mb-1">Pilih File Foto / Video</span>
                                    <span className="text-xs text-gray-400">Mendukung .jpg, .png, .mp4, .webm</span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            )}
                        </div>

                        {step === 1 && (
                            isScanning ? (
                                <button
                                    onClick={stopProcessing}
                                    className="bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-red-700 inline-flex items-center gap-2"
                                >
                                    <FiX className="text-xl" />
                                    Batalkan Deteksi
                                </button>
                            ) : (
                                <button
                                    onClick={processMediaAI}
                                    disabled={!mediaFile}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    <FiActivity />
                                    Jalankan Deteksi AI
                                </button>
                            )
                        )}
                    </motion.div>

                    {/* RESULT SECTION */}
                    {step === 2 && aiResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pt-8 border-t border-gray-100">
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Hasil Deteksi & Aksi IoT</h3>

                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className={`p-4 rounded-xl ${aiResult.eligibility === 'ELIGIBLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {aiResult.eligibility === 'ELIGIBLE' ? <FiCheck size={32} /> : <FiX size={32} />}
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold ${aiResult.eligibility === 'ELIGIBLE' ? 'text-green-700' : 'text-red-700'}`}>
                                        Status: {aiResult.eligibility}
                                    </h3>
                                    <p className="text-gray-500 font-medium">
                                        Kelas: {aiResult.capacityCheck === 'UNDER_250CC' ? 'Under 250cc' : 'Over 250cc'} 
                                        <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">Confidence: {(aiResult.confidence * 100).toFixed(1)}%</span>
                                    </p>
                                </div>
                            </div>

                            <div className={`mb-8 p-5 rounded-xl border-2 flex items-start gap-4 ${
                                aiResult.capacityCheck === 'OVER_250CC' ? 'bg-red-50 border-red-300 text-red-900' : 'bg-green-50 border-green-300 text-green-900'
                            }`}>
                                <FiAlertTriangle className="mt-1 flex-shrink-0" size={24} />
                                <div>
                                    <div className="font-bold text-lg">Sinyal Pemicu IoT Dispenser</div>
                                    <div className="mt-1">
                                        Perintah yang dikirim ke hardware saat ini: <br/>
                                        {aiResult.capacityCheck === 'OVER_250CC' ? (
                                            <span className="font-black text-xl text-red-700">🔴 KUNCI POMPA (RELAY OFF)</span>
                                        ) : (
                                            <span className="font-black text-xl text-green-700">🟢 POMPA AKTIF (RELAY ON)</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-xl mx-auto">
                                <div className="text-sm font-bold text-gray-700 mb-2">Visualisasi Hasil Deteksi YOLO</div>
                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black relative">
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs z-10">AI Processed Output</div>
                                    {aiResult.resultMediaType === 'video' ? (
                                        <video src={aiResult.mediaUrl} autoPlay loop controls className="w-full h-auto" />
                                    ) : (
                                        <img src={aiResult.mediaUrl} alt="Hasil AI" className="w-full h-auto" />
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setMediaFile(null);
                                        setMediaPreview(null);
                                    }}
                                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Uji Kendaraan Lain
                                </button>
                            </div>

                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}

ValidationMotor.layout = (page: any) => <AppLayout title="Validasi Motor AI">{page}</AppLayout>;
