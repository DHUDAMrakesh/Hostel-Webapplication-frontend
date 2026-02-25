import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function MyFees() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ amount: '', method: 'UPI', month: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const load = async () => {
        try {
            const { data } = await api.get('/student/me');
            setProfile(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handlePay = async () => {
        setError('');
        if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/student/pay', {
                amount: Number(form.amount),
                method: form.method,
                month: form.month || `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`,
            });
            setProfile(data);
            setModal(false);
            setForm({ amount: '', method: 'UPI', month: '' });
            setSuccess('Payment recorded successfully!');
            setTimeout(() => setSuccess(''), 3500);
        } catch (e) {
            setError(e.response?.data?.message || 'Payment failed.');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--brand-color)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!profile) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛌</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{t('No Booking Found')}</div>
            <div style={{ fontSize: 14 }}>{t('Please book a room first to manage fees.')}</div>
        </div>
    );

    const payments = [...(profile.payments || [])].reverse();
    const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

    const inp = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box',
        color: 'var(--text-primary)',
    };

    const inputSx = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box',
        color: 'var(--text-primary)',
    };

    return (
        <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>
            <div style={{ marginBottom: 28 }}>
                <div className="page-label">Finance</div>
                <div className="page-title" style={{ background: 'linear-gradient(135deg,#0891b2,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>My Fees</div>
                <div className="page-desc">Track your dues and payment history.</div>
            </div>

            {success && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 10, color: 'var(--success-text)', fontSize: 14, fontWeight: 600 }}>
                    ✓ {success}
                </div>
            )}

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                    { label: t('Monthly Fee'), value: `₹${profile.monthlyFee.toLocaleString('en-IN')}`, color: 'var(--brand-color)', icon: '📋' },
                    { label: t('Fee Dues'), value: `₹${(profile.feeDues || 0).toLocaleString('en-IN')}`, color: profile.feeDues > 0 ? 'var(--error-text)' : 'var(--success-text)', icon: profile.feeDues > 0 ? '⚠' : '✓' },
                    { label: t('Total Paid'), value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'var(--accent-color)', icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pay button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal(true)}
                    style={{ padding: '11px 26px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--brand-gradient)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', boxShadow: 'var(--brand-shadow)' }}>
                    {t('💳 Pay Fees')}
                </motion.button>
            </div>

            {/* Payment history */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t('Payment History')}</div>
                {payments.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>{t('No payments recorded yet.')}</div>
                ) : payments.map((p, i) => (
                    <div key={p._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: i < payments.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💳</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.month || 'Payment'}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.method} · {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success-text)' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: 11, color: 'var(--success-text)' }}>{t('Paid')}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--modal-backdrop)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        onClick={e => e.target === e.currentTarget && setModal(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('Pay Fees')}</div>
                                <button onClick={() => setModal(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>✕</button>
                            </div>
                            <div style={{ padding: '22px 24px' }}>
                                <div style={{ display: 'grid', gap: 14 }}>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('Amount (₹) *')}</label>
                                        <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder={`e.g. ${profile.monthlyFee}`} style={inputSx} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('Payment Method')}</label>
                                        <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} style={{ ...inputSx, cursor: 'pointer' }}>
                                            {['UPI', 'Cash', 'Bank Transfer', 'Card'].map(m => <option key={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{t('For Month')}</label>
                                        <input type="text" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} placeholder={`e.g. February 2025`} style={inputSx} />
                                    </div>
                                </div>
                                {error && <div style={{ marginTop: 12, padding: '9px 12px', background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>⚠ {error}</div>}
                            </div>
                            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button onClick={() => setModal(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer' }}>{t('Cancel')}</button>
                                <button onClick={handlePay} disabled={saving} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Processing…' : 'Confirm Payment'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
