import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    isVisible: boolean;
    text?: string;
}

export default function LoadingOverlay({ isVisible, text = 'Memproses data...' }: Props) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100">
                        {/* Spinning red animation */}
                        <div className="relative flex justify-center items-center w-16 h-16">
                            <div className="absolute inset-0 border-4 border-red-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#980f12] rounded-full border-t-transparent animate-spin"></div>
                            <div className="w-2 h-2 bg-[#980f12] rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-gray-700 font-medium text-sm animate-pulse">{text}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
