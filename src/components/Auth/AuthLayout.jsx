import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden font-sans">
            {/* Background - Pinterest style masonry blur or abstract distinctive background */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center filter blur-xl scale-110" />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[480px] bg-[#1e1e1e] rounded-[32px] p-8 md:p-12 relative z-10 shadow-2xl border border-white/5 flex flex-col items-center text-center"
            >
                {/* Logo */}
                <div className="w-12 h-12 mb-6 text-3xl">
                    🏰
                </div>

                <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
                    {title}
                </h1>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto text-[15px] leading-relaxed">
                    {subtitle}
                </p>

                <div className="w-full">
                    {children}
                </div>

                <div className="mt-8 text-xs text-gray-500 font-medium">
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <span className="mx-2">•</span>
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
