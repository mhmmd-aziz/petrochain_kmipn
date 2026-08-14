import React, { ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiHome, FiFileText, FiTruck, FiMapPin, 
    FiRepeat, FiLink, FiDatabase, FiUsers, 
    FiMenu, FiX, FiLogOut 
} from 'react-icons/fi';

interface Props {
    children: ReactNode;
    title?: string;
}

const navItems = [
    // Dashboard
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiHome, roles: ['admin'] },
    { href: '/operator/dashboard', label: 'Dashboard', icon: FiHome, roles: ['operator'] },
    { href: '/auditor/dashboard', label: 'Dashboard', icon: FiHome, roles: ['auditor'] },
    
    // Public User
    { href: '/registrations', label: 'Kendaraan Saya', icon: FiFileText, roles: ['public'] },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: FiRepeat, roles: ['public'] },
    
    // Admin features
    { href: '/admin/registrations', label: 'Review Pendaftaran', icon: FiFileText, roles: ['admin'] },
    { href: '/vehicles', label: 'Kendaraan', icon: FiTruck, roles: ['admin', 'operator'] },
    { href: '/admin/spbu', label: 'Manajemen SPBU', icon: FiMapPin, roles: ['admin'] },
    { href: '/users', label: 'Pengguna', icon: FiUsers, roles: ['admin'] },
    { href: '/transactions', label: 'Semua Transaksi', icon: FiRepeat, roles: ['admin'] },
    { href: '/blockchain', label: 'Blockchain', icon: FiLink, roles: ['admin', 'auditor'] },

    // Operator features
    { href: '/operator/validation', label: 'Validasi Kendaraan', icon: FiTruck, roles: ['operator'] },
    { href: '/operator/stock', label: 'Update Stok BBM', icon: FiDatabase, roles: ['operator'] },
    { href: '/transactions', label: 'Riwayat Transaksi', icon: FiRepeat, roles: ['operator'] },

    // Auditor features
    { href: '/auditor/transactions', label: 'Audit Transaksi', icon: FiFileText, roles: ['auditor'] },
];

export default function AppLayout({ children, title }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url, props } = usePage<any>();
    const user = props.auth.user;

    const visibleNavItems = navItems.filter(item => !user || item.roles.includes(user.role));

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-64 flex-shrink-0 flex flex-col bg-[#980f12] text-white shadow-xl relative z-20"
                    >
                        {/* Logo */}
                        <div className="flex flex-col gap-1.5 px-6 py-5 border-b border-red-900/50">
                            <img src="/images/logo web navbar.png" alt="PETROCHAIN Logo" className="h-10 object-contain self-start" />
                            <p className="text-[8px] text-white font-medium leading-tight opacity-90">
                                Advancing Transparent and Targeted Fuel Subsidies
                            </p>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {visibleNavItems.map((item) => {
                                const isActive = url.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition-all ${isActive ? 'bg-white text-[#980f12] font-bold shadow-md' : 'text-red-100 hover:bg-white/10'}`}
                                    >
                                        <Icon className={`text-xl ${isActive ? 'text-[#980f12]' : 'text-red-200'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Info */}
                        <div className="px-4 py-4 border-t border-red-900/50 bg-red-900/20">
                            <div className="flex items-center gap-3 p-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#980f12] text-sm font-bold shadow-sm uppercase">
                                    {user?.name?.substring(0, 2) || 'US'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-semibold truncate">{user?.name || 'Guest User'}</div>
                                    <div className="text-red-200 text-xs truncate capitalize">{user?.role || 'Guest'}</div>
                                </div>
                                <Link href="/logout" method="post" as="button" className="text-red-200 hover:text-white transition-colors p-2">
                                    <FiLogOut size={18} />
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Top Bar */}
                <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100"
                        >
                            {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                        </button>
                        {title && <h1 className="text-gray-800 font-bold text-xl">{title}</h1>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-primary border border-red-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            System Online
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
