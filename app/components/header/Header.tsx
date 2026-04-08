import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { isSidebarOpen } from '~/lib/stores/sidebar';
import { useEffect, useState } from 'react';
import { SettingsButton } from '~/components/ui/SettingsButton';
import { ControlPanel } from '~/components/@settings/core/ControlPanel';
import { useTranslation } from 'react-i18next';
import { shortcutEventEmitter } from '~/lib/hooks/useShortcuts';

export function Header() {
  const chat = useStore(chatStore);
  const isPinned = useStore(isSidebarOpen);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const { t } = useTranslation('settings');

  const handleSidebarToggle = () => {
    isSidebarOpen.set(!isPinned);
  };

  useEffect(() => {
    return shortcutEventEmitter.on('openControlPanel', () => {
      setIsControlPanelOpen(true);
    });
  }, []);

  return (
    <header
      className={classNames('flex items-center px-4 border-b h-[var(--header-height)] relative', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary shrink-0">
        <button
          onClick={handleSidebarToggle}
          className={classNames(
            'flex items-center justify-center w-8 h-8 rounded-md transition-all active:scale-95 cursor-pointer',
            isPinned
              ? 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10'
              : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2',
          )}
          aria-label="切换侧边栏"
        >
          <div className="i-ph:sidebar-simple-duotone text-xl" />
        </button>
        <a
          href="/"
          className="text-2xl font-semibold text-accent flex items-center transition-transform active:scale-95"
        >
          {/* <span className="i-bolt:logo-text?mask w-[46px] inline-block" /> */}
          <img src="/logo-light-styled.png" alt="logo" className="w-[90px] inline-block dark:hidden" />
          <img src="/logo-dark-styled.png" alt="logo" className="w-[90px] inline-block hidden dark:block" />
        </a>
      </div>

      {chat.started && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[40%] px-4 w-full pointer-events-none">
          <span className="block truncate text-center text-bolt-elements-textPrimary pointer-events-auto">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
        </div>
      )}

      <div className="flex-1" />

      {chat.started && (
        <ClientOnly>
          {() => (
            <div className="flex items-center gap-1">
              <HeaderActionButtons chatStarted={chat.started} />
            </div>
          )}
        </ClientOnly>
      )}

      <div className="flex items-center gap-2 ml-2">
        <SettingsButton
          onClick={() => setIsControlPanelOpen(true)}
          title={t('controlPanel')}
          label={t('controlPanel')}
        />
      </div>
      <ControlPanel open={isControlPanelOpen} onClose={() => setIsControlPanelOpen(false)} />
    </header>
  );
}
