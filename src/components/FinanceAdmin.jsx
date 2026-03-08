import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SkeletonPage } from './Skeleton';
import useDebounce from '../hooks/useDebounce';

const inputSx = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
    fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none',
    color: 'var(--text-primary)', boxSizing: 'border-box', transition: 'border 0.2s',
};
const labelSx = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };

/* ─── Tabs ─── */
const TABS = ['Invoices', 'Fee Plans', 'Reports'];

/* ─── Fee Plan Modal ─── */
function FeePlanModal({ editData, onClose, onRefresh }) {
    const isEdit = !!editData;
    const [form, setForm] = useState(editData || {
        name: '', amount: '', frequency: 'Monthly', description: ''
    });
    const [saving, setSaving] = useState(false);
    const set = k => v => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.name || !form.amount) return alert('Name and Amount are required.');
        setSaving(true);
        try {
            if (isEdit) await api.put(`/finance/fee-plans/${form._id}`, form);
            else await api.post('/finance/fee-plans', form);
            onRefresh();
            onClose();
        } catch (e) {
            alert(e.response?.data?.message || 'Save failed.');
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 20 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: 460, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{isEdit ? 'Edit Fee Plan' : 'New Fee Plan'}</div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label style={labelSx}>Plan Name</label><input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="e.g. Annual Hostel Fee" style={inputSx} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={labelSx}>Amount (₹)</label><input type="number" value={form.amount} onChange={e => set('amount')(e.target.value)} style={inputSx} /></div>
                        <div>
                            <label style={labelSx}>Frequency</label>
                            <select value={form.frequency} onChange={e => set('frequency')(e.target.value)} style={inputSx}>
                                {['Monthly', 'Yearly', 'One-time'].map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label style={labelSx}>Description (Optional)</label><textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} style={{ ...inputSx, resize: 'none' }} /></div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer', fontFamily: 'Outfit' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600 }}>{saving ? 'Saving…' : 'Save Plan'}</button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Issue Invoice Modal ─── */
function IssueInvoiceModal({ students, feePlans, onClose, onRefresh }) {
    const [form, setForm] = useState({ studentId: '', feePlanIds: [], note: '' });
    const [saving, setSaving] = useState(false);

    const togglePlan = (id) => {
        setForm(p => ({
            ...p,
            feePlanIds: p.feePlanIds.includes(id) ? p.feePlanIds.filter(x => x !== id) : [...p.feePlanIds, id]
        }));
    };

    const handleSave = async () => {
        if (!form.studentId || form.feePlanIds.length === 0) return alert('Select a student and at least one fee plan.');
        setSaving(true);
        try {
            await api.post('/finance/invoices', form);
            onRefresh();
            onClose();
        } catch (e) {
            alert(e.response?.data?.message || 'Invoice generation failed.');
            setSaving(false);
        }
    };

    const totalStr = form.feePlanIds.reduce((sum, id) => {
        const plan = feePlans.find(p => p._id === id);
        return sum + (plan ? plan.amount : 0);
    }, 0).toLocaleString('en-IN');

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 20 }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: 500, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Issue Invoice</div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelSx}>Bill To (Student)</label>
                        <select value={form.studentId} onChange={e => setForm(p => ({ ...p, studentId: e.target.value }))} style={inputSx}>
                            <option value="">— Select Student —</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name} (Room {s.roomNumber})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelSx}>Select Fee Plans</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', padding: 4 }}>
                            {feePlans.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No fee plans created.</div> : feePlans.map(p => (
                                <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.feePlanIds.includes(p._id)} onChange={() => togglePlan(p._id)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.frequency}</div>
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div><label style={labelSx}>Note (Optional)</label><input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="e.g. Summer Term 2026" style={inputSx} /></div>

                    <div style={{ padding: '12px 16px', background: 'rgba(79,70,229,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>Invoice Total</span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>₹{totalStr}</span>
                    </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer', fontFamily: 'Outfit' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600 }}>{saving ? 'Generating…' : 'Generate Invoice'}</button>
                </div>
            </motion.div>
        </div>
    );
}

const STATUS_COLORS = {
    'Draft': '#64748b', 'Issued': '#3b82f6', 'Paid': '#10b981', 'Overdue': '#ef4444', 'Cancelled': '#94a3b8'
};

/* ─── Main Component ─── */
export default function FinanceAdmin() {
    const { user } = useAuth();
    if (user?.role !== 'admin') return <div style={{ padding: 40, textAlign: 'center' }}>Access Denied</div>;

    const [tab, setTab] = useState('Invoices');
    const [loading, setLoading] = useState(true);

    // Data
    const [feePlans, setFeePlans] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [students, setStudents] = useState([]);
    const [reports, setReports] = useState(null);

    // Modals
    const [modal, setModal] = useState(null);
    const [editData, setEditData] = useState(null);

    const loadData = async () => {
        try {
            const [plansRes, invsRes, stuRes, repRes] = await Promise.all([
                api.get('/finance/fee-plans'),
                api.get('/finance/invoices'),
                api.get('/students'), // light payload
                api.get('/finance/reports'),
            ]);
            setFeePlans(plansRes.data);
            setInvoices(invsRes.data);
            setStudents(stuRes.data);
            setReports(repRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDeletePlan = async (id) => {
        if (!window.confirm('Delete this Fee Plan?')) return;
        try { await api.delete(`/finance/fee-plans/${id}`); loadData(); }
        catch (e) { alert('Delete failed'); }
    };

    const handleUpdateInvoiceStatus = async (id, status) => {
        try { await api.patch(`/finance/invoices/${id}/status`, { status }); loadData(); }
        catch (e) { alert('Update failed'); }
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Delete this Invoice permanently?')) return;
        try { await api.delete(`/finance/invoices/${id}`); loadData(); }
        catch (e) { alert('Delete failed'); }
    }

    if (loading) return <SkeletonPage />;

    return (
        <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto', fontFamily: 'Outfit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div className="page-label">Administration</div>
                    <div className="page-title gradient-text-indigo">Finance Center</div>
                    <div className="page-desc">Manage fee structures, issue invoices, and analyze revenue.</div>
                </div>
                {/* Global Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setEditData(null); setModal('feePlan'); }} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #4f46e5', background: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontWeight: 600, fontFamily: 'Outfit', cursor: 'pointer' }}>+ New Fee Plan</button>
                    <button onClick={() => setModal('invoice')} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 600, fontFamily: 'Outfit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>+ Issue Invoice</button>
                </div>
            </div>

            {/* Sub-nav */}
            <div style={{ display: 'flex', gap: 8, marginTop: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 24 }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13,
                        background: tab === t ? 'var(--text-primary)' : 'transparent',
                        color: tab === t ? 'var(--bg-base)' : 'var(--text-muted)'
                    }}>{t}</button>
                ))}
            </div>

            {/* TAB: INVOICES */}
            {tab === 'Invoices' && (
                <div>
                    {invoices.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices issued yet.</div> : (
                        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                                        <th style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</th>
                                        <th style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                                        <th style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '16px 20px', fontSize: 13 }}>{new Date(inv.issuedDate).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>{inv.studentId?.name || 'Unknown Student'}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Room {inv.studentId?.roomNumber || '—'}</div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700 }}>₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: `${STATUS_COLORS[inv.status]}20`, color: STATUS_COLORS[inv.status] }}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <select
                                                    value={inv.status}
                                                    onChange={e => handleUpdateInvoiceStatus(inv._id, e.target.value)}
                                                    style={{ ...inputSx, width: 'auto', padding: '6px 10px', fontSize: 12, marginRight: 8, display: 'inline-block' }}
                                                >
                                                    {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <button onClick={() => handleDeleteInvoice(inv._id)} style={{ padding: '6px', borderRadius: 6, border: '1px solid rgba(225,29,72,0.2)', background: 'transparent', color: '#e11d48', cursor: 'pointer' }} title="Delete Invoice">🗑</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: FEE PLANS */}
            {tab === 'Fee Plans' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {feePlans.map(p => (
                        <div key={p._id} className="card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(79,70,229,0.1)', padding: '2px 8px', borderRadius: 6 }}>{p.frequency}</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => { setEditData(p); setModal('feePlan'); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✎</button>
                                    <button onClick={() => handleDeletePlan(p._id)} style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer' }}>🗑</button>
                                </div>
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12, color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>₹{p.amount.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>{p.description || 'No description provided.'}</div>
                        </div>
                    ))}
                    {feePlans.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No fee plans created. Add one to generate invoices.</div>}
                </div>
            )}

            {/* TAB: REPORTS */}
            {tab === 'Reports' && reports && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 30, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue Collected</div>
                        <div style={{ fontSize: 40, fontWeight: 800, color: '#10b981', marginTop: 8 }}>₹{reports.totalCollected.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="card" style={{ padding: 30, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Outstanding Dues</div>
                        <div style={{ fontSize: 40, fontWeight: 800, color: '#ef4444', marginTop: 8 }}>₹{reports.totalOutstanding.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {modal === 'feePlan' && <FeePlanModal editData={editData} onClose={() => setModal(null)} onRefresh={loadData} />}
                {modal === 'invoice' && <IssueInvoiceModal students={students} feePlans={feePlans} onClose={() => setModal(null)} onRefresh={loadData} />}
            </AnimatePresence>
        </div>
    );
}
