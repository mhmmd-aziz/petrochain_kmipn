import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding/Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <img 
                    src="/images/dashboard_banner.jpg" 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="relative z-20 text-center px-12 flex flex-col items-center">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 transform transition-transform hover:scale-105">
                        <img src="/images/logo web.png" alt="Logo" className="w-56 mx-auto object-contain" />
                    </div>
                    <h1 className="text-white text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg leading-tight">
                        Welcome to<br/>Petrochain
                    </h1>
                    <p className="text-white/95 text-xl font-medium leading-relaxed max-w-md mx-auto drop-shadow-md">
                        Secure, transparent, and intelligent fuel supply chain management system.
                    </p>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 bg-gray-50 relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[100px]"></div>
                </div>

                <div className="mx-auto w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/">
                            <div className="bg-white p-4 rounded-2xl shadow-xl transform transition-transform hover:scale-105">
                                <img src="/images/logo web.png" alt="Logo" className="h-16 object-contain" />
                            </div>
                        </Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl border border-white transition-all hover:shadow-[0_8px_30px_rgba(229,57,53,0.15)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
