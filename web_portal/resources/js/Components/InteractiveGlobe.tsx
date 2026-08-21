import React, { useEffect, useRef, useState } from 'react';
import createGlobe, { Globe } from 'cobe';
import { FiGlobe, FiMapPin, FiShield } from 'react-icons/fi';

interface InteractiveGlobeProps {
    className?: string;
    showCardOverlay?: boolean;
}

export default function InteractiveGlobe({ className = '', showCardOverlay = true }: InteractiveGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const [activeNodeIndex, setActiveNodeIndex] = useState(0);

    const nationalNodes = [
        { name: 'Depot TBBM Krueng Raya', city: 'Banda Aceh', lat: 5.5483, lon: 95.3238, type: 'Depot Hulu', status: 'Online' },
        { name: 'Terminal BBM Medan Labuhan', city: 'Medan', lat: 3.5952, lon: 98.6722, type: 'Depot Transit', status: 'Online' },
        { name: 'Central National Command Node', city: 'Jakarta HQ', lat: -6.2088, lon: 106.8456, type: 'Hyperledger Hub', status: 'Online' },
        { name: 'Kilang RU V Balikpapan', city: 'Balikpapan', lat: -1.2379, lon: 116.8289, type: 'Kilang Induk', status: 'Online' },
        { name: 'Depot Transit Perak', city: 'Surabaya', lat: -7.2575, lon: 112.7521, type: 'Hub Distribusi', status: 'Online' },
        { name: 'Integrated Terminal Makassar', city: 'Makassar', lat: -5.1477, lon: 119.4327, type: 'Hub Indonesia Timur', status: 'Online' },
        { name: 'Fuel Terminal Jayapura', city: 'Papua', lat: -2.5489, lon: 140.7181, type: 'Hub Perbatasan', status: 'Online' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNodeIndex((prev) => (prev + 1) % nationalNodes.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let phi = 1.8; // Centered on Indonesian Longitude (105-120° East)
        let width = 0;
        let animationFrameId: number;
        let globe: Globe | null = null;

        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth;
            }
        };
        window.addEventListener('resize', onResize);
        onResize();

        if (canvasRef.current) {
            globe = createGlobe(canvasRef.current, {
                devicePixelRatio: 2,
                width: width * 2 || 800,
                height: width * 2 || 800,
                phi: phi,
                theta: 0.2,
                dark: 0, // Clean light mode
                diffuse: 1.2,
                mapSamples: 20000,
                mapBrightness: 6,
                baseColor: [0.82, 0.86, 0.90], // Crisp dots for landmass
                markerColor: [0.95, 0.10, 0.15], // Bright neon crimson red [#e53935]
                glowColor: [1, 0.88, 0.88], // Subtle red halo glow
                arcColor: [0.95, 0.15, 0.2], // Connecting laser arcs
                arcWidth: 1.5,
                arcHeight: 0.3,
                markers: [
                    { location: [5.5483, 95.3238], size: 0.09 },   // Banda Aceh
                    { location: [3.5952, 98.6722], size: 0.08 },   // Medan
                    { location: [1.1301, 104.0529], size: 0.07 },  // Batam
                    { location: [-2.9761, 104.7754], size: 0.08 }, // Palembang
                    { location: [-6.2088, 106.8456], size: 0.12 }, // Jakarta HQ (Primary Node)
                    { location: [-6.9175, 107.6191], size: 0.07 }, // Bandung
                    { location: [-6.9667, 110.4167], size: 0.07 }, // Semarang
                    { location: [-7.2575, 112.7521], size: 0.10 }, // Surabaya
                    { location: [-8.6705, 115.2126], size: 0.07 }, // Denpasar
                    { location: [-1.2379, 116.8289], size: 0.11 }, // Balikpapan (RU V Kilang)
                    { location: [-3.3194, 114.5908], size: 0.07 }, // Banjarmasin
                    { location: [-5.1477, 119.4327], size: 0.10 }, // Makassar
                    { location: [-3.6954, 128.1814], size: 0.07 }, // Ambon
                    { location: [-0.8615, 131.2580], size: 0.07 }, // Sorong
                    { location: [-2.5489, 140.7181], size: 0.09 }, // Jayapura
                ],
                arcs: [
                    { from: [-1.2379, 116.8289], to: [-6.2088, 106.8456] }, // Balikpapan -> Jakarta
                    { from: [-1.2379, 116.8289], to: [-7.2575, 112.7521] }, // Balikpapan -> Surabaya
                    { from: [-1.2379, 116.8289], to: [-5.1477, 119.4327] }, // Balikpapan -> Makassar
                    { from: [3.5952, 98.6722], to: [5.5483, 95.3238] },     // Medan -> Aceh
                    { from: [-6.2088, 106.8456], to: [-2.9761, 104.7754] }, // Jakarta -> Palembang
                    { from: [-5.1477, 119.4327], to: [-2.5489, 140.7181] }, // Makassar -> Jayapura
                ],
            });

            // Smooth continuous rotation loop using v2 update API
            const animate = () => {
                if (pointerInteracting.current === null) {
                    phi += 0.0035;
                }
                const effectivePhi = phi + pointerInteractionMovement.current;
                const currentWidth = canvasRef.current ? canvasRef.current.offsetWidth : width;

                globe?.update({
                    phi: effectivePhi,
                    width: (currentWidth || 400) * 2,
                    height: (currentWidth || 400) * 2,
                });

                animationFrameId = requestAnimationFrame(animate);
            };

            animate();
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (globe) {
                globe.destroy();
            }
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div className={`relative flex flex-col items-center justify-center select-none overflow-hidden ${className}`}>
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-radial from-red-500/5 via-transparent to-transparent pointer-events-none rounded-full blur-2xl"></div>

            {/* 3D Canvas with drag interaction */}
            <div 
                className="relative w-full max-w-[420px] sm:max-w-[480px] aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta * 0.005;
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta * 0.005;
                    }
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full opacity-95 transition-opacity duration-500"
                    style={{ width: '100%', height: '100%', contain: 'layout paint size' }}
                />

                {/* Floating Micro-Badge Top Left: Live Status */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-xs flex items-center gap-2 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[11px] font-mono font-bold text-gray-800">
                        7.280+ SPBU Online
                    </span>
                </div>

                {/* Floating Micro-Badge Top Right: Consensus Ledger */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-xs flex items-center gap-1.5 pointer-events-none">
                    <FiShield className="text-[#980f12] text-xs" />
                    <span className="text-[11px] font-mono font-bold text-gray-800">
                        Fabric RAFT Active
                    </span>
                </div>
            </div>

            {/* Bottom Floating Active Node HUD Card */}
            {showCardOverlay && (
                <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-gray-200 shadow-sm mt-2 relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center font-bold text-base border border-red-100 flex-shrink-0">
                            <FiMapPin />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-red-600 uppercase">
                                    {nationalNodes[activeNodeIndex].type}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </div>
                            <div className="text-xs font-black text-gray-900 leading-tight">
                                {nationalNodes[activeNodeIndex].name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">
                                Wilayah: {nationalNodes[activeNodeIndex].city}
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <span className="text-[9px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                            Node #{activeNodeIndex + 1}/7
                        </span>
                        <div className="text-[10px] font-mono font-semibold text-emerald-600 mt-1">
                            Latency: 18ms
                        </div>
                    </div>
                </div>
            )}
            
            <p className="text-[11px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                <FiGlobe size={11} /> Geser bola dunia 3D untuk melihat rotasi node nasional
            </p>
        </div>
    );
}
