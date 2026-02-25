import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_COLORS = { Single: '#6366f1', Double: '#0891b2', Triple: '#f59e0b' };

export default function MyRoom() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [selected, setSelected] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('All');

    const load = async () => {
        try {
            const [p, r] = await Promise.all([
                api.get('/student/me'),
                api.get('/student/rooms/available'),
            ]);
            setProfile(p.data);
            setRooms(r.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleBook = async () => {
        setError('');
        if (!selected) { setError('Please select a room.'); return; }
        setSaving(true);
        try {
            const { data } = await api.post('/student/book', { roomNumber: selected, phone });
            setProfile(data);
            setBooking(false);
            setSuccess('Room booked successfully!');
            setTimeout(() => setSuccess(''), 3500);
            load();
        } catch (e) {
            setError(e.response?.data?.message || 'Booking failed.');
        } finally { setSaving(false); }
    };

    const filteredRooms = rooms.filter(r => (filter === 'All' || r.type === filter) && r.available);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ padding: 32, maxWidth: 980, margin: '0 auto' }}>
            <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="page-label">Accommodation</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg,#6366f1,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>My Room</div>
                    <div className="page-desc">{profile ? 'Your current room assignment.' : 'Pick an available room and book it.'}</div>
                </div>
                {profile?.roomNumber && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setBooking(true)}
                        style={{ padding: '11px 22px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.07)', color: '#6366f1', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0, marginTop: 4 }}>
                        Change Room
                    </motion.button>
                )}
            </div>

            {success && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, color: '#059669', fontSize: 14, fontWeight: 600 }}>
                    ✓ {success}
                </div>
            )}

            {profile?.roomNumber ? (
                /* ─── Booked View ─── */
                <div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card"
                        style={{ padding: 28, marginBottom: 20, background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(8,145,178,0.06))', borderTop: '3px solid #6366f1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg,#6366f1,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🛏</div>
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Your Room</div>
                                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Room {profile.roomNumber}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Floor {profile.roomNumber.charAt(0)} · Booked since {new Date(profile.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                        {[
                            { icon: '👤', label: 'Name', value: profile.name },
                            { icon: '📧', label: 'Email', value: profile.email || '—' },
                            { icon: '📞', label: 'Phone', value: profile.phone || '—' },
                            { icon: '💰', label: 'Monthly Fee', value: `₹${(profile.monthlyFee || 5000).toLocaleString('en-IN')}` },
                        ].map(d => (
                            <div key={d.label} className="card" style={{ padding: '16px 18px' }}>
                                <div style={{ fontSize: 18, marginBottom: 8 }}>{d.icon}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{d.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* ─── No booking: show available rooms ─── */
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        {['All', 'Single', 'Double', 'Triple'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit,sans-serif', background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)', color: filter === f ? '#fff' : 'var(--text-primary)', transition: 'all 0.2s' }}>
                                {f}
                            </button>
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filteredRooms.length} {t('rooms available')}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
                        {filteredRooms.map(r => (
                            <motion.div key={r.number} whileHover={{ y: -2 }} onClick={() => { setSelected(r.number); setBooking(true); }}
                                style={{ padding: '16px 18px', borderRadius: 14, border: `2px solid ${selected === r.number ? TYPE_COLORS[r.type] : 'var(--border-subtle)'}`, background: selected === r.number ? `${TYPE_COLORS[r.type]}10` : 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: 22, marginBottom: 8 }}>🛏</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Room {r.number}</div>
                                <div style={{ fontSize: 11, color: TYPE_COLORS[r.type] || 'var(--accent)', fontWeight: 600, marginTop: 3 }}>{r.type}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Floor {r.floor}</div>
                            </motion.div>
                        ))}
                        {filteredRooms.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>{t('No available rooms in this category.')}</div>
                        )}
                    </div>

                    {selected && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 20, padding: '18px 22px', background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Selected: Room <strong>{selected}</strong></div>
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setBooking(true)}
                                style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-purple))', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer' }}>
                                Book Room {selected} →
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Booking Confirmation Modal */}
            <AnimatePresence>
                {booking && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--overlay-dark)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        onClick={e => e.target === e.currentTarget && setBooking(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{t('Confirm Booking')} — {t('Room')} {selected || profile?.roomNumber}</div>
                                <button onClick={() => setBooking(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                            </div>
                            <div style={{ padding: '22px 24px' }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Phone Number (optional)</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                                    style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                                {error && <div style={{ marginTop: 12, padding: '9px 12px', background: 'var(--error-alpha)', border: '1px solid var(--error-subtle)', borderRadius: 8, fontSize: 13, color: 'var(--error)' }}>⚠ {error}</div>}
                                <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>A fee of ₹5,000 will be due on booking.</div>
                            </div>
                            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button onClick={() => setBooking(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleBook} disabled={saving} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-purple))', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Booking…' : 'Confirm Booking'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
