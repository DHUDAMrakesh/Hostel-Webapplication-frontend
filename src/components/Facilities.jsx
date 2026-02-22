import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const facilityStyles = [
    { glow: 'rgba(99,102,241,0.35)', iconBg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', badgeColor: '#818cf8', badgeBg: 'rgba(99,102,241,0.1)', badgeBorder: 'rgba(99,102,241,0.25)', accent: '#6366f1' },
    { glow: 'rgba(16,185,129,0.35)', iconBg: 'linear-gradient(135deg,#10b981,#14b8a6)', badgeColor: '#34d399', badgeBg: 'rgba(16,185,129,0.1)', badgeBorder: 'rgba(16,185,129,0.25)', accent: '#10b981' },
    { glow: 'rgba(245,158,11,0.35)', iconBg: 'linear-gradient(135deg,#f59e0b,#f97316)', badgeColor: '#fbbf24', badgeBg: 'rgba(245,158,11,0.1)', badgeBorder: 'rgba(245,158,11,0.25)', accent: '#f59e0b' },
    { glow: 'rgba(236,72,153,0.35)', iconBg: 'linear-gradient(135deg,#ec4899,#f43f5e)', badgeColor: '#f472b6', badgeBg: 'rgba(236,72,153,0.1)', badgeBorder: 'rgba(236,72,153,0.25)', accent: '#ec4899' },
    { glow: 'rgba(6,182,212,0.35)', iconBg: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', badgeColor: '#22d3ee', badgeBg: 'rgba(6,182,212,0.1)', badgeBorder: 'rgba(6,182,212,0.25)', accent: '#06b6d4' },
    { glow: 'rgba(168,85,247,0.35)', iconBg: 'linear-gradient(135deg,#a855f7,#d946ef)', badgeColor: '#c084fc', badgeBg: 'rgba(168,85,247,0.1)', badgeBorder: 'rgba(168,85,247,0.25)', accent: '#a855f7' },
];

const iconEmoji = { Wifi: '📶', Shirt: '👕', Dumbbell: '🏋', Book: '📚', Coffee: '☕', Star: '⭐' };

// Rich metadata per iconName — shown in the detail modal
const facilityMeta = {
    Wifi: {
        hours: '24 / 7',
        days: 'All days',
        location: 'Entire campus',
        highlights: ['High-speed fibre broadband', 'Secure WPA3 encryption', 'Dedicated student bandwidth', 'Support desk available'],
    },
    Shirt: {
        hours: '6:00 AM – 10:00 PM',
        days: 'Mon – Sat',
        location: 'Ground floor, Block B',
        highlights: ['Washing machines & dryers', 'Ironing boards provided', 'Detergent vending machine', 'Express 2-hour cycle'],
    },
    Dumbbell: {
        hours: '5:30 AM – 10:00 PM',
        days: 'All days',
        location: 'Sports complex, Block C',
        highlights: ['Modern cardio equipment', 'Free weights & machines', 'Trained fitness coach on call', 'Locker room & showers'],
    },
    Book: {
        hours: '8:00 AM – 11:00 PM',
        days: 'All days',
        location: 'Library building, Block A',
        highlights: ['10,000+ books & journals', 'Quiet study zones', 'High-speed internet', 'Printing & scanning'],
    },
    Coffee: {
        hours: '7:00 AM – 11:00 PM',
        days: 'All days',
        location: 'Common area, Block A & B',
        highlights: ['Hot & cold beverages', 'Light snacks & meals', 'Comfortable seating', 'Student discount available'],
    },
    Star: {
        hours: '9:00 AM – 6:00 PM',
        days: 'Mon – Fri',
        location: 'Admin block',
        highlights: ['Dedicated student support', 'Grievance redressal', 'Event coordination', 'Campus activities'],
    },
};

/* ─── Detail Modal ─── */
function FacilityModal({ facility, style, onClose }) {
    const emoji = iconEmoji[facility.iconName] || '⭐';
    const meta = facilityMeta[facility.iconName] || facilityMeta.Star;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(248,250,255,0.97))',
                    borderRadius: 22, width: '100%', maxWidth: 520,
                    boxShadow: `0 32px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.5)`,
                    overflow: 'hidden',
                }}
            >
                {/* Hero banner */}
                <div style={{
                    background: style.iconBg, padding: '32px 28px 24px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Soft glow blob */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 180, height: 180,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(40px)',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}>
                            {emoji}
                        </div>
                        <button onClick={onClose} style={{
                            width: 34, height: 34, borderRadius: '50%', border: 'none',
                            background: 'rgba(255,255,255,0.25)', color: '#fff',
                            fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(8px)',
                        }}>✕</button>
                    </div>
                    <div style={{ marginTop: 18, color: '#fff' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{facility.name}</div>
                        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{facility.description}</div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px' }}>
                    {/* Info rows */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                        {[
                            { icon: '🕐', label: 'Hours', value: meta.hours },
                            { icon: '📅', label: 'Days', value: meta.days },
                            { icon: '📍', label: 'Location', value: meta.location },
                        ].map(info => (
                            <div key={info.label} style={{
                                padding: '12px 14px', borderRadius: 14,
                                background: style.badgeBg, border: `1px solid ${style.badgeBorder}`,
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 18, marginBottom: 4 }}>{info.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{info.label}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{info.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Highlights */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>What's Included</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {meta.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.06 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <span style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: style.iconBg, color: '#fff',
                                        fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, fontWeight: 700,
                                    }}>✓</span>
                                    <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{h}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Status footer */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                                boxShadow: '0 0 8px #10b981', display: 'inline-block',
                            }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Facility Available</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>Open to all residents</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function Facilities() {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [selected, setSelected] = useState(null); // facility to show in modal

    useEffect(() => {
        api.get('/facilities').then(r => setFacilities(r.data)).catch(console.error);
    }, []);

    return (
        <div className="facilities">
            <div className="facilities-header">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="page-label" style={{ textAlign: 'center' }}>Amenities</div>
                </motion.div>
                <motion.div className="page-title gradient-text-white" style={{ fontSize: 36, textAlign: 'center', marginTop: 8 }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    World-Class Facilities
                </motion.div>
                <motion.div className="page-desc" style={{ textAlign: 'center', marginTop: 10, maxWidth: 480, margin: '10px auto 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    Everything you need for a comfortable, productive stay — all under one roof.
                </motion.div>
            </div>

            <div className="facilities-grid">
                {facilities.map((facility, index) => {
                    const s = facilityStyles[index % facilityStyles.length];
                    const emoji = iconEmoji[facility.iconName] || '⭐';
                    return (
                        <motion.div
                            key={facility._id}
                            className="card facility-card"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.4 }}
                            whileHover={{ y: -4, boxShadow: `0 20px 60px ${s.glow}` }}
                            style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setSelected({ facility, style: s })}
                        >
                            {/* Glow blob */}
                            <div style={{
                                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                                borderRadius: '50%', background: s.glow, filter: 'blur(40px)',
                                opacity: 0.4, pointerEvents: 'none',
                            }} />

                            <div className="facility-icon" style={{ background: s.iconBg }}>
                                <span style={{ fontSize: 24 }}>{emoji}</span>
                            </div>
                            <div className="facility-name">{facility.name}</div>
                            <div className="facility-desc">{facility.description}</div>
                            <div className="facility-footer">
                                <span className="facility-badge" style={{ color: s.badgeColor, background: s.badgeBg, borderColor: s.badgeBorder }}>
                                    Available 24/7
                                </span>
                                <motion.span
                                    className="facility-link"
                                    style={{ color: s.accent, fontWeight: 600 }}
                                    whileHover={{ x: 3 }}
                                >
                                    Details ↗
                                </motion.span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Detail modal */}
            <AnimatePresence>
                {selected && (
                    <FacilityModal
                        facility={selected.facility}
                        style={selected.style}
                        onClose={() => setSelected(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
