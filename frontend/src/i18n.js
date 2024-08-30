import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

// Define the resources with translations
const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  .use(LanguageDetector) // Automatically detect the user's language
  .use(initReactI18next) // Bind react-i18next to the i18n instance
  .init({
    resources,
    fallbackLng: 'en', // Default language
    debug: true,
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
