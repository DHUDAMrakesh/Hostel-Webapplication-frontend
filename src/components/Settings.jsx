import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

/* ─── Shared inline style tokens ─── */
const T = {
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textAccMuted: '#475569',
    bgInput: '#ffffff',
    bgInputHov: '#f8faff',
    border: '1px solid rgba(0,0,0,0.12)',
    borderFocus: '1px solid rgba(79,70,229,0.55)',
    borderSection: '1px solid rgba(0,0,0,0.08)',
    radius: 10,
};

const Section = ({ title, children, delay = 0 }) => (
    <motion.div
        className="card"
        style={{ padding: 28, marginBottom: 20 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35 }}
    >
        <div style={{
            fontSize: 11, fontWeight: 700, color: T.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 20, paddingBottom: 12, borderBottom: T.borderSection,
        }}>
            {title}
        </div>
        {children}
    </motion.div>
);

const Field = ({ label, hint, children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 3 }}>{label}</div>
            {hint && <div style={{ fontSize: 12, color: T.textMuted }}>{hint}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const inputBase = {
    background: T.bgInput,
    border: T.border,
    borderRadius: T.radius,
    padding: '9px 14px',
    color: T.textPrimary,
    fontSize: 14,
    fontFamily: 'Outfit, sans-serif',
    width: 240,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputBase}
        onFocus={e => {
            e.target.style.borderColor = 'rgba(79,70,229,0.55)';
            e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
        }}
        onBlur={e => {
            e.target.style.borderColor = 'rgba(0,0,0,0.12)';
            e.target.style.boxShadow = 'none';
        }}
    />
);

const Toggle = ({ value, onChange, accent }) => (
    <button
        onClick={() => onChange(!value)}
        style={{
            width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: value ? (accent || '#4f46e5') : 'rgba(0,0,0,0.15)',
            position: 'relative', transition: 'background 0.25s',
            boxShadow: value ? `0 0 12px ${accent || '#4f46e5'}55` : 'none',
        }}
    >
        <span style={{
            position: 'absolute', top: 3, left: value ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: 'white',
            transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }} />
    </button>
);

const Select = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
            background: T.bgInput,
            border: T.border,
            borderRadius: T.radius,
            padding: '9px 14px',
            color: T.textPrimary,
            fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
            width: 220,
            outline: 'none',
            cursor: 'pointer',
        }}
    >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#ffffff', color: '#0f172a' }}>{o.label}</option>)}
    </select>
);

const SaveBtn = ({ onClick, saved, accent }) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: saved
                ? 'linear-gradient(135deg,#059669,#0d9488)'
                : `linear-gradient(135deg, ${accent || '#4f46e5'}, #7c3aed)`,
            color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
            transition: 'all 0.3s',
            boxShadow: saved ? '0 0 16px rgba(5,150,105,0.35)' : `0 0 16px ${accent || '#4f46e5'}44`,
        }}
    >
        {saved ? '✓ Saved!' : 'Save Changes'}
    </button>
);

export default function Settings() {
    const { settings, updateSettings, resetSettings } = useSettings();

    const [draft, setDraft] = useState({ ...settings });
    const [savedSection, setSavedSection] = useState(null);

    const set = (key) => (val) => setDraft(prev => ({ ...prev, [key]: val }));

    const save = (section, keys) => {
        const partial = {};
        keys.forEach(k => { partial[k] = draft[k]; });
        updateSettings(partial);
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2000);
    };

    const accentColors = ['#4f46e5', '#9333ea', '#db2777', '#059669', '#d97706', '#0891b2', '#e11d48'];

    return (
        <div style={{ padding: 32, maxWidth: 860, margin: '0 auto' }}>
            <div className="page-header">
                <div className="page-label">Configuration</div>
                <div className="page-title">Settings</div>
                <div className="page-desc">Changes are applied live across the app when you save.</div>
            </div>

            {/* Hostel Information */}
            <Section title="Hostel Information" delay={0.05}>
                <Field label="Hostel Name" hint="Shown in the sidebar logo">
                    <Input value={draft.hostelName} onChange={set('hostelName')} placeholder="Hostel name" />
                </Field>
                <Field label="Admin Name" hint="Shown in the top bar greeting">
                    <Input value={draft.adminName} onChange={set('adminName')} placeholder="Your name" />
                </Field>
                <Field label="Admin Email" hint="Used for notifications">
                    <Input value={draft.adminEmail} onChange={set('adminEmail')} placeholder="admin@example.com" type="email" />
                </Field>
                <Field label="Phone Number">
                    <Input value={draft.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
                </Field>
                <Field label="Address">
                    <Input value={draft.address} onChange={set('address')} placeholder="Street, City, State" />
                </Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <SaveBtn accent={settings.accentColor} onClick={() => save('info', ['hostelName', 'adminName', 'adminEmail', 'phone', 'address'])} saved={savedSection === 'info'} />
                </div>
            </Section>

            {/* Fee Settings */}
            <Section title="Fee Configuration" delay={0.1}>
                <Field label="Monthly Fee" hint="Base fee per student per month">
                    <Input value={draft.monthlyFee} onChange={set('monthlyFee')} placeholder="5000" type="number" />
                </Field>
                <Field label="Late Fee" hint="Penalty for late payment">
                    <Input value={draft.lateFee} onChange={set('lateFee')} placeholder="200" type="number" />
                </Field>
                <Field label="Due Day of Month">
                    <Input value={draft.dueDayOfMonth} onChange={set('dueDayOfMonth')} placeholder="5" type="number" />
                </Field>
                <Field label="Currency">
                    <Select value={draft.currency} onChange={set('currency')} options={[
                        { value: 'INR', label: '₹ Indian Rupee (INR)' },
                        { value: 'USD', label: '$ US Dollar (USD)' },
                        { value: 'EUR', label: '€ Euro (EUR)' },
                    ]} />
                </Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <SaveBtn accent={settings.accentColor} onClick={() => save('fee', ['monthlyFee', 'lateFee', 'dueDayOfMonth', 'currency'])} saved={savedSection === 'fee'} />
                </div>
            </Section>

            {/* Notifications */}
            <Section title="Notifications" delay={0.15}>
                <Field label="Email Notifications" hint="Receive updates via email">
                    <Toggle accent={settings.accentColor} value={draft.emailNotif} onChange={set('emailNotif')} />
                </Field>
                <Field label="Fee Due Alerts" hint="Alert when student fees are overdue">
                    <Toggle accent={settings.accentColor} value={draft.dueAlerts} onChange={set('dueAlerts')} />
                </Field>
                <Field label="Occupancy Alerts" hint="Alert when beds fall below 20% availability">
                    <Toggle accent={settings.accentColor} value={draft.occupancyAlerts} onChange={set('occupancyAlerts')} />
                </Field>
                <Field label="Maintenance Alerts" hint="Alerts for facility maintenance requests">
                    <Toggle accent={settings.accentColor} value={draft.maintenanceAlerts} onChange={set('maintenanceAlerts')} />
                </Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <SaveBtn accent={settings.accentColor} onClick={() => save('notif', ['emailNotif', 'dueAlerts', 'occupancyAlerts', 'maintenanceAlerts'])} saved={savedSection === 'notif'} />
                </div>
            </Section>

            {/* Appearance */}
            <Section title="Appearance" delay={0.2}>
                <Field label="Theme" hint="Color scheme of the application">
                    <Select value={draft.theme} onChange={set('theme')} options={[
                        { value: 'light', label: '☀️ Light (Current)' },
                        { value: 'dark', label: '🌑 Dark' },
                        { value: 'midnight', label: '🌌 Midnight Blue' },
                    ]} />
                </Field>
                <Field label="Accent Color" hint="Primary highlight color — changes sidebar, buttons, and charts">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {accentColors.map(c => (
                            <button
                                key={c}
                                onClick={() => set('accentColor')(c)}
                                style={{
                                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                                    outline: draft.accentColor === c ? `3px solid ${c}` : '3px solid transparent',
                                    outlineOffset: 2, transition: 'all 0.2s', boxShadow: `0 0 10px ${c}60`,
                                }}
                            />
                        ))}
                    </div>
                </Field>
                <Field label="Language">
                    <Select value={draft.language} onChange={set('language')} options={[
                        { value: 'en', label: '🇬🇧 English' },
                        { value: 'hi', label: '🇮🇳 Hindi' },
                        { value: 'ta', label: '🇮🇳 Tamil' },
                        { value: 'te', label: '🇮🇳 Telugu' },
                    ]} />
                </Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <SaveBtn accent={settings.accentColor} onClick={() => save('appearance', ['theme', 'accentColor', 'language'])} saved={savedSection === 'appearance'} />
                </div>
            </Section>

            {/* Security */}
            <Section title="Security" delay={0.25}>
                <Field label="Current Password">
                    <Input value={draft.currentPassword || ''} onChange={set('currentPassword')} placeholder="••••••••" type="password" />
                </Field>
                <Field label="New Password" hint="At least 8 characters">
                    <Input value={draft.newPassword || ''} onChange={set('newPassword')} placeholder="••••••••" type="password" />
                </Field>
                <Field label="Confirm New Password">
                    <Input value={draft.confirmPassword || ''} onChange={set('confirmPassword')} placeholder="••••••••" type="password" />
                </Field>
                <Field label="Two-Factor Authentication" hint="Add an extra layer of security">
                    <Toggle accent={settings.accentColor} value={draft.twoFactor} onChange={set('twoFactor')} />
                </Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <SaveBtn
                        accent={settings.accentColor}
                        onClick={() => {
                            if (draft.newPassword && draft.newPassword !== draft.confirmPassword) {
                                alert('Passwords do not match!');
                                return;
                            }
                            save('security', ['twoFactor']);
                        }}
                        saved={savedSection === 'security'}
                    />
                </div>
            </Section>

            {/* Danger Zone */}
            <motion.div
                className="card"
                style={{
                    padding: 28,
                    border: '1px solid rgba(225,29,72,0.25)',
                    background: 'rgba(225,29,72,0.04)',
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div style={{
                    fontSize: 11, fontWeight: 700, color: '#e11d48',
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    marginBottom: 20, paddingBottom: 12,
                    borderBottom: '1px solid rgba(225,29,72,0.15)',
                }}>
                    Danger Zone
                </div>
                <Field label="Reset to Defaults" hint="Reset all settings to factory defaults.">
                    <button
                        onClick={() => {
                            if (window.confirm('Reset all settings to defaults?')) {
                                resetSettings();
                                setDraft({
                                    hostelName: 'HostelPro', adminName: 'Admin', adminEmail: 'admin@hostelpro.com',
                                    phone: '+91 98765 43210', address: '123 College Road, City',
                                    monthlyFee: '5000', lateFee: '200', dueDayOfMonth: '5', currency: 'INR',
                                    emailNotif: true, dueAlerts: true, occupancyAlerts: false, maintenanceAlerts: true,
                                    theme: 'light', accentColor: '#4f46e5', language: 'en', twoFactor: false,
                                });
                            }
                        }}
                        style={{
                            padding: '9px 20px', borderRadius: 10,
                            border: '1px solid rgba(225,29,72,0.3)',
                            background: 'rgba(225,29,72,0.06)',
                            color: '#e11d48',
                            fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(225,29,72,0.12)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(225,29,72,0.06)'}
                    >
                        Reset Defaults
                    </button>
                </Field>
            </motion.div>
        </div>
    );
}
