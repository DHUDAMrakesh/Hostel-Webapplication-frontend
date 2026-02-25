import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
    hostelName: 'HostelPro',
    adminName: 'Admin',
    adminEmail: 'admin@hostelpro.com',
    phone: '+91 98765 43210',
    address: '123 College Road, City',
    monthlyFee: '5000',
    lateFee: '200',
    dueDayOfMonth: '5',
    currency: 'INR',
    emailNotif: true,
    dueAlerts: true,
    occupancyAlerts: false,
    maintenanceAlerts: true,
    theme: localStorage.getItem('hostel_theme') || 'dark', // Default to dark for premium look
    accentColor: '#4f46e5',
    language: 'en',
    twoFactor: false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        // Sync data-theme attribute whenever settings.theme changes
        document.documentElement.setAttribute('data-theme', settings.theme);
        localStorage.setItem('hostel_theme', settings.theme);
    }, [settings.theme]);

    const updateSettings = (partial) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const resetSettings = () => setSettings(defaultSettings);

    const setTheme = (t) => updateSettings({ theme: t });

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, setTheme }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
}
