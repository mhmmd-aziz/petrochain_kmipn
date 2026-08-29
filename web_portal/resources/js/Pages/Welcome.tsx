import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import InteractiveGlobe from '@/Components/InteractiveGlobe';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';
import { 
    FiArrowRight, FiArrowUp, FiShield, FiActivity, FiCheckCircle, 
    FiSearch, FiMenu, FiX, FiCpu, FiLock, FiLayers, 
    FiChevronDown, FiDatabase, FiTruck, FiZap, FiExternalLink,
    FiCode, FiServer, FiCheck, FiRadio, FiMapPin, FiRefreshCw,
    FiSliders, FiAlertCircle, FiInfo, FiFileText, FiAlertTriangle, FiUsers, FiAward
} from 'react-icons/fi';
import { FaMotorcycle, FaQrcode, FaGasPump, FaAndroid } from 'react-icons/fa';

export default function Welcome({ auth }: { auth: any }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const [spbus, setSpbus] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/public/spbus')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setSpbus(data.data.slice(0, 3));
                }
            })
            .catch(err => console.error('Error fetching SPBU stock:', err));
    }, []);


    // Download App Alert Handler (prevents automatic repeated file downloads)
    const handleDownloadApp = (e: React.MouseEvent) => {
        e.preventDefault();
        Swal.fire({
            title: 'Unduh Aplikasi Mobile PETROCHAIN',
            html: `
                <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    <p style="margin-bottom: 8px;">Aplikasi <strong>PETROCHAIN Mobile (Android)</strong> menyediakan modul lengkap bagi pemilik kendaraan:</p>
                    <ul style="list-style-type: disc; margin-left: 20px; margin-bottom: 12px;">
                        <li>Pendaftaran STNK &amp; verifikasi kelayakan subsidi mandiri</li>
                        <li>Dynamic QR Code Token (Anti-Replay OTP 60 detik)</li>
                        <li>Cek sisa kuota subsidi harian &amp; riwayat transaksi SPBU</li>
                        <li>Pantau ketersediaan stok SPBU secara real-time</li>
                    </ul>
                    <p style="font-size: 12px; color: #9ca3af;">File: <strong>app-release.apk</strong> • Ukuran: ~28 MB</p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Mulai Unduh APK',
            cancelButtonText: 'Tutup',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                const link = document.createElement('a');
                link.href = '/app-release.apk';
                link.download = 'app-release.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    };
    
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
            if (window.scrollY > 15) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
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
        <div className="min-h-screen bg-gray-50 selection:bg-[#980f12] selection:text-white font-sans text-gray-900">
            <Head title="PETROCHAIN - Platform Intelligent Verification & Audit Distribusi BBM Bersubsidi" />

            {/* Dynamic Navbar: Frosted Glass at Top -> Crisp White when Scrolled */}
            <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-white/95 backdrop-blur-md shadow-md py-3.5 border-b border-gray-200' 
                    : 'bg-black/20 backdrop-blur-md py-4 border-b border-white/15'
            }`}>
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12">
                    <div className="flex justify-between items-center gap-2 xl:gap-4">
                        {/* Logos: Tut Wuri -> Kemendikti Saintek -> Poltek -> KMIPN -> Petrochain */}
                        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
                            <div className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg border transition-all shrink-0 ${
                                isScrolled 
                                    ? 'bg-gray-100/90 border-gray-200 hover:bg-gray-200/70' 
                                    : 'bg-white/10 border-white/20 hover:bg-white/15 backdrop-blur-xs'
                            }`}>
                                {/* 1. Tut Wuri Handayani */}
                                <img 
                                    src="/images/logos/tut_wuri.png?v=2" 
                                    alt="Tut Wuri Handayani" 
                                    className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" 
                                    title="Tut Wuri Handayani"
                                />
                                {/* 2. Kemendikti Saintek */}
                                <img 
                                    src="/images/logos/kemendikti.png" 
                                    alt="Kemendikti Saintek" 
                                    className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" 
                                    title="Kementerian Pendidikan Tinggi, Sains, dan Teknologi"
                                />
                                {/* 3. Poltek (Politeknik Negeri Lhokseumawe) */}
                                <img 
                                    src="/images/logos/pnl.png" 
                                    alt="Politeknik Negeri Lhokseumawe" 
                                    className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" 
                                    title="Politeknik Negeri Lhokseumawe"
                                />
                                {/* 4. KMIPN */}
                                <img 
                                    src="/images/logos/kmipn.png" 
                                    alt="KMIPN 2026" 
                                    className="h-6 sm:h-7 2xl:h-8 w-auto object-contain drop-shadow-xs" 
                                    title="KMIPN 2026"
                                />
                            </div>

                            {/* Separator */}
                            <div className={`h-6 w-[1px] hidden md:block shrink-0 ${
                                isScrolled ? 'bg-gray-200' : 'bg-white/25'
                            }`}></div>

                            {/* 5. Petrochain */}
                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 2xl:w-9 2xl:h-9 rounded-lg p-1 flex items-center justify-center transform group-hover:scale-105 transition-all shadow-xs shrink-0 ${
                                    isScrolled ? 'bg-[#980f12] text-white' : 'bg-white/15 ring-1 ring-white/30'
                                }`}>
                                    <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col justify-center shrink-0">
                                    <span className={`font-extrabold text-sm sm:text-base 2xl:text-lg tracking-wide leading-none transition-colors whitespace-nowrap ${
                                        isScrolled ? 'text-gray-950' : 'text-white drop-shadow-xs'
                                    }`}>
                                        PETROCHAIN
                                    </span>
                                    <p className={`text-[8.5px] 2xl:text-[9px] font-medium leading-tight mt-0.5 hidden lg:block transition-colors whitespace-nowrap ${
                                        isScrolled ? 'text-gray-500' : 'text-white/80'
                                    }`}>
                                        Intelligent Fuel Subsidy Ecosystem
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden xl:flex items-center gap-2.5 lg:gap-3 xl:gap-3.5 2xl:gap-5 shrink-0">
                            <a 
                                href="#cara-kerja" 
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className={`text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
                            >
                                Cara Kerja
                            </a>
                            <a 
                                href="#aturan" 
                                onClick={(e) => scrollToSection(e, 'aturan')}
                                className={`text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
                            >
                                <FiSliders className={isScrolled ? 'text-[#980f12]' : 'text-yellow-300'} /> Aturan &amp; Limit Kuota
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className={`text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
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
                                className={`text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
                            >
                                Arsitektur AI &amp; Blockchain
                            </a>
                            <a 
                                href="#faq" 
                                onClick={(e) => scrollToSection(e, 'faq')}
                                className={`text-xs 2xl:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
                            >
                                FAQ
                            </a>
                            <Link 
                                href={route('public.stock')} 
                                className={`text-xs 2xl:text-sm font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                                    isScrolled 
                                        ? 'text-gray-700 hover:text-[#980f12]' 
                                        : 'text-white/90 hover:text-white drop-shadow-xs'
                                }`}
                            >
                                <FiSearch className={isScrolled ? 'text-[#980f12]' : 'text-yellow-300'} /> Cek Stok SPBU
                            </Link>
                        </div>

                        <div className={`h-6 w-[1px] hidden xl:block shrink-0 ${
                            isScrolled ? 'bg-gray-200' : 'bg-white/25'
                        }`}></div>

                        {/* Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-2 2xl:gap-3 shrink-0">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={`px-4 2xl:px-5 py-2 2xl:py-2.5 rounded-lg text-xs 2xl:text-sm font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap ${
                                        isScrolled 
                                            ? 'bg-[#980f12] text-white hover:bg-red-800' 
                                            : 'bg-white text-[#980f12] hover:bg-gray-100'
                                    }`}
                                >
                                    <FiActivity /> Masuk Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link 
                                        href={route('login')} 
                                        className={`text-xs 2xl:text-sm font-semibold px-2.5 py-2 transition-colors whitespace-nowrap ${
                                            isScrolled 
                                                ? 'text-gray-700 hover:text-[#980f12]' 
                                                : 'text-white/90 hover:text-white'
                                        }`}
                                    >
                                        Log In
                                    </Link>
                                    <button
                                        onClick={handleDownloadApp}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 2xl:px-5 py-2 2xl:py-2.5 rounded-lg text-xs 2xl:text-sm font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                    >
                                        <FaAndroid size={15} /> Download App
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <div className="flex xl:hidden shrink-0">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`p-2 rounded-lg transition-colors focus:outline-none ${
                                    isScrolled 
                                        ? 'text-gray-800 bg-gray-100 hover:bg-gray-200' 
                                        : 'text-white bg-white/10 hover:bg-white/20'
                                }`}
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
                            className={`xl:hidden px-4 pt-3 pb-6 space-y-3 shadow-xl ${
                                isScrolled 
                                    ? 'bg-white/98 backdrop-blur-xl border-t border-gray-200 text-gray-800' 
                                    : 'bg-black/85 backdrop-blur-2xl border-t border-white/15 text-white'
                            }`}
                        >
                            <a 
                                href="#cara-kerja" 
                                onClick={(e) => scrollToSection(e, 'cara-kerja')}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                Cara Kerja
                            </a>
                            <a 
                                href="#aturan" 
                                onClick={(e) => scrollToSection(e, 'aturan')}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                Aturan & Limit Kuota
                            </a>
                            <a 
                                href="#alur" 
                                onClick={(e) => scrollToSection(e, 'alur')}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
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
                                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
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
                                className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                FAQ
                            </a>
                            <Link 
                                href={route('public.stock')} 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                                    isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'
                                }`}
                            >
                                Cek Stok SPBU
                            </Link>
                            <div className={`pt-3 border-t flex flex-col gap-2 ${
                                isScrolled ? 'border-gray-200' : 'border-white/15'
                            }`}>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full text-center bg-[#980f12] text-white py-2.5 rounded-full text-sm font-bold shadow-md"
                                    >
                                        Masuk Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link 
                                            href={route('login')} 
                                            className={`w-full text-center py-2.5 rounded-full text-sm font-semibold ${
                                                isScrolled 
                                                    ? 'text-gray-800 bg-gray-100 hover:bg-gray-200' 
                                                    : 'text-white bg-white/10'
                                            }`}
                                        >
                                            Log In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ========================================================================= */}
            {/* HERO SECTION: IMAGE BACKGROUND FROM Gambar/Background                     */}
            {/* ========================================================================= */}
            <section 
                className="min-h-screen lg:h-screen lg:max-h-screen pt-20 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-10 xl:px-14 flex flex-col justify-center border-b border-gray-200 relative overflow-hidden bg-white"
            >
                {/* Background Image from folder Gambar/Background (2112.w015.n001.664B.p15.664.jpg) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/background/bg_spbu_city.jpg')" }}
                />

                {/* Brand Overlay for text contrast & seamless blend with header */}
                {/* <div className="absolute inset-0 bg-gradient-to-r from-[#980f12] via-[#980f12]/85 to-[#980f12]/40" /> */}
                <div className="absolute inset-0 bg-black/25" />

                <div className="w-full my-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-10 items-center">
                        
                        {/* LEFT COLUMN: Main Typography & CTAs (Col 6) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center"
                        >
                            {/* Main Heading with Subtle Stroke & Soft Shadow */}
                            <h1 
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08] mb-3 sm:mb-4"
                                style={{
                                    WebkitTextStroke: '1px rgba(0, 0, 0, 0.6)',
                                    paintOrder: 'stroke fill',
                                    textShadow: '0 2px 6px rgba(0, 0, 0, 0.35)'
                                }}
                            >
                                Subsidi Tepat. <br />
                                Distribusi Aman.
                            </h1>

                            {/* Subtitle with Soft Text Shadow */}
                            <p 
                                className="text-white text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed mb-5 sm:mb-6"
                                style={{
                                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                Verifikasi ganda <strong className="text-yellow-300 font-bold">AI YOLO &amp; Dokumen STNK</strong> dengan ledger terdesentralisasi <strong className="text-yellow-300 font-bold">Hyperledger Fabric</strong> untuk transparansi energi nasional.
                            </p>

                            {/* Action Buttons: Sejajar 1 Baris & Rounded Dikecilkan (rounded-lg) */}
                            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 mb-5 sm:mb-6">
                                <Link
                                    href={route('register')}
                                    className="hidden inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#980f12] px-5 sm:px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                                >
                                    <span>Daftar Kendaraan Subsidi</span>
                                    <FiArrowRight size={16} />
                                </Link>

                                <a
                                    href="#aturan"
                                    onClick={(e) => scrollToSection(e, 'aturan')}
                                    className="inline-flex items-center justify-center gap-2 bg-black/40 hover:bg-black/60 text-white px-4 sm:px-5 py-3.5 rounded-lg font-bold text-xs sm:text-sm border border-white/30 shadow-md transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <FiSliders className="text-yellow-300" />
                                    <span>Cek Kelayakan CC</span>
                                </a>

                                <button
                                    onClick={handleDownloadApp}
                                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 sm:px-5 py-3.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <FaAndroid size={16} />
                                    <span>Download App</span>
                                </button>
                            </div>


                        </motion.div>

                        {/* RIGHT COLUMN: Large 3D SPBU Model Display (Col 6) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="lg:col-span-6 xl:col-span-6 flex items-center justify-center relative"
                        >
                            <div className="relative w-full max-w-[660px] xl:max-w-[750px] mx-auto flex items-center justify-center">
                                {/* SPBU Illustration with Soft Natural Drop Shadow */}
                                <img 
                                    src="/images/hero_spbu.png" 
                                    alt="Simulasi Ekosistem SPBU Petrochain"
                                    className="w-full max-h-[460px] lg:max-h-[520px] xl:max-h-[580px] object-contain hover:scale-105 transition-transform duration-500 relative z-10" 
                                    style={{
                                        filter: 'drop-shadow(0 5px 10px rgba(255, 255, 255, 0.69)) drop-shadow(0 4px 5px rgba(255, 255, 255, 0.56))'
                                    }}
                                />
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* HOW IT WORKS / USER JOURNEY 4-STEP FLOW (FULL-WIDTH LIGHT)                */}
            {/* ========================================================================= */}
            <section id="cara-kerja" className="pt-20 pb-0 bg-gray-50/70 border-b border-gray-200 scroll-mt-24">
                <div className="w-full">
                    {/* Section Header: Left-Aligned, Large Typography (Matching Image 2) */}
                    <div className="w-full text-left mb-10 px-4 sm:px-6 lg:px-10 xl:px-14">
                        <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                            Workflow Solusi Cerdas
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight">
                            4 Langkah Mudah Verifikasi &amp; Pengisian Subsidi
                        </h2>
                        <p className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                            Integrasi cerdas dari pendaftaran STNK mandiri di rumah, validasi regulasi, hingga nozzle dispenser otomatis di SPBU.
                        </p>
                    </div>

                    {/* Edge-to-Edge Cards Grid: 0 Gap, Straight Corners, Flush with Screen */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-b border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                        {/* Step 1 */}
                        <div className="bg-white rounded-none p-7 sm:p-8 lg:p-10 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-bold border border-red-100 group-hover:scale-105 transition-transform">
                                        <FiFileText />
                                    </div>
                                    <span className="text-xs font-mono font-black tracking-widest text-[#980f12]">
                                        STEP 01
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 mb-2.5">Unggah STNK & Data Diri</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Masyarakat mendaftar mandiri via portal. AI PaddleOCR mengekstrak nomor plat, masa berlaku, dan kapasitas mesin (CC) STNK secara otomatis.
                                </p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>OCR Otomatis</span>
                                <strong className="text-emerald-600 font-bold">Akurasi 98.8%</strong>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-none p-7 sm:p-8 lg:p-10 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-100 group-hover:scale-105 transition-transform">
                                        <FaQrcode />
                                    </div>
                                    <span className="text-xs font-mono font-black tracking-widest text-blue-700">
                                        STEP 02
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 mb-2.5">Validasi Kuota & QR Pass</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Sistem memverifikasi kelayakan sesuai Perpres 191/2014 dan menerbitkan QR Pass digital dinamis dengan token anti-replay 60 detik.
                                </p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Keamanan Token</span>
                                <strong className="text-blue-700 font-bold">Anti-Replay OTP</strong>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-none p-7 sm:p-8 lg:p-10 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-100 group-hover:scale-105 transition-transform">
                                        <FiCpu />
                                    </div>
                                    <span className="text-xs font-mono font-black tracking-widest text-emerald-700">
                                        STEP 03
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 mb-2.5">Deteksi Edge AI di SPBU</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Saat kendaraan tiba di SPBU, Dual Camera ANPR YOLOv8 memindai plat nomor dan mencocokkan fisik kendaraan (&lt; 2s) sebelum dispenser aktif.
                                </p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Latency Model</span>
                                <strong className="text-emerald-700 font-bold">&lt; 42ms / Frame</strong>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-none p-7 sm:p-8 lg:p-10 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold border border-purple-100 group-hover:scale-105 transition-transform">
                                        <FiLayers />
                                    </div>
                                    <span className="text-xs font-mono font-black tracking-widest text-purple-700">
                                        STEP 04
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5 mb-2.5">Audit Ledger Blockchain</h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Volume liter, ID SPBU, dan nomor transaksi disimpan permanen ke Hyperledger Fabric. Audit trail transparan dan tidak dapat dimanipulasi.
                                </p>
                            </div>
                            <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Integritas Audit</span>
                                <strong className="text-purple-700 font-bold">100% Immutable</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* FITUR UNGGULAN: 5 SOLUSI INOVATIF PEMECAH MASALAH SUBSIDI BBM             */}
            {/* ========================================================================= */}
            <section id="fitur" className="py-20 bg-gray-50 border-b border-gray-200 scroll-mt-24">
                <div className="w-full">
                    {/* Section Header: Left-Aligned, Matching Image 2 Design Language */}
                    <div className="w-full text-left mb-10 px-4 sm:px-6 lg:px-10 xl:px-14">
                        <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                            Fitur Solusi Unggulan
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight">
                            5 Solusi Inovatif Menutup Celah Subsidi BBM
                        </h2>
                        <p className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                            Setiap fitur PETROCHAIN dirancang khusus untuk mengatasi akar masalah manipulasi, kebocoran kuota, dan ketidaksesuaian distribusi energi bersubsidi nasional.
                        </p>
                    </div>

                    {/* 5-Column Monolithic Grid: Edge-to-Edge, Straight Corners, Clean Dividers */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-px bg-gray-200 border-t border-b border-gray-200">
                        
                        {/* 1. AI CC Classification (Roda 2) */}
                        <div className="bg-white p-6 sm:p-7 xl:p-8 flex flex-col justify-between hover:bg-gray-50/90 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-11 h-11 rounded-lg bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-bold border border-red-100 group-hover:scale-105 transition-transform">
                                        <FaMotorcycle />
                                    </div>
                                    <span className="text-[11px] font-mono font-black tracking-widest text-[#980f12] bg-red-50 px-2 py-0.5 rounded-sm border border-red-100">
                                        FITUR 01
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                                    AI CC Classification
                                </h3>
                                <span className="inline-block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Target: Roda 2 (Motor)
                                </span>

                                {/* Masalah */}
                                <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-none mb-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#980f12] flex items-center gap-1 mb-1">
                                        <FiAlertTriangle size={12} className="shrink-0" />
                                        <span>Masalah:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Motor &gt;250cc masih berpotensi mengisi BBM subsidi di lapangan.
                                    </p>
                                </div>

                                {/* Solusi */}
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-none mb-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                                        <FiCheckCircle size={12} className="shrink-0" />
                                        <span>Solusi Petrochain:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Kamera YOLO mengklasifikasikan motor menjadi &lt;250cc atau ≥250cc. Kendaraan yang memenuhi syarat dapat mengisi BBM, sedangkan motor mewah otomatis ditolak.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Engine</span>
                                <strong className="text-gray-900 font-bold">YOLOv8 Vision</strong>
                            </div>
                        </div>

                        {/* 2. Cross-Validation QR & Limit Harian (Roda 4) */}
                        <div className="bg-white p-6 sm:p-7 xl:p-8 flex flex-col justify-between hover:bg-gray-50/90 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold border border-blue-100 group-hover:scale-105 transition-transform">
                                        <FaQrcode />
                                    </div>
                                    <span className="text-[11px] font-mono font-black tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
                                        FITUR 02
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                                    Cross-Validation QR &amp; Limit
                                </h3>
                                <span className="inline-block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Target: Roda 4 (Mobil)
                                </span>

                                {/* Masalah */}
                                <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-none mb-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#980f12] flex items-center gap-1 mb-1">
                                        <FiAlertTriangle size={12} className="shrink-0" />
                                        <span>Masalah:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Penyalahgunaan QR Code pinjaman dan pelanggaran kuota harian.
                                    </p>
                                </div>

                                {/* Solusi */}
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-none mb-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                                        <FiCheckCircle size={12} className="shrink-0" />
                                        <span>Solusi Petrochain:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        YOLO + OCR membaca pelat nomor, lalu mencocokkannya dengan data QR Code. Jika sesuai dan kuota harian masih tersedia, pompa BBM diaktifkan.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Validasi</span>
                                <strong className="text-blue-700 font-bold">Dual Cross-Check</strong>
                            </div>
                        </div>

                        {/* 3. AI-Assisted Registration */}
                        <div className="bg-white p-6 sm:p-7 xl:p-8 flex flex-col justify-between hover:bg-gray-50/90 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold border border-amber-100 group-hover:scale-105 transition-transform">
                                        <FiFileText />
                                    </div>
                                    <span className="text-[11px] font-mono font-black tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-100">
                                        FITUR 03
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                                    AI-Assisted Registration
                                </h3>
                                <span className="inline-block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Target: Registrasi Kendaraan
                                </span>

                                {/* Masalah */}
                                <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-none mb-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#980f12] flex items-center gap-1 mb-1">
                                        <FiAlertTriangle size={12} className="shrink-0" />
                                        <span>Masalah:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Verifikasi berkas fisik STNK masih sangat lambat dan rawan human error manual.
                                    </p>
                                </div>

                                {/* Solusi */}
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-none mb-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                                        <FiCheckCircle size={12} className="shrink-0" />
                                        <span>Solusi Petrochain:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        AI mencocokkan pelat nomor pada STNK dan foto kendaraan. Jika ada ketidaksesuaian, sistem memberi flag otomatis untuk ditinjau operator.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Verifikasi</span>
                                <strong className="text-amber-700 font-bold">Auto-Flag Anomaly</strong>
                            </div>
                        </div>

                        {/* 4. PetroLocator */}
                        <div className="bg-white p-6 sm:p-7 xl:p-8 flex flex-col justify-between hover:bg-gray-50/90 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-100 group-hover:scale-105 transition-transform">
                                        <FaGasPump />
                                    </div>
                                    <span className="text-[11px] font-mono font-black tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                                        FITUR 04
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                                    PetroLocator
                                </h3>
                                <span className="inline-block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Target: Publik &amp; Pengemudi
                                </span>

                                {/* Masalah */}
                                <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-none mb-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#980f12] flex items-center gap-1 mb-1">
                                        <FiAlertTriangle size={12} className="shrink-0" />
                                        <span>Masalah:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Pengguna tidak mengetahui ketersediaan stok BBM riil di stasiun SPBU tujuan.
                                    </p>
                                </div>

                                {/* Solusi */}
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-none mb-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                                        <FiCheckCircle size={12} className="shrink-0" />
                                        <span>Solusi Petrochain:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Operator memperbarui status stok secara real-time sehingga pengguna dapat melihat ketersediaan BBM sebelum berangkat.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Pembaruan</span>
                                <strong className="text-emerald-700 font-bold">Real-time Telemetry</strong>
                            </div>
                        </div>

                        {/* 5. Blockchain Audit Trail */}
                        <div className="bg-white p-6 sm:p-7 xl:p-8 flex flex-col justify-between hover:bg-gray-50/90 transition-all group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold border border-purple-100 group-hover:scale-105 transition-transform">
                                        <FiDatabase />
                                    </div>
                                    <span className="text-[11px] font-mono font-black tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded-sm border border-purple-100">
                                        FITUR 05
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                                    Blockchain Audit Trail
                                </h3>
                                <span className="inline-block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Target: BPH Migas &amp; Regulator
                                </span>

                                {/* Masalah */}
                                <div className="p-3.5 bg-red-50/80 border border-red-100 rounded-none mb-3">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#980f12] flex items-center gap-1 mb-1">
                                        <FiAlertTriangle size={12} className="shrink-0" />
                                        <span>Masalah:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Audit penyaluran subsidi kurang transparan dan catatan buku rentan rekayasa.
                                    </p>
                                </div>

                                {/* Solusi */}
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-none mb-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1 mb-1">
                                        <FiCheckCircle size={12} className="shrink-0" />
                                        <span>Solusi Petrochain:</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                        Seluruh transaksi BBM dicatat di blockchain sehingga data tidak dapat diubah dan mudah diaudit secara langsung oleh pemerintah.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>Ledger</span>
                                <strong className="text-purple-700 font-bold">Immutable Fabric</strong>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* ATURAN & LIMIT KUOTA SUBSIDI (IMAGE BACKGROUND FROM Gambar/Background)    */}
            {/* ========================================================================= */}
            <section id="aturan" className="py-20 relative overflow-hidden scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14 bg-gray-100">
                {/* Background Image from folder Gambar/Background (Full brightness, no dark overlay) */}
                <div className="absolute inset-0 z-0">
                    {/* <img 
                        src="/images/background/2112.w015.n001.664B.p15.664.jpg" 
                        alt="Regulasi SPBU Background" 
                        className="w-full h-full object-cover object-center"
                    /> */}
                </div>

                <div className="w-full relative z-10">
                    {/* Section Header: Left-Aligned, Larger Typography, No Background Box (Flush with Element Below) */}
                    <div className="w-full text-left mb-8">
                        <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                            Regulasi Resmi
                        </div>
                        <h2 
                            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight"
                            style={{ textShadow: '0 1px 8px rgba(255, 255, 255, 0.9), 0 0 2px rgba(255, 255, 255, 0.9)' }}
                        >
                            Aturan &amp; Limit Kuota Harian Subsidi
                        </h2>
                        <p 
                            className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium"
                            style={{ textShadow: '0 1px 6px rgba(255, 255, 255, 0.9)' }}
                        >
                            Sistem secara otomatis mendeteksi CC dan tipe kendaraan melalui AI OCR untuk menentukan batas maksimal pengisian sesuai aturan pemerintah.
                        </p>
                    </div>

                    {/* Unified Comparison Box: Compact & Perfectly Aligned with Other Sections */}
                    <div className="w-full border border-gray-200 bg-white/95 rounded-none">
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                            
                            {/* Column 1: Pertalite */}
                            <div className="p-6 sm:p-8 bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-950">PERTALITE (RON 90)</h3>
                                        </div>
                                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                                            RODA 4
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-5 font-medium">
                                        Subsidi Tepat Sasaran Khusus Kendaraan Bensin
                                    </p>

                                    {/* Compact Spec Cards */}
                                    <div className="space-y-3 font-mono text-xs">
                                        <div className="p-3.5 bg-gray-50 border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <div className="text-gray-500 font-sans text-[11px] uppercase tracking-wider font-bold">Batas Mesin (CC)</div>
                                                <div className="text-sm font-black text-gray-900 mt-0.5">Maksimal 1.400 CC</div>
                                            </div>
                                            <span className="text-[10px] font-sans text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-200">Eligible</span>
                                        </div>

                                        <div className="p-3.5 bg-gray-50 border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <div className="text-gray-500 font-sans text-[11px] uppercase tracking-wider font-bold">Kuota Harian (QR Code)</div>
                                                <div className="text-sm font-black text-gray-900 mt-0.5">50 Liter / Hari</div>
                                            </div>
                                            <span className="text-[10px] font-sans text-gray-500">Semua Roda 4</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                    <span>Verifikasi Valid:</span>
                                    <strong className="text-emerald-700 font-sans font-bold">STNK OCR + Camera ANPR</strong>
                                </div>
                            </div>

                            {/* Column 2: Bio Solar */}
                            <div className="p-6 sm:p-8 bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <h3 className="text-xl sm:text-2xl font-black text-gray-950">BIO SOLAR (CN 48)</h3>
                                        </div>
                                        <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5">
                                            DIESEL GOLONGAN
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-5 font-medium">
                                        Distribusi Bertingkat Berdasarkan Klasifikasi Armada
                                    </p>

                                    {/* Compact Spec Cards */}
                                    <div className="space-y-3 font-mono text-xs">
                                        <div className="p-3.5 bg-gray-50 border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <div className="text-gray-500 font-sans text-[11px] uppercase tracking-wider font-bold">Batas Mesin (CC)</div>
                                                <div className="text-sm font-black text-gray-900 mt-0.5">Tidak Ada Batas CC</div>
                                            </div>
                                            <span className="text-[10px] font-sans text-amber-700 font-bold bg-amber-50 px-2 py-0.5 border border-amber-200">Semua Diesel</span>
                                        </div>

                                        <div className="p-3.5 bg-gray-50 border border-gray-200 space-y-1.5">
                                            <div className="text-gray-500 font-sans text-[11px] uppercase tracking-wider font-bold border-b border-gray-200 pb-1">Kuota Harian (QR Code)</div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-sans text-gray-700">Mobil Pribadi</span>
                                                <strong className="text-gray-950 font-black">50 Liter / Hari</strong>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-sans text-gray-700">Bus / Angkutan Umum</span>
                                                <strong className="text-gray-950 font-black">80 Liter / Hari</strong>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-sans text-gray-700">Truk / Angkutan Barang</span>
                                                <strong className="text-gray-950 font-black">200 Liter / Hari</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-500">
                                    <span>Dasar Regulasi:</span>
                                    <strong className="text-gray-800 font-sans font-bold">SK BPH Migas No. 04/2020</strong>
                                </div>
                            </div>

                        </div>

                        {/* Compact Bottom Warning Bar */}
                        <div className="bg-gray-50 border-t border-gray-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-rose-700 font-bold">
                                <FiAlertTriangle size={15} className="shrink-0" />
                                <span>Tanpa QR Code (Hanya Plat Nomor Fisik):</span>
                            </div>
                            <div className="text-gray-600 text-center sm:text-right">
                                Kuota dibatasi ketat maksimal <strong className="text-gray-950 font-black font-mono">20 Liter / Hari</strong> untuk semua kendaraan subsidi.
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ========================================================================= */}
            {/* END-TO-END NATIONAL FUEL SUPPLY CHAIN DIAGRAM (FULL-WIDTH)                */}
            {/* ========================================================================= */}
            <section id="alur" className="py-20 bg-gray-50/60 border-b border-gray-100 scroll-mt-24">
                <div className="w-full">
                    {/* Section Header: Left-Aligned, Large Typography */}
                    <div className="w-full text-left mb-10 px-4 sm:px-6 lg:px-10 xl:px-14">
                        <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                            Keunggulan PETROCHAIN
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight">
                            5 Fitur Cerdas Anti-Kecurangan
                        </h2>
                        <p className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                            Bagaimana PETROCHAIN mengunci celah kecurangan dari hulu registrasi hingga ke nozzle dispenser SPBU.
                        </p>
                    </div>

                    {/* 5 Features Flow: Grid Edge-to-Edge */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 border-t border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
                        
                        {/* Feature 1 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-black mb-5 border border-blue-100 group-hover:scale-105 transition-transform">
                                    <FaMotorcycle />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider">FITUR 01 • RODA 2 (MOTOR)</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">AI CC Classification</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Motor &gt;250cc masih berpotensi mengisi BBM subsidi di lapangan.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Kamera YOLO mengklasifikasikan motor menjadi &lt;250cc atau ≥250cc. Kendaraan yang memenuhi syarat dapat mengisi BBM, sedangkan motor mewah otomatis ditolak.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Engine: YOLOv8 Vision
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-black mb-5 border border-red-100 group-hover:scale-105 transition-transform">
                                    <FaQrcode />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#980f12] uppercase tracking-wider">FITUR 02 • RODA 4 (MOBIL)</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">Cross-Validation QR & Limit</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Penyalahgunaan QR Code pinjaman dan pelanggaran kuota harian.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> YOLO + OCR membaca pelat nomor, lalu mencocokkannya dengan data QR Code. Jika sesuai dan kuota harian masih tersedia, pompa BBM diaktifkan.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Validasi: Dual Cross-Check
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-black mb-5 border border-emerald-100 group-hover:scale-105 transition-transform">
                                    <FiCheckCircle />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">FITUR 03 • REGISTRASI KENDARAAN</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">AI-Assisted Registration</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Verifikasi berkas fisik STNK masih sangat lambat dan rawan human error manual.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> AI mencocokkan pelat nomor pada STNK dan foto kendaraan. Jika ada ketidaksesuaian, sistem memberi flag otomatis untuk ditinjau operator.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Verifikasi: Auto-Flag Anomaly
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-black mb-5 border border-amber-100 group-hover:scale-105 transition-transform">
                                    <FiMapPin />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider">FITUR 04 • PUBLIK & PENGEMUDI</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">PetroLocator</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Pengguna tidak mengetahui ketersediaan stok BBM riil di stasiun SPBU tujuan.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Operator memperbarui status stok secara real-time sehingga pengguna dapat melihat ketersediaan BBM sebelum berangkat.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Pembaruan: Real-time Telemetry
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-black mb-5 border border-purple-100 group-hover:scale-105 transition-transform">
                                    <FiLayers />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider">FITUR 05 • BPH MIGAS & REGULATOR</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">Blockchain Audit Trail</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Audit penyaluran subsidi kurang transparan dan catatan buku rentan rekayasa.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Seluruh transaksi BBM dicatat di blockchain sehingga data tidak dapat diubah dan mudah diaudit secara langsung oleh pemerintah.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Ledger: Immutable Fabric
                            </div>
                        </div>

                    </div>

                    {/* 3D Global Distributed Node Network Showcase Box: Full-Width Edge-to-Edge */}
                    {/* <div className="w-full bg-white p-6 sm:p-10 lg:p-14 border-t border-b border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-none">
                        <div className="lg:col-span-6 space-y-5">
                            <div className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-wider text-[#980f12] uppercase">
                                <FiActivity className="animate-pulse" />
                                <span>Deployment Ready Nasional</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 leading-tight">
                                Topologi Jaringan Terdistribusi Sabang hingga Merauke
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Setiap Depot TBBM, Kilang Pengolahan, dan SPBU di 38 provinsi terhubung dalam jaringan konsensus <strong>Hyperledger Fabric</strong>. Validasi kuota dan verifikasi fisik ANPR diproses secara lokal di SPBU (&lt; 2 detik), kemudian diverifikasi silang ke ledger terpusat untuk mengeliminasi pemalsuan kuota antar wilayah.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                                <div className="p-4 rounded-none bg-gray-50/80 border border-gray-200 shadow-2xs">
                                    <div className="text-gray-500 font-sans">Cakupan SPBU Nasional</div>
                                    <div className="text-lg sm:text-xl font-black text-gray-950 mt-1"><CountUp end={7280} duration={3} separator="." suffix="+" enableScrollSpy scrollSpyOnce /> SPBU</div>
                                </div>
                                <div className="p-4 rounded-none bg-gray-50/80 border border-gray-200 shadow-2xs">
                                    <div className="text-gray-500 font-sans">Konsensus Node</div>
                                    <div className="text-lg sm:text-xl font-black text-emerald-600 mt-1">BFT / RAFT Active</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 flex justify-center w-full">
                            <InteractiveGlobe />
                        </div>
                    </div> */}
                </div>
            </section>


            {/* ========================================================================= */}
            {/* TABBED DEEP-DIVE TECHNOLOGY MATRIX                                        */}
            {/* ========================================================================= */}
                        {/* ========================================================================= */}
            {/* LIVE SPBU FUEL STOCK LOCATOR MINI-PREVIEW (BRIGHT SPBU IMAGE BACKGROUND)  */}
            {/* ========================================================================= */}
            <section className="pt-16 pb-0 relative overflow-hidden bg-gray-100">
                {/* Background Image from folder Gambar (Full brightness, no dark overlay) */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/images/background/3009.jpg" 
                        alt="SPBU Pertamina Background" 
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                <div className="w-full relative z-10">
                    <div className="px-4 sm:px-6 lg:px-10 xl:px-14 mb-10">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-none border border-gray-200 shadow-md">
                            <div>
                                <div className="text-xs font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-1.5">
                                    Transparansi Stok Publik
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-gray-950 mt-1 mb-2">
                                    Pantau Ketersediaan BBM Subsidi Real-Time
                                </h3>
                                <p className="text-gray-700 text-sm sm:text-base max-w-2xl leading-relaxed">
                                    Akses status tangki Pertalite dan Solar di seluruh SPBU untuk menghindari antrean panjang dan kepalsuan stok habis.
                                </p>
                            </div>

                            <Link
                                href={route('public.stock')}
                                className="bg-[#980f12] text-white px-8 py-4 rounded-none font-bold text-sm shadow-md hover:bg-red-800 transition-all flex items-center gap-2 flex-shrink-0 self-start lg:self-auto cursor-pointer"
                            >
                                <FiSearch size={18} /> Buka Peta & Stok SPBU Lengkap
                            </Link>
                        </div>
                    </div>

                    {/* Edge-to-Edge SPBU Mini Sample Cards: 0 Gap, Straight Corners, Flush with Screen */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white/95 backdrop-blur-md">
                        {spbus.length > 0 ? spbus.map((spbu: any) => {
                            const pertalite = spbu.fuel_stocks?.find((s: any) => s.fuel_type === 'pertalite');
                            const biosolar = spbu.fuel_stocks?.find((s: any) => s.fuel_type === 'solar' || s.fuel_type === 'biosolar');
                            
                            return (
                                <div key={spbu.id} className="bg-transparent p-6 sm:p-8 rounded-none hover:bg-white transition-colors">
                                    <div className="text-xs font-bold text-gray-950 flex items-center justify-between">
                                        <span>{spbu.name}</span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </div>
                                    <div className="mt-4 space-y-2 font-mono text-xs">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                                            <span className="text-gray-600">Pertalite:</span>
                                            <strong className={`font-bold ${pertalite?.status === 'empty' ? 'text-red-600' : (pertalite?.status === 'limited' ? 'text-amber-600' : 'text-emerald-700')}`}>
                                                {pertalite?.status === 'empty' ? 'Habis' : (pertalite?.status === 'limited' ? 'Menipis' : 'Tersedia')}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Biosolar:</span>
                                            <strong className={`font-bold ${biosolar?.status === 'empty' ? 'text-red-600' : (biosolar?.status === 'limited' ? 'text-amber-600' : 'text-emerald-700')}`}>
                                                {biosolar?.status === 'empty' ? 'Habis' : (biosolar?.status === 'limited' ? 'Menipis' : 'Tersedia')}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-3 p-8 text-center text-gray-500 text-sm">Memuat data stok SPBU...</div>
                        )}
                    </div>

                </div>
            </section>


            {/* ========================================================================= */}
            {/* FAQ ACCORDION SECTION (EXPANDED LEFT COLUMN, STRAIGHT CORNERS, FLUSH TIGHT) */}
            {/* ========================================================================= */}
            <section 
                id="faq" 
                className="py-20 bg-white scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14 border-b border-gray-100"
            >
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* FAQ Left Header - Expanded to 5 cols with comfortable title size */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="text-xs font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                                Frequently Asked Questions
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-950 leading-tight tracking-tight">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Pelajari bagaimana ekosistem PETROCHAIN bekerja untuk menjamin distribusi BBM bersubsidi yang adil, tepat sasaran, dan anti-kecurangan.
                            </p>

                            <div className="pt-2">
                                <div className="p-6 rounded-none bg-gray-50 border border-gray-200 space-y-2">
                                    <div className="text-sm font-bold text-gray-950">Butuh Bantuan Lebih Lanjut?</div>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Hubungi call center 135 atau ajukan pertanyaan ke tim auditor kami.</p>
                                    <Link href={route('public.stock')} className="text-xs sm:text-sm font-bold text-[#980f12] hover:underline inline-flex items-center gap-1 pt-1">
                                        Cek Informasi SPBU <FiArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Right Accordion List - Tight / Flush (divide-y, rounded-none), Generous Padding */}
                        <div className="lg:col-span-7 w-full border border-gray-200 divide-y divide-gray-200 bg-white rounded-none shadow-2xs">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx} 
                                    className="rounded-none transition-colors duration-150"
                                >
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                        className="w-full px-6 py-5 sm:px-8 sm:py-5.5 text-left font-bold text-gray-900 bg-gray-50/50 hover:bg-gray-100/70 flex justify-between items-center transition-colors cursor-pointer rounded-none"
                                    >
                                        <span className="text-sm sm:text-base pr-4 leading-snug">{faq.q}</span>
                                        <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0 ${activeFaq === idx ? 'rotate-180 text-[#980f12]' : ''}`} />
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
                                                <div className="px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base text-gray-600 bg-white leading-relaxed border-t border-gray-100">
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
                <div className="w-full max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 border-b pb-4">
                        <FiUsers className="text-[#3b82f6] text-2xl" />
                        <h2 className="text-xl font-bold text-gray-900">Informasi Tim</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Kolom Kiri */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">NAMA TIM</div>
                                <div className="text-base font-semibold text-gray-900">TimBerapa</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">KATEGORI KOMPETISI</div>
                                <div className="text-base font-semibold text-gray-900">E-Government</div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">KETUA TIM</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-lg">
                                        M
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Muhammad Aziz</div>
                                        <div className="text-xs text-gray-500">NIM: 2024573010089</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">DOSEN PEMBIMBING</div>
                                <div className="text-sm font-bold text-gray-900">Dr. Rahmad Hidayat, S.Kom., M.Cs</div>
                                <div className="text-xs text-gray-500">NIDN: 0120048303 | NIP: 198304202012121003</div>
                            </div>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ANGGOTA TIM</div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg">
                                            D
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">Deswita Nazwa Ariani</div>
                                            <div className="text-xs text-gray-500">NIM: 2024573010003</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg">
                                            A
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">Amirullah</div>
                                            <div className="text-xs text-gray-500">NIM: 2024573010089</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================================================= */}
            {/* FOOTER (FULL-WIDTH)                                                       */}
            {/* ========================================================================= */}
            {/* ========================================================================= */}
            {/* FOOTER (CLEAN WHITE PERTAMINA-STYLE LAYOUT WITH ORIGINAL INFO)            */}
            {/* ========================================================================= */}
            <footer className="bg-white text-gray-700 pt-16 pb-12 border-t border-gray-200 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full">
                    {/* Clean 3-Column Layout with Enlarged Typography */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10">
                        {/* Column 1: Partner Logos, Brand & Platform Description (Col 5) */}
                        <div className="md:col-span-5 space-y-4">
                            {/* Logos: Tut Wuri -> Kemendikti Saintek -> Poltek -> KMIPN -> Petrochain */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 bg-gray-50/90 p-2 sm:p-2.5 rounded-2xl border border-gray-200 shadow-xs w-fit">
                                {/* 1. Tut Wuri Handayani */}
                                <img 
                                    src="/images/logos/tut_wuri.png?v=2" 
                                    alt="Tut Wuri Handayani" 
                                    className="h-7 sm:h-8 w-auto object-contain" 
                                    title="Tut Wuri Handayani"
                                />
                                {/* 2. Kemendikti Saintek */}
                                <img 
                                    src="/images/logos/kemendikti.png" 
                                    alt="Kemendikti Saintek" 
                                    className="h-7 sm:h-8 w-auto object-contain" 
                                    title="Kementerian Pendidikan Tinggi, Sains, dan Teknologi"
                                />
                                {/* 3. Poltek (Politeknik Negeri Lhokseumawe) */}
                                <img 
                                    src="/images/logos/pnl.png" 
                                    alt="Politeknik Negeri Lhokseumawe" 
                                    className="h-7 sm:h-8 w-auto object-contain" 
                                    title="Politeknik Negeri Lhokseumawe"
                                />
                                {/* 4. KMIPN */}
                                <img 
                                    src="/images/logos/kmipn.png" 
                                    alt="KMIPN 2026" 
                                    className="h-7 sm:h-8 w-auto object-contain" 
                                    title="KMIPN 2026"
                                />
                                <div className="h-6 w-[1px] bg-gray-300 mx-0.5"></div>
                                {/* 5. Petrochain */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-[#980f12] p-1.5 flex items-center justify-center shadow-xs">
                                        <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xl font-black text-gray-950 tracking-tight">PETROCHAIN</span>
                                </div>
                            </div>

                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Platform Intelligent Verification dan Audit Trail untuk Penguatan Distribusi BBM Bersubsidi, dirancang sebagai layer inovasi terintegrasi untuk ekosistem MyPertamina.
                            </p>

                            <div className="inline-block px-3.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-700">
                                KMIPN 2026 &bull; Kategori E-Goverment
                            </div>
                        </div>

                        {/* Column 2: Navigation Links (Col 3) */}
                        <div className="md:col-span-3 space-y-4">
                            <h4 className="text-base sm:text-lg font-extrabold text-gray-950 tracking-tight uppercase">
                                Menu Utama
                            </h4>
                            <ul className="space-y-3 text-sm sm:text-base font-medium text-gray-600">
                                <li>
                                    <a href="#cara-kerja" onClick={(e) => scrollToSection(e, 'cara-kerja')} className="hover:text-[#980f12] transition-colors cursor-pointer inline-flex items-center gap-1.5">
                                        &rsaquo; Cara Kerja
                                    </a>
                                </li>
                                <li>
                                    <a href="#simulator" onClick={(e) => scrollToSection(e, 'simulator')} className="hover:text-[#980f12] transition-colors cursor-pointer inline-flex items-center gap-1.5">
                                        &rsaquo; Simulasi Cek CC
                                    </a>
                                </li>
                                <li>
                                    <a href="#alur" onClick={(e) => scrollToSection(e, 'alur')} className="hover:text-[#980f12] transition-colors cursor-pointer inline-flex items-center gap-1.5">
                                        &rsaquo; Rantai Pasok Nasional
                                    </a>
                                </li>
                                <li>
                                    <a href="#teknologi" onClick={(e) => scrollToSection(e, 'teknologi')} className="hover:text-[#980f12] transition-colors cursor-pointer inline-flex items-center gap-1.5">
                                        &rsaquo; Arsitektur AI &amp; Chain
                                    </a>
                                </li>
                                <li>
                                    <Link href={route('public.stock')} className="hover:text-[#980f12] transition-colors inline-flex items-center gap-1.5">
                                        &rsaquo; Cek Stok SPBU
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('login')} className="hover:text-[#980f12] transition-colors inline-flex items-center gap-1.5">
                                        &rsaquo; Masuk Portal
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Developer Info (Col 4 - Expanded Width so text never breaks) */}
                        <div className="md:col-span-4 space-y-4">
                            <h4 className="text-base sm:text-lg font-extrabold text-gray-950 tracking-tight uppercase">
                                Pengembang
                            </h4>
                            <div className="text-sm sm:text-base space-y-1.5 text-gray-600">
                                <p className="text-base sm:text-lg font-black text-gray-950">TIMBERAPA</p>
                                <p className="leading-relaxed whitespace-normal lg:whitespace-nowrap">
                                    Jurusan Teknologi Informasi dan Komputer
                                </p>
                                <p className="font-bold text-gray-850 whitespace-normal lg:whitespace-nowrap">
                                    Politeknik Negeri Lhokseumawe
                                </p>
                                <p className="text-gray-500">
                                    Aceh, Indonesia
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar: Copyright, Ecosystem Info, and Social Icons */}
                    <div className="border-t border-gray-200 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-gray-600 font-medium gap-4">
                        <div className="text-center md:text-left space-y-1">
                            <p>&copy; 2026 PETROCHAIN - TIMBERAPA Politeknik Negeri Lhokseumawe. All rights reserved.</p>
                            <p className="text-gray-500">Sistem Pendukung Ekosistem MyPertamina &amp; BPH Migas.</p>
                        </div>

                  
                    </div>
                </div>
            </footer>

            {/* ========================================================================= */}
            {/* BACK TO TOP BUTTON                                                        */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {isScrolled && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        aria-label="Kembali ke Atas"
                        className="fixed bottom-7 right-7 z-50 bg-[#980f12] hover:bg-[#7e0b0e] text-white w-12 h-12 rounded-full shadow-2xl shadow-black/40 border border-white/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                        title="Kembali ke Atas"
                    >
                        <FiArrowUp size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

        </div>
    );
}



