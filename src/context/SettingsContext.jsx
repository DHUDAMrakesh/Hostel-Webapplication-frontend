import React, { createContext, useContext, useState } from 'react';

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
    theme: 'dark',
    accentColor: '#6366f1',
    language: 'en',
    twoFactor: false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(defaultSettings);

    const updateSettings = (partial) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const resetSettings = () => setSettings(defaultSettings);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
}
