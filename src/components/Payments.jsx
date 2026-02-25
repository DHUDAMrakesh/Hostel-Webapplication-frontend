import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const API = '';
const METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card'];
const STATUSES = ['Paid', 'Pending', 'Overdue'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const curYear = new Date().getFullYear();
const MONTH_OPTIONS = MONTHS.flatMap(m => [`${m} ${curYear}`, `${m} ${curYear - 1}`]);

/* ─── Shared tokens ─── */
const STATUS_STYLE = {
    Paid: { color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)' },
    Pending: { color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)' },
    Overdue: { color: '#e11d48', bg: 'rgba(225,29,72,0.1)', border: 'rgba(225,29,72,0.25)' },
};

const Badge = ({ status }) => {
    const s = STATUS_STYLE[status] || STATUS_STYLE['Paid'];
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            color: s.color, background: s.bg, border: `1px solid ${s.border}`,
        }}>{status}</span>
    );
};

/* ─── Add Payment Modal ─── */
function AddPaymentModal({ student, onClose, onSaved }) {
    const [form, setForm] = useState({
        amount: student.monthlyFee || 5000,
        month: `${MONTHS[new Date().getMonth()]} ${curYear}`,
        method: 'Cash',
        status: 'Paid',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = k => v => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.amount || form.amount <= 0) { setError('Enter a valid amount.'); return; }
        setSaving(true);
        try {
            await api.post(`/students/${student._id}/payments`, form);
            onSaved();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save.');
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif',
        outline: 'none', boxSizing: 'border-box',
    };
    const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{
                    background: 'var(--bg-base)', borderRadius: 18, width: '100%', maxWidth: 460,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Transaction</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Add Payment — {student.name}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Amount (₹)</label>
                            <input type="number" value={form.amount} onChange={e => set('amount')(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>For Month</label>
                            <select value={form.month} onChange={e => set('month')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {MONTH_OPTIONS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Payment Method</label>
                            <select value={form.method} onChange={e => set('method')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {METHODS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select value={form.status} onChange={e => set('status')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Note (optional)</label>
                        <input type="text" placeholder="e.g. Paid via UPI ref #12345" value={form.note} onChange={e => set('note')(e.target.value)} style={inputStyle} />
                    </div>
                    {error && <div style={{ padding: '9px 12px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>⚠ {error}</div>}
                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                        {saving ? 'Saving…' : '+ Add Payment'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Add/Edit Student Modal ─── */
function StudentModal({ editData, onClose, onSaved }) {
    const isEdit = !!editData;
    const [form, setForm] = useState(editData ? {
        name: editData.name, roomNumber: editData.roomNumber,
        email: editData.email || '', phone: editData.phone || '',
        feeDues: editData.feeDues || 0, monthlyFee: editData.monthlyFee || 5000,
    } : { name: '', roomNumber: '', email: '', phone: '', feeDues: 0, monthlyFee: 5000 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.name.trim() || !form.roomNumber.trim()) { setError('Name and Room Number are required.'); return; }
        setSaving(true);
        try {
            if (isEdit) await api.put(`/students/${editData._id}`, form);
            else await api.post(`/students`, form);
            onSaved();
        } catch (e) {
            setError(e.response?.data?.message || 'Save failed.');
            setSaving(false);
        }
    };

    const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                style={{ background: 'var(--bg-base)', borderRadius: 18, width: '100%', maxWidth: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isEdit ? 'Edit Student' : 'New Student'}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{isEdit ? `Editing — ${editData.name}` : 'Add Student'}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={labelStyle}>Full Name *</label><input value={form.name} onChange={set('name')} placeholder="Student name" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Room Number *</label><input value={form.roomNumber} onChange={set('roomNumber')} placeholder="e.g. 101" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="student@email.com" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Monthly Fee (₹)</label><input type="number" value={form.monthlyFee} onChange={set('monthlyFee')} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Current Dues (₹)</label><input type="number" value={form.feeDues} onChange={set('feeDues')} style={inputStyle} /></div>
                    </div>
                    {error && <div style={{ padding: '9px 12px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>⚠ {error}</div>}
                </div>
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                        {saving ? 'Saving…' : isEdit ? '✓ Update' : '+ Add Student'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Student Detail Panel ─── */
function StudentDetail({ student, onAddPayment, onDeletePayment, onEdit, onDelete }) {
    const totalPaid = student.payments.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);

    return (
        <motion.div
            key={student._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}
        >
            {/* Student header card */}
            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
                            boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                        }}>
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                                Room {student.roomNumber}
                                {student.email && ` · ${student.email}`}
                                {student.phone && ` · ${student.phone}`}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, opacity: 0.8 }}>
                                Joined {new Date(student.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={onEdit} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(79,70,229,0.25)', background: 'rgba(79,70,229,0.07)', color: '#4f46e5', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>✎ Edit</button>
                        <button onClick={onDelete} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(225,29,72,0.25)', background: 'rgba(225,29,72,0.07)', color: '#e11d48', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>🗑 Remove</button>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                    {[
                        { label: 'Monthly Fee', value: `₹${(student.monthlyFee || 5000).toLocaleString('en-IN')}`, color: '#4f46e5' },
                        { label: 'Total Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#059669' },
                        { label: 'Outstanding Dues', value: `₹${(student.feeDues || 0).toLocaleString('en-IN')}`, color: student.feeDues > 0 ? '#e11d48' : '#059669' },
                    ].map(stat => (
                        <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{stat.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment history */}
            <div className="card" style={{ padding: 24, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction History</div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                            {student.payments.length} record{student.payments.length !== 1 && 's'}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={onAddPayment}
                        style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
                    >+ Add Payment</motion.button>
                </div>

                {student.payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                        <div style={{ fontSize: 14 }}>No payments recorded yet.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[...student.payments].reverse().map((p, i) => (
                            <motion.div key={p._id}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                                    borderRadius: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: STATUS_STYLE[p.status]?.bg || 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    {p.status === 'Paid' ? '✓' : p.status === 'Pending' ? '⏳' : '⚠'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.month || '—'}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {p.method} · {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {p.note && ` · ${p.note}`}
                                    </div>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: STATUS_STYLE[p.status]?.color || 'var(--text-primary)', flexShrink: 0 }}>
                                    ₹{Number(p.amount).toLocaleString('en-IN')}
                                </div>
                                <Badge status={p.status} />
                                <button
                                    onClick={() => onDeletePayment(p._id)}
                                    style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', fontSize: 12, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
                                    title="Delete record"
                                >🗑</button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ─── Main Component ─── */
export default function Payments() {
    const { t } = useLanguage();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [modal, setModal] = useState(null); // null | 'addStudent' | 'editStudent' | 'addPayment'

    const fetchStudents = async () => {
        try {
            const { data } = await api.get(`/students`);
            setStudents(data);
            if (!selected && data.length) setSelected(data[0]);
            else if (selected) {
                const refreshed = data.find(s => s._id === selected._id);
                setSelected(refreshed || data[0] || null);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleDeleteStudent = async () => {
        if (!selected || !window.confirm(`Remove ${selected.name} from the system?`)) return;
        await api.delete(`/students/${selected._id}`);
        const remaining = students.filter(s => s._id !== selected._id);
        setStudents(remaining);
        setSelected(remaining[0] || null);
    };

    const handleDeletePayment = async (pid) => {
        if (!window.confirm('Delete this payment record?')) return;
        await api.delete(`/students/${selected._id}/payments/${pid}`);
        fetchStudents();
    };

    const afterModal = () => { setModal(null); fetchStudents(); };

    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.roomNumber.includes(search);
        const matchStatus = filterStatus === 'All' ||
            (filterStatus === 'Dues' && s.feeDues > 0) ||
            (filterStatus === 'Clear' && s.feeDues === 0);
        return matchSearch && matchStatus;
    });

    const totalDues = students.reduce((a, s) => a + (s.feeDues || 0), 0);
    const withDues = students.filter(s => s.feeDues > 0).length;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 1300, margin: '0 auto' }}>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="page-label">Finance</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Manage Payments
                    </div>
                    <div className="page-desc">Track fees, dues and payment history for every student.</div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal('addStudent')}
                    style={{ padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 18px rgba(79,70,229,0.35)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}
                >
                    <span style={{ fontSize: 18 }}>+</span> Add Student
                </motion.button>
            </div>

            {/* Summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total Students', value: students.length, color: '#4f46e5', icon: '👥' },
                    { label: 'With Pending Dues', value: withDues, color: '#e11d48', icon: '⚠' },
                    { label: 'Total Outstanding', value: `₹${totalDues.toLocaleString('en-IN')}`, color: '#d97706', icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Student list */}
                <div style={{ width: 240, flexShrink: 0 }}>
                    {/* Search + filter */}
                    <div style={{ marginBottom: 12 }}>
                        <input
                            type="text"
                            placeholder="🔍  Name or room…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['All', 'Dues', 'Clear'].map(f => (
                                <button key={f} onClick={() => setFilterStatus(f)}
                                    style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Outfit, sans-serif', background: filterStatus === f ? 'var(--accent)' : 'var(--bg-elevated)', color: filterStatus === f ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                                >{f}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {filtered.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No students found</div>}
                        {filtered.map(s => (
                            <motion.button
                                key={s._id}
                                whileHover={{ x: 2 }}
                                onClick={() => setSelected(s)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                                    border: `1px solid ${selected?._id === s._id ? 'var(--accent-muted)' : 'transparent'}`,
                                    background: selected?._id === s._id ? 'var(--accent-glow)' : 'var(--bg-surface)',
                                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: selected?._id === s._id ? 'var(--accent)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                                    {s.feeDues > 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48', flexShrink: 0 }} />}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Room {s.roomNumber}</div>
                                {s.feeDues > 0 && <div style={{ fontSize: 11, color: '#e11d48', marginTop: 2, fontWeight: 600 }}>₹{s.feeDues.toLocaleString('en-IN')} due</div>}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Detail panel */}
                {selected ? (
                    <StudentDetail
                        student={selected}
                        onAddPayment={() => setModal('addPayment')}
                        onDeletePayment={handleDeletePayment}
                        onEdit={() => setModal('editStudent')}
                        onDelete={handleDeleteStudent}
                    />
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 48 }}>👈</div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>Select a student to view details</div>
                    </div>
                )}
            </div>


            {/* Modals */}
            <AnimatePresence>
                {modal === 'addStudent' && <StudentModal onClose={() => setModal(null)} onSaved={afterModal} />}
                {modal === 'editStudent' && selected && <StudentModal editData={selected} onClose={() => setModal(null)} onSaved={afterModal} />}
                {modal === 'addPayment' && selected && <AddPaymentModal student={selected} onClose={() => setModal(null)} onSaved={afterModal} />}
            </AnimatePresence>
        </div >
    );
}
