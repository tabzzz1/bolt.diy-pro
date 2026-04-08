import { memo } from 'react';
import { IconButton } from '~/components/ui/IconButton';
interface SettingsButtonProps {
  onClick: () => void;
  title?: string;
  label?: string;
}

export const SettingsButton = memo(({ onClick, title = 'Control Panel', label }: SettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={title}
      data-testid="settings-button"
      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-bolt-elements-borderColor bg-white dark:bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-gray-100 dark:hover:bg-bolt-elements-background-depth-2 transition-all ml-1"
    >
      <div className="i-ph:sliders-horizontal text-xl transition-transform group-hover:rotate-12" />
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
});

interface HelpButtonProps {
  onClick: () => void;
}

export const HelpButton = memo(({ onClick }: HelpButtonProps) => {
  return (
    <IconButton
      onClick={onClick}
      icon="i-ph:question"
      size="xl"
      title="Help & Documentation"
      data-testid="help-button"
      className="text-[#666] hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive/10 transition-colors"
    />
  );
});
