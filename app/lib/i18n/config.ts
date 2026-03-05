import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import zh from './locales/zh';
import { STORAGE_KEY_USER_PROFILE } from '~/lib/persistence/storageKeys';

/**
 * 从 bolt_user_profile 读取已保存的语言设置。
 * 与 SettingsTab.tsx 的现有存储路径保持一致。
 */
function getInitialLanguage(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    const profile = raw ? JSON.parse(raw) : {};

    return profile.language === 'zh' ? 'zh' : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: { en, zh },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'sidebar',
  ns: ['sidebar', 'settings', 'chat'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
