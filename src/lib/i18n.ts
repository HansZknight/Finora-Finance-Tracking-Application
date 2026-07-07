import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import id from '../locales/id.json';

const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
};

// Retrieve language from localStorage or default to English
const savedLanguage = localStorage.getItem('finora-language') || 'en';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
