import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminComplaints() {
    const { t } = useLanguage();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchComplaints();
    }, []);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'in-review': return '#3b82f6';
            case 'resolved': return '#10b981';
            default: return '#888';
        }
    };

    return (
        <div className="admin-complaints">
            <div className="page-header">
                <div className="page-label">{t('Management')}</div>
                <div className="page-title">{t('Complaints')}</div>
                <div className="page-desc">{t('View and manage student complaints.')}</div>
            </div>

            <div className="filters-row" style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                {['all', 'pending', 'in-review', 'resolved'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 20,
                            border: '1px solid var(--border-subtle)',
                            background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)',
                            color: filter === f ? 'white' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 13,
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t(f)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: 200 }}>Loading...</div>
            ) : (
                <div className="complaints-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    <AnimatePresence>
                        {filteredComplaints.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                {t('No complaints found.')}
                            </div>
                        ) : (
                            filteredComplaints.map(c => (
                                <motion.div
                                    key={c._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card"
                                    style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--border-subtle)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: 6,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            background: getStatusColor(c.status) + '22',
                                            color: getStatusColor(c.status),
                                            border: `1px solid ${getStatusColor(c.status)}44`
                                        }}>
                                            {t(c.status)}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>{c.title}</h3>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.description}</div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.studentName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room: {c.roomNumber} • {t(c.category)}</div>
                                        </div>
                                        <select
                                            value={c.status}
                                            onChange={(e) => updateStatus(c._id, e.target.value)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                background: 'var(--bg-elevated)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--border-subtle)',
                                                fontSize: 12,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="pending">{t('Pending')}</option>
                                            <option value="in-review">{t('In Review')}</option>
                                            <option value="resolved">{t('Resolved')}</option>
                                        </select>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

const styles = `
.admin-complaints .card:hover {
    border-color: var(--accent) !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
`;
