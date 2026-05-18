import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

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
function AddPaymentModal({ student, students, onClose, onSaved }) {
    const [selectedStudentId, setSelectedStudentId] = useState(student?._id || '');
    const defaultAmount = student ? student.monthlyFee : 5000;

    const [form, setForm] = useState({
        amount: defaultAmount || 5000,
        month: `${MONTHS[new Date().getMonth()]} ${curYear}`,
        method: 'Cash',
        status: 'Paid',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = k => v => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!selectedStudentId) { setError('Please select a student.'); return; }
        if (!form.amount || form.amount <= 0) { setError('Enter a valid amount.'); return; }
        setSaving(true);
        try {
            await api.post(`/students/${selectedStudentId}/payments`, form);
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
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{student ? `Add Payment — ${student.name}` : `Add Payment`}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!student && (
                        <div>
                            <label style={labelStyle}>Select Student</label>
                            <select value={selectedStudentId} onChange={e => {
                                const st = students.find(s => s._id === e.target.value);
                                setSelectedStudentId(e.target.value);
                                if (st && st.monthlyFee) set('amount')(st.monthlyFee);
                            }} style={{ ...inputStyle, cursor: 'pointer' }}>
                                <option value="">— Select a student —</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} (Room {s.roomNumber})</option>
                                ))}
                            </select>
                        </div>
                    )}

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
                                {['Cash', 'UPI', 'Bank Transfer', 'Card', 'Refund'].map(m => <option key={m}>{m}</option>)}
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

/* ─── Edit Payment Modal ─── */
function EditPaymentModal({ student, editData, onClose, onSaved }) {
    const [form, setForm] = useState(editData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = k => v => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.amount || form.amount === '') { setError('Enter a valid amount.'); return; }
        setSaving(true);
        try {
            await api.put(`/students/${student._id}/payments/${editData._id}`, form);
            onSaved();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to save.');
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} style={{ width: '100%', maxWidth: 440, background: 'var(--bg-base)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 50px rgba(0,0,0,0.2), 0 0 0 1px var(--border-subtle)' }}>
                <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Correct Record</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Edit Payment — {student.name}</div>
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
                                {['Cash', 'UPI', 'Bank Transfer', 'Card', 'Refund'].map(m => <option key={m}>{m}</option>)}
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
                        <input type="text" placeholder="e.g. Corrected amount, late fee..." value={form.note} onChange={e => set('note')(e.target.value)} style={inputStyle} />
                    </div>
                    {error && <div style={{ padding: '9px 12px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48' }}>⚠ {error}</div>}
                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                        {saving ? 'Saving…' : 'Save Changes'}
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
function StudentDetail({ student, onAddPayment, onDeletePayment, onEdit, onDelete, onSendReminder, reminderLoading, reminderResult, isAdmin, canManage }) {
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
                    {/* Action buttons — admin only */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {isAdmin && (
                            <>
                                <button onClick={onEdit} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(79,70,229,0.25)', background: 'rgba(79,70,229,0.07)', color: '#4f46e5', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>✎ Edit</button>
                                <button onClick={onDelete} style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(225,29,72,0.25)', background: 'rgba(225,29,72,0.07)', color: '#e11d48', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>🗑 Remove</button>
                            </>
                        )}
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
                    <div style={{ display: 'flex', gap: 8 }}>
                        {canManage && (
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                onClick={onAddPayment}
                                style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}
                            >+ Add Payment</motion.button>
                        )}

                        {/* WhatsApp Reminder button */}
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={onSendReminder}
                            disabled={reminderLoading || !student.phone}
                            title={!student.phone ? 'No phone number on record' : 'Send WhatsApp fee reminder to student'}
                            style={{
                                padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(37,211,102,0.35)',
                                cursor: reminderLoading || !student.phone ? 'not-allowed' : 'pointer',
                                background: 'rgba(37,211,102,0.1)', color: '#25d366',
                                fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                                opacity: reminderLoading || !student.phone ? 0.6 : 1,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            {reminderLoading ? '⏳ Sending…' : '📲 Remind'}
                        </motion.button>
                    </div>
                </div>{/* end header flex row */}

                {/* WhatsApp reminder result banner — auto-clears after 5s */}
                {reminderResult && (
                    <div style={{
                        padding: '9px 14px', borderRadius: 10, marginBottom: 12,
                        background: reminderResult.ok ? 'rgba(37,211,102,0.1)' : 'rgba(225,29,72,0.08)',
                        border: `1px solid ${reminderResult.ok ? 'rgba(37,211,102,0.3)' : 'rgba(225,29,72,0.2)'}`,
                        fontSize: 13, color: reminderResult.ok ? '#25d366' : '#e11d48',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        {reminderResult.ok ? '✅' : '❌'} {reminderResult.message}
                    </div>
                )}

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
                                    {p.amount < 0 ? '-' : ''}₹{Math.abs(Number(p.amount)).toLocaleString('en-IN')}
                                </div>
                                <Badge status={p.status} />
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button
                                            onClick={() => onEditPayment(p)}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.06)', color: '#10b981', fontSize: 12, cursor: 'pointer', lineHeight: 1 }}
                                            title="Correct payment"
                                        >✎</button>
                                        <button
                                            onClick={() => onDeletePayment(p._id)}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', fontSize: 12, cursor: 'pointer', lineHeight: 1 }}
                                            title="Delete record"
                                        >🗑</button>
                                    </div>
                                )}
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
    const { user } = useAuth();
    const role = (user?.role || '').toLowerCase().trim();
    const isAdmin = role === 'admin';
    const canManage = role === 'admin' || role === 'manager';
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [modal, setModal] = useState(null);
    const [editPaymentData, setEditPaymentData] = useState(null);
    const [confirmStudent, setConfirmStudent] = useState(false);
    const [confirmPaymentId, setConfirmPaymentId] = useState(null);
    const [reminderLoading, setReminderLoading] = useState(false);
    const [reminderResult, setReminderResult] = useState(null);
    // New: mock payment status tab
    const [mainTab, setMainTab] = useState('manual');  // 'manual' | 'status' | 'pending'
    const [paymentStatus, setPaymentStatus] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [statusLoading, setStatusLoading] = useState(false);

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

    const fetchPaymentStatus = async () => {
        setStatusLoading(true);
        try {
            const [statusRes, pendingRes] = await Promise.all([
                api.get('/manager/payments/students'),
                api.get('/manager/payments/pending'),
            ]);
            setPaymentStatus(statusRes.data);
            setPendingPayments(pendingRes.data);
        } catch (e) { console.error(e); }
        finally { setStatusLoading(false); }
    };

    useEffect(() => {
        fetchStudents();
        fetchPaymentStatus();
    }, []);

    const handleDeleteStudent = async () => {
        if (!selected) return;
        await api.delete(`/students/${selected._id}`);
        const remaining = students.filter(s => s._id !== selected._id);
        setStudents(remaining);
        setSelected(remaining[0] || null);
        setConfirmStudent(false);
    };

    const handleDeletePayment = async (pid) => {
        await api.delete(`/students/${selected._id}/payments/${pid}`);
        setConfirmPaymentId(null);
        fetchStudents();
    };

    const afterModal = () => { setModal(null); fetchStudents(); };

    const handleSendReminder = async () => {
        if (!selected) return;
        setReminderLoading(true);
        setReminderResult(null);
        try {
            const { data } = await api.post(`/notifications/send-reminder/${selected._id}`);
            setReminderResult({ ok: true, message: data.message || 'WhatsApp reminder sent!' });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reminder.';
            setReminderResult({ ok: false, message: msg });
        } finally {
            setReminderLoading(false);
            // Auto-clear result banner after 5s
            setTimeout(() => setReminderResult(null), 5000);
        }
    };

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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="page-label">Finance</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Manage Payments
                    </div>
                    <div className="page-desc">Track fees, dues and payment history for every student.</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    {canManage && (
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={() => { setModal('addPaymentGlobal'); }}
                            style={{ padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 18px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <span style={{ fontSize: 18 }}>+</span> Add Payment
                        </motion.button>
                    )}
                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setModal('addStudent')}
                            style={{ padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 18px rgba(79,70,229,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <span style={{ fontSize: 18 }}>+</span> Add Student
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Main tab switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                {[{ id: 'manual', label: '💳 Payment Records' }, { id: 'status', label: '📊 Payment Status' }, { id: 'pending', label: '⏳ Pending Invoices' }].map(tab => (
                    <button key={tab.id} onClick={() => setMainTab(tab.id)}
                        style={{
                            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.18s',
                            background: mainTab === tab.id ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'var(--bg-elevated)',
                            color: mainTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: mainTab === tab.id ? '0 4px 14px rgba(79,70,229,0.3)' : 'none',
                        }}
                    >{tab.label}</button>
                ))}
            </div>

            {/* ── TAB: MANUAL PAYMENT RECORDS ── */}
            {mainTab === 'manual' && (
                <>
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
                                onDeletePayment={(pid) => setConfirmPaymentId(pid)}
                                onEdit={() => setModal('editStudent')}
                                onDelete={() => setConfirmStudent(true)}
                                onSendReminder={handleSendReminder}
                                reminderLoading={reminderLoading}
                                reminderResult={reminderResult}
                                isAdmin={isAdmin}
                                canManage={canManage}
                            />
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 48 }}>👈</div>
                                <div style={{ fontSize: 15, fontWeight: 500 }}>Select a student to view details</div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── TAB: PAYMENT STATUS (from mock payment system) ── */}
            {mainTab === 'status' && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                    {statusLoading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                        </div>
                    ) : paymentStatus.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No payment data available.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                                    {['Student', 'Room', 'Dues', 'Open Invoices', 'Last Payment', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '13px 18px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paymentStatus.map((s, i) => {
                                    const lp = s.latestPayment;
                                    const hasIssue = s.feeDues > 0 || s.openInvoices > 0;
                                    return (
                                        <tr key={s.studentId} style={{ borderBottom: i < paymentStatus.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                                            </td>
                                            <td style={{ padding: '14px 18px', fontSize: 13 }}>Room {s.roomNumber || '—'}</td>
                                            <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 700, color: s.feeDues > 0 ? '#dc2626' : '#16a34a' }}>
                                                ₹{(s.feeDues || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '14px 18px', fontSize: 13, color: s.openInvoices > 0 ? '#ca8a04' : 'var(--text-muted)' }}>{s.openInvoices}</td>
                                            <td style={{ padding: '14px 18px' }}>
                                                {lp ? (
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600 }}>₹{lp.amount.toLocaleString('en-IN')}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(lp.createdAt).toLocaleDateString('en-IN')} · {lp.paymentMethod}</div>
                                                    </div>
                                                ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No payments</span>}
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                                                    background: hasIssue ? '#fee2e2' : '#dcfce7',
                                                    color: hasIssue ? '#dc2626' : '#16a34a'
                                                }}>{hasIssue ? '⚠ Action Needed' : '✓ Clear'}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── TAB: PENDING INVOICES ── */}
            {mainTab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {statusLoading ? (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                        </div>
                    ) : pendingPayments.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                            <div style={{ fontWeight: 600, fontSize: 16 }}>All invoices are paid!</div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>No students have outstanding invoices.</div>
                        </div>
                    ) : pendingPayments.map((entry, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚠</div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700 }}>{entry.student?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Room {entry.student?.roomNumber || '—'} · {entry.invoices.length} invoice{entry.invoices.length !== 1 ? 's' : ''} pending</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>
                                    ₹{entry.student?.feeDues?.toLocaleString('en-IN') || '0'} due
                                </div>
                            </div>
                            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {entry.invoices.map(inv => (
                                    <div key={inv._id} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', fontSize: 13 }}>
                                        <span style={{ fontWeight: 600 }}>₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                                        <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span>
                                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: inv.status === 'Overdue' ? '#dc2626' : '#ca8a04' }}>• {inv.status}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}


            {/* Modals */}
            <AnimatePresence>
                {modal === 'addStudent' && <StudentModal onClose={() => setModal(null)} onSaved={afterModal} />}
                {modal === 'editStudent' && selected && <StudentModal editData={selected} onClose={() => setModal(null)} onSaved={afterModal} />}
                {modal === 'addPayment' && selected && <AddPaymentModal student={selected} students={students} onClose={() => setModal(null)} onSaved={afterModal} />}
                {modal === 'addPaymentGlobal' && <AddPaymentModal student={null} students={students} onClose={() => setModal(null)} onSaved={afterModal} />}
            </AnimatePresence>

            {/* Confirm — Remove Student */}
            <ConfirmModal
                open={confirmStudent}
                icon="🗑"
                title="Remove Student?"
                message={selected ? `This will permanently remove ${selected.name} from the system, including all payment records.` : ''}
                confirmText="Yes, Remove"
                cancelText="Cancel"
                onConfirm={handleDeleteStudent}
                onCancel={() => setConfirmStudent(false)}
            />

            {/* Confirm — Delete Payment */}
            <ConfirmModal
                open={!!confirmPaymentId}
                icon="🧾"
                title="Delete Payment Record?"
                message="This payment record will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={() => handleDeletePayment(confirmPaymentId)}
                onCancel={() => setConfirmPaymentId(null)}
            />
        </div >
    );
}
