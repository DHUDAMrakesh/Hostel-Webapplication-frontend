import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleAccountModal = ({ isOpen, onClose, onSelectAccount }) => {
    const [view, setView] = useState('list'); // 'list' | 'add-email' | 'add-password'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    if (!isOpen) return null;

    const handleNext = () => {
        if (view === 'add-email') {
            if (!validateEmail(email)) {
                setError('Please enter a valid email address.');
                return;
            }
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                setView('add-password');
            }, 1000);
        } else if (view === 'add-password') {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                // Verify and add account
                const newAccount = {
                    id: Date.now(),
                    name: 'New User',
                    email: email,
                    avatar: email.charAt(0).toUpperCase()
                };
                onSelectAccount(newAccount);
                // Reset for next time
                setTimeout(() => {
                    setView('list');
                    setEmail('');
                    setError('');
                    setPassword('');
                }, 500);
            }, 1500);
        }
    };

    const handleBack = () => {
        setError('');
        if (view === 'add-password') setView('add-email');
        else if (view === 'add-email') setView('list');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#2d2d2d] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white/10"
            >
                <div className="p-6 pb-2 min-h-[320px] flex flex-col">
                    <div className="flex justify-center mb-6">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-medium text-white text-center mb-1">
                        {view === 'list' ? 'Choose an account' : 'Sign in'}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-6">
                        {view === 'list' ? 'to continue to HostelOS' : 'with your Google Account'}
                    </p>

                    {view === 'list' && (
                        <div className="flex-1 overflow-y-auto -mx-6 px-6">
                            {[
                                { id: 1, name: 'Admin User', email: 'admin@hostel.com', avatar: 'A' },
                                { id: 2, name: 'Warden Smith', email: 'warden@hostel.com', avatar: 'W' },
                                { id: 3, name: 'Student Services', email: 'students@hostel.com', avatar: 'S' },
                            ].map((acc) => (
                                <button
                                    key={acc.id}
                                    onClick={() => onSelectAccount(acc)}
                                    className="w-full py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 rounded-lg px-2 -mx-2"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {acc.avatar}
                                    </div>
                                    <div className="truncate">
                                        <div className="text-white text-sm font-medium truncate">{acc.name}</div>
                                        <div className="text-gray-400 text-xs truncate">{acc.email}</div>
                                    </div>
                                </button>
                            ))}

                            <button
                                onClick={() => setView('add-email')}
                                className="w-full py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left rounded-lg px-2 -mx-2 mt-2"
                            >
                                <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="text-white text-sm font-medium">Use another account</div>
                            </button>
                        </div>
                    )}

                    {view !== 'list' && (
                        <div className="flex-1 flex flex-col">
                            <div className="space-y-4">
                                {view === 'add-email' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (error) setError('');
                                            }}
                                            placeholder="Email or phone"
                                            className={`w-full px-5 py-3.5 rounded-full bg-[#303030] border ${error ? 'border-red-500' : 'border-transparent'} text-white placeholder-gray-500 focus:outline-none focus:bg-transparent transition-all font-medium text-[15px] ${error ? 'focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'focus:border-white/20 focus:ring-2 focus:ring-white/10'}`}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleNext();
                                            }}
                                        />
                                        {error && (
                                            <div className="flex items-center gap-2 mt-2 text-red-500 text-xs px-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {view === 'add-password' && (
                                    <>
                                        <div className="flex items-center gap-2 border border-white/10 rounded-full py-1 px-3 w-fit mx-auto mb-4 bg-white/5 cursor-pointer" onClick={() => setView('add-email')}>
                                            <div className="w-5 h-5 rounded-full bg-brand-indigo text-[10px] flex items-center justify-center font-bold text-white">
                                                {email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-white break-all">{email}</span>
                                            <span className="text-[10px] text-white">▼</span>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                                                autoFocus
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between items-center pt-8">
                                    <button onClick={handleBack} className="text-white text-sm font-medium hover:text-gray-300">
                                        {view === 'add-email' ? 'Create account' : 'Forgot password?'}
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!email || (view === 'add-password' && !password) || isLoading}
                                        className="px-8 py-3 bg-[#E60023] hover:bg-[#ad081b] text-white font-bold rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoading && <div className="w-4 h-4 border-1 border-white/30 border-t-white rounded-full animate-spin" />}
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GoogleAccountModal;
