import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
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

export default function Dashboard() {
    const { t } = useLanguage();
    const [stats, setStats] = useState({ totalBeds: 0, occupiedBeds: 0, availableBeds: 0, feeDues: 0 });

    useEffect(() => {
        api.get('/stats').then(r => setStats(r.data)).catch(console.error);
    }, []);

    const occupancyPct = stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;
    const pieData = [
        { name: 'Occupied', value: stats.occupiedBeds },
        { name: 'Available', value: stats.availableBeds },
    ];

    const formatValue = (key, val) => {
        if (key === 'feeDues') return `₹${Number(val).toLocaleString('en-IN')}`;
        return val;
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <div className="page-label">{t('Overview')}</div>
                <div className="page-title">{t('Dashboard')}</div>
                <div className="page-desc">{t('Real-time hostel performance metrics.')}</div>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                {cardConfigs.map((c, i) => (
                    <motion.div
                        key={c.key}
                        className="card stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
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

            {/* Quick Actions */}
            <motion.div className="card quick-actions-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="chart-title-label">{t('Quick Actions')}</div>
                <div className="quick-actions-grid">
                    {[t('Add Student'), t('Record Payment'), t('Manage Rooms'), t('View Reports')].map(a => (
                        <button key={a} className="action-btn">
                            <span>{a}</span>
                            <span style={{ fontSize: 14 }}>↗</span>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
