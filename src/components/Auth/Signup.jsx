import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from './AuthLayout';
import GoogleAccountModal from './GoogleAccountModal';
import { useAuth } from '../../context/AuthContext';

const Signup = ({ onSignup, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const auth = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await auth.register(formData.name, formData.email, formData.password);
            onSignup(user);
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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
            // Google sign-in is UI-only (no real OAuth). Treat as student.
            onSignup({ name: account.name, email: account.email, role: 'student' });
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <AuthLayout
                title="Sign up to explore"
                subtitle="Find new ideas for your hostel management."
            >
                <form onSubmit={handleSubmit} className="w-full">
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password (min 6 chars)"
                            className="w-full px-5 py-3.5 rounded-full bg-[#303030] border border-transparent text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-transparent focus:ring-2 focus:ring-white/10 transition-all font-medium text-[15px]"
                            required
                            minLength={6}
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

                    {/* Role note */}
                    <div className="mb-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                        🎓 New accounts are registered as <span className="text-white font-semibold">Student</span>. Contact an admin to be assigned Manager or Admin role.
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#E60023] hover:bg-[#ad081b] text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </motion.button>
                </form>

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
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </motion.button>

                <div className="mt-8 text-sm text-gray-400">
                    Already a member?{' '}
                    <button onClick={onSwitchToLogin} className="text-white font-semibold hover:underline">Log in</button>
                </div>
            </AuthLayout>

            <AnimatePresence>
                {showGoogleModal && (
                    <GoogleAccountModal
                        isOpen={showGoogleModal}
                        onClose={() => setShowGoogleModal(false)}
                        onSelectAccount={handleAccountSelect}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Signup;
