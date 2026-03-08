import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const STATUS_CFG = {
    pending: { color: '#d97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.22)', label: 'Pending' },
    'in-review': { color: '#0891b2', bg: 'rgba(8,145,178,0.10)', border: 'rgba(8,145,178,0.22)', label: 'In Review' },
    resolved: { color: '#059669', bg: 'rgba(5,150,105,0.10)', border: 'rgba(5,150,105,0.22)', label: 'Resolved' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', border: 'var(--border-subtle)', label: status };
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 99,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
            border: `1px solid ${cfg.border}`,
        }}>
            {cfg.label}
        </span>
    );
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/student/me'),
            api.get('/student/complaints'),
        ]).then(([p, c]) => {
            setProfile(p.data);
            setComplaints(c.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const totalPaid = profile?.payments?.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0) || 0;
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = user?.name?.split(' ')[0] || 'Student';

    const cards = [
        {
            icon: '🛏', label: t('My Room'), value: profile?.roomNumber || t('Not booked'),
            sub: profile ? t('View details') : t('Book a room →'),
            color: '#6366f1', glow: '#6366f1', iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            accent: 'linear-gradient(180deg,#6366f1,#8b5cf6)',
            onClick: () => navigate('/student/room'),
        },
        {
            icon: '💳', label: t('Fee Dues'), value: profile ? `₹${(profile.feeDues || 0).toLocaleString('en-IN')}` : '—',
            sub: profile?.feeDues > 0 ? t('Payment pending') : t('All cleared ✓'),
            color: profile?.feeDues > 0 ? '#e11d48' : '#10b981',
            glow: profile?.feeDues > 0 ? '#f43f5e' : '#10b981',
            iconBg: profile?.feeDues > 0 ? 'linear-gradient(135deg,#f43f5e,#ec4899)' : 'linear-gradient(135deg,#10b981,#14b8a6)',
            accent: profile?.feeDues > 0 ? 'linear-gradient(180deg,#f43f5e,#ec4899)' : 'linear-gradient(180deg,#10b981,#14b8a6)',
            onClick: () => navigate('/student/fees'),
        },
        {
            icon: '💰', label: t('Total Paid'), value: `₹${totalPaid.toLocaleString('en-IN')}`,
            sub: `${profile?.payments?.length || 0} ${t('payments recorded')}`,
            color: '#0891b2', glow: '#0ea5e9', iconBg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
            accent: 'linear-gradient(180deg,#0ea5e9,#06b6d4)',
            onClick: () => navigate('/student/fees'),
        },
        {
            icon: '💬', label: t('Complaints'), value: openComplaints,
            sub: openComplaints > 0 ? `${openComplaints} ${t('open')}` : t('All resolved'),
            color: '#d97706', glow: '#f59e0b', iconBg: 'linear-gradient(135deg,#f59e0b,#f97316)',
            accent: 'linear-gradient(180deg,#f59e0b,#f97316)',
            onClick: () => navigate('/student/complaints'),
        },
    ];

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid var(--border-default)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading your dashboard…</div>
        </div>
    );

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

            {/* Premium Hero Banner */}
            <motion.div
                className="page-hero"
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                style={{ background: profile?.feeDues > 0 ? 'linear-gradient(135deg, #1e1065 0%, #4f46e5 50%, #7c3aed 100%)' : 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)', marginBottom: 24 }}
            >
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-badge">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a5f3fc', boxShadow: '0 0 8px #a5f3fc' }} />
                        Student Portal
                    </div>
                    <div className="hero-title">{greeting}, {firstName}! 👋</div>
                    <div className="hero-sub" style={{ marginBottom: 16 }}>
                        {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {profile?.roomNumber && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 99, fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                🛏 Room {profile.roomNumber}
                            </div>
                        )}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: profile?.feeDues > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)', borderRadius: 99, fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)', border: `1px solid ${profile?.feeDues > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                            {profile?.feeDues > 0 ? `⚠ ₹${profile.feeDues.toLocaleString('en-IN')} due` : '✓ Fees cleared'}
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 90, opacity: 0.07, userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
                    {firstName.charAt(0).toUpperCase()}
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 24 }}>
                {cards.map((c, i) => (
                    <motion.div key={c.label} className="card stat-card"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        onClick={c.onClick}
                        whileHover={{ y: -3, scale: 1.02 }}
                        style={{ cursor: 'pointer', '--stat-accent': c.accent }}
                    >
                        <div className="stat-glow" style={{ background: c.glow }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div className="stat-icon" style={{ background: c.iconBg, boxShadow: `0 6px 20px ${c.glow}55` }}>
                                <span style={{ fontSize: 20 }}>{c.icon}</span>
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</span>
                        </div>
                        <div className="stat-label">{c.label}</div>
                        <div className="stat-value" style={{ color: c.color, fontSize: 24 }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Lower Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                {/* Recent Complaints */}
                <motion.div className="card" style={{ overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                >
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
                        background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div className="chart-title-label">Recent Activity</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{t('Complaints')}</div>
                        </div>
                        <span style={{
                            padding: '3px 10px', borderRadius: 99,
                            background: complaints.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(5,150,105,0.1)',
                            color: complaints.length > 0 ? '#d97706' : '#059669',
                            border: `1px solid ${complaints.length > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(5,150,105,0.2)'}`,
                            fontSize: 11, fontWeight: 700,
                        }}>
                            {complaints.length} total
                        </span>
                    </div>

                    <div style={{ padding: '14px 16px' }}>
                        {complaints.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">💬</div>
                                <div className="empty-state-title">{t('No complaints raised yet')}</div>
                                <div className="empty-state-desc">Raise a complaint if you need anything resolved.</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {complaints.slice(0, 3).map((c, i) => (
                                    <motion.div
                                        key={c._id}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '11px 14px',
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: 11,
                                            borderLeft: `3px solid ${STATUS_CFG[c.status]?.color || 'var(--border-default)'}`,
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>{c.category}</div>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => navigate('/student/complaints')}
                            style={{
                                marginTop: 12, width: '100%', padding: '10px',
                                borderRadius: 10, border: '1px solid rgba(99,102,241,0.25)',
                                background: 'rgba(99,102,241,0.07)', color: '#6366f1',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                        >
                            {complaints.length === 0 ? '+ Raise a Complaint' : 'View All Complaints →'}
                        </button>
                    </div>
                </motion.div>

                {/* Room & Fees shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        {
                            icon: '🛏', emoji: '🏠', label: profile?.roomNumber ? `Room ${profile.roomNumber}` : t('Book a Room'),
                            sub: profile?.roomNumber ? t('View your room details') : t('Pick from available rooms'),
                            to: '/student/room', color: '#6366f1', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        },
                        {
                            icon: '💳', emoji: '💰', label: t('Fees & Payments'),
                            sub: profile?.feeDues > 0 ? `₹${profile.feeDues.toLocaleString('en-IN')} due` : t('View payment history'),
                            to: '/student/fees',
                            color: profile?.feeDues > 0 ? '#e11d48' : '#10b981',
                            bg: profile?.feeDues > 0 ? 'linear-gradient(135deg,#f43f5e,#ec4899)' : 'linear-gradient(135deg,#10b981,#14b8a6)',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                            whileHover={{ y: -2 }}
                            className="card"
                            onClick={() => navigate(item.to)}
                            style={{ padding: '20px 22px', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                                background: item.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, boxShadow: `0 6px 20px ${item.color}44`,
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{item.label}</div>
                                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.sub}</div>
                            </div>
                            <div style={{ fontSize: 18, color: item.color, fontWeight: 700, opacity: 0.7 }}>→</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
