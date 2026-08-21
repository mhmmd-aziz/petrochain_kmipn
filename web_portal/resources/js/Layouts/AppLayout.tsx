import React, { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiHome, FiFileText, FiTruck, FiMapPin, 
    FiRepeat, FiLink, FiDatabase, FiUsers, 
    FiMenu, FiX, FiLogOut, FiCpu, FiClock,
    FiUser, FiShield, FiChevronDown, FiActivity,
    FiCheckCircle, FiHelpCircle
} from 'react-icons/fi';
import { FaMotorcycle } from 'react-icons/fa';

interface Props {
    children: ReactNode;
    title?: string;
}

interface NavItem {
    href: string;
    label: string;
    icon: any;
    roles: string[];
    section?: string;
}

const navItems: NavItem[] = [
    // Dashboard
    { href: '/admin/dashboard', label: 'Dashboard Admin', icon: FiHome, roles: ['admin'], section: 'UTAMA' },
    { href: '/operator/dashboard', label: 'Dashboard Operator', icon: FiHome, roles: ['operator'], section: 'UTAMA' },
    { href: '/auditor/dashboard', label: 'Dashboard Auditor', icon: FiHome, roles: ['auditor'], section: 'UTAMA' },
    
    // Public User
    { href: '/registrations', label: 'Kendaraan Saya', icon: FiFileText, roles: ['public'], section: 'LAYANAN' },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: FiRepeat, roles: ['public'], section: 'LAYANAN' },
    
    // Admin features
    { href: '/admin/registrations', label: 'Review Pendaftaran', icon: FiFileText, roles: ['admin'], section: 'VERIFIKASI & DATA' },
    { href: '/vehicles', label: 'Database Kendaraan', icon: FiTruck, roles: ['admin', 'operator'], section: 'VERIFIKASI & DATA' },
    { href: '/admin/spbu', label: 'Manajemen SPBU', icon: FiMapPin, roles: ['admin'], section: 'VERIFIKASI & DATA' },
    { href: '/users', label: 'Manajemen Pengguna', icon: FiUsers, roles: ['admin'], section: 'PENGATURAN' },
    { href: '/transactions', label: 'Semua Transaksi', icon: FiRepeat, roles: ['admin'], section: 'LEDGER & AUDIT' },
    { href: '/blockchain', label: 'Blockchain Ledger', icon: FiLink, roles: ['admin', 'auditor'], section: 'LEDGER & AUDIT' },

    // Operator features
    { href: '/operator/validation', label: 'Validasi Mobil (QR)', icon: FiCheckCircle, roles: ['operator'], section: 'POS DISPENSER' },
    { href: '/operator/validation-motor', label: 'Validasi Motor (YOLO)', icon: FaMotorcycle, roles: ['operator'], section: 'POS DISPENSER' },
    { href: '/operator/stock', label: 'Update Stok Tangki', icon: FiDatabase, roles: ['operator'], section: 'OPERASIONAL' },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: FiRepeat, roles: ['operator'], section: 'OPERASIONAL' },

    // Auditor features
    { href: '/auditor/transactions', label: 'Audit Transaksi', icon: FiShield, roles: ['auditor'], section: 'PENGAWASAN' },
];

const roleBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    admin: { label: 'ADMINISTRATOR', bg: 'bg-red-50', text: 'text-[#980f12]', border: 'border-red-200' },
    operator: { label: 'OPERATOR SPBU', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    auditor: { label: 'AUDITOR BPH MIGAS', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    public: { label: 'PENGGUNA SUBSIDI', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function AppLayout({ children, title }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('');

    const { url, props } = usePage<any>();
    const user = props.auth.user;
    const roleConfig = roleBadgeConfig[user?.role] || roleBadgeConfig['public'];

    // Real-time SPBU clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const dateStr = now.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            setCurrentTime(`${dateStr} • ${timeStr} WIB`);
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close profile dropdown on outside click
    useEffect(() => {
        const closeDropdown = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('#user-profile-menu')) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    const visibleNavItems = navItems.filter(item => !user || item.roles.includes(user.role));

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-gray-800 font-sans selection:bg-[#980f12] selection:text-white">
            
            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Navigation */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        className="fixed inset-y-0 left-0 z-40 w-72 lg:static lg:z-20 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#800b0e] via-[#980f12] to-[#b91c1c] text-white shadow-2xl overflow-hidden select-none"
                    >
                        {/* Logo & Brand Header */}
                        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-white/20 p-1.5 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                                    <img src="/images/logoicon.png" alt="Petrochain" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-extrabold text-lg tracking-wider leading-none">
                                        PETROCHAIN
                                    </span>
                                    <span className="text-[9px] text-red-200 font-medium leading-tight mt-0.5">
                                        Intelligent Fuel Ecosystem
                                    </span>
                                </div>
                            </Link>

                            {/* Close button on mobile */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-white/80 hover:text-white p-1.5 rounded-lg bg-white/10"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Role Indicator Banner */}
                        <div className="mx-4 mt-4 px-3.5 py-2.5 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-[10px] font-bold tracking-widest text-red-100 uppercase">
                                    {roleConfig.label}
                                </span>
                            </div>
                            <span className="text-[9px] font-mono bg-white/10 text-white px-2 py-0.5 rounded-md">
                                v2.4
                            </span>
                        </div>

                        {/* Navigation Items */}
                        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
                            {visibleNavItems.map((item, idx) => {
                                const isActive = url === item.href || url.startsWith(item.href + '/');
                                const Icon = item.icon;
                                const showSection = item.section && (idx === 0 || visibleNavItems[idx - 1]?.section !== item.section);

                                return (
                                    <React.Fragment key={item.href + idx}>
                                        {showSection && (
                                            <div className={`px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-widest text-red-200/50 flex items-center gap-1.5 ${idx > 0 ? 'mt-2 border-t border-white/5 pt-2.5' : ''}`}>
                                                <span className="w-1 h-1 rounded-full bg-red-300/80"></span>
                                                {item.section}
                                            </div>
                                        )}
                                        <Link
                                            href={item.href}
                                            onClick={() => {
                                                if (window.innerWidth < 1024) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs rounded-2xl transition-all duration-200 group ${
                                                isActive 
                                                    ? 'bg-white text-[#980f12] font-black shadow-md shadow-black/10 scale-[1.01]' 
                                                    : 'text-red-100/90 hover:bg-white/10 hover:text-white font-semibold'
                                            }`}
                                        >
                                            <div className={`p-1 rounded-xl transition-transform group-hover:scale-110 flex-shrink-0 ${isActive ? 'text-[#980f12]' : 'text-red-200'}`}>
                                                <Icon size={17} />
                                            </div>
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    </React.Fragment>
                                );
                            })}
                        </nav>

                        {/* Bottom User Card */}
                        <div className="p-4 border-t border-white/10 bg-black/15">
                            <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-[#980f12] text-sm font-extrabold shadow-sm flex-shrink-0">
                                        {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-white text-xs font-bold truncate">{user?.name || 'Petro User'}</div>
                                        <div className="text-red-200 text-[10px] truncate capitalize">{user?.email || 'user@petrochain.id'}</div>
                                    </div>
                                </div>
                                <Link 
                                    href="/logout" 
                                    method="post" 
                                    as="button" 
                                    className="text-red-200 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors flex-shrink-0"
                                    title="Keluar"
                                >
                                    <FiLogOut size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                
                {/* Top Header Bar */}
                <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-gray-200 shadow-xs flex-shrink-0 z-20">
                    
                    {/* Left: Sidebar Toggle & Page Title */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 hover:text-[#980f12] transition-colors p-2 rounded-xl hover:bg-red-50 border border-gray-200 focus:outline-none"
                            title={sidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
                        >
                            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                        {title && (
                            <h1 className="text-gray-900 font-extrabold text-base sm:text-xl tracking-tight truncate">
                                {title}
                            </h1>
                        )}
                    </div>

                    {/* Right: Live Clock, Status, & User Dropdown */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        
                        {/* Real-time SPBU Digital Clock */}
                        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 shadow-2xs">
                            <FiClock className="text-[#980f12]" />
                            <span>{currentTime || 'Sinkronisasi Jam...'}</span>
                        </div>

                        {/* Live AI / Blockchain Indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>Edge AI Online</span>
                        </div>

                        {/* User Profile Menu with Dropdown */}
                        <div className="relative" id="user-profile-menu">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-gray-200 hover:border-red-200 hover:bg-red-50/40 transition-all text-left focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-xl bg-[#980f12] text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                                <div className="hidden lg:block text-xs">
                                    <div className="font-bold text-gray-900 leading-tight">{user?.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono font-semibold capitalize">{user?.role}</div>
                                </div>
                                <FiChevronDown className={`hidden sm:block text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180 text-[#980f12]' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {profileDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                                    >
                                        {/* Dropdown User Info */}
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                            <div className="text-xs font-bold text-gray-900">{user?.name}</div>
                                            <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
                                            <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                                                {roleConfig.label}
                                            </span>
                                        </div>

                                        {/* Dropdown Links */}
                                        <div className="py-1 text-xs">
                                            <Link 
                                                href="/" 
                                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#980f12] font-medium"
                                            >
                                                <FiHome /> Halaman Utama Publik
                                            </Link>
                                            <Link 
                                                href={route('public.stock')} 
                                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#980f12] font-medium"
                                            >
                                                <FiMapPin /> Cek Stok SPBU
                                            </Link>
                                        </div>

                                        {/* Logout Button */}
                                        <div className="pt-1 border-t border-gray-100">
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold text-left transition-colors"
                                            >
                                                <FiLogOut /> Keluar dari Sistem
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </header>

                {/* Page Body Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

