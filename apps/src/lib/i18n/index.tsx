/* eslint-disable react-refresh/only-export-components */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resources } from './resources';

export * from './utils';

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4', // Updated to v4 for i18next compatibility

  // allows integrating dynamic values into translations.
  interpolation: {
    escapeValue: false, // escape passed in values to avoid XSS injections
  },
});

// Is it a RTL language?
export const isRTL = false;

export default i18n;
