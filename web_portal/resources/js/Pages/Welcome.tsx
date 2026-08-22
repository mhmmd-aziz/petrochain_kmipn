import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveGlobe from '@/Components/InteractiveGlobe';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';
import { 
    FiArrowRight, FiArrowUpRight, FiShield, FiActivity, FiCheckCircle, 
    FiSearch, FiMenu, FiX, FiCpu, FiLock, FiLayers, 
    FiChevronDown, FiDatabase, FiTruck, FiZap, FiExternalLink,
    FiCode, FiServer, FiCheck, FiRadio, FiMapPin, FiRefreshCw,
    FiSliders, FiAlertCircle, FiInfo, FiFileText, FiAward,
    FiTrendingUp, FiUsers, FiDollarSign, FiUserCheck
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
    const [publicToolMode, setPublicToolMode] = useState<'plate_checker' | 'cc_simulator'>('plate_checker');

    // Public Quick Plate Search State
    const [plateQuery, setPlateQuery] = useState('BL 1234 AB');
    const [isSearchingPlate, setIsSearchingPlate] = useState(false);
    const [searchedPlateData, setSearchedPlateData] = useState<{
        plate: string;
        type: string;
        model: string;
        cc: number;
        status: 'verified' | 'pending' | 'rejected' | 'not_registered';
        quotaDaily: number;
        quotaRemaining: number;
        lastRefuel: string;
        spbuLocation: string;
        stnkExpiry: string;
    } | null>({
        plate: 'BL 1234 AB',
        type: 'Sepeda Motor',
        model: 'Honda Vario 125 CBS',
        cc: 125,
        status: 'verified',
        quotaDaily: 8.0,
        quotaRemaining: 6.2,
        lastRefuel: 'Hari ini, 09:14 WIB',
        spbuLocation: 'SPBU 14.201.001 Banda Aceh',
        stnkExpiry: '10/2028',
    });

    const handleCheckPlate = (plateInput?: string) => {
        const query = (plateInput || plateQuery).trim().toUpperCase();
        if (!query) return;
        setPlateQuery(query);
        setIsSearchingPlate(true);
        setTimeout(() => {
            setIsSearchingPlate(false);
            if (query === 'BL 1234 AB') {
                setSearchedPlateData({
                    plate: 'BL 1234 AB',
                    type: 'Sepeda Motor',
                    model: 'Honda Vario 125 CBS',
                    cc: 125,
                    status: 'verified',
                    quotaDaily: 8.0,
                    quotaRemaining: 6.2,
                    lastRefuel: 'Hari ini, 09:14 WIB',
                    spbuLocation: 'SPBU 14.201.001 Banda Aceh',
                    stnkExpiry: '10/2028',
                });
            } else if (query === 'B 9988 XYZ') {
                setSearchedPlateData({
                    plate: 'B 9988 XYZ',
                    type: 'Mobil Penumpang',
                    model: 'Toyota Avanza 1.3 G',
                    cc: 1298,
                    status: 'verified',
                    quotaDaily: 30.0,
                    quotaRemaining: 22.5,
                    lastRefuel: 'Kemarin, 16:40 WIB',
                    spbuLocation: 'SPBU 31.129.02 Jakarta',
                    stnkExpiry: '06/2027',
                });
            } else if (query === 'BK 4567 CD') {
                setSearchedPlateData({
                    plate: 'BK 4567 CD',
                    type: 'Sepeda Motor',
                    model: 'Kawasaki Ninja ZX-25R',
                    cc: 250,
                    status: 'rejected',
                    quotaDaily: 0,
                    quotaRemaining: 0,
                    lastRefuel: 'Tidak Ada (Non-Subsidi)',
                    spbuLocation: 'SPBU 14.243.012 Medan',
                    stnkExpiry: '11/2026',
                });
            } else if (query === 'D 1088 EF') {
                setSearchedPlateData({
                    plate: 'D 1088 EF',
                    type: 'Sepeda Motor',
                    model: 'Yamaha NMAX 155 Connected',
                    cc: 155,
                    status: 'verified',
                    quotaDaily: 10.0,
                    quotaRemaining: 8.5,
                    lastRefuel: 'Hari ini, 11:05 WIB',
                    spbuLocation: 'SPBU 34.401.05 Bandung',
                    stnkExpiry: '04/2029',
                });
            } else {
                setSearchedPlateData({
                    plate: query,
                    type: 'Kendaraan Belum Terdaftar',
                    model: 'Data STNK Belum Ditemukan di Ledger',
                    cc: 0,
                    status: 'not_registered',
                    quotaDaily: 0,
                    quotaRemaining: 0,
                    lastRefuel: '-',
                    spbuLocation: '-',
                    stnkExpiry: '-',
                });
            }
        }, 350);
    };

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

            {/* Transparent Floating Glassmorphism Navbar */}
            <nav className={`fixed w-full z-50 top-0 transition-all duration-500 ${
                isScrolled 
                    ? 'bg-[#800b0e]/95 backdrop-blur-md shadow-xl shadow-red-950/30 py-3.5 border-b border-red-800/40' 
                    : 'bg-transparent py-5 border-b border-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-white/20 p-1.5 flex items-center justify-center transform group-hover:scale-105 transition-all backdrop-blur-xs">
                                <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-white font-extrabold text-lg sm:text-xl tracking-wide leading-none drop-shadow-sm">
                                    PETROCHAIN
                                </span>
                                <p className="text-[9px] text-red-200 font-medium leading-tight mt-0.5 drop-shadow-xs">
                                    Intelligent Fuel Subsidy Ecosystem
                                </p>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links (Clean Minimalist, No Glass Capsule) */}
                        <div className="hidden xl:flex items-center gap-6">
                            <a 
                                href="#cara-kerja" 
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                Cara Kerja
                            </a>
                            <a 
                                href="#simulator" 
                                onClick={(e) => scrollToSection(e, 'simulator')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <FiSliders className="text-yellow-300" /> Cek Plat & CC
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                Rantai Pasok
                            </a>
                            <a 
                                href="#dampak" 
                                onClick={(e) => scrollToSection(e, 'dampak')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                Dampak APBN
                            </a>
                            <a 
                                href="#teknologi" 
                                onClick={(e) => scrollToSection(e, 'teknologi')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                Teknologi
                            </a>
                            <a 
                                href="#tim" 
                                onClick={(e) => scrollToSection(e, 'tim')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                Tim Inovator
                            </a>
                            <a 
                                href="#faq" 
                                onClick={(e) => scrollToSection(e, 'faq')}
                                className="text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                            >
                                FAQ
                            </a>
                            <Link href={route('public.stock')} className="text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center gap-1">
                                <FiSearch className="text-yellow-300" /> Stok SPBU
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
                        <div className="flex xl:hidden">
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
                            className="xl:hidden bg-[#800b0e] border-t border-red-900/60 px-4 pt-3 pb-6 space-y-3"
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
                                Cek Plat & CC Kendaraan
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Rantai Pasok Nasional
                            </a>
                            <a 
                                href="#dampak" 
                                onClick={(e) => scrollToSection(e, 'dampak')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Dampak APBN & Regulasi
                            </a>
                            <a 
                                href="#teknologi" 
                                onClick={(e) => scrollToSection(e, 'teknologi')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Arsitektur AI & Blockchain
                            </a>
                            <a 
                                href="#tim" 
                                onClick={(e) => scrollToSection(e, 'tim')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Tim Inovator (TIMBERAPA)
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
            {/* HERO SECTION: 100% FULL-WIDTH GRAND CINEMATIC PERTAMINA RED STAGE         */}
            {/* ========================================================================= */}
            <section className="relative w-full min-h-screen pt-36 sm:pt-44 lg:pt-48 pb-6 sm:pb-8 lg:pb-10 bg-gradient-to-br from-[#800b0e] via-[#980f12] to-[#5a0709] text-white flex flex-col justify-between overflow-hidden shadow-2xl">
                
                {/* Full-Bleed Background Central Engineer Image & Cinematic Lighting Blend */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
                    <motion.img 
                        initial={{ scale: 1.06, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.92 }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                        // src="/images/hero_engineer.jpg" 
                        alt="Petrochain Smart Fuel Engineer" 
                        className="w-full h-full object-cover object-[center_18%] sm:object-[center_22%] lg:object-[center_28%] filter contrast-[1.05]"
                    />
                    {/* Radial White Highlight Glow with Ambient Breathing Pulse */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.05, 1],
                            opacity: [0.85, 1, 0.85]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.24)_0%,rgba(152,15,18,0.75)_55%,rgba(90,9,11,0.96)_100%)]"
                    />
                    
                    {/* Deep rich dark vignettes on left & right so sides are pure empty red stage */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#5a0709] via-transparent to-black/30"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#70090c] via-transparent to-[#70090c] lg:from-[#70090c]/95 lg:via-transparent lg:to-[#70090c]/95"></div>
                </div>

                {/* Inner Content Container - Identical Alignment with Navbar max-w-7xl px-4 sm:px-6 lg:px-8 */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col justify-between flex-1 my-auto">
                    
                    {/* Middle Content: Left Content elevated higher up on desktop, lowered below engineer on mobile */}
                    <div className="my-auto py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Side: Animated Badge + Description + Interactive CTA Buttons */}
                        <motion.div 
                            initial={{ opacity: 0, x: -35 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.85, ease: "easeOut" }}
                            className="lg:col-span-6 xl:col-span-5 flex flex-col justify-start items-start space-y-4 max-w-md mt-60 sm:mt-72 md:mt-80 lg:mt-0 lg:-mt-16"
                        >
                            {/* Ecosystem Badge with Micro-Motion */}
                            <motion.div 
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/20 text-white/90 backdrop-blur-md text-xs font-mono shadow-md hover:border-yellow-400/50 transition-colors"
                            >
                                <FiCpu className="text-yellow-300 shrink-0" />
                                <span>AI VISION & BLOCKCHAIN</span>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.6 }}
                                className="text-white/95 text-sm sm:text-base leading-relaxed drop-shadow-md font-medium"
                            >
                                PETROCHAIN menyatukan sistem verifikasi visual ganda <strong>AI Computer Vision CCTV</strong> & buku besar <strong>Hyperledger Fabric</strong> untuk mengamankan subsidi BBM nasional tanpa celah fraud.
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-wrap items-center justify-start gap-3 pt-2"
                            >
                                {/* Primary White/Yellow Pill Button with Spring Hover */}
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-3 bg-white text-[#980f12] hover:bg-yellow-300 hover:text-gray-950 px-6 py-3.5 rounded-full font-black text-xs sm:text-sm shadow-2xl shadow-black/40 transition-all group cursor-pointer whitespace-nowrap"
                                    >
                                        <span>Daftar Subsidi</span>
                                        <div className="w-6 h-6 rounded-full bg-[#980f12] text-white group-hover:bg-gray-950 flex items-center justify-center text-xs transition-transform duration-300 group-hover:rotate-45 font-bold shrink-0">
                                            <FiArrowUpRight size={13} />
                                        </div>
                                    </Link>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                                    <a
                                        href="#simulator"
                                        onClick={(e) => scrollToSection(e, 'simulator')}
                                        className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-5 py-3.5 rounded-full font-bold text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer whitespace-nowrap hover:border-white/40"
                                    >
                                        <FiSliders className="text-yellow-300" /> Cek CC Kendaraan
                                    </a>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Right Area: Floating Futuristic Telemetry HUD Chips */}
                        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between items-end h-64 pointer-events-none pr-4">
                     
                        </div>
                    </div>

                    {/* Bottom Institution / Trust Logo Strip with Animated Entrance */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="w-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/15 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between sm:justify-around gap-4 text-white/80 font-mono text-[11px] sm:text-xs font-bold tracking-wider mt-auto"
                    >
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                            <span>KEMENTERIAN ESDM</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>BPH MIGAS</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            <span>PERTAMINA PATRA NIAGA</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                            <span>HYPERLEDGER FABRIC</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                            <span>POLITEKNIK NEGERI LHOKSEUMAWE</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-300 font-black">
                            <span>KMIPN 2026</span>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* ========================================================================= */}
            {/* MACRO METRIC CARDS & QUICK ACCESS STRIP                                  */}
            {/* ========================================================================= */}
            <section className="py-10 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="max-w-7xl mx-auto">
                    
                    {/* 3 Macro Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
                        
                        {/* Connected SPBU Nodes */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-4 bg-gray-50/90 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
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

                        {/* Cryptographic Fuel Volume Ledger */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="lg:col-span-4 bg-gray-50/90 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
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

                        {/* CC Simulator Teaser */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-4 bg-gray-50/90 rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
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

                    {/* Floating / Bouncing Scroll-Down Indicator */}
                    <div className="pt-8 flex justify-center">
                        <a
                            href="#cara-kerja"
                            onClick={(e) => scrollToSection(e, 'cara-kerja')}
                            className="group inline-flex flex-col items-center gap-2 text-gray-500 hover:text-[#980f12] transition-colors cursor-pointer"
                        >
                            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 group-hover:text-[#980f12] transition-colors">
                                Scroll untuk Eksplorasi
                            </span>
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-500 group-hover:border-red-300 group-hover:text-[#980f12] group-hover:shadow-md transition-all"
                            >
                                <FiChevronDown size={16} />
                            </motion.div>
                        </a>
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
            {/* INTERACTIVE PUBLIC TOOLS: PLATE CHECKER & CC ELIGIBILITY SIMULATOR        */}
            {/* ========================================================================= */}
            <section id="simulator" className="py-20 bg-white border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
                            Fitur Publik Terbuka & Interaktif
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-2">
                            Pusat Validasi & Kelayakan Kendaraan Subsidi
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Cek status verifikasi plat nomor Anda yang terdaftar atau uji simulasi batas CC kendaraan sesuai <strong>Perpres No. 191/2014</strong>.
                        </p>
                    </div>

                    {/* Dual Mode Switcher Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                        <button
                            onClick={() => setPublicToolMode('plate_checker')}
                            className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer border ${
                                publicToolMode === 'plate_checker'
                                    ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            <FiSearch size={16} /> 1. Cek Status Plat Nomor Anda (Live Registry)
                        </button>
                        <button
                            onClick={() => setPublicToolMode('cc_simulator')}
                            className={`px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer border ${
                                publicToolMode === 'cc_simulator'
                                    ? 'bg-[#980f12] text-white border-[#980f12] shadow-md shadow-red-950/20'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                        >
                            <FiSliders size={16} /> 2. Simulasi Kelayakan CC Kendaraan Baru
                        </button>
                    </div>

                    {/* Mode 1: Public Quick Plate Checker */}
                    {publicToolMode === 'plate_checker' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50/80 text-gray-900 rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs relative overflow-hidden"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                                {/* Left Input & Query Column */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                            Masukkan Nomor Plat Kendaraan Anda
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <input 
                                                    type="text" 
                                                    value={plateQuery}
                                                    onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPlate()}
                                                    placeholder="Contoh: BL 1234 AB / B 9988 XYZ"
                                                    className="w-full px-5 py-4 rounded-2xl font-mono text-base font-black text-gray-950 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12] uppercase tracking-wider shadow-xs"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleCheckPlate()}
                                                disabled={isSearchingPlate}
                                                className="bg-[#980f12] hover:bg-red-800 text-white font-bold px-7 py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                            >
                                                {isSearchingPlate ? (
                                                    <>
                                                        <FiRefreshCw className="animate-spin" size={16} /> Memeriksa...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSearch size={16} /> Cek Status
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Preset Plate Chips */}
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 block mb-2">
                                            Uji Coba Plat Terdaftar di Jaringan:
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { plate: 'BL 1234 AB', label: 'BL 1234 AB (Vario 125)' },
                                                { plate: 'B 9988 XYZ', label: 'B 9988 XYZ (Avanza 1.3)' },
                                                { plate: 'BK 4567 CD', label: 'BK 4567 CD (Ninja 250cc)' },
                                                { plate: 'D 1088 EF', label: 'D 1088 EF (NMAX 155)' },
                                            ].map((sample) => (
                                                <button
                                                    key={sample.plate}
                                                    onClick={() => handleCheckPlate(sample.plate)}
                                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                                                        plateQuery === sample.plate
                                                            ? 'bg-[#980f12] text-white border-[#980f12] shadow-xs'
                                                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}
                                                >
                                                    {sample.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Detailed Verification Specs Card */}
                                    {searchedPlateData && (
                                        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-3 font-mono text-xs shadow-2xs">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                <span className="text-gray-500 font-sans">Status STNK Samsat:</span>
                                                <strong className="text-gray-900 font-bold">{searchedPlateData.stnkExpiry !== '-' ? `Aktif s/d ${searchedPlateData.stnkExpiry}` : 'Belum Ada'}</strong>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                <span className="text-gray-500 font-sans">Merek / Model:</span>
                                                <strong className="text-gray-900">{searchedPlateData.model}</strong>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                <span className="text-gray-500 font-sans">Riwayat Pengisian:</span>
                                                <strong className="text-gray-700">{searchedPlateData.lastRefuel}</strong>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500 font-sans">SPBU Terdaftar:</span>
                                                <strong className="text-gray-900 truncate max-w-[200px]">{searchedPlateData.spbuLocation}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Result / Digital Pass Preview */}
                                <div className="lg:col-span-5">
                                    {searchedPlateData ? (
                                        <div className={`p-6 sm:p-8 rounded-3xl border-2 text-center transition-all ${
                                            searchedPlateData.status === 'verified'
                                                ? 'bg-emerald-50/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                                : searchedPlateData.status === 'rejected'
                                                ? 'bg-rose-50/90 border-rose-500 shadow-lg shadow-rose-500/10'
                                                : 'bg-amber-50/90 border-amber-500 shadow-lg shadow-amber-500/10'
                                        }`}>
                                            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 ${
                                                searchedPlateData.status === 'verified' ? 'bg-emerald-600 text-white shadow-md' :
                                                searchedPlateData.status === 'rejected' ? 'bg-rose-600 text-white shadow-md' :
                                                'bg-amber-600 text-white shadow-md'
                                            }`}>
                                                {searchedPlateData.status === 'verified' ? <FiCheckCircle /> : 
                                                 searchedPlateData.status === 'rejected' ? <FiAlertCircle /> : <FiInfo />}
                                            </div>

                                            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500">
                                                Hasil Penelusuran Registry
                                            </span>

                                            <h4 className={`text-xl sm:text-2xl font-black mt-1 mb-2 ${
                                                searchedPlateData.status === 'verified' ? 'text-emerald-950' :
                                                searchedPlateData.status === 'rejected' ? 'text-rose-950' : 'text-amber-950'
                                            }`}>
                                                {searchedPlateData.status === 'verified' ? 'TERVERIFIKASI AKTIF' :
                                                 searchedPlateData.status === 'rejected' ? 'TIDAK BERHAK (NON-SUBSIDI)' : 'BELUM TERDAFTAR'}
                                            </h4>

                                            <div className="font-mono text-xl font-black text-gray-900 bg-white py-1.5 px-4 rounded-xl border border-gray-200/80 shadow-2xs inline-block mb-3">
                                                {searchedPlateData.plate}
                                            </div>

                                            {searchedPlateData.status === 'verified' ? (
                                                <div className="space-y-4">
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                        Kendaraan <strong>{searchedPlateData.model}</strong> memenuhi syarat subsidi. Alokasi kuota harian aktif.
                                                    </p>
                                                    <div className="p-3.5 rounded-2xl bg-white text-left text-xs font-mono border border-emerald-200 space-y-1.5 shadow-2xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500 font-sans">Sisa Kuota Hari Ini:</span>
                                                            <strong className="text-emerald-700 font-bold">{searchedPlateData.quotaRemaining} L / {searchedPlateData.quotaDaily} L</strong>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div 
                                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                                                                style={{ width: `${(searchedPlateData.quotaRemaining / searchedPlateData.quotaDaily) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                                                            <span>Token Anti-Replay:</span>
                                                            <span className="text-emerald-600 font-bold">READY (60s OTP)</span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={route('login')}
                                                        className="w-full block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        Masuk & Tampilkan QR Pass Lengkap
                                                    </Link>
                                                </div>
                                            ) : searchedPlateData.status === 'rejected' ? (
                                                <div className="space-y-4">
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                        Kapasitas mesin ({searchedPlateData.cc}cc) melebihi ambang batas regulasi BBM bersubsidi.
                                                    </p>
                                                    <Link
                                                        href={route('public.stock')}
                                                        className="w-full block text-center bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors"
                                                    >
                                                        Cek Ketersediaan Pertamax di SPBU
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                        Plat ini belum terdaftar di basis data verifikasi PETROCHAIN. Segera daftarkan foto STNK Anda.
                                                    </p>
                                                    <Link
                                                        href={route('register')}
                                                        className="w-full block text-center bg-[#980f12] hover:bg-red-800 text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        Daftarkan Kendaraan Subsidi Sekarang
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Mode 2: Interactive CC Eligibility Simulator */}
                    {publicToolMode === 'cc_simulator' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50/80 text-gray-900 rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-200/80 shadow-xs relative overflow-hidden"
                        >
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

                                    {/* CC Slider / Input with Visual Zones */}
                                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                                3. Kapasitas Mesin (CC)
                                            </label>
                                            <span className={`font-mono text-xl font-black px-3 py-1 rounded-lg border transition-colors ${
                                                isEligible 
                                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                                    : 'text-rose-700 bg-rose-50 border-rose-200'
                                            }`}>
                                                <CountUp end={simCC} duration={0.4} preserveValue /> CC
                                            </span>
                                        </div>

                                        {/* Visual Two-Zone Bar */}
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-full rounded-full bg-gray-100 overflow-hidden flex relative border border-gray-200 shadow-inner">
                                                <div 
                                                    style={{ width: simVehicleType === 'motor' ? '44.44%' : '22.22%' }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 relative transition-all duration-300"
                                                    title={simVehicleType === 'motor' ? 'Zona Subsidi: 50cc - 250cc' : 'Zona Subsidi: 800cc - 1400cc'}
                                                >
                                                    <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
                                                </div>
                                                <div 
                                                    style={{ width: simVehicleType === 'motor' ? '55.56%' : '77.78%' }}
                                                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-300"
                                                    title={simVehicleType === 'motor' ? 'Zona Non-Subsidi: > 250cc' : 'Zona Non-Subsidi: > 1400cc'}
                                                ></div>
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
                                        </div>

                                        {/* Visual Zone Badges */}
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between transition-all ${
                                                isEligible
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${isEligible ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-gray-300'}`}></div>
                                                    <span>Zona Subsidi</span>
                                                </div>
                                                <span className="text-[10px]">{simVehicleType === 'motor' ? '≤ 250cc' : '≤ 1.400cc'}</span>
                                            </div>
                                            <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between transition-all ${
                                                !isEligible
                                                    ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold shadow-2xs'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200'
                                            }`}>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${!isEligible ? 'bg-rose-500 ring-2 ring-rose-300' : 'bg-gray-300'}`}></div>
                                                    <span>Non-Subsidi</span>
                                                </div>
                                                <span className="text-[10px]">{simVehicleType === 'motor' ? '> 250cc' : '> 1.400cc'}</span>
                                            </div>
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
                        </motion.div>
                    )}
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

                    {/* 4 Pillars Flow with Connecting Pipeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
                        {/* Desktop Pipeline Flow Line */}
                        <div className="hidden lg:block absolute top-[45%] left-12 right-12 h-0.5 border-t-2 border-dashed border-gray-300 z-0 pointer-events-none"></div>

                        {/* Pillar 1: Depot */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative z-10 group">
                            {/* Connector Arrow to Pillar 2 (Desktop) */}
                            <div className="hidden lg:flex absolute -right-3.5 top-[45%] -translate-y-1/2 z-20 w-7 h-7 bg-white border border-gray-200 rounded-full items-center justify-center text-amber-600 shadow-xs group-hover:scale-110 group-hover:border-amber-300 transition-all">
                                <FiArrowRight size={13} />
                            </div>
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-black mb-4 border border-amber-100 group-hover:scale-105 transition-transform">
                                    <FiDatabase />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">PILAR 1 • HULU</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Depot Kilang Pertamina</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Monitoring tangki induk dan penugasan armada mobil tangki bersensor IoT Flowmeter & GPS Geofencing.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span>Output Data:</span>
                                <strong className="text-amber-700 font-bold">Manifest Digital</strong>
                            </div>
                        </div>

                        {/* Pillar 2: SPBU Dispenser */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative z-10 group">
                            {/* Connector Arrow to Pillar 3 (Desktop) */}
                            <div className="hidden lg:flex absolute -right-3.5 top-[45%] -translate-y-1/2 z-20 w-7 h-7 bg-white border border-gray-200 rounded-full items-center justify-center text-[#980f12] shadow-xs group-hover:scale-110 group-hover:border-red-300 transition-all">
                                <FiArrowRight size={13} />
                            </div>
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-2xl font-black mb-4 border border-red-100 group-hover:scale-105 transition-transform">
                                    <FaGasPump />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#980f12] uppercase">PILAR 2 • DISPENSER</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Edge AI Dispenser SPBU</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Dual Camera CCTV membaca plat nomor fisik (OCR) dan klasifikasi kapasitas motor (YOLO) saat pengisian.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span>Kecepatan:</span>
                                <strong className="text-[#980f12] font-bold">Validasi &lt; 2s</strong>
                            </div>
                        </div>

                        {/* Pillar 3: Konsumen */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative z-10 group">
                            {/* Connector Arrow to Pillar 4 (Desktop) */}
                            <div className="hidden lg:flex absolute -right-3.5 top-[45%] -translate-y-1/2 z-20 w-7 h-7 bg-white border border-gray-200 rounded-full items-center justify-center text-blue-600 shadow-xs group-hover:scale-110 group-hover:border-blue-300 transition-all">
                                <FiArrowRight size={13} />
                            </div>
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-black mb-4 border border-blue-100 group-hover:scale-105 transition-transform">
                                    <FaQrcode />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">PILAR 3 • KONSUMEN</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">QR Pass MyPertamina</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Masyarakat menggunakan QR Pass terverifikasi STNK. Sistem menolak jika QR digunakan pada plat mobil lain.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span>Keamanan:</span>
                                <strong className="text-blue-700 font-bold">Anti-Replay Token</strong>
                            </div>
                        </div>

                        {/* Pillar 4: Auditor Blockchain */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative z-10 group">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-black mb-4 border border-purple-100 group-hover:scale-105 transition-transform">
                                    <FiLayers />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">PILAR 4 • AUDIT</span>
                                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2">Hyperledger Blockchain</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Data transaksi dicatat secara permanen tanpa perantara. BPH Migas & Kemenkeu mengaudit tanpa resiko manipulasi.
                                </p>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-gray-500 pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span>Integritas:</span>
                                <strong className="text-purple-700 font-bold">100% Immutable</strong>
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
            {/* NATIONAL MACRO IMPACT METRICS SECTION (FULL-WIDTH LIGHT)                  */}
            {/* ========================================================================= */}
            <section id="dampak" className="py-20 bg-gray-50/70 border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100 inline-flex items-center gap-1.5">
                            <FiTrendingUp /> Proyeksi Dampak Makro-Ekonomi & Regulasi
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
                            Kuantifikasi Dampak Transformasi Energi Nasional
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            Mengunci kebocoran anggaran APBN subsidi BBM, memangkas antrean SPBU, dan menghadirkan audit trail mutlak bagi BPH Migas & Kementerian Keuangan.
                        </p>
                    </div>

                    {/* 4 Impact Bento Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Impact Card 1: APBN Savings */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
                                        <FiDollarSign />
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        ANALISIS APBN 2026
                                    </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-gray-950 font-mono tracking-tight mb-2">
                                    Rp <CountUp end={18.4} decimals={1} duration={2.5} enableScrollSpy scrollSpyOnce /> T
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Potensi Penghematan Kebocoran / Thn</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Mencegah alokasi subsidi jatuh ke kendaraan non-hak (moge &gt;250cc, mobil mewah &gt;1.400cc) serta penimbunan tangki modifikasi di 7.280+ SPBU.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                                <FiCheckCircle size={13} /> Efisiensi Fiskal Berkelanjutan
                            </div>
                        </div>

                        {/* Impact Card 2: Zero Fraud */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center text-2xl font-bold border border-red-100 group-hover:scale-110 transition-transform">
                                        <FiShield />
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-[#980f12] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                        ANTI-REPLAY TOKEN
                                    </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-gray-950 font-mono tracking-tight mb-2">
                                    <CountUp end={100} duration={2} suffix="%" enableScrollSpy scrollSpyOnce /> Zero-Fraud
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Eliminasi Screenshot Barcode</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    QR Pass berkode token dinamis 60 detik yang diverifikasi silang dengan plat fisik ANPR, mengeliminasi penyalahgunaan foto QR orang lain.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 text-[11px] font-mono text-[#980f12] font-bold flex items-center gap-1">
                                <FiLock size={13} /> Kriptografi SHA-256 Auth
                            </div>
                        </div>

                        {/* Impact Card 3: Realtime Latency */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-bold border border-blue-100 group-hover:scale-110 transition-transform">
                                        <FiZap />
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                        EDGE INFERENCE
                                    </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-gray-950 font-mono tracking-tight mb-2">
                                    &lt; 2.0 Detik
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Verifikasi Cepat Tanpa Antrean</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Dual Camera CCTV memindai plat dan bodi kendaraan secara simultan (42ms inference) sebelum nozzle dispenser dibuka secara otomatis.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 text-[11px] font-mono text-blue-700 font-bold flex items-center gap-1">
                                <FiActivity size={13} /> Smooth SPBU Traffic Flow
                            </div>
                        </div>

                        {/* Impact Card 4: National Consensus Coverage */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-bold border border-purple-100 group-hover:scale-110 transition-transform">
                                        <FiLayers />
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                                        MULTI-INSTITUSI
                                    </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-black text-gray-950 font-mono tracking-tight mb-2">
                                    <CountUp end={38} duration={2} suffix=" Provinsi" enableScrollSpy scrollSpyOnce />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Audit Kriptografis Terpadu</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Mewujudkan Single Source of Truth energi nasional antara Pertamina Patra Niaga, BPH Migas, Samsat, dan Auditor Negara.
                                </p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-gray-100 text-[11px] font-mono text-purple-700 font-bold flex items-center gap-1">
                                <FiAward size={13} /> Hyperledger Fabric Raft BFT
                            </div>
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
                                <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs text-slate-200">
                                    <div className="text-slate-400 pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 ml-2">// YOLOv8_Inference_Log.json</span>
                                        </div>
                                        <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">HTTP 200 OK</span>
                                    </div>
                                    <div className="overflow-x-auto text-[11px] leading-relaxed font-mono">
                                        <div><span className="text-slate-500">&#123;</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"status"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"MATCH"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"detected_plate"</span><span className="text-slate-400">: </span><span className="text-amber-300 font-bold">"BL 1234 AB"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"ocr_confidence"</span><span className="text-slate-400">: </span><span className="text-purple-300">0.9882</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"vehicle_class"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"motorcycle"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"capacity_check"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"UNDER_250CC"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"decision"</span><span className="text-slate-400">: </span><span className="text-emerald-400 font-bold">"SUBSIDY_ELIGIBLE"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"actuator_signal"</span><span className="text-slate-400">: </span><span className="text-blue-300">"RELAY_HIGH_UNLOCKED"</span></div>
                                        <div><span className="text-slate-500">&#125;</span></div>
                                    </div>
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
                                <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs text-slate-200">
                                    <div className="text-slate-400 pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 ml-2">// ESP32_Relay_Command.cpp</span>
                                        </div>
                                        <span className="text-amber-400 font-bold bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded text-[10px]">HARDWARE READY</span>
                                    </div>
                                    <div className="overflow-x-auto text-[11px] leading-relaxed font-mono">
                                        <div><span className="text-purple-400 font-bold">void</span> <span className="text-sky-300 font-bold">executeNozzleCutoff</span><span className="text-slate-400">() &#123;</span></div>
                                        <div className="pl-4"><span className="text-purple-400 font-bold">if</span> <span className="text-slate-300">(validationResult == MISMATCH || vehicleCC &gt; </span><span className="text-amber-300">250</span><span className="text-slate-300">) &#123;</span></div>
                                        <div className="pl-8"><span className="text-sky-300">digitalWrite</span><span className="text-slate-300">(RELAY_NOZZLE_PIN, </span><span className="text-rose-400 font-bold">LOW</span><span className="text-slate-300">);</span> <span className="text-slate-500">// Cutoff pump</span></div>
                                        <div className="pl-8"><span className="text-sky-300">triggerAlarmBuzzer</span><span className="text-slate-300">(PATTERN_FRAUD);</span></div>
                                        <div className="pl-8"><span className="text-sky-300">logBlockchainAnomaly</span><span className="text-slate-300">(TRANSACTION_ID);</span></div>
                                        <div className="pl-4"><span className="text-slate-300">&#125;</span></div>
                                        <div><span className="text-slate-500">&#125;</span></div>
                                    </div>
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
                                <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs text-slate-200">
                                    <div className="text-slate-400 pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 ml-2">// SmartContract_Ledger.sol</span>
                                        </div>
                                        <span className="text-purple-400 font-bold bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 rounded text-[10px]">VERIFIED CONTRACT</span>
                                    </div>
                                    <div className="overflow-x-auto text-[11px] leading-relaxed font-mono">
                                        <div><span className="text-purple-400 font-bold">function</span> <span className="text-sky-300 font-bold">recordTransaction</span><span className="text-slate-400">(</span></div>
                                        <div className="pl-4"><span className="text-purple-400">string</span> <span className="text-blue-300">memory</span> <span className="text-slate-300">txId,</span></div>
                                        <div className="pl-4"><span className="text-purple-400">string</span> <span className="text-blue-300">memory</span> <span className="text-slate-300">plate,</span></div>
                                        <div className="pl-4"><span className="text-purple-400">uint256</span> <span className="text-slate-300">volumeLiters,</span></div>
                                        <div className="pl-4"><span className="text-purple-400">bytes32</span> <span className="text-slate-300">dataHash</span></div>
                                        <div><span className="text-slate-400">) </span><span className="text-purple-400 font-bold">public</span> <span className="text-amber-300 font-bold">onlySPBUNode</span> <span className="text-slate-500">&#123;</span></div>
                                        <div className="pl-4"><span className="text-slate-300">auditLedger[txId] = </span><span className="text-sky-300">AuditRecord</span><span className="text-slate-300">(plate, volumeLiters, dataHash, block.timestamp);</span></div>
                                        <div className="pl-4"><span className="text-purple-400 font-bold">emit</span> <span className="text-emerald-300 font-semibold">TransactionAudited</span><span className="text-slate-300">(txId, block.number);</span></div>
                                        <div><span className="text-slate-500">&#125;</span></div>
                                    </div>
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
                                <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-800 shadow-xl font-mono text-xs text-slate-200">
                                    <div className="text-slate-400 pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                                            </div>
                                            <span className="text-[11px] text-slate-400 ml-2">// Fraud_Prevention_Matrix.json</span>
                                        </div>
                                        <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">PROTECTED</span>
                                    </div>
                                    <div className="overflow-x-auto text-[11px] leading-relaxed font-mono">
                                        <div><span className="text-slate-500">&#123;</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"anpr_physical_match"</span><span className="text-slate-400">: </span><span className="text-emerald-400 font-bold">true</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"qr_token_validity"</span><span className="text-slate-400">: </span><span className="text-emerald-300">"CURRENT_SESSION"</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"daily_quota_remaining_liters"</span><span className="text-slate-400">: </span><span className="text-amber-300 font-bold">15.0</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"cross_spbu_replay_detected"</span><span className="text-slate-400">: </span><span className="text-emerald-400 font-bold">false</span><span className="text-slate-500">,</span></div>
                                        <div className="pl-4"><span className="text-sky-400">"verdict"</span><span className="text-slate-400">: </span><span className="text-emerald-400 font-bold">"APPROVED_TRANSACTION"</span></div>
                                        <div><span className="text-slate-500">&#125;</span></div>
                                    </div>
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
            {/* INNOVATION TEAM & FACULTY ADVISOR SECTION (KMIPN 2026)                    */}
            {/* ========================================================================= */}
            <section id="tim" className="py-20 bg-white border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-black uppercase tracking-widest text-[#980f12] bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100 inline-flex items-center gap-1.5">
                            <FiUsers /> TIM PENGEMBANG INOVASI • KMIPN 2026
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">
                            Inovator di Balik Ekosistem PETROCHAIN
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            Karya kolaborasi mahasiswa dan dosen pembimbing Jurusan Teknologi Informasi dan Komputer, <strong>Politeknik Negeri Lhokseumawe</strong> dalam Kompetisi Mahasiswa Informatika Politeknik Nasional.
                        </p>
                    </div>

                    {/* Faculty Advisor Featured Card */}
                    <div className="bg-gradient-to-r from-gray-950 via-[#700b0e] to-[#980f12] rounded-3xl p-6 sm:p-8 lg:p-10 text-white border border-red-900/30 shadow-xl mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                            <div className="lg:col-span-3 flex justify-center">
                                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/20">
                                    <img 
                                        src="/images/team_advisor.jpg" 
                                        alt="Dosen Pembimbing PNL" 
                                        className="w-full h-full object-cover object-top"
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs py-1 px-2 rounded-lg text-center text-[10px] font-mono font-bold text-amber-300 border border-white/10">
                                        DOSEN PEMBIMBING
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-9 space-y-3 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-amber-300 font-bold">
                                    <FiAward /> Faculty Advisor & System Architecture Mentor
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white">
                                    M. Aziz, S.Kom., M.Kom.
                                </h3>
                                <p className="text-red-100/90 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                                    Dosen Jurusan Teknologi Informasi dan Komputer, <strong>Politeknik Negeri Lhokseumawe</strong>. Mengarahkan riset arsitektur Artificial Intelligence Computer Vision, Distributed Ledger Technology (DLT), dan keselarasan regulasi Perpres Subsidi Energi.
                                </p>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-[11px] font-mono text-red-200">
                                    <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">AI & Computer Vision Research</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">Blockchain Consensus</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">Politeknik Negeri Lhokseumawe</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4 Student Innovators Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Member 1 */}
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-gray-200 bg-white">
                                    <img 
                                        src="/images/team_member_1.jpg" 
                                        alt="Muhammad Zaky" 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-[#980f12] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                                        KETUA TIM
                                    </div>
                                </div>
                                <h4 className="text-base font-black text-gray-900 mb-1">Muhammad Zaky</h4>
                                <div className="text-xs font-bold text-[#980f12] mb-2 flex items-center gap-1">
                                    <FiCpu /> Lead AI & Vision Engineer
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Pengembangan model YOLOv8 Dual-Camera ANPR, pipeline PaddleOCR ekstraksi STNK, dan inferensi Edge SPBU.
                                </p>
                            </div>
                            <div className="pt-3 mt-4 border-t border-gray-200/60 text-[10px] font-mono font-bold text-gray-500 flex justify-between">
                                <span>TIK PNL</span>
                                <span className="text-emerald-700">YOLOv8 & OCR</span>
                            </div>
                        </div>

                        {/* Member 2 */}
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-gray-200 bg-white">
                                    <img 
                                        src="/images/team_member_2.jpg" 
                                        alt="Farhan Al-Fayed" 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-purple-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                                        BLOCKCHAIN
                                    </div>
                                </div>
                                <h4 className="text-base font-black text-gray-900 mb-1">Farhan Al-Fayed</h4>
                                <div className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
                                    <FiLayers /> Blockchain Core Specialist
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Implementasi arsitektur Hyperledger Fabric, Smart Contract Chaincode transaksi kuota, dan audit multi-instansi.
                                </p>
                            </div>
                            <div className="pt-3 mt-4 border-t border-gray-200/60 text-[10px] font-mono font-bold text-gray-500 flex justify-between">
                                <span>TIK PNL</span>
                                <span className="text-purple-700">Fabric & Raft</span>
                            </div>
                        </div>

                        {/* Member 3 */}
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-gray-200 bg-white">
                                    <img 
                                        src="/images/team_member_3.jpg" 
                                        alt="Cut Annisa Rahma" 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-blue-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                                        HARDWARE IOT
                                    </div>
                                </div>
                                <h4 className="text-base font-black text-gray-900 mb-1">Cut Annisa Rahma</h4>
                                <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                                    <FiZap /> IoT Hardware & Firmware
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Integrasi modul Raspberry Pi, solenoid relay dispenser actuator cut-off, dan telemetri flowmeter sensor BBM.
                                </p>
                            </div>
                            <div className="pt-3 mt-4 border-t border-gray-200/60 text-[10px] font-mono font-bold text-gray-500 flex justify-between">
                                <span>TIK PNL</span>
                                <span className="text-blue-700">IoT & Firmware</span>
                            </div>
                        </div>

                        {/* Member 4 */}
                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 border border-gray-200 bg-white">
                                    <img 
                                        src="/images/team_member_4.jpg" 
                                        alt="Rizki Maulana" 
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                                        FRONTEND / UX
                                    </div>
                                </div>
                                <h4 className="text-base font-black text-gray-900 mb-1">Rizki Maulana</h4>
                                <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1">
                                    <FiCode /> Full-Stack & UI/UX Lead
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Perancangan antarmuka portal publik, WebGL 3D Globe interaktif, dan integrasi Inertia.js React 19.
                                </p>
                            </div>
                            <div className="pt-3 mt-4 border-t border-gray-200/60 text-[10px] font-mono font-bold text-gray-500 flex justify-between">
                                <span>TIK PNL</span>
                                <span className="text-emerald-700">React & 3D WebGL</span>
                            </div>
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
                                <li><a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')} className="hover:text-white transition-colors cursor-pointer">Cek Plat & CC</a></li>
                                <li><a href="#alur" onClick={(e) => scrollToSection(e, 'alur')} className="hover:text-white transition-colors cursor-pointer">Rantai Pasok Nasional</a></li>
                                <li><a href="#dampak" onClick={(e) => scrollToSection(e, 'dampak')} className="hover:text-white transition-colors cursor-pointer">Dampak APBN</a></li>
                                <li><a href="#teknologi" onClick={(e) => scrollToSection(e, 'teknologi')} className="hover:text-white transition-colors cursor-pointer">Arsitektur Teknologi</a></li>
                                <li><a href="#tim" onClick={(e) => scrollToSection(e, 'tim')} className="hover:text-white transition-colors cursor-pointer">Tim Inovator PNL</a></li>
                                <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
                                <li><Link href={route('public.stock')} className="hover:text-white transition-colors">Cek Stok SPBU</Link></li>
                                <li><Link href={route('login')} className="hover:text-white transition-colors">Masuk Portal</Link></li>
                            </ul>
                        </div>

                        {/* Institution Info */}
                        <div>
                            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Pengembang Inovasi</h5>
                            <p className="text-sm text-gray-300 font-bold">TIMBERAPA</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Jurusan Teknologi Informasi dan Komputer<br/>
                                <strong>Politeknik Negeri Lhokseumawe</strong><br/>
                                Aceh, Indonesia
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-1">
                                <div>Dosen Pembimbing:</div>
                                <div className="text-white font-bold">M. Aziz, S.Kom., M.Kom.</div>
                            </div>
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



