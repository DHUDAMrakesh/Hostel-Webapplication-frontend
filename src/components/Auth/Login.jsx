import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from './AuthLayout';
import { useSettings } from '../../context/SettingsContext';
import GoogleAccountModal from './GoogleAccountModal';
import ForgotPasswordHelper from './ForgotPasswordHelper';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// Inline SVG icons for form fields
const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);

const EyeIcon = ({ open }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {open ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

const ShieldIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// Styled input with icon
function AuthInput({ icon, type = 'text', value, onChange, placeholder, required, maxLength, center, autoFocus, rightAction }) {
    return (
        <div style={{ position: 'relative', marginBottom: 12 }}>
            {/* Left icon */}
            <div style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center',
                pointerEvents: 'none',
            }}>
                {icon}
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                autoFocus={autoFocus}
                style={{
                    width: '100%',
                    padding: center ? '13px 50px' : '13px 50px 13px 44px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'white',
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    textAlign: center ? 'center' : 'left',
                    letterSpacing: center ? '0.5em' : 'normal',
                }}
                onFocus={e => {
                    e.target.style.borderColor = 'rgba(99,102,241,0.5)';
                    e.target.style.background = 'rgba(99,102,241,0.08)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.boxShadow = 'none';
                }}
            />
            {/* Right action (e.g. eye toggle) */}
            {rightAction && (
                <div style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}>
                    {rightAction}
                </div>
            )}
        </div>
    );
}

const Login = ({ onLogin, onSwitchToSignup }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    const handleAccountSelect = (account) => {
        setShowGoogleModal(false);
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); onLogin(account); }, 1000);
    };

    const btnStyle = {
        width: '100%',
        padding: '13px',
        borderRadius: 12,
        border: 'none',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: 'white',
        fontSize: 14.5,
        fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
        cursor: isLoading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 22px rgba(79,70,229,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s',
        letterSpacing: '-0.1px',
        marginBottom: 12,
    };

    return (
        <>
            <AuthLayout
                title={isMfaStep ? "Verify it's you" : "Welcome back"}
                subtitle={isMfaStep ? `A 6-digit code was sent to ${mfaEmail}` : "Sign in to continue to your dashboard."}
            >
                <AnimatePresence mode="wait">
                    {!isMfaStep ? (
                        <motion.form
                            key="login-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                        >
                            <AuthInput
                                icon={<MailIcon />}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                autoFocus
                            />
                            <AuthInput
                                icon={<LockIcon />}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                rightAction={
                                    <span onClick={() => setShowPassword(!showPassword)}>
                                        <EyeIcon open={showPassword} />
                                    </span>
                                }
                            />

                            {/* Forgot password */}
                            <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -4 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 13, color: 'rgba(255,255,255,0.4)',
                                        fontFamily: "'Inter', sans-serif", fontWeight: 500,
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{
                                            marginBottom: 14, padding: '10px 14px',
                                            borderRadius: 10, background: 'rgba(239,68,68,0.12)',
                                            border: '1px solid rgba(239,68,68,0.28)',
                                            color: '#fca5a5', fontSize: 13, fontWeight: 500,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}
                                    >
                                        <span>⚠</span> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                style={btnStyle}
                                whileHover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 28px rgba(79,70,229,0.5)' }}
                                whileTap={{ transform: 'translateY(0)' }}
                            >
                                {isLoading ? (
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                                ) : 'Sign in'}
                            </motion.button>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 12px' }}>
                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>OR</span>
                                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                            </div>

                            {/* Google */}
                            <motion.button
                                type="button"
                                onClick={() => setShowGoogleModal(true)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: 12,
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: 'white', fontSize: 14, fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    transition: 'all 0.2s',
                                }}
                                whileHover={{ background: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="mfa-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleVerify2FA}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16,
                                    background: 'rgba(79,70,229,0.15)',
                                    border: '1px solid rgba(79,70,229,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 12px', color: '#818cf8',
                                }}>
                                    <ShieldIcon />
                                </div>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                                    Enter the 6-digit code sent to<br />
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{mfaEmail}</span>
                                </p>
                            </div>

                            <AuthInput
                                icon={<ShieldIcon />}
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="• • • • • •"
                                maxLength={6}
                                required
                                center
                            />

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{
                                            marginBottom: 14, padding: '10px 14px',
                                            borderRadius: 10, background: 'rgba(239,68,68,0.12)',
                                            border: '1px solid rgba(239,68,68,0.28)',
                                            color: '#fca5a5', fontSize: 13,
                                        }}
                                    >
                                        ⚠ {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                style={{ ...btnStyle, marginTop: 4 }}
                                whileHover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 28px rgba(79,70,229,0.5)' }}
                                whileTap={{ transform: 'translateY(0)' }}
                            >
                                {isLoading ? (
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }} />
                                ) : 'Verify & Sign in'}
                            </motion.button>

                            <div style={{ textAlign: 'center', marginTop: 14 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsMfaStep(false)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 13, color: 'rgba(255,255,255,0.38)',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                    onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}
                                >
                                    ← Back to login
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </AuthLayout>

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
