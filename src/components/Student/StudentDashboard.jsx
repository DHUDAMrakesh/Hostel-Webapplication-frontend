import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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

    const cards = [
        {
            icon: '🛏', label: t('My Room'), value: profile?.roomNumber || t('Not booked'),
            sub: profile ? t('View details') : t('Book a room →'),
            color: '#6366f1', onClick: () => navigate('/student/room'),
        },
        {
            icon: '💳', label: t('Fee Dues'), value: profile ? `₹${(profile.feeDues || 0).toLocaleString('en-IN')}` : '—',
            sub: profile?.feeDues > 0 ? t('Payment pending') : t('Clear'),
            color: profile?.feeDues > 0 ? '#e11d48' : '#10b981',
            onClick: () => navigate('/student/fees'),
        },
        {
            icon: '💰', label: t('Total Paid'), value: `₹${totalPaid.toLocaleString('en-IN')}`,
            sub: `${profile?.payments?.length || 0} ${t('payments recorded')}`,
            color: '#0891b2', onClick: () => navigate('/student/fees'),
        },
        {
            icon: '💬', label: t('Complaints'), value: openComplaints,
            sub: openComplaints > 0 ? `${openComplaints} ${t('open')}` : t('All resolved'),
            color: '#f59e0b', onClick: () => navigate('/student/complaints'),
        },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div className="page-label">{t('Student Portal')}</div>
                <div className="page-title" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {t('Welcome')}, {user?.name?.split(' ')[0]} 👋
                </div>
                <div className="page-desc">{t("Here's your hostel summary at a glance.")}</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
                {cards.map((c, i) => (
                    <motion.div key={c.label} className="card"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        onClick={c.onClick}
                        whileHover={{ y: -3 }}
                        style={{ padding: '20px 22px', cursor: 'pointer', borderTop: `3px solid ${c.color}` }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Lower Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Recent Complaints */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>{t('Recent Complaints')}</div>
                    {complaints.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>{t('No complaints raised yet')}</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {complaints.slice(0, 3).map(c => (
                                <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.category}</div>
                                    </div>
                                    <StatusBadge status={c.status} />
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => navigate('/student/complaints')}
                        style={{ marginTop: 14, width: '100%', padding: '9px', borderRadius: 9, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {complaints.length === 0 ? t('+ Raise a Complaint') : t('View All →')}
                    </button>
                </div>

                {/* Room & Fees shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: 22, cursor: 'pointer', flex: 1 }} onClick={() => navigate('/student/room')}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>🛏</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {profile?.roomNumber ? `${t('Room')} ${profile.roomNumber}` : t('Book a Room')}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {profile?.roomNumber ? t('View your room details') : t('Pick from available rooms')}
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: 22, cursor: 'pointer', flex: 1 }} onClick={() => navigate('/student/fees')}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>💳</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t('Fees & Payments')}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {profile?.feeDues > 0 ? `₹${profile.feeDues.toLocaleString('en-IN')} ${t('due')}` : t('View payment history')}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = {
        pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
        'in-review': { color: '#0891b2', bg: 'rgba(8,145,178,0.1)', label: 'In Review' },
        resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Resolved' },
    }[status] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', label: status };
    return (
        <span style={{ padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {cfg.label}
        </span>
    );
}
