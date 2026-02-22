import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API = '';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mealMeta = [
    {
        key: 'breakfast', label: 'Breakfast', time: '7:30 – 9:30 AM', icon: '🌅',
        accentColor: '#d97706', accentBg: 'rgba(217,119,6,0.1)', accentBorder: 'rgba(217,119,6,0.25)',
        defaultImg: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80',
    },
    {
        key: 'lunch', label: 'Lunch', time: '12:30 – 2:30 PM', icon: '☀️',
        accentColor: '#059669', accentBg: 'rgba(5,150,105,0.1)', accentBorder: 'rgba(5,150,105,0.25)',
        defaultImg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    },
    {
        key: 'dinner', label: 'Dinner', time: '7:30 – 9:30 PM', icon: '🌙',
        accentColor: '#4f46e5', accentBg: 'rgba(79,70,229,0.1)', accentBorder: 'rgba(79,70,229,0.25)',
        defaultImg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    },
];

const EMPTY_FORM = {
    day: 'Monday',
    breakfast: '', breakfastImg: '',
    lunch: '', lunchImg: '',
    dinner: '', dinnerImg: '',
};

/* ─── Image Picker for one meal ─── */
function ImagePicker({ label, icon, accentColor, imgKey, form, setForm }) {
    const [tab, setTab] = useState('url'); // 'url' | 'upload'
    const fileRef = useRef();
    const [uploading, setUploading] = useState(false);

    const currentImg = form[imgKey];

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const { data } = await api.post('/menu/upload', fd);
            setForm(prev => ({ ...prev, [imgKey]: `http://localhost:5000${data.url}` }));
        } catch {
            alert('Image upload failed. Check the server is running.');
        } finally {
            setUploading(false);
        }
    };

    const tabBtn = (t, lbl) => (
        <button
            onClick={() => setTab(t)}
            style={{
                padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: tab === t ? accentColor : 'rgba(0,0,0,0.06)',
                color: tab === t ? '#fff' : '#334155',
                fontSize: 12, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
            }}
        >{lbl}</button>
    );

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: accentColor, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{icon}</span> {label} Image
            </div>

            {/* Preview */}
            {currentImg && (
                <div style={{ position: 'relative', marginBottom: 10, borderRadius: 10, overflow: 'hidden', height: 90 }}>
                    <img src={currentImg} alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <button
                        onClick={() => setForm(prev => ({ ...prev, [imgKey]: '' }))}
                        style={{
                            position: 'absolute', top: 6, right: 6, width: 22, height: 22,
                            borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)',
                            color: '#fff', fontSize: 12, cursor: 'pointer', lineHeight: 1,
                        }}
                    >✕</button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {tabBtn('url', '🔗 URL')}
                {tabBtn('upload', '📁 Upload')}
            </div>

            {tab === 'url' ? (
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={currentImg}
                    onChange={e => setForm(prev => ({ ...prev, [imgKey]: e.target.value }))}
                    style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.13)', background: '#fff',
                        fontSize: 13, color: '#0f172a', fontFamily: 'Outfit, sans-serif', outline: 'none',
                    }}
                />
            ) : (
                <div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    <button
                        onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: `1px dashed ${accentColor}`,
                            background: `${accentColor}0d`, color: accentColor,
                            fontSize: 13, fontWeight: 500, fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                        }}
                    >
                        {uploading ? '⏳ Uploading…' : '📁 Choose Image File'}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Add / Edit Modal ─── */
function DayModal({ editData, existingDays, onClose, onSave }) {
    const isEdit = !!editData;
    const [form, setForm] = useState(editData ? { ...editData } : { ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const usedDays = existingDays.filter(d => d !== (editData?.day));

    const handleSave = async () => {
        if (!form.breakfast.trim() || !form.lunch.trim() || !form.dinner.trim()) {
            setError('Please fill all three meal descriptions.'); return;
        }
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                await api.put(`/menu/${editData._id}`, form);
            } else {
                if (usedDays.includes(form.day)) { setError(`${form.day} already exists.`); setSaving(false); return; }
                await api.post('/menu', form);
            }
            onSave();
        } catch (e) {
            setError(e.response?.data?.message || 'Save failed.');
            setSaving(false);
        }
    };

    const fieldStyle = {
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.13)', background: '#fff',
        fontSize: 13, color: '#0f172a', fontFamily: 'Outfit, sans-serif', outline: 'none',
        resize: 'vertical', minHeight: 58, boxSizing: 'border-box',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.22 }}
                style={{
                    background: '#f8faff', borderRadius: 18, width: '100%', maxWidth: 680,
                    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 28px 18px', borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff',
                }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isEdit ? 'Edit Day' : 'Add New Day'}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                            {isEdit ? `Editing — ${editData.day}` : 'Add Day to Menu'}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32, height: 32, borderRadius: '50%', border: 'none',
                            background: 'rgba(0,0,0,0.07)', color: '#334155',
                            fontSize: 16, cursor: 'pointer', lineHeight: 1,
                        }}
                    >✕</button>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                    {/* Day selector */}
                    {!isEdit && (
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 7 }}>Day of the Week</label>
                            <select
                                value={form.day}
                                onChange={e => setForm(p => ({ ...p, day: e.target.value }))}
                                style={{ ...fieldStyle, minHeight: 'unset', resize: 'none', cursor: 'pointer' }}
                            >
                                {DAYS.map(d => (
                                    <option key={d} value={d} disabled={usedDays.includes(d)}>{d}{usedDays.includes(d) ? ' (exists)' : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Per-meal sections */}
                    {mealMeta.map(m => (
                        <div key={m.key} style={{
                            marginBottom: 28, padding: 18, borderRadius: 14,
                            background: '#fff', border: `1px solid ${m.accentBorder}`,
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: m.accentColor, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span>{m.icon}</span> {m.label}
                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>· {m.time}</span>
                            </div>

                            <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 5 }}>Menu Description</label>
                            <textarea
                                value={form[m.key]}
                                onChange={e => setForm(p => ({ ...p, [m.key]: e.target.value }))}
                                placeholder={`e.g. Idli, Vada, Sambar & Chutney`}
                                style={{ ...fieldStyle, marginBottom: 14 }}
                            />

                            <ImagePicker
                                label={m.label}
                                icon={m.icon}
                                accentColor={m.accentColor}
                                imgKey={`${m.key}Img`}
                                form={form}
                                setForm={setForm}
                            />
                        </div>
                    ))}

                    {error && (
                        <div style={{ padding: '10px 14px', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, fontSize: 13, color: '#e11d48', marginBottom: 16 }}>
                            ⚠ {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px', borderTop: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fff',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)',
                            background: '#fff', color: '#334155', fontSize: 14, fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                        }}
                    >Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: '#fff', fontSize: 14, fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif', opacity: saving ? 0.7 : 1,
                            boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                        }}
                    >{saving ? 'Saving…' : isEdit ? '✓ Update Day' : '+ Add Day'}</button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Main Component ─── */
export default function FoodMenu() {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [modal, setModal] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchMenu = async () => {
        try {
            const { data } = await api.get('/menu');
            // Sort days Monday → Sunday
            const sorted = [...data].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
            setMenu(sorted);
            if (!selected && sorted.length) setSelected(sorted[0]);
            else if (selected) {
                const refreshed = sorted.find(d => d._id === selected._id);
                setSelected(refreshed || sorted[0] || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenu(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this day from the menu?')) return;
        setDeleting(id);
        try {
            await api.delete(`/menu/${id}`);
            const newMenu = menu.filter(d => d._id !== id);
            setMenu(newMenu);
            if (selected?._id === id) setSelected(newMenu[0] || null);
        } catch {
            alert('Delete failed.');
        } finally {
            setDeleting(null);
        }
    };

    const afterSave = async () => {
        setModal(null);
        await fetchMenu();
    };

    const getImg = (day, mealKey, defaultImg) => {
        const url = day?.[`${mealKey}Img`];
        return url && url.trim() ? url : defaultImg;
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #4f46e5', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <div className="food-menu">
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div className="page-label">Dining</div>
                    <div className="page-title gradient-text-orange">Weekly Menu</div>
                    <div className="page-desc">Nutritious meals prepared fresh every day.</div>
                </div>
                {!isStudent && (
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setModal('add')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: '#fff', fontSize: 14, fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: '0 4px 18px rgba(79,70,229,0.35)',
                            marginTop: 4, flexShrink: 0,
                        }}
                    >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Day
                    </motion.button>
                )}
            </div>

            {menu.length === 0 ? (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: 280, gap: 14,
                }}>
                    <div style={{ fontSize: 48 }}>🍽️</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#334155' }}>No menu yet</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Click <strong>+ Add Day</strong> to create the first entry.</div>
                </div>
            ) : (
                <div className="menu-layout">
                    {/* Day Selector */}
                    <div className="day-selector">
                        {menu.map((day) => (
                            <motion.button
                                key={day._id}
                                className={`day-btn${selected?._id === day._id ? ' active' : ''}`}
                                onClick={() => setSelected(day)}
                                whileHover={{ x: 2 }}
                            >
                                <span>{day.day}</span>
                                {selected?._id === day._id && <span style={{ color: '#4f46e5' }}>›</span>}
                            </motion.button>
                        ))}
                    </div>

                    {/* Meals Grid */}
                    <AnimatePresence mode="wait">
                        {selected && (
                            <motion.div
                                key={selected._id}
                                className="meals-grid"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                {mealMeta.map((m, i) => (
                                    <motion.div
                                        key={m.key}
                                        className="card meal-card"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.07 }}
                                    >
                                        <div className="meal-img-wrap">
                                            <img
                                                src={getImg(selected, m.key, m.defaultImg)}
                                                alt={m.label}
                                                onError={e => { e.target.src = m.defaultImg; }}
                                            />
                                            <div className="meal-img-overlay" />
                                            <div className="meal-time-badge" style={{ color: m.accentColor }}>
                                                <span>⏱</span> {m.time}
                                            </div>
                                        </div>
                                        <div className="meal-body">
                                            <div className="meal-type-badge" style={{ color: m.accentColor, background: m.accentBg, borderColor: m.accentBorder }}>
                                                <span>{m.icon}</span> {m.label}
                                            </div>
                                            <div className="meal-desc">{selected[m.key] || '—'}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal — admin/manager only */}
            {!isStudent && (
                <AnimatePresence>
                    {modal && (
                        <DayModal
                            editData={modal === 'add' ? null : modal}
                            existingDays={menu.map(d => d.day)}
                            onClose={() => setModal(null)}
                            onSave={afterSave}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
