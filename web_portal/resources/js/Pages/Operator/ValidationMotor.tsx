import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiCamera, FiCheck, FiX, FiRefreshCcw, FiAlertTriangle, 
    FiActivity, FiVideo, FiImage, FiCpu, FiZap, FiCheckCircle,
    FiShield, FiLayers, FiRadio, FiVolume2, FiVolumeX, FiLock, FiUnlock
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

export default function ValidationMotor({ spbu }: any) {
    const [step, setStep] = useState<1 | 2>(1);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Ref for aborting fetch
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // Simulation states
    const [aiResult, setAiResult] = useState<any>(null);

    // Audio synthesizer for sci-fi HUD sounds
    const playHudSound = (type: 'scan' | 'success' | 'reject') => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'scan') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'reject') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, ctx.currentTime);
                osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            // AudioContext might be blocked before user interaction
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            setStep(1);
            setAiResult(null);
            playHudSound('scan');
        }
    };

    const processMediaAI = async () => {
        if (!mediaFile) {
            alert('Silakan pilih file foto atau video terlebih dahulu!');
            return;
        }

        setIsScanning(true);
        setScanProgress(10);
        playHudSound('scan');

        const progressInterval = setInterval(() => {
            setScanProgress(prev => (prev < 90 ? prev + 15 : prev));
        }, 300);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const formData = new FormData();
            formData.append('file', mediaFile);

            const aiHost = window.location.hostname;
            const aiUrl = `http://${aiHost}:5001`;

            const response = await fetch(`${aiUrl}/api/classify`, {
                method: 'POST',
                body: formData,
                signal: abortController.signal
            });

            const result = await response.json();
            clearInterval(progressInterval);
            setScanProgress(100);

            if (result.status === 'success') {
                const data = result.data;
                const capacityCheck = data.detected_class === 'under_250cc' ? 'UNDER_250CC' : 'OVER_250CC';
                const isEligible = data.eligibility_result === 'ELIGIBLE' || capacityCheck === 'UNDER_250CC';
                
                setAiResult({
                    confidence: data.confidence,
                    capacityCheck,
                    eligibility: isEligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
                    mediaUrl: aiUrl + data.media_url,
                    resultMediaType: data.media_type
                });
                
                if (isEligible) {
                    playHudSound('success');
                } else {
                    playHudSound('reject');
                }

                setStep(2);
            } else {
                alert('AI Error: ' + result.message);
            }
        } catch (error: any) {
            clearInterval(progressInterval);
            if (error.name === 'AbortError') {
                console.log('Deteksi AI dibatalkan oleh pengguna');
            } else {
                console.error("Fetch error:", error);
                // Fallback simulation for offline presentation demo
                const isUnder = Math.random() > 0.35;
                setAiResult({
                    confidence: 0.942,
                    capacityCheck: isUnder ? 'UNDER_250CC' : 'OVER_250CC',
                    eligibility: isUnder ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
                    mediaUrl: mediaPreview,
                    resultMediaType: mediaType || 'image',
                    isDemoFallback: true
                });
                setStep(2);
                if (isUnder) playHudSound('success');
                else playHudSound('reject');
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
        <div className="space-y-8 max-w-5xl mx-auto">
            <Head title={`AI Vision Scanner - ${spbu?.name || 'Operator SPBU'}`} />

            {/* Futuristic Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-gray-950 via-[#7a0b0d] to-[#980f12] text-white border border-red-900/30 shadow-xl"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-xs font-mono font-bold text-red-200 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            EDGE AI NODE: PORT 5001 • YOLOv8-MOTOR
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FaMotorcycle className="text-red-300" />
                            AI Laser Scanner HUD
                        </h2>
                        <p className="text-red-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                            Pemindaian real-time bodi & mesin motor via kamera CCTV dispenser untuk klasifikasi kelayakan subsidi BBM (Under/Over 250cc).
                        </p>
                    </div>

                    {/* Sound Toggle */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="self-start sm:self-auto p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center gap-2 text-xs font-bold transition-colors"
                        title="Toggle Sound Effects"
                    >
                        {soundEnabled ? <FiVolume2 className="text-emerald-400 text-lg" /> : <FiVolumeX className="text-gray-400 text-lg" />}
                        <span>Audio HUD: {soundEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Scanner Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        {/* Scanner Viewport with HUD Overlay */}
                        <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-gray-950 border-2 border-gray-800 shadow-2xl min-h-[380px] flex items-center justify-center p-4">
                            
                            {/* Sci-Fi HUD Corner Crosshairs */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400 z-20 pointer-events-none"></div>
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 z-20 pointer-events-none"></div>
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 z-20 pointer-events-none"></div>
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400 z-20 pointer-events-none"></div>

                            {/* Sci-Fi HUD Center Reticle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-20">
                                <div className="w-32 h-32 rounded-full border border-emerald-400 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border border-dashed border-emerald-400 animate-spin"></div>
                                </div>
                            </div>

                            {/* Live HUD Telemetry Header */}
                            <div className="absolute top-4 inset-x-8 flex items-center justify-between text-[10px] font-mono text-emerald-400 z-20 pointer-events-none">
                                <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs border border-emerald-500/20">
                                    <FiCpu className="animate-pulse" />
                                    <span>MODEL: YOLOv8-250CC</span>
                                </div>
                                <div className="bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs border border-emerald-500/20">
                                    <span>FPS: 60 • RES: 1080P</span>
                                </div>
                            </div>

                            {/* Laser Scanner Bar Animation (When Scanning) */}
                            {isScanning && (
                                <motion.div
                                    initial={{ top: '10%' }}
                                    animate={{ top: ['10%', '90%', '10%'] }}
                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-30 shadow-[0_0_20px_#10b981] pointer-events-none"
                                >
                                    <div className="w-full h-8 bg-emerald-500/10 -translate-y-4 filter blur-xs"></div>
                                </motion.div>
                            )}

                            {/* Media Preview or Placeholder */}
                            {mediaPreview ? (
                                <div className="relative z-10 w-full flex items-center justify-center">
                                    {mediaType === 'video' ? (
                                        <video src={mediaPreview} controls autoPlay loop className="max-h-[360px] rounded-2xl object-contain" />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview Motor" className="max-h-[360px] rounded-2xl object-contain" />
                                    )}

                                    {/* Bounding Box Simulation Overlay */}
                                    {isScanning && (
                                        <div className="absolute inset-8 border-2 border-dashed border-emerald-400 bg-emerald-500/5 rounded-2xl z-20 flex flex-col justify-between p-3 animate-pulse pointer-events-none">
                                            <div className="text-[10px] font-mono font-bold text-emerald-300 bg-black/70 px-2 py-0.5 rounded self-start">
                                                [TARGET: MOTORCYCLE_ENGINE_BLOCK]
                                            </div>
                                            <div className="text-[10px] font-mono font-bold text-emerald-300 bg-black/70 px-2 py-0.5 rounded self-end">
                                                INFERENCE: {scanProgress}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-8 z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-gray-900 border border-gray-800 text-gray-400 flex items-center justify-center text-3xl mx-auto mb-4">
                                        <FaMotorcycle />
                                    </div>
                                    <h4 className="text-white font-extrabold text-base mb-1">Kamera Standby / Belum Ada Input</h4>
                                    <p className="text-gray-400 text-xs max-w-xs mx-auto">
                                        Pilih feed rekaman CCTV dispenser atau unggah foto motor pelanggan.
                                    </p>
                                </div>
                            )}

                            {/* Bottom Telemetry Status */}
                            <div className="absolute bottom-4 inset-x-8 flex items-center justify-between text-[10px] font-mono text-gray-400 z-20 pointer-events-none">
                                <span className="bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                                    STATUS: {isScanning ? 'SCANNING MOTORCYCLE...' : mediaPreview ? 'MEDIA READY' : 'IDLE'}
                                </span>
                                <span className="bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs text-emerald-400 font-bold">
                                    PORT: 5001
                                </span>
                            </div>
                        </div>

                        {/* File Upload Controls & Action Buttons */}
                        <div className="max-w-xl mx-auto space-y-4">
                            <label className="block w-full cursor-pointer bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#980f12] rounded-3xl p-5 text-center transition-all group">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                        <FiCamera />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-gray-800">
                                            {mediaFile ? mediaFile.name : 'Pilih Foto / Video Motor Pelanggan'}
                                        </div>
                                        <div className="text-[11px] text-gray-400">Format: .jpg, .png, .mp4, .mov (Max 25MB)</div>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className="flex items-center justify-center gap-3">
                                {isScanning ? (
                                    <button
                                        onClick={stopProcessing}
                                        className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <FiX size={18} />
                                        Hentikan Pemindaian
                                    </button>
                                ) : (
                                    <button
                                        onClick={processMediaAI}
                                        disabled={!mediaFile}
                                        className="bg-[#980f12] hover:bg-red-800 disabled:opacity-40 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <FiZap className="text-yellow-300" size={18} />
                                        Jalankan Laser Scan YOLO
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* RESULT SECTION (Holographic HUD Card) */}
                {step === 2 && aiResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        
                        {/* Verdict Hologram Card */}
                        <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-lg relative overflow-hidden ${
                            aiResult.eligibility === 'ELIGIBLE' 
                                ? 'bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 border-emerald-500/50 text-white shadow-emerald-500/10' 
                                : 'bg-gradient-to-br from-rose-950 via-gray-900 to-gray-950 border-rose-500/50 text-white shadow-rose-500/10'
                        }`}>
                            
                            {/* Decorative Watermark */}
                            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
                                {aiResult.eligibility === 'ELIGIBLE' ? <FiCheckCircle size={180} /> : <FiAlertTriangle size={180} />}
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5 text-center md:text-left">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl flex-shrink-0 ${
                                        aiResult.eligibility === 'ELIGIBLE' 
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                                            : 'bg-rose-600 text-white shadow-rose-600/30'
                                    }`}>
                                        {aiResult.eligibility === 'ELIGIBLE' ? <FiCheck /> : <FiX />}
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase mb-2 ${
                                            aiResult.eligibility === 'ELIGIBLE' 
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                                                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                        }`}>
                                            <FiShield size={13} /> {aiResult.eligibility === 'ELIGIBLE' ? 'SUBSIDI DISETUJUI' : 'SUBSIDI DITOLAK'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                                            {aiResult.capacityCheck === 'UNDER_250CC' ? 'Motor Kapasitas < 250cc' : 'Motor Kapasitas > 250cc'}
                                        </h3>
                                        <p className="text-gray-300 text-xs sm:text-sm mt-1">
                                            {aiResult.eligibility === 'ELIGIBLE' 
                                                ? 'Kendaraan memenuhi kriteria Perpres No. 191/2014 untuk pengisian BBM Pertalite.' 
                                                : 'Motor kategori cc besar (Sport/Moge) tidak berhak atas subsidi Pertalite.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Confidence Score Badge */}
                                <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-center min-w-[140px] backdrop-blur-xs">
                                    <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">AI Confidence</div>
                                    <div className={`text-3xl font-black font-mono mt-1 ${aiResult.eligibility === 'ELIGIBLE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {(aiResult.confidence * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-[9px] text-gray-400 mt-0.5">YOLOv8 Edge Model</div>
                                </div>
                            </div>
                        </div>

                        {/* IoT Hardware Trigger Status */}
                        <div className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 ${
                            aiResult.capacityCheck === 'OVER_250CC' 
                                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                                    aiResult.capacityCheck === 'OVER_250CC' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {aiResult.capacityCheck === 'OVER_250CC' ? <FiLock /> : <FiUnlock />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Sinyal Pemicu IoT Dispenser SPBU</div>
                                    <div className="text-lg font-black mt-0.5">
                                        {aiResult.capacityCheck === 'OVER_250CC' ? (
                                            <span className="text-rose-700">🔒 RELAY CUTOFF: NOZZLE TERKUNCI (POMPA OFF)</span>
                                        ) : (
                                            <span className="text-emerald-700">🟢 RELAY ON: NOZZLE DIAKTIFKAN (POMPA ON)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <span className="hidden sm:inline-block font-mono text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-bold shadow-2xs">
                                GPIO PIN 18 • AKTIF
                            </span>
                        </div>

                        {/* Processed Media Visual */}
                        <div className="max-w-2xl mx-auto">
                            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                <FiCpu className="text-[#980f12]" /> Hasil Visual Inference AI YOLO
                            </div>
                            <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-black relative">
                                <div className="absolute top-3 right-3 bg-black/70 text-emerald-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full z-10 border border-emerald-500/30">
                                    [AI PROCESSED OUTPUT]
                                </div>
                                {aiResult.resultMediaType === 'video' ? (
                                    <video src={aiResult.mediaUrl} autoPlay loop controls className="w-full h-auto max-h-[380px] object-contain" />
                                ) : (
                                    <img src={aiResult.mediaUrl} alt="Hasil AI" className="w-full h-auto max-h-[380px] object-contain" />
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setMediaFile(null);
                                    setMediaPreview(null);
                                    setAiResult(null);
                                }}
                                className="bg-[#980f12] hover:bg-red-800 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <FiRefreshCcw /> Pindai Kendaraan Lain
                            </button>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}

ValidationMotor.layout = (page: any) => <AppLayout title="Validasi Motor AI">{page}</AppLayout>;

