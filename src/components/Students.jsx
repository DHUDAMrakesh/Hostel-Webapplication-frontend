import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const API = '';

const EMPTY_FORM = {
    name: '', roomNumber: '', email: '', phone: '',
    feeDues: 0, monthlyFee: 5000,
};

/* ─── Add / Edit Modal ─── */
function StudentModal({ editData, onClose, onSaved }) {
    const isEdit = !!editData;
    const [form, setForm] = useState(isEdit ? {
        name: editData.name, roomNumber: editData.roomNumber || '',
        email: editData.email || '', phone: editData.phone || '',
        feeDues: editData.feeDues || 0, monthlyFee: editData.monthlyFee || 5000,
    } : { name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            setError('Name and email are required.'); return;
        }
        if (isEdit && !form.roomNumber.trim()) {
            setError('Room number is required.'); return;
        }
        setSaving(true); setError('');
        try {
            if (isEdit) await api.put(`/students/${editData._id}`, form);
            else await api.post(`/students`, form);
            onSaved(form.email);
        } catch (e) {
            setError(e.response?.data?.message || 'Save failed.');
            setSaving(false);
        }
    };

    const inp = {
        width: '100%', padding: '10px 13px', borderRadius: 9,
        border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
        fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif',
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 };
    const focusInp = e => { e.target.style.borderColor = 'var(--accent-muted)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; };
    const blurInp = e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                style={{ background: 'var(--bg-base)', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
            >
                {/* Header */}
                <div style={{ padding: '20px 26px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isEdit ? 'Edit Student' : 'New Student'}</div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{isEdit ? `Editing — ${editData.name}` : 'Add Student'}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 16, cursor: 'pointer' }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 26px' }}>
                    {/* Avatar preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.3)', flexShrink: 0 }}>
                            {form.name ? form.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{form.name || 'Student name'}</span><br />
                            <span style={{ fontSize: 12 }}>{form.email || 'email@example.com'}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {/* Always visible: name, email, phone */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={lbl}>Full Name *</label>
                            <input value={form.name} onChange={set('name')} onFocus={focusInp} onBlur={blurInp} placeholder="e.g. Ravi Kumar" style={inp} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={lbl}>Email *</label>
                            <input type="email" value={form.email} onChange={set('email')} onFocus={focusInp} onBlur={blurInp} placeholder="student@email.com" style={inp} disabled={isEdit} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={lbl}>Phone</label>
                            <input value={form.phone} onChange={set('phone')} onFocus={focusInp} onBlur={blurInp} placeholder="+91 XXXXX XXXXX" style={inp} />
                        </div>

                        {/* Extra fields for editing existing student */}
                        {isEdit && (<>
                            <div>
                                <label style={lbl}>Room Number *</label>
                                <input value={form.roomNumber} onChange={set('roomNumber')} onFocus={focusInp} onBlur={blurInp} placeholder="e.g. 101" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Monthly Fee (₹)</label>
                                <input type="number" value={form.monthlyFee} onChange={set('monthlyFee')} onFocus={focusInp} onBlur={blurInp} style={inp} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={lbl}>Current Dues (₹)</label>
                                <input type="number" value={form.feeDues} onChange={set('feeDues')} onFocus={focusInp} onBlur={blurInp} style={inp} />
                            </div>
                        </>)}
                    </div>

                    {/* Email notice for new students */}
                    {!isEdit && (
                        <div style={{ marginTop: 16, padding: '10px 13px', background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: 9, fontSize: 13, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>✉</span>
                            <span>Login credentials will be auto-generated and emailed to the student.</span>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: 14, padding: '10px 13px', background: 'rgba(225,29,72,0.07)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 9, fontSize: 13, color: '#e11d48' }}>
                            ⚠ {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 26px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
                        {saving ? 'Saving…' : isEdit ? '✓ Update Student' : '+ Add Student'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Student Card ─── */
function StudentCard({ student, onEdit, onDelete, delay }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Remove ${student.name}?`)) return;
        setDeleting(true);
        await onDelete(student._id);
    };

    const dueColor = student.feeDues > 0 ? '#e11d48' : '#059669';

    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{ padding: '20px 22px' }}
        >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.28)', flexShrink: 0 }}>
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Room {student.roomNumber}</div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        onClick={() => onEdit(student)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(79,70,229,0.25)', background: 'rgba(79,70,229,0.07)', color: '#4f46e5', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}
                        title="Edit"
                    >✎</button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(225,29,72,0.25)', background: 'rgba(225,29,72,0.07)', color: '#e11d48', fontSize: 13, cursor: 'pointer', lineHeight: 1, opacity: deleting ? 0.5 : 1 }}
                        title="Remove"
                    >{deleting ? '…' : '🗑'}</button>
                </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {student.email && (
                    <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>✉</span> {student.email}
                    </div>
                )}
                {student.phone && (
                    <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>📞</span> {student.phone}
                    </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📅 Joined {new Date(student.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {student.payments?.length || 0} payment{student.payments?.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Fee strip */}
            <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: 'var(--accent-glow)', border: '1px solid var(--accent-muted)', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Monthly Fee</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>₹{(student.monthlyFee || 5000).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: 10, background: student.feeDues > 0 ? 'rgba(225,29,72,0.08)' : 'rgba(5,150,105,0.08)', border: `1px solid ${student.feeDues > 0 ? 'rgba(225,29,72,0.18)' : 'rgba(5,150,105,0.18)'}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{student.feeDues > 0 ? 'Dues' : 'Status'}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: dueColor }}>
                        {student.feeDues > 0 ? `₹${student.feeDues.toLocaleString('en-IN')}` : '✓ Clear'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Main Component ─── */
export default function Students() {
    const { t } = useLanguage();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | { ...editData }
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'dues' | 'room'
    const [toast, setToast] = useState(null); // { msg, type }

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get(`/students`);
            setStudents(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleDelete = async (id) => {
        await api.delete(`/students/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
    };

    const afterSave = (email) => {
        setModal(null);
        fetchStudents();
        if (email) showToast(`✓ Student added — credentials sent to ${email}`);
    };

    // Filter + sort
    const filtered = students
        .filter(s => {
            const q = search.toLowerCase();
            const matchSearch = s.name.toLowerCase().includes(q) || s.roomNumber.includes(q) || (s.email || '').toLowerCase().includes(q);
            const matchStatus = filterStatus === 'All' ||
                (filterStatus === 'Dues' && s.feeDues > 0) ||
                (filterStatus === 'Clear' && s.feeDues === 0);
            return matchSearch && matchStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'dues') return b.feeDues - a.feeDues;
            if (sortBy === 'room') return a.roomNumber.localeCompare(b.roomNumber);
            return a.name.localeCompare(b.name);
        });

    const totalDues = students.reduce((acc, s) => acc + (s.feeDues || 0), 0);
    const withDues = students.filter(s => s.feeDues > 0).length;
    const totalPaid = students.reduce((acc, s) => acc + (s.payments || []).filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0), 0);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="page-label">Administration</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Manage Students
                    </div>
                    <div className="page-desc">Add, edit and remove student records from the hostel.</div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal('add')}
                    style={{ padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', boxShadow: '0 4px 18px rgba(79,70,229,0.35)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexShrink: 0 }}
                >
                    <span style={{ fontSize: 18 }}>+</span> Add Student
                </motion.button>
            </div>

            {/* Summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 26 }}>
                {[
                    { label: 'Total Students', value: students.length, color: '#4f46e5', icon: '👥' },
                    { label: 'Rooms Occupied', value: [...new Set(students.map(s => s.roomNumber))].length, color: '#0891b2', icon: '🏠' },
                    { label: 'Pending Dues', value: withDues, color: '#e11d48', icon: '⚠' },
                    { label: 'Total Collected', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#059669', icon: '💰' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>{stat.icon}</div>
                        <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {/* Search */}
                <input
                    type="text"
                    placeholder="🔍  Search by name, room or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                />

                {/* Status filter */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Dues', 'Clear'].map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            style={{ padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif', background: filterStatus === f ? 'var(--accent)' : 'var(--bg-elevated)', color: filterStatus === f ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                        >{f === 'Dues' ? '⚠ Dues' : f === 'Clear' ? '✓ Clear' : f}</button>
                    ))}
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="name">Sort: Name</option>
                    <option value="room">Sort: Room</option>
                    <option value="dues">Sort: Dues ↓</option>
                </select>
            </div>

            {/* Count */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
            </div>

            {/* Grid */}
            {
                filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 48, marginBottom: 14 }}>🎓</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No students found</div>
                        <div style={{ fontSize: 13 }}>
                            {students.length === 0
                                ? 'Click "+ Add Student" to enrol the first student.'
                                : 'Try a different search or filter.'}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {filtered.map((s, i) => (
                            <StudentCard
                                key={s._id}
                                student={s}
                                delay={i * 0.05}
                                onEdit={student => setModal(student)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )
            }

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <StudentModal
                        editData={modal === 'add' ? null : modal}
                        onClose={() => setModal(null)}
                        onSaved={afterSave}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        style={{
                            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                            padding: '12px 22px', borderRadius: 14, zIndex: 2000,
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            color: '#fff', fontSize: 14, fontWeight: 600,
                            boxShadow: '0 8px 30px rgba(5,150,105,0.35)',
                            display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
                        }}
                    >
                        <span style={{ fontSize: 18 }}>✉</span>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
