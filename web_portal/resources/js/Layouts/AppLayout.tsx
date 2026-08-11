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
    { href: '/dashboard', label: 'Dashboard', icon: FiHome, roles: ['admin', 'operator', 'auditor'] },
    { href: '/registrations', label: 'Pendaftaran', icon: FiFileText, roles: ['admin'] },
    { href: '/vehicles', label: 'Kendaraan', icon: FiTruck, roles: ['admin', 'operator'] },
    { href: '/spbu', label: 'SPBU', icon: FiMapPin, roles: ['admin', 'auditor'] },
    { href: '/transactions', label: 'Transaksi', icon: FiRepeat, roles: ['admin', 'operator', 'auditor'] },
    { href: '/blockchain', label: 'Blockchain', icon: FiLink, roles: ['admin', 'auditor'] },
    { href: '/fuel-stock', label: 'Stok BBM', icon: FiDatabase, roles: ['admin', 'operator'] },
    { href: '/users', label: 'Pengguna', icon: FiUsers, roles: ['admin'] },
];

export default function AppLayout({ children, title }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url } = usePage();

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
                        className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 shadow-sm relative z-20"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-primary shadow-md">
                                PC
                            </div>
                            <div>
                                <div className="text-gray-900 font-bold text-sm tracking-wide">PETROCHAIN</div>
                                <div className="text-xs text-gray-500">MyPertamina Ext.</div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = url.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm ${isActive ? 'active' : 'text-gray-600'}`}
                                    >
                                        <Icon className={`text-lg ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Info */}
                        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3 p-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-primary shadow-sm">
                                    AD
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-gray-900 text-sm font-semibold truncate">Admin Pusat</div>
                                    <div className="text-xs text-gray-500 truncate">admin@petrochain.id</div>
                                </div>
                                <Link href="/logout" method="post" as="button" className="text-gray-400 hover:text-primary transition-colors p-2">
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
