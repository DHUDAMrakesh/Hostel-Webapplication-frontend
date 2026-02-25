import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = ['maintenance', 'food', 'cleanliness', 'security', 'noise', 'other'];
const STATUS_CFG = {
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
    'in-review': { color: '#0891b2', bg: 'rgba(8,145,178,0.1)', label: 'In Review' },
    resolved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Resolved' },
};

export default function MyComplaints() {
    const { t } = useLanguage();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', category: 'maintenance' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const { data } = await api.get('/student/complaints');
            setComplaints(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        setError('');
        if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required.'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/student/complaints', form);
            setComplaints(prev => [data, ...prev]);
            setModal(false);
            setForm({ title: '', description: '', category: 'maintenance' });
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit complaint.');
        } finally { setSaving(false); }
    };

    const inp = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box',
        color: 'var(--text-primary)',
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="page-label">Support</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>My Complaints</div>
                    <div className="page-desc">Raise and track hostel issues.</div>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal(true)}
                    style={{ padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', flexShrink: 0, marginTop: 4 }}>
                    {t('New Complaint')}
                </motion.button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Total', value: complaints.length, color: '#6366f1' },
                    { label: 'Open', value: complaints.filter(c => c.status !== 'resolved').length, color: '#f59e0b' },
                    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* List */}
            {complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{t('No complaints yet')}</div>
                    <div style={{ fontSize: 14 }}>{t('Raise your first complaint to see it here.')}</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {complaints.map((c, i) => {
                        const s = STATUS_CFG[c.status] || STATUS_CFG.pending;
                        return (
                            <motion.div key={c._id} className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                style={{ padding: '18px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600, textTransform: 'capitalize' }}>{c.category}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.description}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                                            {t('Raised on')} {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {c.roomNumber !== '—' && ` · ${t('Room')} ${c.roomNumber}`}
                                        </div>
                                    </div>
                                    <span style={{ padding: '5px 12px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        {s.label}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        onClick={e => e.target === e.currentTarget && setModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('Raise a Complaint')}</div>
                                <button onClick={() => setModal(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                            </div>
                            <div style={{ padding: '22px 24px', display: 'grid', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('Category')}</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: 'pointer', textTransform: 'capitalize' }}>
                                        {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('Title *')}</label>
                                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Broken AC in room" style={inp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('Description *')}</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Describe the issue in detail…"
                                        style={{ ...inp, minHeight: 90, resize: 'vertical' }} />
                                </div>
                                {error && <div style={{ padding: '9px 12px', background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>⚠ {error}</div>}
                            </div>
                            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button onClick={() => setModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer' }}>{t('Cancel')}</button>
                                <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? t('Saving…') : t('Submit Complaint')}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
