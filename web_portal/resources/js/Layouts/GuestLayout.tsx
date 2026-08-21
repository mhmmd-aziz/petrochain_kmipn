import { Link } from '@inertiajs/react';
import React, { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-white text-gray-800 flex flex-col lg:flex-row relative font-sans select-none">
            {/* Left Brand Panel (Full Height on Desktop) */}
            <div className="w-full lg:w-5/12 bg-gradient-to-br from-[#800b0e] via-[#980f12] to-[#c9181b] text-white relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden flex-shrink-0">
                
                {/* Decorative background glow rings */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-red-400/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Nav / Home Link */}
                <div className="relative z-20">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-200/90 hover:text-white transition-colors group"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Kembali ke Beranda
                    </Link>
                </div>

                {/* Center Brand Identity */}
                <div className="relative z-20 flex flex-col items-center text-center my-auto py-3">
                    <span className="text-red-200 text-xs sm:text-sm font-medium tracking-wider mb-2.5 drop-shadow-sm">
                        Welcome to
                    </span>

                    {/* Floating Red Circular Badge */}
                    <Link href="/" className="group mb-3 block">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#980f12] rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.35)] flex items-center justify-center p-3 ring-4 ring-white/25 border-2 border-white/40 transform group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 overflow-hidden">
                            <img
                                src="/images/logoicon.png"
                                alt="Petrochain Icon"
                                className="w-full h-full object-contain filter drop-shadow-sm"
                            />
                        </div>
                    </Link>

                    {/* Brand Name */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wide mb-2 drop-shadow-md">
                        Petrochain
                    </h1>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-red-100/90 max-w-[280px] lg:max-w-[320px] leading-relaxed font-normal drop-shadow-sm">
                        Intelligent Verification & Blockchain Audit Trail for Transparent Fuel Subsidies.
                    </p>
                </div>

                {/* Bottom Footer Note inside Red Panel */}
                <div className="relative z-20 text-center text-[11px] text-red-200/75 hidden lg:block">
                    © 2026 Petrochain Ecosystem • TIMBERAPA
                </div>

                {/* Desktop Multi-layer Vertical Cloud Wave Transition (Edge-to-Edge) */}
                <div className="absolute top-0 right-0 h-full w-20 sm:w-28 lg:w-32 pointer-events-none hidden lg:block z-10 translate-x-[1px]">
                    <svg
                        viewBox="0 0 100 600"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Layer 1: Semi-transparent White (22% Opacity) */}
                        <path
                            d="M100,0 C60,50 25,110 50,180 C75,250 15,330 45,410 C75,490 25,540 55,600 L100,600 Z"
                            fill="white"
                            fillOpacity="0.22"
                        />
                        {/* Layer 2: Semi-transparent White (55% Opacity) */}
                        <path
                            d="M100,0 C72,70 40,140 65,210 C90,280 35,370 62,450 C90,520 45,565 72,600 L100,600 Z"
                            fill="white"
                            fillOpacity="0.55"
                        />
                        {/* Layer 3: Solid White (100% Opacity) */}
                        <path
                            d="M100,0 C84,90 55,170 80,250 C105,320 52,420 78,500 C98,555 70,580 88,600 L100,600 Z"
                            fill="white"
                        />
                    </svg>
                </div>

                {/* Mobile Multi-layer Horizontal Cloud Wave Transition */}
                <div className="absolute bottom-0 left-0 w-full h-10 sm:h-14 pointer-events-none lg:hidden -mb-[1px] z-10">
                    <svg
                        viewBox="0 0 600 100"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0,100 C50,60 110,25 180,50 C250,75 330,15 410,45 C490,75 540,25 600,55 L600,100 Z"
                            fill="white"
                            fillOpacity="0.22"
                        />
                        <path
                            d="M0,100 C70,72 140,40 210,65 C280,90 370,35 450,62 C520,90 565,45 600,72 L600,100 Z"
                            fill="white"
                            fillOpacity="0.55"
                        />
                        <path
                            d="M0,100 C90,84 170,55 250,80 C320,105 420,52 500,78 C555,98 580,70 600,88 L600,100 Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>

            {/* Right Form Panel (Full Height on Desktop, Centered Content) */}
            <div className="w-full lg:w-7/12 h-full bg-white flex flex-col justify-center px-6 py-6 sm:px-12 sm:py-8 lg:px-16 lg:py-10 overflow-y-auto relative z-0">
                <div className="w-full max-w-md mx-auto my-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}


