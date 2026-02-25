import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

/* ──────────────────────────────────────────────────
   Supported languages (UI label only)
────────────────────────────────────────────────── */
const LANGUAGES = ['English', 'हिन्दी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'ਪੰਜਾਬੀ', 'मराठी', 'ગુજરાતી'];
const CATEGORIES = ['maintenance', 'food', 'cleanliness', 'security', 'noise', 'other'];

/* ──────────────────────────────────────────────────
   Tiny shared input style
────────────────────────────────────────────────── */
const inputSx = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
    fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none',
    color: 'var(--text-primary)',
    boxSizing: 'border-box', transition: 'border 0.2s',
};

/* ──────────────────────────────────────────────────
   Toggle switch
────────────────────────────────────────────────── */
function Toggle({ value, onChange, accent = '#6366f1' }) {
    return (
        <div onClick={() => onChange(!value)}
            style={{ width: 40, height: 22, borderRadius: 11, background: value ? accent : 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: value ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Section heading
────────────────────────────────────────────────── */
function SectionLabel({ children }) {
    return <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px 6px' }}>{children}</div>;
}

/* ──────────────────────────────────────────────────
   Row button
────────────────────────────────────────────────── */
function PanelRow({ icon, label, onClick, danger, right, badge }) {
    const [hover, setHover] = useState(false);
    return (
        <div onClick={onClick}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', cursor: onClick ? 'pointer' : 'default', background: hover && onClick ? (danger ? 'rgba(225,29,72,0.06)' : 'rgba(99,102,241,0.05)') : 'transparent', transition: 'background 0.15s' }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: danger ? '#e11d48' : 'var(--text-primary)', flex: 1 }}>{label}</span>
            {badge && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontWeight: 700 }}>{badge}</span>}
            {right && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{right}</span>}
            {onClick && !right && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>›</span>}
        </div>
    );
}

/* ──────────────────────────────────────────────────
   Main Panel
────────────────────────────────────────────────── */
export default function StudentProfilePanel({ onClose, onThemeChange, theme }) {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const panelRef = useRef(null);

    // Sub-panel state
    const [view, setView] = useState('main'); // main | editProfile | changePassword | complaint | payments | settings | language

    // Prefs (localStorage persisted)
    const darkMode = theme === 'dark';
    const [twoFA, setTwoFA] = useState(false);
    const { language, changeLanguage, t } = useLanguage();

    // Data
    const [profile, setProfile] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [payments, setPayments] = useState([]);

    // Edit profile
    const [epName, setEpName] = useState('');
    const [epPhone, setEpPhone] = useState('');
    const [epSaving, setEpSaving] = useState(false);
    const [epMsg, setEpMsg] = useState('');

    // Change password
    const [cpCur, setCpCur] = useState('');
    const [cpNew, setCpNew] = useState('');
    const [cpConf, setCpConf] = useState('');
    const [cpSaving, setCpSaving] = useState(false);
    const [cpMsg, setCpMsg] = useState({ type: '', text: '' });
    const [showPasswords, setShowPasswords] = useState(false);

    // Complaint
    const [cTitle, setCTitle] = useState('');
    const [cDesc, setCDesc] = useState('');
    const [cCat, setCCat] = useState('maintenance');
    const [cSaving, setCSaving] = useState(false);
    const [cMsg, setCMsg] = useState({ type: '', text: '' });

    // 2FA Verification
    const [v2faOtp, setV2faOtp] = useState('');
    const [v2faSaving, setV2faSaving] = useState(false);
    const [v2faMsg, setV2faMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        api.get('/student/me').then(r => {
            setProfile(r.data);
            setEpName(r.data?.name || user?.name || '');
            setEpPhone(r.data?.phone || '');
            setPayments([...(r.data?.payments || [])].reverse());
            // Link 2FA state to backend user account (assumed to be populated or verified)
            // Actually Student model has userId, but student/me should return populated user or we fetch separately.
            // Let's assume student/me returns user object or we fetch /auth/me
        }).catch(console.error);

        api.get('/auth/me').then(r => {
            setTwoFA(r.data.is2FAEnabled);
        }).catch(console.error);

        api.get('/student/complaints').then(r => setComplaints(r.data)).catch(console.error);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleTheme = (val) => {
        onThemeChange(val ? 'dark' : 'light');
    };

    const handleTwoFA = async (val) => {
        if (val) {
            // Request setup
            try {
                await api.post('/auth/2fa/request-setup');
                setV2faOtp('');
                setV2faMsg({ type: '', text: '' });
                setView('verify2FA');
            } catch (e) {
                console.error('Failed to request 2FA setup:', e.response?.data || e.message);
                alert('Failed to send verification code.');
            }
        } else {
            // Simple toggle for disabling
            try {
                const res = await api.patch('/auth/2fa/toggle', { enabled: val });
                setTwoFA(res.data.is2FAEnabled);
            } catch (e) {
                console.error('Failed to disable 2FA:', e.response?.data || e.message);
                alert('Failed to disable 2FA.');
            }
        }
    };

    const confirmTwoFA = async () => {
        if (!v2faOtp) return;
        setV2faSaving(true);
        setV2faMsg({ type: '', text: '' });
        try {
            const res = await api.post('/auth/2fa/confirm-setup', { otp: v2faOtp });
            setTwoFA(res.data.is2FAEnabled);
            setV2faMsg({ type: 'ok', text: '✓ 2FA enabled successfully!' });
            setTimeout(() => setView('main'), 1500);
        } catch (e) {
            setV2faMsg({ type: 'err', text: e.response?.data?.message || 'Verification failed.' });
        } finally {
            setV2faSaving(false);
        }
    };

    const handleLanguage = (lang) => {
        changeLanguage(lang); // updates context + localStorage for all components
        setView('main');
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const saveProfile = async () => {
        setEpSaving(true); setEpMsg('');
        try {
            await api.patch('/student/profile', { name: epName, phone: epPhone });
            // Update auth context so the name is reflected everywhere immediately
            updateUser({ name: epName });
            setProfile(prev => ({ ...prev, name: epName, phone: epPhone }));
            setEpMsg('✓ Profile updated!');
            setTimeout(() => { setEpMsg(''); setView('main'); }, 1500);
        } catch (e) { setEpMsg('⚠ ' + (e.response?.data?.message || 'Failed')); }
        finally { setEpSaving(false); }
    };

    const savePassword = async () => {
        setCpMsg({ type: '', text: '' });
        if (cpNew !== cpConf) { setCpMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
        if (cpNew.length < 6) { setCpMsg({ type: 'err', text: 'Min 6 characters.' }); return; }
        setCpSaving(true);
        try {
            await api.patch('/student/password', { currentPassword: cpCur, newPassword: cpNew });
            setCpMsg({ type: 'ok', text: '✓ Password changed!' });
            setCpCur(''); setCpNew(''); setCpConf('');
            setTimeout(() => { setCpMsg({ type: '', text: '' }); setView('main'); }, 1800);
        } catch (e) { setCpMsg({ type: 'err', text: e.response?.data?.message || 'Failed.' }); }
        finally { setCpSaving(false); }
    };

    const saveComplaint = async () => {
        setCMsg({ type: '', text: '' });
        if (!cTitle.trim() || !cDesc.trim()) { setCMsg({ type: 'err', text: 'Title and description required.' }); return; }
        setCSaving(true);
        try {
            await api.post('/student/complaints', { title: cTitle, description: cDesc, category: cCat });
            setCMsg({ type: 'ok', text: '✓ Complaint submitted!' });
            setCTitle(''); setCDesc(''); setCCat('maintenance');
            setTimeout(() => { setCMsg({ type: '', text: '' }); setView('main'); }, 1800);
        } catch (e) { setCMsg({ type: 'err', text: e.response?.data?.message || 'Failed.' }); }
        finally { setCSaving(false); }
    };

    /* ── Header avatar initials ── */
    const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

    /* ── Shared sub-header ── */
    const SubHeader = ({ title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setView('main')} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
    );

    /* ── Inline message ── */
    const Msg = ({ msg, type }) => msg ? (
        <div style={{ margin: '8px 20px', padding: '8px 12px', borderRadius: 8, background: type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(225,29,72,0.07)', border: `1px solid ${type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(225,29,72,0.2)'}`, fontSize: 12, color: type === 'ok' ? '#059669' : '#e11d48' }}>
            {msg}
        </div>
    ) : null;

    /* ── Save button ── */
    const SaveBtn = ({ onClick, saving, label = 'Save Changes', color = '#6366f1' }) => (
        <div style={{ padding: '10px 20px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} disabled={saving}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : label}
            </motion.button>
        </div>
    );

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none' }}>
                <motion.div ref={panelRef}
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    style={{ position: 'absolute', top: 0, right: 0, width: 320, height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', boxShadow: '-8px 0 40px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', pointerEvents: 'all', overflowY: 'auto' }}>

                    {/* ─── MAIN VIEW ─── */}
                    <AnimatePresence mode="wait">
                        {view === 'main' && (
                            <motion.div key="main" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }} style={{ flex: 1 }}>
                                {/* Panel header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</span>
                                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                                </div>

                                {/* Profile card */}
                                <div style={{ padding: '20px', background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(168,85,247,0.04))', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                                            {initials}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 700 }}>Student</span>
                                                {profile?.roomNumber && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 700 }}>Room {profile.roomNumber}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Quick stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
                                        {[
                                            { label: 'Dues', value: profile ? `₹${profile.feeDues || 0}` : '—', color: profile?.feeDues > 0 ? '#e11d48' : '#10b981' },
                                            { label: 'Payments', value: profile?.payments?.length || 0, color: '#0891b2' },
                                            { label: 'Complaints', value: openComplaints, color: '#f59e0b' },
                                        ].map(s => (
                                            <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                                                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Account */}
                                <SectionLabel>Account</SectionLabel>
                                <PanelRow icon="📝" label="Edit Profile" onClick={() => setView('editProfile')} />
                                <PanelRow icon="🔒" label="Change Password" onClick={() => setView('changePassword')} />
                                <PanelRow icon="🔐" label="Two-Factor Auth (2FA)"
                                    right={<Toggle value={twoFA} onChange={handleTwoFA} />} />

                                {/* Activity */}
                                <SectionLabel>Activity</SectionLabel>
                                <PanelRow icon="💬" label="Raise Complaint" onClick={() => setView('complaint')} badge={openComplaints > 0 ? openComplaints : null} />
                                <PanelRow icon="💳" label="View Payment History" onClick={() => setView('payments')} badge={payments.length || null} />

                                {/* Preferences */}
                                <SectionLabel>Preferences</SectionLabel>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px' }}>
                                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{darkMode ? '🌙' : '☀️'}</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>Dark Mode</span>
                                    <Toggle value={darkMode} onChange={handleTheme} />
                                </div>
                                <PanelRow icon="🌐" label="Language" right={language} onClick={() => setView('language')} />
                                <PanelRow icon="⚙" label="Settings" onClick={() => { navigate('/student/home'); onClose(); }} />

                                {/* Logout */}
                                <SectionLabel>Session</SectionLabel>
                                <PanelRow icon="↪" label="Logout" onClick={handleLogout} danger />
                                <div style={{ height: 20 }} />
                            </motion.div>
                        )}

                        {/* ─── EDIT PROFILE ─── */}
                        {view === 'editProfile' && (
                            <motion.div key="editProfile" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Edit Profile" />
                                <div style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Full Name</label>
                                        <input value={epName} onChange={e => setEpName(e.target.value)} style={inputSx} placeholder="Enter your full name" />
                                    </div>
                                    <div style={{ marginBottom: 15 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Email</label>
                                        <input value={user?.email} disabled style={{ ...inputSx, background: 'var(--bg-base)', opacity: 0.6, color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                                    </div>
                                    <div style={{ marginBottom: 15 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Phone Number</label>
                                        <input value={epPhone} onChange={e => setEpPhone(e.target.value)} style={inputSx} placeholder="Enter phone number" />
                                    </div>
                                    {profile?.roomNumber && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Room</label>
                                                <input value={`Room ${profile.roomNumber}`} disabled style={{ ...inputSx, background: 'var(--bg-base)', opacity: 0.6, color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Msg msg={epMsg} type={epMsg.startsWith('✓') ? 'ok' : 'err'} />
                                <SaveBtn onClick={saveProfile} saving={epSaving} />
                            </motion.div>
                        )}

                        {/* ─── CHANGE PASSWORD ─── */}
                        {view === 'changePassword' && (
                            <motion.div key="changePassword" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Change Password" />
                                <div style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
                                    {[
                                        { label: 'Current Password', value: cpCur, set: setCpCur },
                                        { label: 'New Password', value: cpNew, set: setCpNew },
                                        { label: 'Confirm New', value: cpConf, set: setCpConf },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                                            <input type={showPasswords ? 'text' : 'password'} value={f.value} onChange={e => f.set(e.target.value)} style={inputSx} placeholder="••••••••" />
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input type="checkbox" id="showPw" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} style={{ cursor: 'pointer' }} />
                                        <label htmlFor="showPw" style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Show passwords</label>
                                    </div>
                                </div>
                                <Msg msg={cpMsg.text} type={cpMsg.type === 'ok' ? 'ok' : 'err'} />
                                <SaveBtn onClick={savePassword} saving={cpSaving} label="Update Password" color="#e11d48" />
                            </motion.div>
                        )}

                        {/* ─── RAISE COMPLAINT ─── */}
                        {view === 'complaint' && (
                            <motion.div key="complaint" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Raise a Complaint" />
                                <div style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
                                    <div style={{ marginBottom: 15 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Category</label>
                                        <select value={cCat} onChange={e => setCCat(e.target.value)} style={inputSx}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: 15 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Title *</label>
                                        <input value={cTitle} onChange={e => setCTitle(e.target.value)} style={inputSx} placeholder="Brief subject" />
                                    </div>
                                    <div style={{ marginBottom: 18 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Description *</label>
                                        <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} style={{ ...inputSx, height: 100, resize: 'none' }} placeholder="Provide more details..." />
                                    </div>
                                </div>
                                <Msg msg={cMsg.text} type={cMsg.type} />
                                <SaveBtn onClick={saveComplaint} saving={cSaving} label="Submit Complaint" color="#f59e0b" />
                            </motion.div>
                        )}

                        {/* ─── PAYMENT HISTORY ─── */}
                        {view === 'payments' && (
                            <motion.div key="payments" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Payment History" />
                                {payments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', fontSize: 13 }}>No payments recorded yet.</div>
                                ) : (
                                    <div>
                                        {payments.map((p, i) => (
                                            <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.month || 'Payment'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.method} · {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>₹{p.amount.toLocaleString()}</div>
                                                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>{p.status.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Total Paid</span>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>₹{payments.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ─── LANGUAGE ─── */}
                        {view === 'language' && (
                            <motion.div key="language" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Choose Language" />
                                {LANGUAGES.map(lang => (
                                    <div key={lang} onClick={() => handleLanguage(lang)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', cursor: 'pointer', background: language === lang ? 'rgba(99,102,241,0.07)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                        <span style={{ fontSize: 14, color: language === lang ? '#6366f1' : 'var(--text-primary)', fontWeight: language === lang ? 700 : 400 }}>{lang}</span>
                                        {language === lang && <span style={{ color: '#6366f1', fontSize: 16 }}>✓</span>}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        {/* ─── VERIFY 2FA ─── */}
                        {view === 'verify2FA' && (
                            <motion.div key="verify2FA" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
                                <SubHeader title="Verify 2FA Setup" />
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, marginBottom: 16 }}>🔐</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                                        A 6-digit verification code has been sent to your email. Enter it below to enable 2FA.
                                    </p>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={v2faOtp}
                                        onChange={e => setV2faOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ ...inputSx, textAlign: 'center', fontSize: 20, letterSpacing: '0.4em', height: 48 }}
                                        placeholder="000000"
                                    />
                                    <Msg msg={v2faMsg.text} type={v2faMsg.type} />
                                    <div style={{ height: 12 }} />
                                    <SaveBtn onClick={confirmTwoFA} saving={v2faSaving} label="Confirm & Enable 2FA" />
                                    <button
                                        onClick={() => setView('main')}
                                        style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', marginTop: 12, cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
