import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/* ─── Shared style tokens ─── */
const inputSx = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
    fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none',
    color: 'var(--text-primary)', boxSizing: 'border-box', transition: 'border 0.2s',
};

const lbl = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
    display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

/* ─── Toggle ─── */
function Toggle({ value, onChange, accent = '#6366f1' }) {
    return (
        <div
            onClick={() => onChange(!value)}
            style={{
                width: 40, height: 22, borderRadius: 11,
                background: value ? accent : 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)', cursor: 'pointer',
                position: 'relative', transition: 'background 0.25s', flexShrink: 0,
            }}
        >
            <div style={{
                position: 'absolute', top: 3, left: value ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            }} />
        </div>
    );
}

/* ─── Section label ─── */
const SectionLabel = ({ children }) => (
    <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '14px 20px 6px',
    }}>{children}</div>
);

/* ─── Panel row ─── */
function PanelRow({ icon, label, onClick, danger, right, badge, sub }) {
    const [hover, setHover] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sub ? '9px 20px' : '11px 20px',
                cursor: onClick ? 'pointer' : 'default',
                background: hover && onClick
                    ? (danger ? 'rgba(225,29,72,0.06)' : 'rgba(99,102,241,0.05)')
                    : 'transparent',
                transition: 'background 0.15s',
            }}
        >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{
                fontSize: sub ? 12 : 13, fontWeight: 500,
                color: danger ? '#e11d48' : 'var(--text-primary)', flex: 1,
            }}>{label}</span>
            {badge && (
                <span style={{
                    fontSize: 11, padding: '2px 7px', borderRadius: 20,
                    background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontWeight: 700,
                }}>{badge}</span>
            )}
            {right && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{right}</span>}
            {onClick && !right && !badge && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>›</span>}
        </div>
    );
}

/* ─── Inline message ─── */
const Msg = ({ msg, type }) => msg ? (
    <div style={{
        margin: '8px 20px', padding: '8px 12px', borderRadius: 8,
        background: type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(225,29,72,0.07)',
        border: `1px solid ${type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(225,29,72,0.2)'}`,
        fontSize: 12, color: type === 'ok' ? '#059669' : '#e11d48',
    }}>{msg}</div>
) : null;

/* ─── Save button ─── */
const SaveBtn = ({ onClick, saving, label = 'Save Changes', color = '#6366f1' }) => (
    <div style={{ padding: '10px 20px' }}>
        <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onClick} disabled={saving}
            style={{
                width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                color: '#fff', fontSize: 13, fontWeight: 700,
                fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
            }}
        >
            {saving ? 'Saving…' : label}
        </motion.button>
    </div>
);

/* ─── Stat chip ─── */
const StatChip = ({ label, value, color, icon }) => (
    <div style={{
        textAlign: 'center', padding: '10px 6px',
        background: 'var(--bg-elevated)', borderRadius: 12,
        border: '1px solid var(--border-subtle)',
    }}>
        <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
    </div>
);

/* ─── Main AdminProfilePanel ─── */
export default function AdminProfilePanel({ onClose, onThemeChange, theme }) {
    const { user, logout, updateUser } = useAuth();
    const { language, changeLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const panelRef = useRef(null);

    const role = user?.role || 'admin';
    const darkMode = theme === 'dark';
    const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Views
    const [view, setView] = useState('main'); // main | editProfile | changePassword | language | verify2FA

    // Stats
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [twoFA, setTwoFA] = useState(false);

    // Edit profile state
    const [epName, setEpName] = useState(user?.name || '');
    const [epPhone, setEpPhone] = useState('');
    const [epOrg, setEpOrg] = useState('');
    const [epSaving, setEpSaving] = useState(false);
    const [epMsg, setEpMsg] = useState({ type: '', text: '' });

    // Change password state
    const [cpCur, setCpCur] = useState('');
    const [cpNew, setCpNew] = useState('');
    const [cpConf, setCpConf] = useState('');
    const [cpSaving, setCpSaving] = useState(false);
    const [cpMsg, setCpMsg] = useState({ type: '', text: '' });
    const [showPw, setShowPw] = useState(false);

    // 2FA verify
    const [v2faOtp, setV2faOtp] = useState('');
    const [v2faSaving, setV2faSaving] = useState(false);
    const [v2faMsg, setV2faMsg] = useState({ type: '', text: '' });

    const LANGUAGES = ['English', 'हिन्दी', 'தமிழ்', 'తెలుగు'];

    /* ── Load data on mount ── */
    useEffect(() => {
        // Load dashboard stats
        api.get('/stats').then(r => setStats(r.data)).catch(() => { });

        // Load recent complaints (last 5)
        api.get('/complaints').then(r => setRecentComplaints(r.data.slice(0, 5))).catch(() => { });

        // Load 2FA status
        api.get('/auth/me').then(r => {
            setTwoFA(r.data.is2FAEnabled);
            setEpPhone(r.data.phone || '');
            setEpOrg(r.data.organization || '');
        }).catch(() => { });
    }, []);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = e => {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleLogout = () => { logout(); navigate('/login'); };

    /* ── Edit Profile ── */
    const saveProfile = async () => {
        setEpSaving(true);
        setEpMsg({ type: '', text: '' });
        try {
            await api.patch('/auth/profile', { name: epName, phone: epPhone, organization: epOrg });
            updateUser({ name: epName });
            setEpMsg({ type: 'ok', text: '✓ Profile updated successfully!' });
            setTimeout(() => { setEpMsg({ type: '', text: '' }); setView('main'); }, 1800);
        } catch (e) {
            setEpMsg({ type: 'err', text: e.response?.data?.message || 'Update failed.' });
        } finally {
            setEpSaving(false);
        }
    };

    /* ── Change Password ── */
    const savePassword = async () => {
        setCpMsg({ type: '', text: '' });
        if (cpNew !== cpConf) { setCpMsg({ type: 'err', text: 'Passwords do not match.' }); return; }
        if (cpNew.length < 6) { setCpMsg({ type: 'err', text: 'Minimum 6 characters required.' }); return; }
        setCpSaving(true);
        try {
            await api.patch('/auth/change-password', { currentPassword: cpCur, newPassword: cpNew });
            setCpMsg({ type: 'ok', text: '✓ Password changed successfully!' });
            setCpCur(''); setCpNew(''); setCpConf('');
            setTimeout(() => { setCpMsg({ type: '', text: '' }); setView('main'); }, 1800);
        } catch (e) {
            setCpMsg({ type: 'err', text: e.response?.data?.message || 'Failed to change password.' });
        } finally {
            setCpSaving(false);
        }
    };

    /* ── 2FA ── */
    const handleTwoFA = async (val) => {
        if (val) {
            try {
                await api.post('/auth/2fa/request-setup');
                setV2faOtp(''); setV2faMsg({ type: '', text: '' });
                setView('verify2FA');
            } catch { }
        } else {
            try {
                const res = await api.patch('/auth/2fa/toggle', { enabled: false });
                setTwoFA(res.data.is2FAEnabled);
            } catch { }
        }
    };

    const confirmTwoFA = async () => {
        if (!v2faOtp) return;
        setV2faSaving(true);
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

    /* ── Sub header ── */
    const SubHeader = ({ title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
                onClick={() => setView('main')}
                style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 14, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >‹</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        </div>
    );

    const ROLE_COLOR = role === 'admin' ? '#7c3aed' : '#0891b2';
    const ROLE_LABEL = role === 'admin' ? 'Administrator' : 'Manager';
    const JOIN_DATE = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none' }}>
                <motion.div
                    ref={panelRef}
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    style={{
                        position: 'absolute', top: 0, right: 0, width: 340, height: '100%',
                        background: 'var(--bg-surface)',
                        borderLeft: '1px solid var(--border-subtle)',
                        boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
                        display: 'flex', flexDirection: 'column',
                        pointerEvents: 'all', overflowY: 'auto',
                        fontFamily: 'Outfit, sans-serif',
                    }}
                >
                    <AnimatePresence mode="wait">

                        {/* ─── MAIN VIEW ─── */}
                        {view === 'main' && (
                            <motion.div
                                key="main"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}
                                style={{ flex: 1 }}
                            >
                                {/* Panel header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</span>
                                    <button
                                        onClick={onClose}
                                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13 }}
                                    >✕</button>
                                </div>

                                {/* Profile hero card */}
                                <div style={{
                                    padding: '20px',
                                    background: `linear-gradient(135deg, ${ROLE_COLOR}0d, ${ROLE_COLOR}06)`,
                                    borderBottom: '1px solid var(--border-subtle)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: 60, height: 60, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${ROLE_COLOR}, #a855f7)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
                                            boxShadow: `0 4px 16px ${ROLE_COLOR}44`,
                                            border: `3px solid ${ROLE_COLOR}33`,
                                        }}>
                                            {initials}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {user?.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                                {user?.email}
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                                                    background: `${ROLE_COLOR}1a`, color: ROLE_COLOR, fontWeight: 700,
                                                    border: `1px solid ${ROLE_COLOR}33`,
                                                }}>
                                                    {role === 'admin' ? '🛡 Admin' : '👤 Manager'}
                                                </span>
                                                {twoFA && (
                                                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(5,150,105,0.12)', color: '#059669', fontWeight: 700 }}>
                                                        🔐 2FA On
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info pills */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span>📅</span>
                                            <span>Member since {JOIN_DATE}</span>
                                        </div>
                                        {user?.email && (
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                                <span>✉</span>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats strip */}
                                    {stats && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
                                            <StatChip label="Students" value={stats.occupiedBeds ?? '—'} color="#4f46e5" icon="🎓" />
                                            <StatChip label="Vacant" value={stats.availableBeds ?? '—'} color="#059669" icon="🛏" />
                                            <StatChip
                                                label="Dues"
                                                value={stats.feeDues > 0 ? `₹${(stats.feeDues / 1000).toFixed(0)}k` : '₹0'}
                                                color={stats.feeDues > 0 ? '#e11d48' : '#059669'}
                                                icon="💰"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Account section */}
                                <SectionLabel>Account</SectionLabel>
                                <PanelRow icon="📝" label="Edit Profile" onClick={() => setView('editProfile')} />
                                <PanelRow icon="🔒" label="Change Password" onClick={() => setView('changePassword')} />
                                <PanelRow
                                    icon="🔐"
                                    label="Two-Factor Auth (2FA)"
                                    right={<Toggle value={twoFA} onChange={handleTwoFA} accent={ROLE_COLOR} />}
                                />

                                {/* Activity section */}
                                <SectionLabel>Recent Activity</SectionLabel>
                                {recentComplaints.length === 0 ? (
                                    <div style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text-muted)' }}>No recent complaints.</div>
                                ) : (
                                    recentComplaints.slice(0, 3).map(c => (
                                        <div
                                            key={c._id}
                                            onClick={() => { navigate(`/${role}/complaints`); onClose(); }}
                                            style={{
                                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                                padding: '9px 20px', cursor: 'pointer',
                                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                            }}
                                        >
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                                                background: c.status === 'resolved' ? '#10b981' : c.status === 'in-review' ? '#3b82f6' : '#f59e0b',
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {c.title}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {c.studentName} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: 9, padding: '2px 6px', borderRadius: 20, fontWeight: 700, flexShrink: 0,
                                                background: c.status === 'resolved' ? 'rgba(16,185,129,0.12)' : c.status === 'in-review' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                                                color: c.status === 'resolved' ? '#10b981' : c.status === 'in-review' ? '#3b82f6' : '#f59e0b',
                                            }}>{c.status}</span>
                                        </div>
                                    ))
                                )}
                                {recentComplaints.length > 0 && (
                                    <div
                                        onClick={() => { navigate(`/${role}/complaints`); onClose(); }}
                                        style={{ padding: '8px 20px', fontSize: 12, color: ROLE_COLOR, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        View all complaints →
                                    </div>
                                )}

                                {/* Navigation shortcuts */}
                                <SectionLabel>Quick Navigate</SectionLabel>
                                <PanelRow icon="⊞" label="Dashboard" onClick={() => { navigate(`/${role}/dashboard`); onClose(); }} />
                                <PanelRow icon="🎓" label="Students" onClick={() => { navigate(`/${role}/students`); onClose(); }} />
                                <PanelRow icon="💳" label="Payments" onClick={() => { navigate(`/${role}/payments`); onClose(); }} />
                                {role === 'admin' && (
                                    <PanelRow icon="⚙" label="Settings" onClick={() => { navigate(`/${role}/settings`); onClose(); }} />
                                )}

                                {/* Preferences */}
                                <SectionLabel>Preferences</SectionLabel>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px' }}>
                                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{darkMode ? '🌙' : '☀️'}</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>Dark Mode</span>
                                    <Toggle value={darkMode} onChange={(v) => onThemeChange(v ? 'dark' : 'light')} accent={ROLE_COLOR} />
                                </div>
                                <PanelRow icon="🌐" label="Language" right={language} onClick={() => setView('language')} />

                                {/* Session */}
                                <SectionLabel>Session</SectionLabel>
                                <PanelRow icon="↪" label="Sign Out" onClick={handleLogout} danger />
                                <div style={{ height: 24 }} />
                            </motion.div>
                        )}

                        {/* ─── EDIT PROFILE ─── */}
                        {view === 'editProfile' && (
                            <motion.div
                                key="editProfile"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}
                            >
                                <SubHeader title="Edit Profile" />
                                <div style={{ padding: '16px 20px', display: 'grid', gap: 14 }}>
                                    {/* Avatar preview */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                                        <div style={{
                                            width: 72, height: 72, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${ROLE_COLOR}, #a855f7)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 28, fontWeight: 700, color: '#fff',
                                            boxShadow: `0 6px 20px ${ROLE_COLOR}44`,
                                        }}>{(epName || user?.name || '?').charAt(0).toUpperCase()}</div>
                                    </div>

                                    <div>
                                        <label style={lbl}>Full Name *</label>
                                        <input
                                            value={epName}
                                            onChange={e => setEpName(e.target.value)}
                                            style={inputSx}
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label style={lbl}>Email (read-only)</label>
                                        <input
                                            value={user?.email || ''}
                                            disabled
                                            style={{ ...inputSx, opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-base)' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={lbl}>Phone Number</label>
                                        <input
                                            value={epPhone}
                                            onChange={e => setEpPhone(e.target.value)}
                                            style={inputSx}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>

                                    <div>
                                        <label style={lbl}>Role</label>
                                        <div style={{
                                            padding: '9px 12px', borderRadius: 9,
                                            border: '1px solid var(--border-subtle)',
                                            background: 'var(--bg-base)', fontSize: 13,
                                            color: ROLE_COLOR, fontWeight: 600,
                                        }}>
                                            {role === 'admin' ? '🛡 Administrator' : '👤 Manager'} (cannot be changed)
                                        </div>
                                    </div>

                                    {/* Account created date */}
                                    <div style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 9, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span>📅</span>
                                        <span>Account created: <strong style={{ color: 'var(--text-primary)' }}>{JOIN_DATE}</strong></span>
                                    </div>
                                </div>
                                <Msg msg={epMsg.text} type={epMsg.type} />
                                <SaveBtn onClick={saveProfile} saving={epSaving} color={ROLE_COLOR} />
                            </motion.div>
                        )}

                        {/* ─── CHANGE PASSWORD ─── */}
                        {view === 'changePassword' && (
                            <motion.div
                                key="changePassword"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}
                            >
                                <SubHeader title="Change Password" />

                                {/* Security tips banner */}
                                <div style={{
                                    margin: '14px 20px 0',
                                    padding: '10px 14px',
                                    background: `${ROLE_COLOR}0d`,
                                    border: `1px solid ${ROLE_COLOR}33`,
                                    borderRadius: 10, fontSize: 12, color: ROLE_COLOR,
                                    lineHeight: 1.5,
                                }}>
                                    🔒 Use at least 8 characters with a mix of letters, numbers, and symbols.
                                </div>

                                <div style={{ padding: '16px 20px', display: 'grid', gap: 14 }}>
                                    {[
                                        { label: 'Current Password', value: cpCur, set: setCpCur, id: 'cp-cur' },
                                        { label: 'New Password', value: cpNew, set: setCpNew, id: 'cp-new' },
                                        { label: 'Confirm New Password', value: cpConf, set: setCpConf, id: 'cp-conf' },
                                    ].map(f => (
                                        <div key={f.id}>
                                            <label style={lbl}>{f.label}</label>
                                            <input
                                                id={f.id}
                                                type={showPw ? 'text' : 'password'}
                                                value={f.value}
                                                onChange={e => f.set(e.target.value)}
                                                style={inputSx}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="checkbox"
                                            id="showPwAdmin"
                                            checked={showPw}
                                            onChange={e => setShowPw(e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label htmlFor="showPwAdmin" style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            Show passwords
                                        </label>
                                    </div>
                                </div>
                                <Msg msg={cpMsg.text} type={cpMsg.type} />
                                <SaveBtn onClick={savePassword} saving={cpSaving} label="Update Password" color="#e11d48" />
                            </motion.div>
                        )}

                        {/* ─── LANGUAGE ─── */}
                        {view === 'language' && (
                            <motion.div
                                key="language"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}
                            >
                                <SubHeader title="Choose Language" />
                                {LANGUAGES.map(lang => (
                                    <div
                                        key={lang}
                                        onClick={() => { changeLanguage(lang); setView('main'); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '13px 20px', cursor: 'pointer',
                                            background: language === lang ? `${ROLE_COLOR}0a` : 'transparent',
                                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <span style={{
                                            fontSize: 14,
                                            color: language === lang ? ROLE_COLOR : 'var(--text-primary)',
                                            fontWeight: language === lang ? 700 : 400,
                                        }}>{lang}</span>
                                        {language === lang && <span style={{ color: ROLE_COLOR, fontSize: 16 }}>✓</span>}
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* ─── VERIFY 2FA ─── */}
                        {view === 'verify2FA' && (
                            <motion.div
                                key="verify2FA"
                                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}
                            >
                                <SubHeader title="Verify 2FA Setup" />
                                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.55 }}>
                                        A 6-digit verification code has been sent to <strong>{user?.email}</strong>. Enter it below to enable 2FA.
                                    </p>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={v2faOtp}
                                        onChange={e => setV2faOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ ...inputSx, textAlign: 'center', fontSize: 22, letterSpacing: '0.5em', height: 52 }}
                                        placeholder="000000"
                                    />
                                    <Msg msg={v2faMsg.text} type={v2faMsg.type} />
                                    <div style={{ height: 14 }} />
                                    <SaveBtn onClick={confirmTwoFA} saving={v2faSaving} label="Confirm & Enable 2FA" color={ROLE_COLOR} />
                                    <button
                                        onClick={() => setView('main')}
                                        style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', marginTop: 10, cursor: 'pointer', fontWeight: 600 }}
                                    >Cancel</button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
