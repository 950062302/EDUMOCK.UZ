import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import uzTranslation from './locales/uz.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
      uz: {
        translation: uzTranslation,
      },
    },
    fallbackLng: 'uz', // Agar til aniqlanmasa, sukut bo'yicha o'zbek tili
    debug: false, // Debugging uchun true qiling
    interpolation: {
      escapeValue: false, // React matnlarni avtomatik ravishda escape qiladi
    },
    detection: {
      order: ['localStorage', 'navigator'], // Tilni aniqlash tartibi
      caches: ['localStorage'], // Aniqlangan tilni saqlash joyi
    },
  });

export default i18n;