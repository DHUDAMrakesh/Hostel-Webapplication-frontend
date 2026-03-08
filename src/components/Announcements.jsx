import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

/* ─── Type metadata ─── */
const TYPE_META = {
    announcement: { label: 'Announcement', color: '#4f46e5', bg: 'rgba(79,70,229,0.10)', border: 'rgba(79,70,229,0.25)', icon: '📢' },
    notice: { label: 'Notice', color: '#0891b2', bg: 'rgba(8,145,178,0.10)', border: 'rgba(8,145,178,0.25)', icon: '📋' },
    alert: { label: 'Alert', color: '#e11d48', bg: 'rgba(225,29,72,0.10)', border: 'rgba(225,29,72,0.25)', icon: '🚨' },
};

/* ─── Compose Modal ─── */
function ComposeModal({ onClose, onSent }) {
    const [form, setForm] = useState({ title: '', message: '', type: 'announcement' });
    const [sending, setSending] = useState(false);
    const [err, setErr] = useState('');

    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSend = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            setErr('Title and message are required.'); return;
        }
        setSending(true); setErr('');
        try {
            await api.post('/announcements', form);
            onSent();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to send.');
            setSending(false);
        }
    };

    const inp = {
        width: '100%', padding: '10px 13px', borderRadius: 10,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    };
    const tm = TYPE_META[form.type];

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{ background: 'var(--bg-base)', borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
            >
                {/* Header */}
                <div style={{ padding: '20px 26px 18px', borderBottom: '1px solid var(--border-subtle)', background: `linear-gradient(135deg, ${tm.color}12, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Message</div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Compose Announcement</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 16, cursor: 'pointer' }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Type selector */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {Object.entries(TYPE_META).map(([key, meta]) => (
                                <button
                                    key={key}
                                    onClick={() => setForm(p => ({ ...p, type: key }))}
                                    style={{
                                        flex: 1, padding: '9px 8px', borderRadius: 10, cursor: 'pointer',
                                        fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 12,
                                        border: `2px solid ${form.type === key ? meta.color : 'var(--border-subtle)'}`,
                                        background: form.type === key ? meta.bg : 'transparent',
                                        color: form.type === key ? meta.color : 'var(--text-secondary)',
                                        transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                    }}
                                >
                                    <span>{meta.icon}</span> {meta.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title *</label>
                        <input
                            value={form.title} onChange={set('title')} placeholder="e.g. Water supply maintenance tomorrow"
                            style={inp}
                            onFocus={e => { e.target.style.borderColor = tm.color; e.target.style.boxShadow = `0 0 0 3px ${tm.bg}`; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message *</label>
                        <textarea
                            value={form.message} onChange={set('message')}
                            placeholder="Write your full message here…"
                            rows={4}
                            style={{ ...inp, resize: 'vertical', minHeight: 90 }}
                            onFocus={e => { e.target.style.borderColor = tm.color; e.target.style.boxShadow = `0 0 0 3px ${tm.bg}`; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Audience notice */}
                    <div style={{ padding: '10px 13px', background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.18)', borderRadius: 10, fontSize: 13, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🔔</span>
                        <span>This will be sent as a notification to <strong>all students</strong> immediately.</span>
                    </div>

                    {err && (
                        <div style={{ padding: '10px 13px', background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 9, fontSize: 13, color: '#e11d48' }}>
                            ⚠ {err}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 26px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        style={{ padding: '10px 26px', borderRadius: 10, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${tm.color}, #7c3aed)`, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit, sans-serif', opacity: sending ? 0.7 : 1, boxShadow: `0 4px 16px ${tm.color}40`, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {sending ? 'Sending…' : <><span>📤</span> Send to All Students</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Announcement Card ─── */
function AnnouncementCard({ item, onDelete, canDelete, delay }) {
    const tm = TYPE_META[item.type] || TYPE_META.announcement;
    const date = new Date(item.createdAt);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{ padding: '20px 22px', borderLeft: `4px solid ${tm.color}` }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, flex: 1 }}>
                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tm.bg, border: `1px solid ${tm.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {tm.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: tm.bg, color: tm.color, fontWeight: 700, border: `1px solid ${tm.border}` }}>
                                {tm.label}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dateStr} · {timeStr}</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                            Posted by <strong style={{ color: 'var(--text-secondary)' }}>{item.createdByName || 'Manager'}</strong>
                        </div>
                    </div>
                </div>
                {/* Delete */}
                {canDelete && (
                    <button
                        onClick={() => onDelete(item)}
                        title="Delete announcement"
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', fontSize: 13, cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}
                    >🗑</button>
                )}
            </div>
        </motion.div>
    );
}

/* ─── Main Component ─── */
export default function Announcements() {
    const { user } = useAuth();
    const role = user?.role || 'admin';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [compose, setCompose] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const load = async () => {
        try {
            const { data } = await api.get('/announcements');
            setItems(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/announcements/${deleteTarget._id}`);
            setItems(prev => prev.filter(a => a._id !== deleteTarget._id));
            showToast('Announcement deleted.');
        } catch (e) {
            showToast('Delete failed.');
        } finally { setDeleteTarget(null); }
    };

    const filtered = typeFilter === 'All' ? items : items.filter(a => a.type === typeFilter);

    const canManage = role === 'admin' || role === 'manager';
    const counts = { All: items.length, announcement: 0, notice: 0, alert: 0 };
    items.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1; });

    return (
        <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                <div>
                    <div className="page-label">{canManage ? 'Communications' : 'Hostel'}</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg,#4f46e5,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {canManage ? 'Announcements' : 'Notice Board'}
                    </div>
                    <div className="page-desc">
                        {canManage ? 'Post notices, alerts and announcements to all hostel students.' : 'Stay updated with the latest hostel announcements and notices.'}
                    </div>
                </div>
                {canManage && (
                    <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setCompose(true)}
                        style={{ padding: '11px 22px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,70,229,0.3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <span style={{ fontSize: 18 }}>+</span> New Announcement
                    </motion.button>
                )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                {[
                    { key: 'All', label: `All (${counts.All})`, color: '#4f46e5' },
                    { key: 'announcement', label: `📢 Announcements (${counts.announcement})`, color: '#4f46e5' },
                    { key: 'notice', label: `📋 Notices (${counts.notice})`, color: '#0891b2' },
                    { key: 'alert', label: `🚨 Alerts (${counts.alert})`, color: '#e11d48' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setTypeFilter(f.key)}
                        style={{
                            padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 700,
                            background: typeFilter === f.key ? f.color : 'var(--bg-elevated)',
                            color: typeFilter === f.key ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}
                    >{f.label}</button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📢</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No announcements yet</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                        {canManage
                            ? <>Click <strong>+ New Announcement</strong> to send a message to all students.</>
                            : 'No notices have been posted yet. Check back later.'}
                    </div>
                    {canManage && (
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            onClick={() => setCompose(true)}
                            style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}
                        >
                            + Create First Announcement
                        </motion.button>
                    )}
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <AnimatePresence>
                        {filtered.map((item, i) => (
                            <AnnouncementCard
                                key={item._id}
                                item={item}
                                delay={i * 0.05}
                                canDelete={canManage}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Compose Modal */}
            <AnimatePresence>
                {compose && (
                    <ComposeModal
                        onClose={() => setCompose(false)}
                        onSent={() => { load(); showToast('✓ Announcement sent to all students!'); }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <ConfirmModal
                open={!!deleteTarget}
                icon="🗑"
                title="Delete Announcement?"
                message={deleteTarget ? `"${deleteTarget.title}" will be removed permanently.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', padding: '12px 22px', borderRadius: 14, zIndex: 2000, background: 'linear-gradient(135deg,#059669,#0d9488)', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(5,150,105,0.35)', whiteSpace: 'nowrap' }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
