import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveGlobe from '@/Components/InteractiveGlobe';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';
import { 
    FiArrowRight, FiShield, FiActivity, FiCheckCircle, 
    FiSearch, FiMenu, FiX, FiCpu, FiLock, FiLayers, 
    FiChevronDown, FiDatabase, FiTruck, FiZap, FiExternalLink,
    FiCode, FiServer, FiCheck, FiRadio, FiMapPin, FiRefreshCw,
    FiSliders, FiAlertCircle, FiInfo, FiFileText
} from 'react-icons/fi';
import { FaMotorcycle, FaQrcode, FaGasPump } from 'react-icons/fa';

export default function Welcome({ auth }: { auth: any }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    
    // Interactive Simulator State
    const [simVehicleType, setSimVehicleType] = useState<'motor' | 'mobil'>('motor');
    const [simCC, setSimCC] = useState<number>(125);
    const [simBrand, setSimBrand] = useState<string>('Honda Vario');
    const [hasInteracted, setHasInteracted] = useState(false);
    const prevEligibleRef = useRef<boolean | null>(null);

    // Interactive Tech Tab State
    const [activeTechTab, setActiveTechTab] = useState<'yolo' | 'iot' | 'blockchain' | 'fraud'>('yolo');

    // Confetti burst when user becomes eligible
    const fireConfetti = useCallback(() => {
        const duration = 1500;
        const end = Date.now() + duration;
        const colors = ['#10b981', '#34d399', '#6ee7b7', '#ffffff', '#980f12'];

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.65 },
                colors,
                zIndex: 9999,
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.65 },
                colors,
                zIndex: 9999,
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.getElementById(targetId);
        if (element) {
            const offset = 85;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Calculate Subsidy Eligibility based on Perpres 191/2014 & Draft Regulations
    const isEligible = simVehicleType === 'motor' ? simCC < 250 : simCC <= 1400;

    // Fire confetti when eligibility changes to true after user interaction
    useEffect(() => {
        if (!hasInteracted) return;
        if (isEligible && prevEligibleRef.current === false) {
            fireConfetti();
        }
        prevEligibleRef.current = isEligible;
    }, [isEligible, hasInteracted, fireConfetti]);

    const quickPresets = [
        { type: 'motor', name: 'Honda BeAT', cc: 110 },
        { type: 'motor', name: 'Yamaha NMAX', cc: 155 },
        { type: 'motor', name: 'Kawasaki Ninja', cc: 250 },
        { type: 'mobil', name: 'Toyota Avanza', cc: 1300 },
        { type: 'mobil', name: 'Honda HR-V', cc: 1500 },
        { type: 'mobil', name: 'Toyota Fortuner', cc: 2800 },
    ];

    const faqs = [
        {
            q: 'Apa itu ekosistem PETROCHAIN?',
            a: 'PETROCHAIN adalah platform intelligent verification dan audit trail berlapis untuk memperkuat sistem subsidi BBM (mendukung MyPertamina). Sistem ini menggabungkan AI Computer Vision (YOLO & OCR) dengan Blockchain Hyperledger Fabric untuk memastikan subsidi tepat sasaran.'
        },
        {
            q: 'Bagaimana AI memvalidasi kelayakan subsidi kendaraan?',
            a: 'AI bekerja dalam dua tahap: (1) OCR mengekstrak nomor plat, masa berlaku, dan kapasitas mesin (CC) dari STNK saat pendaftaran. (2) Kamera YOLO di SPBU mendeteksi fisik kendaraan secara real-time saat pengisian untuk mencocokkan plat nomor fisik dan memvalidasi kapasitas motor (under/over 250cc).'
        },
        {
            q: 'Mengapa PETROCHAIN menggunakan Blockchain Hyperledger Fabric?',
            a: 'Setiap transaksi sukses dicatat ke ledger terdesentralisasi (Hyperledger Fabric) dengan hash kriptografi SHA-256. Data ini bersifat immutable (tidak dapat dimanipulasi/dihapus), memberikan audit trail transparan bagi pemerintah, BPH Migas, dan Pertamina.'
        },
        {
            q: 'Bagaimana cara masyarakat mendaftarkan kendaraannya?',
            a: 'Masyarakat cukup membuat akun pada menu "Daftar Subsidi", mengunggah foto STNK & foto fisik kendaraan. Sistem AI akan memproses verifikasi awal dan admin SPBU akan menyetujui kuota QR Code digital.'
        },
        {
            q: 'Bagaimana keamanan data dan privasi pemilik kendaraan (STNK & NIK) dilindungi?',
            a: 'Data sensitif seperti foto fisik STNK dan NIK dienkripsi secara end-to-end dengan standar militer AES-256 dan hanya disimpan dalam format hash kriptografis SHA-256 pada ledger terdesentralisasi. Sistem sepenuhnya mematuhi UU Pelindungan Data Pribadi (UU PDP No. 27/2022).'
        },
        {
            q: 'Apakah PETROCHAIN kompatibel dan dapat diintegrasikan dengan aplikasi MyPertamina?',
            a: 'Ya, PETROCHAIN dirancang sebagai middleware modular (plug-and-play). Sistem menyediakan REST API & Webhook berlatensi sangat rendah (< 50ms) yang dapat langsung berkomunikasi dengan backend MyPertamina dan POS dispenser SPBU eksisting tanpa merombak infrastruktur utama.'
        },
        {
            q: 'Berapa estimasi biaya dan efisiensi implementasi perangkat keras di setiap SPBU?',
            a: 'PETROCHAIN mengusung konsep Low-Cost Edge AI Retrofit. Setiap pulau pompa SPBU hanya membutuhkan kamera IP standar dan modul edge micro-controller (seperti Jetson Nano / Raspberry Pi 4) yang dihubungkan ke solenoid nozzle dispenser, menekan biaya investasi hingga 80% dibanding mengganti unit dispenser baru.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#980f12] selection:text-white font-sans text-gray-900 overflow-x-hidden scroll-smooth">
            <Head title="PETROCHAIN - Platform Intelligent Verification & Audit Distribusi BBM Bersubsidi" />

            {/* Glassmorphism Navbar */}
            <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-[#980f12]/95 backdrop-blur-md shadow-lg shadow-red-950/20 py-3.5 border-b border-red-800/40' 
                    : 'bg-[#980f12] py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-white/20 p-1.5 flex items-center justify-center transform group-hover:scale-105 transition-all">
                                <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-white font-extrabold text-lg sm:text-xl tracking-wide leading-none">
                                    PETROCHAIN
                                </span>
                                <p className="text-[9px] text-red-200 font-medium leading-tight mt-0.5">
                                    Intelligent Fuel Subsidy Ecosystem
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <a 
                                href="#cara-kerja" 
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="text-sm font-medium text-red-100 hover:text-white transition-colors cursor-pointer"
                            >
                                Cara Kerja
                            </a>
                            <a 
                                href="#simulator" 
                                onClick={(e) => scrollToSection(e, 'simulator')}
                                className="text-sm font-medium text-red-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <FiSliders className="text-yellow-300" /> Cek Kelayakan CC
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className="text-sm font-medium text-red-100 hover:text-white transition-colors cursor-pointer"
                            >
                                Rantai Pasok Nasional
                            </a>
                            <a 
                                href="#teknologi" 
                                onClick={(e) => scrollToSection(e, 'teknologi')}
                                className="text-sm font-medium text-red-100 hover:text-white transition-colors cursor-pointer"
                            >
                                Arsitektur AI & Blockchain
                            </a>
                            <a 
                                href="#faq" 
                                onClick={(e) => scrollToSection(e, 'faq')}
                                className="text-sm font-medium text-red-100 hover:text-white transition-colors cursor-pointer"
                            >
                                FAQ
                            </a>
                            <Link href={route('public.stock')} className="text-sm font-medium text-red-100 hover:text-white transition-colors flex items-center gap-1.5">
                                <FiSearch className="text-red-200" /> Cek Stok SPBU
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden sm:flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-white text-[#980f12] px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-100 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <FiActivity /> Masuk Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                         href={route('login')} 
                                        className="text-sm font-semibold text-white/90 hover:text-white px-3 py-2 transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-white text-[#980f12] px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-100 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Daftar Subsidi
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <div className="flex sm:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors focus:outline-none"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="sm:hidden bg-[#800b0e] border-t border-red-900/60 px-4 pt-3 pb-6 space-y-3"
                        >
                            <a 
                                href="#cara-kerja" 
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Cara Kerja
                            </a>
                            <a 
                                href="#simulator" 
                                onClick={(e) => scrollToSection(e, 'simulator')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Cek Kelayakan CC
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Rantai Pasok Nasional
                            </a>
                            <a 
                                href="#teknologi" 
                                onClick={(e) => scrollToSection(e, 'teknologi')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Arsitektur AI & Blockchain
                            </a>
                            <a 
                                href="#faq" 
                                onClick={(e) => scrollToSection(e, 'faq')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                FAQ
                            </a>
                            <Link 
                                href={route('public.stock')} 
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10"
                            >
                                Cek Stok SPBU
                            </Link>
                            <div className="pt-3 border-t border-red-900/40 flex flex-col gap-2">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full text-center bg-white text-[#980f12] py-2.5 rounded-full text-sm font-bold shadow-md"
                                    >
                                        Masuk Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            href={route('login')} 
                                            className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-white/10"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="w-full text-center bg-white text-[#980f12] py-2.5 rounded-full text-sm font-bold shadow-md"
                                        >
                                            Daftar Subsidi
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ========================================================================= */}
            {/* HERO SECTION: MODERN FULL-WIDTH BENTO CANVAS                              */}
            {/* ========================================================================= */}
            <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-10 xl:px-14 bg-white min-h-[calc(100vh-70px)] flex flex-col justify-center border-b border-gray-100">
                <div className="w-full">
                    
                    {/* Main Bento Hero Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                        
                        {/* ================================================================= */}
                        {/* LEFT STAGE: HERO BANNER (Col 8 on LG, Col 7 on XL)                */}
                        {/* ================================================================= */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-8 bg-gray-50/80 rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between"
                        >
                            {/* Subtle Ambient Glows */}
                            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Inner Grid: Text on Left, Model Card on Right */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                                
                                {/* Left Content */}
                                <div className="md:col-span-7 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider mb-5 shadow-xs w-fit">
                                        <FiShield className="text-[#980f12]" />
                                        <span>Intelligent Fuel Ecosystem</span>
                                    </div>

                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-950 tracking-tight leading-[1.08] mb-4">
                                        Subsidi Tepat. <br />
                                        Distribusi Aman.
                                    </h1>

                                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed mb-6">
                                        Verifikasi ganda <strong>AI YOLO & Dokumen STNK</strong> dengan ledger terdesentralisasi <strong>Hyperledger Fabric</strong> untuk transparansi energi nasional.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-2.5 bg-[#980f12] hover:bg-red-800 text-white px-7 py-3.5 rounded-full font-black text-xs sm:text-sm shadow-xl shadow-red-950/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <span>Daftar Kendaraan Subsidi</span>
                                            <FiArrowRight size={16} />
                                        </Link>

                                        <a
                                            href="#simulator"
                                            onClick={(e) => scrollToSection(e, 'simulator')}
                                            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-5 py-3.5 rounded-full font-bold text-xs border border-gray-200 transition-colors cursor-pointer"
                                        >
                                            <FiSliders className="text-[#980f12]" /> Cek Kelayakan CC
                                        </a>
                                    </div>
                                </div>

                                {/* Right Model Image Frame */}
                                <div className="md:col-span-5 relative">
                                    <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-md aspect-4/5 max-h-[380px] w-full mx-auto">
                                        <img 
                                            src="/images/hero_citizen.jpg" 
                                            alt="Pengguna Terverifikasi Petrochain"
                                            className="w-full h-full object-cover object-top" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

                                        {/* Floating Badge inside Frame */}
                                        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                                <FiCheckCircle size={14} />
                                            </div>
                                            <div className="text-[10px] font-mono leading-tight">
                                                <div className="font-bold text-gray-900">VERIFIED PASS</div>
                                                <div className="text-emerald-600 font-black">AI & LEDGER OK</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Lower Trust Markers */}
                            <div className="relative z-10 pt-5 mt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-3 text-gray-500 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Standar Nasional:</span>
                                    <div className="flex items-center gap-3 font-mono font-black text-gray-700 text-xs">
                                        <span>BPH MIGAS</span>
                                        <span>•</span>
                                        <span>MYPERTAMINA</span>
                                        <span>•</span>
                                        <span>HYPERLEDGER</span>
                                    </div>
                                </div>
                                <span className="font-mono text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    ● ZERO-FRAUD ACTIVE
                                </span>
                            </div>
                        </motion.div>


                        {/* ================================================================= */}
                        {/* RIGHT COLUMN: 3 BENTO CARDS (Col 4)                                */}
                        {/* ================================================================= */}
                        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                            
                            {/* Bento Card 1: Pilihan BBM */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-extrabold text-gray-900">Kategori Bahan Bakar</span>
                                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        REALTIME
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs" title="Pertalite (Subsidi)">
                                            P
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-xs shadow-xs" title="Biosolar (Subsidi)">
                                            S
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs" title="Pertamax">
                                            PX
                                        </span>
                                        <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs" title="Pertamax Turbo">
                                            PT
                                        </span>
                                    </div>
                                    <Link href={route('public.stock')} className="text-xs font-bold text-gray-700 hover:text-[#980f12] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 transition-colors">
                                        Cek Harga <FiArrowRight size={12} />
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Bento Card 2: AI Edge Vision Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group"
                            >
                                <div className="flex items-start justify-between relative z-10 mb-2">
                                    <div>
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-[10px] uppercase mb-1">
                                            AI Edge Vision v8
                                        </span>
                                        <h4 className="text-base font-black text-gray-900">Dual-Camera ANPR</h4>
                                        <p className="text-[11px] text-gray-500 font-medium">Deteksi plat nomor & CC &lt; 2s</p>
                                    </div>
                                    <Link
                                        href="/operator/validation-motor"
                                        className="w-8 h-8 rounded-full bg-white hover:bg-[#980f12] text-gray-700 hover:text-white flex items-center justify-center text-xs transition-all border border-gray-200 group-hover:scale-110"
                                        title="Buka AI Scanner"
                                    >
                                        <FiArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="relative h-24 rounded-xl overflow-hidden border border-gray-200/80">
                                    <img 
                                        src="/images/hero_camera.jpg" 
                                        alt="AI Camera Sensor" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                                        <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                            INFERENCE 42ms
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Bento Card 3: Smart Dispenser Operator Card (Portrait Card) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs relative overflow-hidden group"
                            >
                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <div>
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 text-[#980f12] font-mono font-black text-[10px] uppercase mb-1">
                                            IoT Dispenser Cutoff
                                        </span>
                                        <h4 className="text-base font-black text-gray-900">Operator SPBU Terminal</h4>
                                    </div>
                                    <Link
                                        href="/operator/validation"
                                        className="w-8 h-8 rounded-full bg-white hover:bg-[#980f12] text-gray-700 hover:text-white flex items-center justify-center text-xs transition-all border border-gray-200 group-hover:scale-110"
                                        title="Buka POS Dispenser"
                                    >
                                        <FiArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="relative h-24 rounded-xl overflow-hidden border border-gray-200/80">
                                    <img 
                                        src="/images/hero_operator.jpg" 
                                        alt="SPBU Operator Terminal" 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                                        <span className="text-[10px] font-mono text-white font-bold">
                                            SMART NOZZLE RELAY • ACTIVE
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>


                    {/* ================================================================= */}
                    {/* BOTTOM ROW: BENTO METRICS & POPULAR STRIP (Full Width)            */}
                    {/* ================================================================= */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 mt-5">
                        
                        {/* Bottom Card 1: Connected SPBU Nodes (Col 4) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="lg:col-span-4 bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
                        >
                            <div>
                                <div className="text-xs font-black text-gray-900">SPBU Terdaftar</div>
                                <div className="text-[11px] text-gray-500 font-medium"><CountUp end={530} duration={2.5} suffix="+" enableScrollSpy scrollSpyOnce /> SPBU Terkoneksi Nasional</div>
                                <div className="flex items-center gap-2 mt-3 text-xs font-mono font-bold text-gray-700">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center border border-red-100">
                                        <FiMapPin size={15} />
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                                        <FiTruck size={15} />
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                                        <FaMotorcycle size={15} />
                                    </div>
                                </div>
                            </div>
                            <Link 
                                href={route('public.stock')}
                                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#980f12] text-gray-700 hover:text-white flex items-center justify-center text-sm transition-colors border border-gray-200 shadow-2xs"
                            >
                                <FiArrowRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Bottom Card 2: Verified Fuel Volume (Col 4) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-4 bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#980f12] to-red-600 text-white flex flex-col items-center justify-center shadow-md">
                                    <span className="text-xs font-black"><CountUp end={2.4} decimals={1} duration={2} suffix="M+" enableScrollSpy scrollSpyOnce /></span>
                                    <span className="text-[8px] font-mono uppercase tracking-widest text-red-200">LITER</span>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-gray-900">Audit Kriptografis</div>
                                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                        <FiCheckCircle className="text-emerald-600" />
                                        <span><CountUp end={99.8} decimals={1} duration={2.5} suffix="%" enableScrollSpy scrollSpyOnce /> Integritas Data BPH Migas</span>
                                    </div>
                                    <span className="inline-block text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                                        100% IMMUTABLE
                                    </span>
                                </div>
                            </div>
                            <Link 
                                href="/blockchain"
                                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#980f12] text-gray-700 hover:text-white flex items-center justify-center text-sm transition-colors border border-gray-200 shadow-2xs"
                            >
                                <FiArrowRight size={14} />
                            </Link>
                        </motion.div>

                        {/* Bottom Card 3: Popular Feature Teaser (Col 4) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="lg:col-span-4 bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
                        >
                            <div>
                                <span className="text-[10px] font-mono font-bold text-red-600 uppercase flex items-center gap-1">
                                    <FiActivity className="text-red-600" /> POPULER
                                </span>
                                <div className="text-xs font-black text-gray-900 mt-0.5">Cek Kelayakan Kendaraan</div>
                                <div className="text-[11px] text-gray-500 font-medium">Uji CC Motor & Mobil Anda</div>
                            </div>
                            <a 
                                href="#simulator"
                                onClick={(e) => scrollToSection(e, 'simulator')}
                                className="px-4 py-2.5 rounded-2xl bg-[#980f12] hover:bg-red-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Cek CC</span>
                                <FiArrowRight size={12} />
                            </a>
                        </motion.div>

                    </div>

                </div>
            </section>


            {/* ========================================================================= */}
            {/* HOW IT WORKS / USER JOURNEY 4-STEP FLOW (FULL-WIDTH LIGHT)                */}
            {/* ========================================================================= */}
            <section id="cara-kerja" className="py-20 bg-gray-50/70 border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
                            Workflow Solusi Cerdas
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
                            4 Langkah Mudah Verifikasi & Pengisian Subsidi
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Integrasi cerdas dari pendaftaran STNK mandiri di rumah, validasi regulasi, hingga nozzle dispenser otomatis di SPBU.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Step 1 */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-bold border border-red-100 group-hover:scale-110 transition-transform">
                                        <FiFileText />
                                    </div>
                                    <span className="text-xs font-mono font-black text-[#980f12] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                        STEP 01
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-2">Unggah STNK & Data Diri</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Masyarakat mendaftar mandiri via portal. AI PaddleOCR mengekstrak nomor plat, masa berlaku, dan kapasitas mesin (CC) STNK secara otomatis.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                                <span>OCR Otomatis</span>
                                <strong className="text-emerald-600 font-bold">Akurasi 98.8%</strong>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-100 group-hover:scale-110 transition-transform">
                                        <FaQrcode />
                                    </div>
                                    <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                        STEP 02
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-2">Validasi Kuota & QR Pass</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Sistem memverifikasi kelayakan sesuai Perpres 191/2014 dan menerbitkan QR Pass digital dinamis dengan token anti-replay 60 detik.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                                <span>Keamanan Token</span>
                                <strong className="text-blue-700 font-bold">Anti-Replay OTP</strong>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
                                        <FiCpu />
                                    </div>
                                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        STEP 03
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-2">Deteksi Edge AI di SPBU</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Saat kendaraan tiba di SPBU, Dual Camera ANPR YOLOv8 memindai plat nomor dan mencocokkan fisik kendaraan (&lt; 2s) sebelum dispenser aktif.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                                <span>Latency Model</span>
                                <strong className="text-emerald-700 font-bold">&lt; 42ms / Frame</strong>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold border border-purple-100 group-hover:scale-110 transition-transform">
                                        <FiLayers />
                                    </div>
                                    <span className="text-xs font-mono font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                                        STEP 04
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-gray-900 mb-2">Audit Ledger Blockchain</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Volume liter, ID SPBU, dan nomor transaksi disimpan permanen ke Hyperledger Fabric. Audit trail transparan dan tidak dapat dimanipulasi.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-500">
                                <span>Integritas Audit</span>
                                <strong className="text-purple-700 font-bold">100% Immutable</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* INTERACTIVE SUBSIDY ELIGIBILITY CALCULATOR WIDGET (LIGHT FULL-WIDTH)       */}
            {/* ========================================================================= */}
            <section id="simulator" className="py-20 bg-white border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
                            Fitur Publik Interaktif
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
                            Simulasi Cek Kelayakan Subsidi Kendaraan
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Uji kelayakan kendaraan Anda menerima <strong>Pertalite / Biosolar</strong> secara transparan sesuai regulasi <strong>Perpres No. 191/2014</strong>.
                        </p>
                    </div>

                    <div className="bg-gray-50/80 text-gray-900 rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs relative overflow-hidden">
                        {/* Subtle Glow ambient */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                            {/* Input Form Column */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Vehicle Type Toggle */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                        1. Pilih Kategori Kendaraan
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setSimVehicleType('motor');
                                                setSimCC(125);
                                                setSimBrand('Honda Vario');
                                                if (!hasInteracted) setHasInteracted(true);
                                            }}
                                            className={`p-4 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                                                simVehicleType === 'motor'
                                                    ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20'
                                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            <FaMotorcycle size={18} /> Sepeda Motor (&lt; 250cc)
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSimVehicleType('mobil');
                                                setSimCC(1300);
                                                setSimBrand('Toyota Avanza');
                                                if (!hasInteracted) setHasInteracted(true);
                                            }}
                                            className={`p-4 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                                                simVehicleType === 'mobil'
                                                    ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20'
                                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            <FiTruck size={18} /> Mobil Penumpang (&le; 1.400cc)
                                        </button>
                                    </div>
                                </div>

                                {/* Preset Samples */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                        2. Pilih Contoh Kendaraan Populer
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {quickPresets
                                            .filter(p => p.type === simVehicleType)
                                            .map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => {
                                                        setSimCC(preset.cc);
                                                        setSimBrand(preset.name);
                                                        if (!hasInteracted) setHasInteracted(true);
                                                    }}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                                        simBrand === preset.name
                                                            ? 'bg-[#980f12] text-white border-[#980f12] font-black shadow-xs'
                                                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    {preset.name} ({preset.cc >= 1000 ? `${(preset.cc/1000).toFixed(1).replace('.0','')}L / ${preset.cc}cc` : `${preset.cc}cc`})
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {/* CC Slider / Input */}
                                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                            3. Kapasitas Mesin (CC)
                                        </label>
                                        <span className="font-mono text-xl font-black text-[#980f12] bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                            <CountUp end={simCC} duration={0.4} preserveValue /> CC
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={simVehicleType === 'motor' ? 50 : 800}
                                        max={simVehicleType === 'motor' ? 500 : 3500}
                                        step={simVehicleType === 'motor' ? 5 : 50}
                                        value={simCC}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setSimCC(val);
                                            setSimBrand('Kustom');
                                            if (!hasInteracted) setHasInteracted(true);
                                        }}
                                        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#980f12]"
                                    />
                                    <div className="flex justify-between text-[11px] font-mono text-gray-500 mt-2">
                                        <span>{simVehicleType === 'motor' ? '50cc' : '800cc'}</span>
                                        <span className="text-[#980f12] font-bold">
                                            {simVehicleType === 'motor' ? 'Batas Regulasi: 250cc' : 'Batas Regulasi: 1.400cc'}
                                        </span>
                                        <span>{simVehicleType === 'motor' ? '500cc' : '3.500cc'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Result Verdict Card */}
                            <div className="lg:col-span-5">
                                <div className={`p-6 sm:p-8 rounded-3xl border-2 text-center transition-all ${
                                    isEligible 
                                        ? 'bg-emerald-50/90 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                        : 'bg-rose-50/90 border-rose-500 shadow-lg shadow-rose-500/10'
                                }`}>
                                    <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 ${
                                        isEligible ? 'bg-emerald-600 text-white shadow-md' : 'bg-rose-600 text-white shadow-md'
                                    }`}>
                                        {isEligible ? <FiCheckCircle /> : <FiAlertCircle />}
                                    </div>

                                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                                        Hasil Evaluasi AI & Regulasi
                                    </span>

                                    <h4 className={`text-xl sm:text-2xl font-black mt-1 mb-2 ${
                                        isEligible ? 'text-emerald-950' : 'text-rose-950'
                                    }`}>
                                        {isEligible ? 'BERHAK MENERIMA SUBSIDI' : 'TIDAK BERHAK (NON-SUBSIDI)'}
                                    </h4>

                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                                        {isEligible 
                                            ? `Kendaraan ${simBrand} (${simCC}cc) memenuhi kriteria penerima BBM subsidi Pertalite / Biosolar.` 
                                            : `Kendaraan ${simBrand} (${simCC}cc) melebihi batas regulasi. Wajib menggunakan BBM Non-Subsidi (Pertamax / Dex).`}
                                    </p>

                                    <div className="p-3.5 rounded-2xl bg-white text-left text-xs font-mono text-gray-700 border border-gray-200/80 mb-5 space-y-1.5 shadow-2xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Regulasi:</span>
                                            <strong className="text-gray-900">Perpres No. 191/2014</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Kuota Harian:</span>
                                            <strong className={isEligible ? 'text-emerald-700' : 'text-rose-700'}>
                                                {isEligible ? (simVehicleType === 'motor' ? '5 - 10 Liter' : '20 - 40 Liter') : '0 Liter (N/A)'}
                                            </strong>
                                        </div>
                                    </div>

                                    {isEligible ? (
                                        <Link
                                            href={route('register')}
                                            className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Daftarkan QR Pass Sekarang
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('public.stock')}
                                            className="w-full block text-center bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors"
                                        >
                                            Cek Ketersediaan Pertamax di SPBU
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* END-TO-END NATIONAL FUEL SUPPLY CHAIN DIAGRAM (FULL-WIDTH)                */}
            {/* ========================================================================= */}
            <section id="alur" className="py-20 bg-gray-50/60 border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
                            Arsitektur Solusi Nasional
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
                            Rantai Pasok Tertutup & Transparan 4 Pilar
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Bagaimana PETROCHAIN mengunci celah kecurangan dari hulu depot hingga ke nozzle dispenser SPBU.
                        </p>
                    </div>

                    {/* 4 Pillars Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                        {/* Pillar 1: Depot */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-black mb-4 border border-amber-100">
                                    <FiDatabase />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">PILAR 1 • HULU</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Depot Kilang Pertamina</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Monitoring tangki induk dan penugasan armada mobil tangki bersensor IoT Flowmeter & GPS Geofencing.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100">
                                Output: Manifest BBM Digital
                            </div>
                        </div>

                        {/* Pillar 2: SPBU Dispenser */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-2xl font-black mb-4 border border-red-100">
                                    <FaGasPump />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#980f12] uppercase">PILAR 2 • DISPENSER</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Edge AI Dispenser SPBU</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Dual Camera CCTV membaca plat nomor fisik (OCR) dan klasifikasi kapasitas motor (YOLO) saat pengisian.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100">
                                Output: Validasi Real-time &lt; 2s
                            </div>
                        </div>

                        {/* Pillar 3: Konsumen */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black mb-4 border border-blue-100">
                                    <FaQrcode />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">PILAR 3 • KONSUMEN</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">QR Pass MyPertamina</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Masyarakat menggunakan QR Pass terverifikasi STNK. Sistem menolak jika QR digunakan pada plat mobil lain.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100">
                                Output: Zero QR Fraud Replay
                            </div>
                        </div>

                        {/* Pillar 4: Auditor Blockchain */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-black mb-4 border border-purple-100">
                                    <FiLayers />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">PILAR 4 • AUDIT</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Hyperledger Blockchain</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Data transaksi dicatat secara permanen tanpa perantara. BPH Migas & Kemenkeu mengaudit tanpa resiko manipulasi.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100">
                                Output: 100% Immutable Ledger
                            </div>
                        </div>
                    </div>

                    {/* 3D Global Distributed Node Network Showcase Box */}
                    <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-6 space-y-5">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#980f12] text-xs font-mono font-bold border border-red-100">
                                <FiActivity className="animate-pulse" /> DEPLOYMENT READY NASIONAL
                            </div>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 leading-tight">
                                Topologi Jaringan Terdistribusi Sabang hingga Merauke
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Setiap Depot TBBM, Kilang Pengolahan, dan SPBU di 38 provinsi terhubung dalam jaringan konsensus <strong>Hyperledger Fabric</strong>. Validasi kuota dan verifikasi fisik ANPR diproses secara lokal di SPBU (&lt; 2 detik), kemudian diverifikasi silang ke ledger terpusat untuk mengeliminasi pemalsuan kuota antar wilayah.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 shadow-2xs">
                                    <div className="text-gray-500 font-sans">Cakupan SPBU Nasional</div>
                                    <div className="text-lg sm:text-xl font-black text-gray-950 mt-1"><CountUp end={7280} duration={3} separator="." suffix="+" enableScrollSpy scrollSpyOnce /> SPBU</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 shadow-2xs">
                                    <div className="text-gray-500 font-sans">Konsensus Node</div>
                                    <div className="text-lg sm:text-xl font-black text-emerald-600 mt-1">BFT / RAFT Active</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 flex justify-center w-full">
                            <InteractiveGlobe />
                        </div>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* TABBED DEEP-DIVE TECHNOLOGY MATRIX (LIGHT FULL-WIDTH)                     */}
            {/* ========================================================================= */}
            <section id="teknologi" className="py-20 bg-white border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
                            Teknologi & Arsitektur
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
                            4 Lapisan Teknologi PETROCHAIN
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Pilih lapisan teknologi di bawah untuk melihat rincian spesifikasi teknis dan integrasi perangkat keras.
                        </p>
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                        {[
                            { key: 'yolo', label: '1. Computer Vision (YOLO & OCR)', icon: FiCpu },
                            { key: 'iot', label: '2. IoT Smart Dispenser Actuator', icon: FiZap },
                            { key: 'blockchain', label: '3. Hyperledger Fabric Ledger', icon: FiLayers },
                            { key: 'fraud', label: '4. Anti-Replay Security Guard', icon: FiShield },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTechTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTechTab(tab.key as any)}
                                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                        isActive
                                            ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20'
                                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                >
                                    <TabIcon size={16} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Tab Content Card (Clean Light Container) */}
                    <div className="bg-gray-50/80 rounded-3xl p-6 sm:p-10 lg:p-12 text-gray-900 border border-gray-200/80 shadow-xs">
                        {activeTechTab === 'yolo' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                <div>
                                    <span className="text-xs font-mono font-bold text-[#980f12] uppercase bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                                        EDGE COMPUTER VISION
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4 text-gray-950">
                                        YOLOv8 + PaddleOCR Dual Inference
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        Model machine learning berjalan langsung pada edge microservice SPBU (Port 5001). Memproses video feed 30 FPS untuk membaca plat nomor kendaraan dan mengekstrak kubikasi mesin STNK Samsat dengan akurasi 98.8%.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Latency Inference</div>
                                            <div className="text-lg font-black text-emerald-600 mt-1">42 ms / frame</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Model Dataset</div>
                                            <div className="text-lg font-black text-gray-900 mt-1">Plat & Moge 250cc</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 pb-2 mb-3 border-b border-gray-100 flex justify-between">
                                        <span className="font-semibold text-gray-600">// YOLOv8_Inference_Log.json</span>
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">HTTP 200 OK</span>
                                    </div>
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-gray-800">
{`{
  "status": "MATCH",
  "detected_plate": "BL 1234 AB",
  "ocr_confidence": 0.9882,
  "vehicle_class": "motorcycle",
  "capacity_check": "UNDER_250CC",
  "decision": "SUBSIDY_ELIGIBLE",
  "actuator_signal": "RELAY_HIGH_UNLOCKED"
}`}
                                    </pre>
                                </div>
                            </motion.div>
                        )}

                        {activeTechTab === 'iot' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                <div>
                                    <span className="text-xs font-mono font-bold text-amber-700 uppercase bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                        HARDWARE ACTUATOR
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4 text-gray-950">
                                        IoT Smart Dispenser Relay Controller
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        Mikrokontroler ESP32 / Raspberry Pi terpasang pada modul pompa dispenser. Nozzle pengisian hanya akan mengalirkan bahan bakar jika sinyal otorisasi digital diterima dari server AI lokal.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Actuator Pin</div>
                                            <div className="text-lg font-black text-amber-600 mt-1">GPIO PIN 18</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Fail-Safe Cutoff</div>
                                            <div className="text-lg font-black text-emerald-600 mt-1">Auto-Lock &lt; 100ms</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 pb-2 mb-3 border-b border-gray-100 flex justify-between">
                                        <span className="font-semibold text-gray-600">// ESP32_Relay_Command.c</span>
                                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">HARDWARE READY</span>
                                    </div>
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-gray-800">
{`void executeNozzleCutoff() {
  if (validationResult == MISMATCH || vehicleCC > 250) {
    digitalWrite(RELAY_NOZZLE_PIN, LOW); // Cutoff pump
    triggerAlarmBuzzer(PATTERN_FRAUD);
    logBlockchainAnomaly(TRANSACTION_ID);
  }
}`}
                                    </pre>
                                </div>
                            </motion.div>
                        )}

                        {activeTechTab === 'blockchain' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                <div>
                                    <span className="text-xs font-mono font-bold text-purple-700 uppercase bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                        ENTERPRISE BLOCKCHAIN
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4 text-gray-950">
                                        Hyperledger Fabric v2.5 / EVM Audit
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        Setiap transaksi pengisian bahan bakar dienkripsi dan dicatat ke dalam blok buku besar terdistribusi dengan konsensus RAFT/BFT. Menghilangkan resiko data transaksi dimanipulasi oleh oknum internal.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Hashing Standard</div>
                                            <div className="text-lg font-black text-purple-700 mt-1">SHA-256 Merkle</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Smart Contract</div>
                                            <div className="text-lg font-black text-emerald-600 mt-1">PetrochainAudit.sol</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 pb-2 mb-3 border-b border-gray-100 flex justify-between">
                                        <span className="font-semibold text-gray-600">// SmartContract_Ledger.sol</span>
                                        <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">VERIFIED CONTRACT</span>
                                    </div>
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-gray-800">
{`function recordTransaction(
    string memory txId,
    string memory plate,
    uint256 volumeLiters,
    bytes32 dataHash
) public onlySPBUNode {
    auditLedger[txId] = AuditRecord(plate, volumeLiters, dataHash, block.timestamp);
    emit TransactionAudited(txId, block.number);
}`}
                                    </pre>
                                </div>
                            </motion.div>
                        )}

                        {activeTechTab === 'fraud' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                <div>
                                    <span className="text-xs font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                        SECURITY & ANTI-FRAUD
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4 text-gray-950">
                                        Zero-Fraud Multi-Tier Guard
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        Mencegah modus umum kecurangan subsidi BBM: (1) Tangkapan layar QR orang lain, (2) Pengisian berulang di SPBU berbeda dalam 1 hari, dan (3) Pemalsuan pelat nomor modifikasi.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Anti-Replay OTP</div>
                                            <div className="text-lg font-black text-emerald-600 mt-1">60s Dynamic Token</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
                                            <div className="text-gray-500 font-sans">Geofence Radius</div>
                                            <div className="text-lg font-black text-blue-700 mt-1">SPBU 50m Bound</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 pb-2 mb-3 border-b border-gray-100 flex justify-between">
                                        <span className="font-semibold text-gray-600">// Fraud_Prevention_Matrix.json</span>
                                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">PROTECTED</span>
                                    </div>
                                    <pre className="overflow-x-auto text-[11px] leading-relaxed text-gray-800">
{`{
  "anpr_physical_match": true,
  "qr_token_validity": "CURRENT_SESSION",
  "daily_quota_remaining_liters": 15.0,
  "cross_spbu_replay_detected": false,
  "verdict": "APPROVED_TRANSACTION"
}`}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* LIVE SPBU FUEL STOCK LOCATOR MINI-PREVIEW (FULL-WIDTH)                    */}
            {/* ========================================================================= */}
            <section className="py-16 bg-gradient-to-r from-[#800b0e] via-[#980f12] to-[#b91c1c] text-white relative overflow-hidden px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-yellow-300">Transparansi Stok Publik</span>
                            <h3 className="text-2xl sm:text-4xl font-black mt-1 mb-2">Pantau Ketersediaan BBM Subsidi Real-Time</h3>
                            <p className="text-red-100 text-sm max-w-xl">
                                Akses status tangki Pertalite dan Solar di seluruh SPBU untuk menghindari antrean panjang dan kepalsuan stok habis.
                            </p>
                        </div>

                        <Link
                            href={route('public.stock')}
                            className="bg-white text-[#980f12] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0 self-start lg:self-auto"
                        >
                            <FiSearch size={18} /> Buka Peta & Stok SPBU Lengkap
                        </Link>
                    </div>

                    {/* Mini Sample Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
                        <div className="bg-black/25 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>SPBU 14.201.001 Banda Aceh</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="mt-3 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Pertalite:</span>
                                    <strong className="text-emerald-300">14.250 L (Aman)</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Biosolar:</span>
                                    <strong className="text-yellow-300">3.800 L (Menipis)</strong>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/25 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>SPBU 14.243.012 Lhokseumawe</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="mt-3 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Pertalite:</span>
                                    <strong className="text-emerald-300">18.100 L (Aman)</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Biosolar:</span>
                                    <strong className="text-emerald-300">11.400 L (Aman)</strong>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/25 backdrop-blur-xs p-5 rounded-2xl border border-white/10">
                            <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>SPBU 31.129.02 Jakarta</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>
                            <div className="mt-3 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Pertalite:</span>
                                    <strong className="text-emerald-300">22.500 L (Aman)</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Biosolar:</span>
                                    <strong className="text-emerald-300">16.900 L (Aman)</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer Demo Prototipe KMIPN */}
                    <div className="mt-6 flex items-center justify-between flex-wrap gap-3 text-xs text-red-100 bg-black/30 backdrop-blur-md px-4 sm:px-5 py-3 rounded-2xl border border-white/15">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
                            <span><strong>Data Simulasi Prototipe:</strong> Volume stok tangki terhubung dengan sensor IoT Edge simulator real-time untuk demonstrasi kompetisi KMIPN 2026.</span>
                        </div>
                        <span className="font-mono text-[10px] text-yellow-300 font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-md border border-white/10">
                            STATUS: LIVE DEMO FEED
                        </span>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* FAQ ACCORDION SECTION (FULL-WIDTH 2-COLUMN LAYOUT)                        */}
            {/* ========================================================================= */}
            <section id="faq" className="py-20 bg-white scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                        
                        {/* FAQ Left Header */}
                        <div className="lg:col-span-4 space-y-4">
                            <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100 inline-block">
                                Frequently Asked Questions
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Pelajari bagaimana ekosistem PETROCHAIN bekerja untuk menjamin distribusi BBM bersubsidi yang adil, tepat sasaran, dan anti-kecurangan.
                            </p>

                            <div className="pt-4">
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                                    <div className="text-xs font-bold text-gray-900">Butuh Bantuan Lebih Lanjut?</div>
                                    <p className="text-xs text-gray-500">Hubungi call center 135 atau ajukan pertanyaan ke tim auditor kami.</p>
                                    <Link href={route('public.stock')} className="text-xs font-bold text-[#980f12] hover:underline inline-flex items-center gap-1 pt-1">
                                        Cek Informasi SPBU <FiArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Right Accordion List */}
                        <div className="lg:col-span-8 space-y-3.5">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs hover:border-gray-300"
                                >
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                        className="w-full px-6 py-4.5 text-left font-bold text-gray-900 bg-gray-50/70 hover:bg-gray-100/80 flex justify-between items-center transition-colors cursor-pointer"
                                    >
                                        <span className="text-sm sm:text-base">{faq.q}</span>
                                        <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-4 ${activeFaq === idx ? 'rotate-180 text-[#980f12]' : ''}`} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {activeFaq === idx && (
                                            <motion.div
                                                key={`faq-content-${idx}`}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 py-4.5 text-sm text-gray-600 bg-white leading-relaxed border-t border-gray-100">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* FOOTER (FULL-WIDTH)                                                       */}
            {/* ========================================================================= */}
            <footer className="bg-[#111827] text-gray-400 pt-16 pb-12 border-t border-gray-800 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
                        {/* Brand Column */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#980f12] p-2 flex items-center justify-center">
                                    <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-extrabold text-white tracking-wide">PETROCHAIN</span>
                            </div>
                            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                                Platform Intelligent Verification dan Audit Trail untuk Penguatan Distribusi BBM Bersubsidi, dirancang sebagai layer inovasi terintegrasi untuk ekosistem MyPertamina.
                            </p>
                            <div className="text-xs text-gray-500 font-mono">
                                KMIPN 2026 • Kategori Hackathon / Inovasi Perangkat Lunak
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div>
                            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Menu Utama</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><a href="#cara-kerja" onClick={(e) => scrollToSection(e, 'cara-kerja')} className="hover:text-white transition-colors cursor-pointer">Cara Kerja</a></li>
                                <li><a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')} className="hover:text-white transition-colors cursor-pointer">Simulasi Cek CC</a></li>
                                <li><a href="#alur" onClick={(e) => scrollToSection(e, 'alur')} className="hover:text-white transition-colors cursor-pointer">Rantai Pasok Nasional</a></li>
                                <li><a href="#teknologi" onClick={(e) => scrollToSection(e, 'teknologi')} className="hover:text-white transition-colors cursor-pointer">Arsitektur AI & Chain</a></li>
                                <li><Link href={route('public.stock')} className="hover:text-white transition-colors">Cek Stok SPBU</Link></li>
                                <li><Link href={route('login')} className="hover:text-white transition-colors">Masuk Portal</Link></li>
                            </ul>
                        </div>

                        {/* Institution Info */}
                        <div>
                            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Pengembang</h5>
                            <p className="text-sm text-gray-300 font-bold">TIMBERAPA</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Jurusan Teknologi Informasi dan Komputer<br/>
                                <strong>Politeknik Negeri Lhokseumawe</strong><br/>
                                Aceh, Indonesia
                            </p>
                        </div>
                    </div>


                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                        <p>© 2026 PETROCHAIN - TIMBERAPA Politeknik Negeri Lhokseumawe. All rights reserved.</p>
                        <p>Sistem Pendukung Ekosistem MyPertamina & BPH Migas.</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}



