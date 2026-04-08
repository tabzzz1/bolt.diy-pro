import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { classNames } from '~/utils/classNames';
import { Switch } from '~/components/ui/Switch';
import type { UserProfile } from '~/components/@settings/core/types';
import { isMac } from '~/utils/os';
import { setLanguage, type Language } from '~/lib/stores/i18n';
import { STORAGE_KEY_USER_PROFILE } from '~/lib/persistence/storageKeys';

type ShortcutToken = 'mod' | 'meta' | 'alt' | 'shift' | string;

// Helper to get modifier key symbols/text
const getModifierSymbol = (modifier: string): string => {
  switch (modifier) {
    case 'mod':
      return isMac ? '⌘' : 'Ctrl';
    case 'meta':
      return isMac ? '⌘' : 'Win';
    case 'alt':
      return isMac ? '⌥' : 'Alt';
    case 'shift':
      return '⇧';
    default:
      return modifier;
  }
};

export default function SettingsTab() {
  const { t } = useTranslation('settings');
  const [currentTimezone, setCurrentTimezone] = useState('');
  const [settings, setSettings] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
    return saved
      ? JSON.parse(saved)
      : {
          notifications: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
  });

  // 用于跳过首次挂载时的自动保存 effect，避免打开设置面板就弹出 toast
  const isFirstRender = useRef(true);

  useEffect(() => {
    setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // 仅在用户实际修改设置后才保存并提示
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    try {
      const existingProfile = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_PROFILE) || '{}');
      const updatedProfile = {
        ...existingProfile,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
      };
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(updatedProfile));
      toast.success(t('saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('saveFail'));
    }
  }, [settings]);

  const shortcuts: Array<{
    title: string;
    description: string;
    keys: ShortcutToken[];
  }> = [
    {
      title: t('toggleSidebar'),
      description: t('toggleSidebarDescription'),
      keys: ['mod', 'B'],
    },
    {
      title: t('openSettings'),
      description: t('openSettingsDescription'),
      keys: ['mod', ','],
    },
    {
      title: t('toggleTerminal'),
      description: t('toggleTerminalDescription'),
      keys: ['mod', '`'],
    },
    {
      title: t('toggleTheme'),
      description: t('switchBetweenLightAndDark'),
      keys: ['mod', 'shift', 'D'],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Language & Notifications */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:palette-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">{t('preferences')}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:translate-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">{t('language')}</label>
          </div>
          <select
            value={settings.language}
            onChange={(e) => {
              const newLang = e.target.value;
              setSettings((prev) => ({ ...prev, language: newLang }));
              setLanguage((newLang === 'zh' ? 'zh' : 'en') as Language);
            }}
            className={classNames(
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
              'border border-[#E5E5E5] dark:border-[#1A1A1A]',
              'text-bolt-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
              'transition-all duration-200',
            )}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:bell-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">{t('notifications')}</label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-bolt-elements-textSecondary">
              {settings.notifications ? t('notificationsEnabled') : t('notificationsDisabled')}
            </span>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => {
                // Update local state
                setSettings((prev) => ({ ...prev, notifications: checked }));

                // Update localStorage immediately
                const existingProfile = JSON.parse(localStorage.getItem(STORAGE_KEY_USER_PROFILE) || '{}');
                const updatedProfile = {
                  ...existingProfile,
                  notifications: checked,
                };
                localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(updatedProfile));

                // Dispatch storage event for other components
                window.dispatchEvent(
                  new StorageEvent('storage', {
                    key: STORAGE_KEY_USER_PROFILE,
                    newValue: JSON.stringify(updatedProfile),
                  }),
                );

                toast.success(checked ? t('notificationsEnabled') : t('notificationsDisabled'));
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Timezone */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:clock-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">{t('timeSettings')}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="i-ph:globe-fill w-4 h-4 text-bolt-elements-textSecondary" />
            <label className="block text-sm text-bolt-elements-textSecondary">{t('timezone')}</label>
          </div>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
            className={classNames(
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
              'border border-[#E5E5E5] dark:border-[#1A1A1A]',
              'text-bolt-elements-textPrimary',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
              'transition-all duration-200',
            )}
          >
            <option value={currentTimezone}>{currentTimezone}</option>
          </select>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:keyboard-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">{t('keyboardShortcuts')}</span>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.title}
              className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A]"
            >
              <div className="flex flex-col">
                <span className="text-sm text-bolt-elements-textPrimary">{shortcut.title}</span>
                <span className="text-xs text-bolt-elements-textSecondary">{shortcut.description}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={`${shortcut.title}-${key}`}
                    className="px-2 py-1 text-xs font-semibold text-bolt-elements-textSecondary bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#1A1A1A] rounded shadow-sm"
                  >
                    {['mod', 'meta', 'alt', 'shift'].includes(key.toLowerCase())
                      ? getModifierSymbol(key.toLowerCase())
                      : key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
