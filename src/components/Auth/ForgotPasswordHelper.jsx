import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const ForgotPasswordHelper = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: New Password
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleClose = () => {
        setStep(1);
        setIdentifier('');
        setOtp('');
        setNewPassword('');
        setError('');
        setSuccess('');
        onClose();
    };

    if (!isOpen) return null;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/auth/forgot-password', { email: identifier });
            setSuccess(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { email: identifier, otp });
            setStep(3);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email: identifier, otp, newPassword });
            setSuccess('Password reset successfully!');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#2d2d2d] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 border border-white/10 p-8"
            >
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white">
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Enter OTP"}
                        {step === 3 && "New Password"}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                        {step === 1 && "Enter your email to receive an OTP."}
                        {step === 2 && `Code sent to ${identifier}`}
                        {step === 3 && "Create a strong password for your account."}
                    </p>
                </div>

                <form onSubmit={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword}>
                    {step === 1 && (
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Email Address"
                                className="w-full px-5 py-3.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all"
                                required
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="w-full px-5 py-3.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all text-center tracking-widest text-lg"
                                maxLength={6}
                                required
                            />
                            <button type="button" onClick={() => setStep(1)} className="text-xs text-brand-indigo hover:underline w-full text-center">
                                Change Email
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full px-5 py-3.5 rounded-xl bg-[#1e1e1e] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-4 text-center">
                            {error}
                        </motion.p>
                    )}

                    {success && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-xs mt-4 text-center">
                            {success}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-6 py-3.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold rounded-xl shadow-lg flex items-center justify-center transition-all"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            step === 1 ? "Send OTP" : step === 2 ? "Verify" : "Reset Password"
                        )}
                    </button>
                </form>

                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    ✕
                </button>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordHelper;
