import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const STATUS_CFG = {
    pending: { color: '#d97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)', label: 'Pending', icon: '⏳' },
    'in-review': { color: '#0891b2', bg: 'rgba(8,145,178,0.10)', border: 'rgba(8,145,178,0.25)', label: 'In Review', icon: '🔍' },
    resolved: { color: '#059669', bg: 'rgba(5,150,105,0.10)', border: 'rgba(5,150,105,0.25)', label: 'Resolved', icon: '✅' },
};

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in-review', label: 'In Review' },
    { key: 'resolved', label: 'Resolved' },
];

export default function AdminComplaints() {
    const { t } = useLanguage();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/complaints/${id}/status`, { status });
            setComplaints(complaints.map(c => c._id === id ? { ...c, status } : c));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const filteredComplaints = complaints.filter(c => filter === 'all' || c.status === filter);

    const counts = {
        all: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        'in-review': complaints.filter(c => c.status === 'in-review').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

            {/* Hero Banner */}
            <motion.div className="page-hero"
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'linear-gradient(135deg, #1e1065 0%, #312e81 50%, #4338ca 100%)', marginBottom: 24 }}
            >
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="hero-badge">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
                        {counts.pending} pending action{counts.pending !== 1 ? 's' : ''}
                    </div>
                    <div className="hero-title">Student Complaints</div>
                    <div className="hero-sub">Track and resolve student issues to keep the hostel running smoothly</div>
                </div>
            </motion.div>

            {/* Summary chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
                {[
                    { label: 'Pending', val: counts.pending, color: '#d97706', icon: '⏳' },
                    { label: 'In Review', val: counts['in-review'], color: '#0891b2', icon: '🔍' },
                    { label: 'Resolved', val: counts.resolved, color: '#059669', icon: '✅' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                            background: filter === tab.key
                                ? (STATUS_CFG[tab.key]?.color || '#4f46e5')
                                : 'var(--bg-elevated)',
                            color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            boxShadow: filter === tab.key ? `0 4px 14px ${(STATUS_CFG[tab.key]?.color || '#4f46e5')}40` : 'none',
                        }}
                    >
                        {tab.key !== 'all' && STATUS_CFG[tab.key]?.icon + ' '}
                        {tab.label}
                        {counts[tab.key] > 0 && (
                            <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 99, background: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                                {counts[tab.key]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, gap: 14, flexDirection: 'column', color: 'var(--text-muted)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border-default)', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite' }} />
                    <div style={{ fontSize: 13 }}>Loading complaints…</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                    <AnimatePresence mode="popLayout">
                        {filteredComplaints.length === 0 ? (
                            <div style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state">
                                    <div className="empty-state-icon">💬</div>
                                    <div className="empty-state-title">
                                        {filter === 'all' ? 'No complaints yet' : `No ${filter} complaints`}
                                    </div>
                                    <div className="empty-state-desc">
                                        {filter === 'all' ? 'Student complaints will appear here when raised.' : `There are no complaints with "${filter}" status.`}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filteredComplaints.map((c, i) => {
                                const cfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                                const studentInitial = (c.studentName || '?').charAt(0).toUpperCase();
                                return (
                                    <motion.div
                                        key={c._id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="card"
                                        style={{
                                            overflow: 'hidden',
                                            borderLeft: `3px solid ${cfg.color}`,
                                        }}
                                    >
                                        {/* Top bar */}
                                        <div style={{
                                            padding: '14px 18px 12px',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-surface))',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '4px 10px', borderRadius: 99,
                                                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                                                fontSize: 11, fontWeight: 700,
                                            }}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                                                    {c.category || 'General'}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: '6px 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{c.title}</h3>
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                                {c.description}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            padding: '12px 18px',
                                            borderTop: '1px solid var(--border-subtle)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: 'var(--bg-surface)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                                                }}>
                                                    {studentInitial}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.studentName || 'Student'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room {c.roomNumber || '—'}</div>
                                                </div>
                                            </div>

                                            <select
                                                value={c.status}
                                                onChange={e => updateStatus(c._id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px', borderRadius: 8,
                                                    background: cfg.bg, color: cfg.color,
                                                    border: `1px solid ${cfg.border}`,
                                                    fontSize: 12, fontWeight: 700,
                                                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                                                    outline: 'none',
                                                }}
                                            >
                                                <option value="pending">⏳ Pending</option>
                                                <option value="in-review">🔍 In Review</option>
                                                <option value="resolved">✅ Resolved</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
