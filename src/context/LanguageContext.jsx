import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        () => localStorage.getItem('hostel_lang') || 'English'
    );

    const changeLanguage = useCallback((lang) => {
        setLanguage(lang);
        localStorage.setItem('hostel_lang', lang);
    }, []);

    /** Translate a key. Falls back to the key itself if not found. */
    const t = useCallback((key) => {
        return translations[language]?.[key] ?? translations['English']?.[key] ?? key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
}
