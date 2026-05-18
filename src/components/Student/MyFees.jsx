import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

// ─── Tiny icon components ──────────────────────────────────────────────────
const Ic = ({ d, size = 16, ...p }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
        <path d={d} />
    </svg>
);

const PAYMENT_METHODS = ['Mock', 'UPI', 'Card', 'NetBanking'];

const STATUS_COLOR = {
    Success: { bg: '#dcfce7', border: '#86efac', text: '#16a34a', label: '✓ Paid' },
    Pending: { bg: '#fef9c3', border: '#fde047', text: '#ca8a04', label: '⏳ Pending' },
    Failed: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626', label: '✗ Failed' },
};

// ─── Gateway Simulation Modal ─────────────────────────────────────────────
function GatewayModal({ payment, onSuccess, onFailure, onClose }) {
    const [stage, setStage] = useState('idle'); // idle | processing | done
    const [result, setResult] = useState(null);

    const simulate = async (type) => {
        setStage('processing');
        // Fake 1.8s gateway delay for realism
        await new Promise(r => setTimeout(r, 1800));
        try {
            if (type === 'success') {
                await api.post('/student/payments/mock-success', { paymentId: payment._id });
                setResult('success');
                onSuccess();
            } else {
                await api.post('/student/payments/mock-failure', { paymentId: payment._id });
                setResult('failure');
                onFailure();
            }
        } catch {
            setResult('error');
        }
        setStage('done');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 24, width: '100%', maxWidth: 420,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.4)', overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>🏦 Mock Payment Gateway</div>
                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>Secure Demo Simulation</div>
                    </div>
                    {stage !== 'processing' && (
                        <button onClick={onClose} style={{
                            width: 30, height: 30, borderRadius: '50%', border: 'none',
                            background: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                            color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>✕</button>
                    )}
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Amount box */}
                    <div style={{
                        background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)',
                        border: '1px solid #c7d2fe', borderRadius: 14,
                        padding: '16px 20px', marginBottom: 20, textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount to Pay</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#4f46e5', marginTop: 4 }}>
                            ₹{payment.amount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 4 }}>
                            via {payment.paymentMethod} · Txn: {payment.transactionId}
                        </div>
                    </div>

                    {stage === 'idle' && (
                        <>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
                                ⚠️ <strong>Demo Mode</strong> — Choose an outcome below to simulate the payment
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => simulate('success')}
                                    style={{
                                        padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: 'linear-gradient(135deg,#16a34a,#15803d)',
                                        color: '#fff', fontWeight: 700, fontSize: 14,
                                        fontFamily: 'Outfit,sans-serif', boxShadow: '0 4px 16px rgba(22,163,74,0.4)'
                                    }}>
                                    ✓ Simulate<br />Success
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => simulate('failure')}
                                    style={{
                                        padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                                        color: '#fff', fontWeight: 700, fontSize: 14,
                                        fontFamily: 'Outfit,sans-serif', boxShadow: '0 4px 16px rgba(220,38,38,0.4)'
                                    }}>
                                    ✗ Simulate<br />Failure
                                </motion.button>
                            </div>
                        </>
                    )}

                    {stage === 'processing' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                border: '4px solid #e0e7ff', borderTopColor: '#6366f1',
                                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
                            }} />
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Processing Payment…</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Please wait, do not close this window</div>
                        </div>
                    )}

                    {stage === 'done' && result === 'success' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>Payment Successful!</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Your dues have been updated.</div>
                            <button onClick={onClose} style={{
                                marginTop: 20, padding: '10px 28px', borderRadius: 10, border: 'none',
                                background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700,
                                fontFamily: 'Outfit,sans-serif', cursor: 'pointer'
                            }}>Done</button>
                        </div>
                    )}

                    {stage === 'done' && result === 'failure' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 52, marginBottom: 12 }}>❌</div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#dc2626' }}>Payment Failed</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>No amount was deducted. You can retry.</div>
                            <button onClick={onClose} style={{
                                marginTop: 20, padding: '10px 28px', borderRadius: 10, border: 'none',
                                background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700,
                                fontFamily: 'Outfit,sans-serif', cursor: 'pointer'
                            }}>Close</button>
                        </div>
                    )}

                    {stage === 'done' && result === 'error' && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 52, marginBottom: 12 }}>⚠️</div>
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#d97706' }}>Server Error</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Something went wrong. Please try again.</div>
                            <button onClick={onClose} style={{
                                marginTop: 20, padding: '10px 28px', borderRadius: 10, border: 'none',
                                background: '#d97706', color: '#fff', fontSize: 14, fontWeight: 700,
                                fontFamily: 'Outfit,sans-serif', cursor: 'pointer'
                            }}>Close</button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ─── Create Payment Modal ────────────────────────────────────────────────────
function CreatePaymentModal({ invoice, invoices = [], student, onCreated, onClose }) {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [payType, setPayType] = useState(invoice ? 'invoice' : 'advance');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoice?._id || (invoices[0]?._id || ''));
    const [method, setMethod] = useState('Mock');
    const [amount, setAmount] = useState(invoice ? invoice.totalAmount : (student?.monthlyFee || ''));
    const [fromDate, setFromDate] = useState(firstDay);
    const [toDate, setToDate] = useState(lastDay);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currentInvoice = payType === 'invoice' ? (invoices.find(inv => inv._id === selectedInvoiceId) || invoice) : null;

    useEffect(() => {
        if (payType === 'invoice' && currentInvoice) {
            setAmount(currentInvoice.totalAmount);
        } else if (payType === 'advance') {
            setAmount(student?.monthlyFee || '');
            // Auto-generate note if not manually touched? Or just update it live
            const start = new Date(fromDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            const end = new Date(toDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
            setNote(`Fee for ${start} — ${end}`);
        }
    }, [payType, currentInvoice, student, fromDate, toDate]);

    const handleSubmit = async () => {
        setError('');
        if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return; }
        if (payType === 'invoice' && !selectedInvoiceId) { setError('Select an invoice to pay.'); return; }
        if (payType === 'advance' && (!fromDate || !toDate)) { setError('Please select both From and To dates.'); return; }

        setLoading(true);
        try {
            const body = {
                paymentMethod: method,
                note: payType === 'advance' ? note : `Payment for Invoice #${String(selectedInvoiceId).slice(-6)}`,
                ...(payType === 'invoice' ? { invoiceId: selectedInvoiceId } : { 
                    amount: Number(amount),
                    fromDate,
                    toDate
                })
            };
            const { data } = await api.post('/student/payments/create', body);
            onCreated(data);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create payment.');
        } finally { setLoading(false); }
    };

    const inp = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none',
        boxSizing: 'border-box', color: 'var(--text-primary)',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1500,
            background: 'var(--modal-backdrop)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 20, width: '100%', maxWidth: 440,
                    boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
                }}
            >
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>💳 {payType === 'advance' ? 'Pay Advance/Monthly Fee' : 'Pay Pending Invoice'}</div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>✕</button>
                </div>

                <div style={{ padding: '20px 24px', display: 'grid', gap: 14 }}>
                    {/* Payment Type Toggle */}
                    {!invoice && (
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Payment Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <button
                                    onClick={() => setPayType('advance')}
                                    style={{
                                        padding: '8px', borderRadius: 8, border: payType === 'advance' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                                        background: payType === 'advance' ? '#6366f115' : 'transparent',
                                        color: payType === 'advance' ? '#6366f1' : 'var(--text-secondary)',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                    }}
                                >Monthly / Advance</button>
                                <button
                                    onClick={() => setPayType('invoice')}
                                    disabled={invoices.length === 0}
                                    style={{
                                        padding: '8px', borderRadius: 8, border: payType === 'invoice' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                                        background: payType === 'invoice' ? '#6366f115' : 'transparent',
                                        color: payType === 'invoice' ? '#6366f1' : 'var(--text-secondary)',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        opacity: invoices.length === 0 ? 0.5 : 1
                                    }}
                                >Specific Invoice</button>
                            </div>
                        </div>
                    )}

                    {payType === 'invoice' && (
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Select Invoice</label>
                            {invoice ? (
                                <div style={{ ...inp, background: 'var(--bg-base)', opacity: 0.8 }}>Invoice #{String(invoice._id).slice(-6)} — ₹{invoice.totalAmount.toLocaleString('en-IN')}</div>
                            ) : (
                                <select value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                                    {invoices.map(inv => (
                                        <option key={inv._id} value={inv._id}>
                                            Invoice #{String(inv._id).slice(-6)} (₹{inv.totalAmount.toLocaleString('en-IN')})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Date Range Selection for Advance/Monthly */}
                    {payType === 'advance' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>From Date</label>
                                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inp} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>To Date</label>
                                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inp} />
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Amount (₹)</label>
                        {payType === 'advance'
                            ? <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inp} />
                            : <div style={{ ...inp, opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-base)' }}>₹{Number(amount).toLocaleString('en-IN')}</div>
                        }
                    </div>

                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Payment Method</label>
                        <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>

                    {payType === 'advance' && (
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Note / Details (autofilled)</label>
                            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. For March 2026 / Extra charges" style={inp} />
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '9px 12px', background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>
                            ⚠ {error}
                        </div>
                    )}
                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer' }}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit} disabled={loading}
                        style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creating…' : '🚀 Proceed to Payment'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MyFees() {
    const [profile, setProfile] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('invoices'); // invoices | history
    const [createModal, setCreateModal] = useState(null); // null | { invoice? }
    const [gateway, setGateway] = useState(null);   // null | paymentObj
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [profileRes, invRes, histRes] = await Promise.all([
                api.get('/student/me'),
                api.get('/student/invoices'),
                api.get('/student/payments/history'),
            ]);
            setProfile(profileRes.data);
            setInvoices(invRes.data);
            setHistory(histRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onPaymentCreated = (payment) => {
        setCreateModal(null);
        setGateway(payment);
    };

    const onGatewayClose = () => {
        setGateway(null);
        load(); // refresh all data
    };

    const onGatewaySuccess = () => showToast('Payment successful! Dues updated.');
    const onGatewayFailure = () => showToast('Payment failed. You can retry anytime.');

    const handleDownloadReceipt = async (paymentId) => {
        try {
            const response = await api.get(`/student/payments/receipt/${paymentId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${paymentId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch { showToast('Failed to download receipt.'); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!profile) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛌</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No Profile Found</div>
        </div>
    );

    const successPayments = history.filter(p => p.paymentStatus === 'Success');
    const totalPaid = successPayments.reduce((s, p) => s + p.amount, 0);

    const stats = [
        { label: 'Monthly Fee', value: `₹${(profile.monthlyFee || 0).toLocaleString('en-IN')}`, color: '#6366f1', icon: '📋' },
        { label: 'Fee Dues', value: `₹${(profile.feeDues || 0).toLocaleString('en-IN')}`, color: profile.feeDues > 0 ? '#dc2626' : '#16a34a', icon: profile.feeDues > 0 ? '⚠' : '✓' },
        { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#0891b2', icon: '💰' },
        { label: 'Open Invoices', value: invoices.length, color: '#d97706', icon: '📄' },
    ];

    const tabSx = (active) => ({
        padding: '9px 20px', borderRadius: 10, border: 'none', fontFamily: 'Outfit,sans-serif',
        fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
        background: active ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'var(--bg-elevated)',
        color: active ? '#fff' : 'var(--text-secondary)',
        boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
    });

    return (
        <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
                <div className="page-label">Finance</div>
                <div className="page-title" style={{ background: 'linear-gradient(135deg,#0891b2,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>My Fees</div>
                <div className="page-desc">Track your dues, pay invoices, and download receipts.</div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 10, color: 'var(--success-text)', fontSize: 14, fontWeight: 600 }}>
                        ✓ {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                {stats.map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setCreateModal({})}
                    style={{
                        padding: '11px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff',
                        fontSize: 14, fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                    💳 Pay Fee
                </motion.button>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setTab('invoices')} style={tabSx(tab === 'invoices')}>📄 Invoices {invoices.length > 0 ? `(${invoices.length})` : ''}</button>
                    <button onClick={() => setTab('history')} style={tabSx(tab === 'history')}>🕒 History {history.length > 0 ? `(${history.length})` : ''}</button>
                </div>
            </div>

            {/* ── Invoices tab ── */}
            {tab === 'invoices' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        Pending Invoices
                    </div>
                    <AnimatePresence>
                        {invoices.length === 0 ? (
                            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                                <div style={{ fontWeight: 600 }}>No pending invoices!</div>
                                <div style={{ fontSize: 13, marginTop: 4 }}>You're all clear. You can still pay advance fees above.</div>
                            </div>
                        ) : invoices.map((inv, i) => (
                            <motion.div key={inv._id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 22px',
                                    borderBottom: i < invoices.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Invoice #{String(inv._id).slice(-6)}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                            Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                            {' · '}
                                            <span style={{ color: inv.status === 'Overdue' ? '#dc2626' : '#d97706', fontWeight: 600 }}>{inv.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>₹{inv.totalAmount.toLocaleString('en-IN')}</div>
                                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => setCreateModal({ invoice: inv })}
                                        style={{
                                            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                            background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff',
                                            fontSize: 13, fontWeight: 700, fontFamily: 'Outfit,sans-serif',
                                            boxShadow: '0 3px 12px rgba(99,102,241,0.35)'
                                        }}>
                                        Pay Now
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ── History tab ── */}
            {tab === 'history' && (
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                        Payment History
                    </div>
                    {history.length === 0 ? (
                        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                            <div style={{ fontWeight: 600 }}>No payment records yet.</div>
                        </div>
                    ) : history.map((p, i) => {
                        const sc = STATUS_COLOR[p.paymentStatus] || STATUS_COLOR.Pending;
                        return (
                            <motion.div key={p._id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 22px',
                                    borderBottom: i < history.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: sc.bg, border: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                        {p.paymentStatus === 'Success' ? '✓' : p.paymentStatus === 'Failed' ? '✗' : '⏳'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {p.note || (p.invoiceId ? `Invoice #${String(p.invoiceId._id || p.invoiceId).slice(-6)}` : 'Payment')}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                            {p.paymentMethod} · {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {p.transactionId && ` · Txn: ${p.transactionId.slice(-12)}`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, padding: '2px 8px',
                                            borderRadius: 6, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`
                                        }}>{sc.label}</span>
                                    </div>
                                    {p.paymentStatus === 'Success' && (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDownloadReceipt(p._id)}
                                            title="Download Receipt"
                                            style={{
                                                padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border-subtle)',
                                                background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                                                display: 'flex', alignItems: 'center', gap: 5
                                            }}>
                                            ⬇ Receipt
                                        </motion.button>
                                    )}
                                    {p.paymentStatus === 'Pending' && (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => setGateway(p)}
                                            style={{
                                                padding: '7px 14px', borderRadius: 9, border: 'none',
                                                background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff',
                                                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                                            }}>
                                            Complete
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {createModal && (
                    <CreatePaymentModal
                        invoice={createModal.invoice}
                        invoices={invoices}
                        student={profile}
                        onCreated={onPaymentCreated}
                        onClose={() => setCreateModal(null)}
                    />
                )}
                {gateway && (
                    <GatewayModal
                        payment={gateway}
                        onSuccess={onGatewaySuccess}
                        onFailure={onGatewayFailure}
                        onClose={onGatewayClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
