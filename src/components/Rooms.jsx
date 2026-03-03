import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import useDebounce from '../hooks/useDebounce';
import { SkeletonPage } from './Skeleton';

/* ─── Design tokens ─── */
const TYPE_META = {
    Classic: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', label: 'Classic' },
    Premium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Premium' },
};

const inputSx = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
    fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none',
    color: 'var(--text-primary)', boxSizing: 'border-box', transition: 'border 0.2s',
};

/* ─── Occupancy bar ─── */
const OccupancyBar = ({ occupied, total }) => {
    const pct = total === 0 ? 0 : Math.round((occupied / total) * 100);
    const color = pct === 100 ? '#e11d48' : pct >= 70 ? '#f59e0b' : '#10b981';
    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{occupied}/{total} beds</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
            </div>
        </div>
    );
};

/* ─── Room Card ─── */
function RoomCard({ room, onSelect, onDelete, canDelete }) {
    const tm = TYPE_META[room.type] || TYPE_META.Classic;
    const statusColor = room.occupiedBeds === room.totalBeds ? '#e11d48' : room.occupiedBeds === 0 ? '#10b981' : '#f59e0b';
    const statusLabel = room.occupiedBeds === room.totalBeds ? 'Full' : room.occupiedBeds === 0 ? 'Vacant' : 'Partial';

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
            className="card"
            style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', borderTop: `3px solid ${tm.color}` }}
            onClick={() => onSelect(room)}
        >
            {/* Type badge */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: tm.bg, color: tm.color, fontWeight: 700, border: `1px solid ${tm.border}` }}>
                    {tm.label}
                </span>
                {canDelete && (
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(room); }}
                        title="Delete Room"
                        style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', fontSize: 11, cursor: 'pointer', lineHeight: 1 }}
                    >✕</button>
                )}
            </div>

            {/* Icon + number */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 6 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: tm.bg, border: `1px solid ${tm.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    🛏
                </div>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Room {room.roomNumber}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                        <span style={{ fontSize: 11, color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
                    </div>
                </div>
            </div>

            {/* Occupancy */}
            <OccupancyBar occupied={room.occupiedBeds} total={room.totalBeds} />

            {/* Occupants preview */}
            {room.occupants.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {room.occupants.slice(0, 3).map(s => (
                        <div key={s._id} title={s.name} style={{
                            width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: '#fff',
                        }}>
                            {s.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {room.occupants.length > 3 && (
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>
                            +{room.occupants.length - 3}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

/* ─── Room Detail Drawer ─── */
function RoomDrawer({ room, students, onClose, onRefresh }) {
    const [assignId, setAssignId] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [editType, setEditType] = useState(room.type);
    const [editSaving, setEditSaving] = useState(false);
    const [confirmUnassign, setConfirmUnassign] = useState(null);

    const unassigned = students.filter(s => !s.roomNumber || s.roomNumber === '');

    const handleAssign = async () => {
        if (!assignId) return;
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await api.post(`/rooms/${room.roomNumber}/assign`, { studentId: assignId });
            setMsg({ type: 'ok', text: 'Student assigned successfully!' });
            setAssignId('');
            setTimeout(() => { setMsg({ type: '', text: '' }); onRefresh(); }, 1400);
        } catch (e) {
            setMsg({ type: 'err', text: e.response?.data?.message || 'Assignment failed.' });
        } finally { setSaving(false); }
    };

    const handleUnassign = async (s) => {
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await api.post(`/rooms/${room.roomNumber}/unassign`, { studentId: s._id });
            setMsg({ type: 'ok', text: `${s.name} removed from room.` });
            setTimeout(() => { setMsg({ type: '', text: '' }); onRefresh(); }, 1400);
        } catch (e) {
            setMsg({ type: 'err', text: e.response?.data?.message || 'Removal failed.' });
        } finally { setSaving(false); setConfirmUnassign(null); }
    };

    const handleSaveType = async () => {
        setEditSaving(true);
        try {
            await api.put(`/rooms/${room.roomNumber}`, { type: editType });
            setMsg({ type: 'ok', text: 'Room type updated!' });
            setTimeout(() => { setMsg({ type: '', text: '' }); onRefresh(); }, 1400);
        } catch (e) {
            setMsg({ type: 'err', text: e.response?.data?.message || 'Update failed.' });
        } finally { setEditSaving(false); }
    };

    const tm = TYPE_META[room.type] || TYPE_META.Classic;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            {/* Drawer */}
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                style={{
                    position: 'fixed', top: 0, right: 0, width: 400, height: '100%', zIndex: 950,
                    background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
                    boxShadow: '-12px 0 50px rgba(0,0,0,0.18)', overflowY: 'auto',
                    fontFamily: 'Outfit, sans-serif',
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${tm.color}0d, transparent)` }}>
                    <div>
                        <div style={{ fontSize: 12, color: tm.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Room Details</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Room {room.roomNumber}</div>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {[
                            { label: 'Total Beds', value: room.totalBeds, icon: '🛏' },
                            { label: 'Occupied', value: room.occupiedBeds, icon: '👤', color: room.occupiedBeds > 0 ? '#e11d48' : undefined },
                            { label: 'Available', value: room.totalBeds - room.occupiedBeds, icon: '✅', color: '#10b981' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: 18 }}>{s.icon}</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Edit type */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Room Type</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['Classic', 'Premium'].map(t => (
                                <button key={t} onClick={() => setEditType(t)} style={{
                                    flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
                                    border: `2px solid ${editType === t ? TYPE_META[t].color : 'var(--border-subtle)'}`,
                                    background: editType === t ? TYPE_META[t].bg : 'transparent',
                                    color: editType === t ? TYPE_META[t].color : 'var(--text-secondary)',
                                    transition: 'all 0.18s',
                                }}>{t}</button>
                            ))}
                            {editType !== room.type && (
                                <button onClick={handleSaveType} disabled={editSaving} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    {editSaving ? '…' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Current occupants */}
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Current Occupants ({room.occupants.length})</div>
                        {room.occupants.length === 0 ? (
                            <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 10, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                                No students assigned yet.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {room.occupants.map(s => (
                                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                                        </div>
                                        {s.feeDues > 0 && (
                                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: 'rgba(225,29,72,0.1)', color: '#e11d48', fontWeight: 700, flexShrink: 0 }}>₹{s.feeDues.toLocaleString()}</span>
                                        )}
                                        <button
                                            onClick={() => setConfirmUnassign(s)}
                                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(225,29,72,0.2)', background: 'rgba(225,29,72,0.06)', color: '#e11d48', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}
                                            title="Remove from room"
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Assign student */}
                    {room.occupiedBeds < room.totalBeds && (
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Assign Student</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select value={assignId} onChange={e => setAssignId(e.target.value)} style={{ ...inputSx, flex: 1 }}>
                                    <option value="">— Select unassigned student —</option>
                                    {unassigned.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                                <button onClick={handleAssign} disabled={!assignId || saving} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: assignId ? '#6366f1' : 'var(--bg-elevated)', color: assignId ? '#fff' : 'var(--text-muted)', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, cursor: assignId ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.2s' }}>
                                    {saving ? '…' : '+ Assign'}
                                </button>
                            </div>
                            {unassigned.length === 0 && (
                                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>All students are already assigned to rooms.</div>
                            )}
                        </div>
                    )}

                    {/* Feedback message */}
                    {msg.text && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(225,29,72,0.08)', border: `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(225,29,72,0.2)'}`, color: msg.type === 'ok' ? '#059669' : '#e11d48' }}>
                            {msg.text}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Unassign confirm modal */}
            <ConfirmModal
                open={!!confirmUnassign}
                icon="👤"
                title={`Remove ${confirmUnassign?.name}?`}
                message={`${confirmUnassign?.name} will be unassigned from Room ${room.roomNumber}. They can be reassigned later.`}
                confirmText="Remove"
                cancelText="Cancel"
                danger
                onConfirm={() => handleUnassign(confirmUnassign)}
                onCancel={() => setConfirmUnassign(null)}
            />
        </>
    );
}

/* ─── Add Room Modal ─── */
function AddRoomModal({ onClose, onCreated }) {
    const [roomNumber, setRoomNumber] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [type, setType] = useState('Classic');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleCreate = async () => {
        if (!roomNumber.trim()) { setErr('Room number is required.'); return; }
        setSaving(true); setErr('');
        try {
            await api.post('/rooms', { roomNumber: roomNumber.trim(), capacity, type });
            onCreated();
            onClose();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to create room.');
        } finally { setSaving(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
            <motion.div
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
                style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 30px 80px rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}
            >
                <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Add New Room</div>
                    <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Room Number *</label>
                        <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} style={inputSx} placeholder="e.g. 101, A-12, 301" />
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Room Type</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['Classic', 'Premium'].map(t => (
                                <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13, border: `2px solid ${type === t ? TYPE_META[t].color : 'var(--border-subtle)'}`, background: type === t ? TYPE_META[t].bg : 'transparent', color: type === t ? TYPE_META[t].color : 'var(--text-secondary)', transition: 'all 0.18s' }}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bed Capacity (1 – 10)</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <button key={n} onClick={() => setCapacity(n)} style={{ width: 42, height: 42, borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13, border: `2px solid ${capacity === n ? '#6366f1' : 'var(--border-subtle)'}`, background: capacity === n ? 'rgba(99,102,241,0.1)' : 'transparent', color: capacity === n ? '#6366f1' : 'var(--text-secondary)', transition: 'all 0.18s', flexShrink: 0 }}>{n}</button>
                            ))}
                        </div>
                    </div>
                    {err && <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', color: '#e11d48' }}>{err}</div>}
                </div>
                <div style={{ padding: '0 26px 22px', display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.75 : 1 }}>
                        {saving ? 'Creating…' : '+ Create Room'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Main Rooms Component ─── */
export default function Rooms() {
    const { user } = useAuth();
    const role = user?.role || 'admin';

    const [rooms, setRooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All | Vacant | Partial | Full
    const [typeFilter, setTypeFilter] = useState('All');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        try {
            const [r, s] = await Promise.all([
                api.get('/rooms'),
                api.get('/students'),
            ]);
            setRooms(r.data);
            setStudents(s.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleRefresh = () => {
        load().then(() => {
            // Re-select the updated room
            if (selectedRoom) {
                setRooms(prev => {
                    const updated = prev.find(r => r.roomNumber === selectedRoom.roomNumber);
                    if (updated) setSelectedRoom(updated);
                    return prev;
                });
            }
        });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/rooms/${deleteTarget.roomNumber}`);
            setDeleteTarget(null);
            if (selectedRoom?.roomNumber === deleteTarget.roomNumber) setSelectedRoom(null);
            load();
        } catch (e) {
            alert(e.response?.data?.message || 'Delete failed.');
        } finally { setDeleting(false); }
    };

    // Stats summary
    const totalRooms = rooms.length;
    const vacantRooms = rooms.filter(r => r.occupiedBeds === 0).length;
    const fullRooms = rooms.filter(r => r.occupiedBeds === r.totalBeds).length;
    const totalBeds = rooms.reduce((a, r) => a + r.totalBeds, 0);
    const occupiedBeds = rooms.reduce((a, r) => a + r.occupiedBeds, 0);
    const occupancyPct = totalBeds === 0 ? 0 : Math.round((occupiedBeds / totalBeds) * 100);

    // Filter rooms
    const filtered = useMemo(() => rooms.filter(r => {
        const statusMatch = filter === 'All'
            || (filter === 'Vacant' && r.occupiedBeds === 0)
            || (filter === 'Partial' && r.occupiedBeds > 0 && r.occupiedBeds < r.totalBeds)
            || (filter === 'Full' && r.occupiedBeds === r.totalBeds);
        const typeMatch = typeFilter === 'All' || r.type === typeFilter;
        const q = debouncedSearch.toLowerCase().trim();
        const searchMatch = !q || r.roomNumber.toLowerCase().includes(q)
            || r.occupants.some(s => s.name.toLowerCase().includes(q));
        return statusMatch && typeMatch && searchMatch;
    }), [rooms, filter, typeFilter, debouncedSearch]);

    const FILTERS = [
        { key: 'All', label: `All (${totalRooms})` },
        { key: 'Vacant', label: `Vacant (${vacantRooms})`, color: '#10b981' },
        { key: 'Partial', label: `Partial (${totalRooms - vacantRooms - fullRooms})`, color: '#f59e0b' },
        { key: 'Full', label: `Full (${fullRooms})`, color: '#e11d48' },
    ];

    if (loading) return <SkeletonPage cards={6} stats={5} />;

    return (
        <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>

            {/* ─── Header ─── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                <div>
                    <div className="page-label">Accommodation</div>
                    <div className="page-title" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Rooms
                    </div>
                    <div className="page-desc">View occupancy, manage beds, and assign students to rooms.</div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAdd(true)}
                    style={{ padding: '11px 22px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <span style={{ fontSize: 18 }}>+</span> Add Room
                </motion.button>
            </div>

            {/* ─── Summary Stats ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 26 }}>
                {[
                    { label: 'Total Rooms', value: totalRooms, icon: '🏠', color: '#6366f1' },
                    { label: 'Total Beds', value: totalBeds, icon: '🛏', color: '#0891b2' },
                    { label: 'Occupied', value: occupiedBeds, icon: '👤', color: '#f59e0b' },
                    { label: 'Available', value: totalBeds - occupiedBeds, icon: '✅', color: '#10b981' },
                    { label: 'Occupancy', value: `${occupancyPct}%`, icon: '📊', color: occupancyPct > 90 ? '#e11d48' : '#6366f1' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ─── Filters & Search ─── */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontFamily: 'Outfit,sans-serif', fontSize: 12, fontWeight: 700,
                            background: filter === f.key ? (f.color || 'var(--accent)') : 'var(--bg-elevated)',
                            color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}>{f.label}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Classic', 'Premium'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)} style={{
                            padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                            border: `1px solid ${typeFilter === t ? (TYPE_META[t]?.color || 'var(--accent)') : 'var(--border-subtle)'}`,
                            background: typeFilter === t ? (TYPE_META[t]?.bg || 'rgba(99,102,241,0.08)') : 'transparent',
                            color: typeFilter === t ? (TYPE_META[t]?.color || 'var(--accent)') : 'var(--text-muted)',
                            transition: 'all 0.18s',
                        }}>{t}</button>
                    ))}
                </div>
                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search room or student…"
                        style={{ ...inputSx, paddingLeft: 34, width: 210 }}
                    />
                </div>
            </div>

            {/* ─── Empty state ─── */}
            {rooms.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Rooms Yet</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Click <strong>+ Add Room</strong> to create the first room in the hostel.</div>
                    <motion.button whileHover={{ scale: 1.04 }} onClick={() => setShowAdd(true)} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                        + Add First Room
                    </motion.button>
                </motion.div>
            )}

            {/* ─── Room Grid ─── */}
            {filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {filtered.map((room, i) => (
                        <motion.div key={room.roomNumber} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <RoomCard
                                room={room}
                                onSelect={r => setSelectedRoom(r)}
                                onDelete={r => setDeleteTarget(r)}
                                canDelete={role === 'admin'}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : rooms.length > 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                    No rooms match the current filters.
                </div>
            )}

            {/* ─── Room Drawer ─── */}
            <AnimatePresence>
                {selectedRoom && (
                    <RoomDrawer
                        key={selectedRoom.roomNumber}
                        room={rooms.find(r => r.roomNumber === selectedRoom.roomNumber) || selectedRoom}
                        students={students}
                        onClose={() => setSelectedRoom(null)}
                        onRefresh={handleRefresh}
                    />
                )}
            </AnimatePresence>

            {/* ─── Add Room Modal ─── */}
            <AnimatePresence>
                {showAdd && (
                    <AddRoomModal
                        onClose={() => setShowAdd(false)}
                        onCreated={load}
                    />
                )}
            </AnimatePresence>

            {/* ─── Delete Confirm ─── */}
            <ConfirmModal
                open={!!deleteTarget}
                icon="🏠"
                title={`Delete Room ${deleteTarget?.roomNumber}?`}
                message={`This will permanently remove Room ${deleteTarget?.roomNumber} and all its beds from the system.`}
                confirmText={deleting ? 'Deleting…' : 'Delete Room'}
                cancelText="Cancel"
                danger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
