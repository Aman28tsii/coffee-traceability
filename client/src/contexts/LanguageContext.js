import React, { createContext, useState, useContext, useEffect } from 'react';
import { amharicTranslations } from '../i18n/am';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    localStorage.setItem('language', language);
    if (language === 'am') {
      setTranslations(amharicTranslations);
    } else {
      setTranslations({});
    }
  }, [language]);
  
  const t = (key) => {
    if (language === 'am' && translations[key]) {
      return translations[key];
    }
    return key;
  };
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};