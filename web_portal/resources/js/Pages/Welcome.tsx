import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiActivity, FiCheckCircle, FiSearch } from 'react-icons/fi';

export default function Welcome({ auth }: { auth: any }) {
    return (
        <div className="min-h-screen bg-gray-50 selection:bg-[#980f12] selection:text-white font-sans text-gray-900">
            <Head title="PETROCHAIN - Subsidi Tepat Sasaran" />

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#980f12] shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex flex-col justify-center">
                            <img src="/images/logo web navbar.png" alt="PETROCHAIN Logo" className="h-10 object-contain self-start mb-0.5" />
                            <p className="text-[8px] text-white/90 font-medium leading-tight">
                                Advancing Transparent and Targeted Fuel Subsidies
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href={route('public.stock')} className="text-sm font-semibold text-red-100 hover:text-white transition-colors">
                                Cek Stok SPBU
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-white text-[#980f12] px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-100 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Masuk Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-sm font-semibold text-red-100 hover:text-white transition-colors">
                                        Log in
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
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-100/40 via-gray-50 to-gray-50"></div>
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#980f12] text-xs font-bold tracking-wide uppercase mb-6 ring-1 ring-red-100">
                            <span className="w-2 h-2 rounded-full bg-[#980f12] animate-pulse"></span>
                            Ekosistem Distribusi Cerdas
                        </span>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                            Subsidi BBM Tepat <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#980f12] to-red-600">
                                Sasaran & Transparan
                            </span>
                        </h1>
                        
                        <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-600 mx-auto mb-10 leading-relaxed">
                            PETROCHAIN memperkuat distribusi BBM bersubsidi dengan validasi AI (YOLO & OCR) serta audit trail transparan, mendukung ekosistem MyPertamina.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('register')}
                                className="inline-flex justify-center items-center gap-2 bg-[#980f12] text-white px-8 py-4 rounded-full text-base font-bold shadow-xl shadow-red-900/20 hover:bg-red-800 transition-all hover:-translate-y-1"
                            >
                                Daftar Kendaraan <FiArrowRight />
                            </Link>
                            <Link
                                href={route('public.stock')}
                                className="inline-flex justify-center items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full text-base font-bold shadow-md ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50 transition-all"
                            >
                                <FiSearch /> Cek Ketersediaan SPBU
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-red-100 text-[#980f12] flex items-center justify-center text-2xl mb-6">
                                <FiCheckCircle />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Verifikasi AI Otomatis</h3>
                            <p className="text-gray-600 leading-relaxed">Pendaftaran kendaraan dipermudah dengan ekstraksi data STNK otomatis menggunakan teknologi OCR yang akurat.</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mb-6">
                                <FiShield />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Validasi Ganda SPBU</h3>
                            <p className="text-gray-600 leading-relaxed">Mencegah penyalahgunaan QR Code dengan pencocokan plat nomor fisik kendaraan secara real-time via kamera YOLO.</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center text-2xl mb-6">
                                <FiActivity />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Audit Transparan</h3>
                            <p className="text-gray-600 leading-relaxed">Setiap tetes BBM bersubsidi dicatat dalam log audit yang tidak dapat diubah untuk pengawasan pemerintah.</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 text-center text-gray-400">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="font-medium text-sm">
                        &copy; 2026 PETROCHAIN - TIMBERAPA Politeknik Negeri Lhokseumawe.<br/>
                        Sistem Pendukung Ekosistem MyPertamina.
                    </p>
                </div>
            </footer>
        </div>
    );
}
