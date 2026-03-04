import type en from './locales/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'sidebar';
    resources: typeof en;
  }
}
