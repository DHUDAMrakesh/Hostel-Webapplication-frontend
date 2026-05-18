import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const TYPE_COLORS = { Single: '#6366f1', Double: '#0891b2', Triple: '#f59e0b', Dormitory: '#a855f7' };
const ROOM_TYPE_COLORS = { Classic: '#6366f1', Premium: '#f59e0b' };

export default function MyRoom() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Processing, 4: Success

    // Form states
    const [selected, setSelected] = useState('');
    const [phone, setPhone] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');

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
            if (p.data) {
                setPhone(p.data.phone || '');
                setGuardianName(p.data.guardianName || '');
                setEmergencyContact(p.data.emergencyContact || '');
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const validateStep1 = () => {
        if (!phone.trim() || !guardianName.trim() || !emergencyContact.trim()) {
            setError('All basic details are required.');
            return false;
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            processPayment();
        }
    };

    const processPayment = async () => {
        setStep(3); // Processing
        // Simulate real-time payment latency
        setTimeout(async () => {
            try {
                const { data } = await api.post('/student/book', {
                    roomNumber: selected || profile?.roomNumber,
                    phone,
                    guardianName,
                    emergencyContact
                });

                // Record the payment too
                await api.post('/student/pay', {
                    amount: 5000,
                    method: paymentMethod,
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    note: `Initial booking payment for Room ${selected || profile?.roomNumber}`
                });

                setProfile(data);
                setStep(4); // Success
                setTimeout(() => {
                    setBookingModal(false);
                    setStep(1);
                    setSuccess('Room booked successfully!');
                    setTimeout(() => setSuccess(''), 3500);
                    load();
                }, 2000);
            } catch (e) {
                setStep(2);
                setError(e.response?.data?.message || 'Booking failed.');
            }
        }, 3000);
    };

    const filteredRooms = rooms.filter(r => (filter === 'All' || r.type === filter) && r.available);

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontSize: 14,
        fontFamily: 'Outfit, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

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
                    <div className="page-desc">{profile?.roomNumber ? 'Your current room assignment.' : 'Pick an available room and book it.'}</div>
                </div>

            </div>

            {success && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, color: '#059669', fontSize: 14, fontWeight: 600 }}>
                    ✓ {success}
                </motion.div>
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
                            { icon: '🛡️', label: 'Guardian', value: profile.guardianName || '—' },
                            { icon: '🚨', label: 'Emergency', value: profile.emergencyContact || '—' },
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        {['All', 'Single', 'Double', 'Triple', 'Dormitory'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Outfit,sans-serif', background: filter === f ? 'var(--accent)' : 'var(--bg-elevated)', color: filter === f ? '#fff' : 'var(--text-primary)', transition: 'all 0.2s' }}>
                                {f}
                            </button>
                        ))}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filteredRooms.length} {t('rooms available')}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
                        {filteredRooms.map(r => (
                            <motion.div key={r.number} whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} onClick={() => { setSelected(r.number); setStep(1); setBookingModal(true); }}
                                style={{ padding: '20px', borderRadius: 16, border: `2px solid ${selected === r.number ? TYPE_COLORS[r.type] : 'var(--border-subtle)'}`, background: selected === r.number ? `${TYPE_COLORS[r.type]}10` : 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                                <div style={{ fontSize: 28, marginBottom: 12 }}>🛏</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Room {r.number}</div>
                                <div style={{ fontSize: 12, color: TYPE_COLORS[r.type] || 'var(--accent)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.type}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Floor {r.floor} · ₹5,000/mo</div>
                                {r.roomType && (
                                    <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, padding: '2px 6px', borderRadius: 20, background: ROOM_TYPE_COLORS[r.roomType] + '20', color: ROOM_TYPE_COLORS[r.roomType], fontWeight: 700, border: `1px solid ${ROOM_TYPE_COLORS[r.roomType]}44` }}>
                                        {r.roomType}
                                    </div>
                                )}
                                {r.capacity > 1 && (
                                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                                        {r.capacity - r.occupiedBeds}/{r.capacity} beds free
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {filteredRooms.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 15 }}>{t('No available rooms in this category.')}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Premium Multi-step Booking Modal */}
            <AnimatePresence>
                {bookingModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        onClick={e => e.target === e.currentTarget && setBookingModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 24, width: '100%', maxWidth: 450, boxShadow: '0 25px 70px rgba(0,0,0,0.3)', overflow: 'hidden' }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Step {step} of 4</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {step === 1 && 'Basic Details'}
                                        {step === 2 && 'Complete Payment'}
                                        {step === 3 && 'Processing...'}
                                        {step === 4 && 'Success!'}
                                    </div>
                                </div>
                                <button onClick={() => setBookingModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: '28px' }}>
                                {step === 1 && (
                                    <div style={{ display: 'grid', gap: 18 }}>
                                        <div style={{ textAlign: 'center', marginBottom: 10 }}>
                                            <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
                                            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>We need a few more details to finalize your booking for <strong>Room {selected || profile?.roomNumber}</strong>.</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mobile Number</label>
                                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Guardian Name</label>
                                            <input value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="Full name of parent/guardian" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Emergency Contact Number</label>
                                            <input type="tel" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Emergency phone number" style={inputStyle} />
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div style={{ display: 'grid', gap: 18 }}>
                                        <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Amount to Pay</div>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>₹5,000.00</div>
                                            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>First Month Security Deposit</div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Select Payment Method</label>
                                            <div style={{ display: 'grid', gap: 10 }}>
                                                {['UPI', 'Card', 'Net Banking'].map(m => (
                                                    <div
                                                        key={m}
                                                        onClick={() => setPaymentMethod(m)}
                                                        style={{
                                                            padding: '14px 16px',
                                                            borderRadius: 12,
                                                            border: `2px solid ${paymentMethod === m ? 'var(--accent)' : 'var(--border-subtle)'}`,
                                                            background: paymentMethod === m ? 'var(--accent)08' : 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 14, fontWeight: 600 }}>{m}</span>
                                                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === m ? 'var(--accent)' : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {paymentMethod === m && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid var(--border-subtle)', borderTopColor: 'var(--accent)' }}
                                            />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💳</div>
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Verifying Payment</div>
                                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Please do not refresh or close this window. We are confirming your transaction with the bank.</div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', damping: 12 }}
                                            style={{ width: 80, height: 80, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'white', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16,185,129,0.3)' }}
                                        >
                                            ✓
                                        </motion.div>
                                        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</div>
                                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Welcome to your new home. Room <strong>{selected || profile?.roomNumber}</strong> is now reserved for you.</div>
                                    </div>
                                )}

                                {error && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 18, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>⚠ {error}</motion.div>}
                            </div>

                            {/* Modal Footer */}
                            {step < 3 && (
                                <div style={{ padding: '20px 28px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
                                    {step > 1 && (
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        style={{
                                            flex: 2,
                                            padding: '12px',
                                            borderRadius: 12,
                                            border: 'none',
                                            background: 'linear-gradient(135deg,#6366f1,#0891b2)',
                                            color: '#fff',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 8px 20px rgba(99,102,241,0.25)'
                                        }}
                                    >
                                        {step === 1 ? 'Next: Payment' : `Pay ₹5,000 via ${paymentMethod}`}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
