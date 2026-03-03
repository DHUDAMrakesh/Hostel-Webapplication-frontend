import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
    AreaChart, Area, PieChart, Pie, Cell, Tooltip,
    ResponsiveContainer, XAxis, YAxis
} from 'recharts';

const occupancyData = [
    { month: 'Aug', value: 68 }, { month: 'Sep', value: 74 },
    { month: 'Oct', value: 82 }, { month: 'Nov', value: 79 },
    { month: 'Dec', value: 85 }, { month: 'Jan', value: 88 },
    { month: 'Feb', value: 90 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ padding: '10px 14px', background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{payload[0].value}% occupancy</div>
            </div>
        );
    }
    return null;
};

const cardConfigs = [
    { key: 'totalBeds', label: 'Total Beds', icon: '🛏', glow: '#6366f1', iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', badge: 'up', change: 'Full capacity' },
    { key: 'occupiedBeds', label: 'Occupied', icon: '👥', glow: '#06b6d4', iconBg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', badge: 'up', change: '+2 this week' },
    { key: 'availableBeds', label: 'Available', icon: '🏠', glow: '#10b981', iconBg: 'linear-gradient(135deg,#10b981,#14b8a6)', badge: 'down', change: 'Low stock' },
    { key: 'feeDues', label: 'Outstanding Dues', icon: '₹', glow: '#f43f5e', iconBg: 'linear-gradient(135deg,#f43f5e,#ec4899)', badge: 'up', change: '-5% vs last mo' },
];

// ─── Add Student Modal ────────────────────────────────────────────────────────
function AddStudentModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/students', { name: form.name, email: form.email, phone: form.phone });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <ModalCard title="Add New Student" icon="🎓" accent="#6366f1" onClose={onClose}>
                <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <ModalField label="Full Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Raj Kumar" required />
                    <ModalField label="Email" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="student@example.com" required />
                    <ModalField label="Phone" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+91 9876543210" />
                    {error && <p style={{ color: '#f43f5e', fontSize: 13, margin: 0 }}>{error}</p>}
                    <ModalActions onClose={onClose} loading={loading} submitLabel="Add Student" />
                </form>
            </ModalCard>
        </ModalBackdrop>
    );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
function RecordPaymentModal({ onClose, onSuccess }) {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({ studentId: '', amount: '', month: '', year: new Date().getFullYear(), method: 'Cash', notes: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = months[new Date().getMonth()];

    useEffect(() => {
        api.get('/students').then(r => {
            setStudents(r.data || []);
            setForm(p => ({ ...p, month: currentMonth }));
        }).catch(console.error).finally(() => setFetching(false));
    }, []);

    const handle = async (e) => {
        e.preventDefault();
        if (!form.studentId) { setError('Please select a student.'); return; }
        setError('');
        setLoading(true);
        try {
            // Backend: POST /api/students/:id/payments
            await api.post(`/students/${form.studentId}/payments`, {
                amount: Number(form.amount),
                month: `${form.month} ${form.year}`,
                method: form.method,
                status: 'Paid',
                note: form.notes,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <ModalCard title="Record Payment" icon="💳" accent="#10b981" onClose={onClose}>
                {fetching ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>Loading students…</div> : (
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Student</label>
                            <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} required style={inputStyle}>
                                <option value="">Select student…</option>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}
                            </select>
                        </div>
                        <ModalField label="Amount (₹)" type="number" value={form.amount} onChange={v => setForm(p => ({ ...p, amount: v }))} placeholder="5000" required min="1" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Month</label>
                                <select value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} style={inputStyle}>
                                    {months.map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <ModalField label="Year" type="number" value={form.year} onChange={v => setForm(p => ({ ...p, year: v }))} min="2020" max="2099" />
                        </div>
                        <div>
                            <label style={labelStyle}>Payment Method</label>
                            <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))} style={inputStyle}>
                                {['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'].map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <ModalField label="Notes (optional)" value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="e.g. Room 101 fee" />
                        {error && <p style={{ color: '#f43f5e', fontSize: 13, margin: 0 }}>{error}</p>}
                        <ModalActions onClose={onClose} loading={loading} submitLabel="Record Payment" accentColor="#10b981" />
                    </form>
                )}
            </ModalCard>
        </ModalBackdrop>
    );
}

// ─── View Reports Modal ───────────────────────────────────────────────────────
function ViewReportsModal({ stats, onClose }) {
    const occupancyPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;
    const items = [
        { label: 'Total Beds', value: stats.totalBeds, color: '#6366f1', icon: '🛏' },
        { label: 'Occupied Beds', value: stats.occupiedBeds, color: '#0ea5e9', icon: '👥' },
        { label: 'Available Beds', value: stats.availableBeds, color: '#10b981', icon: '🏠' },
        { label: 'Occupancy Rate', value: `${occupancyPct}%`, color: '#f59e0b', icon: '📊' },
        { label: 'Outstanding Dues', value: `₹${Number(stats.feeDues || 0).toLocaleString('en-IN')}`, color: '#f43f5e', icon: '₹' },
    ];
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalCard title="Hostel Report" icon="📈" accent="#8b5cf6" onClose={onClose}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Live snapshot — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</span>
                        </div>
                    ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Occupancy Rate</span><span>{occupancyPct}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${occupancyPct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                </div>
                <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    Close Report
                </button>
            </ModalCard>
        </ModalBackdrop>
    );
}

// ─── Shared Modal Primitives ──────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Outfit, sans-serif', outline: 'none', transition: 'border-color 0.2s' };

function ModalField({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                required={required} min={min} max={max}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
        </div>
    );
}

function ModalActions({ onClose, loading, submitLabel, accentColor = '#6366f1' }) {
    return (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Outfit, sans-serif', transition: 'opacity 0.2s' }}>
                {loading ? 'Saving…' : submitLabel}
            </button>
        </div>
    );
}

function ModalBackdrop({ onClose, children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
            <div onClick={e => e.stopPropagation()}>{children}</div>
        </motion.div>
    );
}

function ModalCard({ title, icon, accent, onClose, children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            style={{ width: '100%', maxWidth: 440, background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-subtle)', boxShadow: `0 0 0 1px ${accent}22, 0 40px 80px rgba(0,0,0,0.35)`, padding: 28, position: 'relative' }}
        >
            {/* Accent glow */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: accent, filter: 'blur(60px)', opacity: 0.18, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${accent}33, ${accent}11)`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {icon}
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 6px', borderRadius: 6 }}>×</button>
            </div>
            {children}
        </motion.div>
    );
}

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, []);
    const colors = { success: '#10b981', error: '#f43f5e', info: '#6366f1' };
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }}
            style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 2000, padding: '12px 20px', borderRadius: 12, background: 'var(--bg-surface)', border: `1px solid ${colors[type]}55`, boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px ${colors[type]}22`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}
        >
            <span style={{ fontSize: 18 }}>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            {message}
        </motion.div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const role = user?.role || 'admin';

    const [stats, setStats] = useState({ totalBeds: 0, occupiedBeds: 0, availableBeds: 0, feeDues: 0 });
    const [modal, setModal] = useState(null); // 'addStudent' | 'recordPayment' | 'reports'
    const [toast, setToast] = useState(null);

    const fetchStats = () => api.get('/stats').then(r => setStats(r.data)).catch(console.error);

    useEffect(() => { fetchStats(); }, []);

    const showToast = (message, type = 'success') => setToast({ message, type, id: Date.now() });

    const occupancyPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;
    const pieData = [
        { name: 'Occupied', value: stats.occupiedBeds },
        { name: 'Available', value: stats.availableBeds },
    ];

    const formatValue = (key, val) => {
        if (key === 'feeDues') return `₹${Number(val).toLocaleString('en-IN')}`;
        return val;
    };

    const quickActions = [
        {
            label: t('Add Student'),
            desc: 'Enroll a new student',
            icon: '🎓',
            accent: '#6366f1',
            glow: 'rgba(99,102,241,0.15)',
            border: 'rgba(99,102,241,0.25)',
            action: () => setModal('addStudent'),
        },
        {
            label: t('Record Payment'),
            desc: 'Log a fee payment',
            icon: '💳',
            accent: '#10b981',
            glow: 'rgba(16,185,129,0.15)',
            border: 'rgba(16,185,129,0.25)',
            action: () => setModal('recordPayment'),
        },
        {
            label: t('Manage Rooms'),
            desc: 'View & assign beds',
            icon: '🏠',
            accent: '#0ea5e9',
            glow: 'rgba(14,165,233,0.15)',
            border: 'rgba(14,165,233,0.25)',
            action: () => navigate(`/${role}/rooms`),
        },
        {
            label: t('View Reports'),
            desc: 'Live hostel snapshot',
            icon: '📊',
            accent: '#8b5cf6',
            glow: 'rgba(139,92,246,0.15)',
            border: 'rgba(139,92,246,0.25)',
            action: () => setModal('reports'),
        },
        {
            label: t('Students'),
            desc: 'Browse all students',
            icon: '👥',
            accent: '#f59e0b',
            glow: 'rgba(245,158,11,0.15)',
            border: 'rgba(245,158,11,0.25)',
            action: () => navigate(`/${role}/students`),
        },
        {
            label: t('Manage Payments'),
            desc: 'Payment history',
            icon: '₹',
            accent: '#f43f5e',
            glow: 'rgba(244,63,94,0.15)',
            border: 'rgba(244,63,94,0.25)',
            action: () => navigate(`/${role}/payments`),
        },
    ];

    return (
        <div className="dashboard">
            {/* Header */}
            <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="page-label">{t('Overview')}</div>
                <div className="page-title">{t('Dashboard')}</div>
                <div className="page-desc">{t('Real-time hostel performance metrics.')}</div>
            </motion.div>

            {/* Stat Cards */}
            <div className="stats-grid">
                {cardConfigs.map((c, i) => (
                    <motion.div
                        key={c.key}
                        className="card stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="stat-glow" style={{ background: c.glow }} />
                        <div className="stat-card-top">
                            <div className="stat-icon" style={{ background: c.iconBg }}>
                                <span style={{ fontSize: 20, color: 'white' }}>{c.icon}</span>
                            </div>
                            <span className={`stat-badge ${c.badge}`}>{c.change}</span>
                        </div>
                        <div className="stat-label">{t(c.label)}</div>
                        <div className="stat-value">{formatValue(c.key, stats[c.key])}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-row">
                <motion.div className="card chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="chart-header">
                        <div>
                            <div className="chart-title-label">{t('Occupancy Trend')}</div>
                            <div className="chart-title-value">{occupancyPct}% {t('this month')}</div>
                        </div>
                        <div className="chart-trend">↑ +6% vs last month</div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={occupancyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="card pie-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
                    <div className="chart-title-label" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>{t('Bed Utilization')}</div>
                    <div style={{ position: 'relative' }}>
                        <ResponsiveContainer width={160} height={160}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                                    <Cell fill="#6366f1" />
                                    <Cell fill="var(--bg-elevated)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{occupancyPct}%</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('Occupied')}</span>
                        </div>
                    </div>
                    <div className="pie-legend">
                        {[{ label: t('Occupied'), color: '#6366f1', val: stats.occupiedBeds }, { label: t('Available'), color: 'var(--bg-elevated)', val: stats.availableBeds }].map(l => (
                            <div key={l.label} className="pie-legend-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="pie-dot" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                                    <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                                </div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.val}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions — Premium Redesign */}
            <motion.div className="card" style={{ padding: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <div className="chart-title-label">{t('Quick Actions')}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>Manage Your Hostel</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 8, padding: '4px 10px', border: '1px solid var(--border-subtle)' }}>
                        6 actions
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {quickActions.map((action, i) => (
                        <motion.button
                            key={action.label}
                            onClick={action.action}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.06 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '16px 18px',
                                borderRadius: 14,
                                background: action.glow,
                                border: `1px solid ${action.border}`,
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'Outfit, sans-serif',
                                transition: 'box-shadow 0.2s',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 24px ${action.glow}`}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                                background: `linear-gradient(135deg, ${action.accent}22, ${action.accent}11)`,
                                border: `1px solid ${action.accent}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20,
                            }}>
                                {action.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{action.desc}</div>
                            </div>
                            {/* Arrow */}
                            <div style={{ fontSize: 16, color: action.accent, fontWeight: 700, flexShrink: 0 }}>↗</div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {modal === 'addStudent' && (
                    <AddStudentModal
                        key="addStudent"
                        onClose={() => setModal(null)}
                        onSuccess={() => { fetchStats(); showToast('Student added successfully!'); }}
                    />
                )}
                {modal === 'recordPayment' && (
                    <RecordPaymentModal
                        key="recordPayment"
                        onClose={() => setModal(null)}
                        onSuccess={() => { fetchStats(); showToast('Payment recorded!'); }}
                    />
                )}
                {modal === 'reports' && (
                    <ViewReportsModal key="reports" stats={stats} onClose={() => setModal(null)} />
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDone={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
