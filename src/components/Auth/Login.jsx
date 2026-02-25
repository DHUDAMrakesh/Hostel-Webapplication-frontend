import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from './AuthLayout';
import { useSettings } from '../../context/SettingsContext';
import GoogleAccountModal from './GoogleAccountModal';
import ForgotPasswordHelper from './ForgotPasswordHelper';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Login = ({ onLogin, onSwitchToSignup }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { settings } = useSettings();
    const auth = useAuth();

    const [mfaEmail, setMfaEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isMfaStep, setIsMfaStep] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await auth.login(email, password);
            if (result.mfaRequired) {
                setMfaEmail(result.email);
                setIsMfaStep(true);
            } else {
                onLogin(result.user);
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await auth.verify2FA(mfaEmail, otp);
            onLogin(user);
        } catch (err) {
            setError(err.message || 'Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginClick = () => {
        setShowGoogleModal(true);
    };

    const handleAccountSelect = (account) => {
        setShowGoogleModal(false);
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onLogin(account);
        }, 1000);
    };

    return (
        <>
            <AuthLayout
                title={isMfaStep ? "Verify it's you" : "Welcome to HostelOS"}
                subtitle={isMfaStep ? `A code was sent to ${mfaEmail}` : "Find new ideas for your hostel management."}
            >
                {!isMfaStep ? (
                    <form onSubmit={handleSubmit} className="w-full">
                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                                required
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="text-right mb-4">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="text-sm font-semibold text-white/50 hover:text-white transition-colors"
                            >
                                Forgot your password?
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#E60023] hover:bg-[#ad081b] text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Log in"
                            )}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify2FA} className="w-full">
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit verification code"
                                className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px] text-center tracking-[0.5em] text-lg"
                                maxLength={6}
                                required
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Verify"
                            )}
                        </motion.button>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setIsMfaStep(false)}
                                className="text-sm font-semibold text-white/50 hover:text-white transition-colors"
                            >
                                Back to login
                            </button>
                        </div>
                    </form>
                )}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#1e1e1e] text-gray-400 font-medium">OR</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleGoogleLoginClick}
                    className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-full shadow-lg flex items-center justify-center gap-3 transition-all group"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </motion.button>


            </AuthLayout>

            {/* Modals */}
            <AnimatePresence>
                {showGoogleModal && (
                    <GoogleAccountModal
                        isOpen={showGoogleModal}
                        onClose={() => setShowGoogleModal(false)}
                        onSelectAccount={handleAccountSelect}
                    />
                )}
                {showForgotPassword && (
                    <ForgotPasswordHelper
                        isOpen={showForgotPassword}
                        onClose={() => setShowForgotPassword(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Login;
