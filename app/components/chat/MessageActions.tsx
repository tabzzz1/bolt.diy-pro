import { memo, useState, useCallback, type ReactNode } from 'react';
import WithTooltip from '~/components/ui/Tooltip';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface ActionButtonProps {
  icon: string;
  tooltip: string;
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
  /** Optional custom className to override default icon styles */
  className?: string;
}

export const ActionButton = memo(({ icon, tooltip, onClick, ariaLabel, disabled, className }: ActionButtonProps) => (
  <WithTooltip tooltip={tooltip}>
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        w-7 h-7 flex items-center justify-center rounded-md
        text-bolt-elements-textTertiary
        hover:text-bolt-elements-textSecondary
        hover:bg-bolt-elements-background-depth-2
        focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-accent-500/50
        transition-all duration-200
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className ?? ''}
      `}
    >
      <div className={`${icon} text-sm`} />
    </button>
  </WithTooltip>
));

ActionButton.displayName = 'ActionButton';

/*
 * CopyButton - Specialized copy button with copied/idle state feedback.
 */
interface CopyButtonProps {
  content: string;
  tooltip?: string;
}

export const CopyButton = memo(({ content, tooltip }: CopyButtonProps) => {
  const { t } = useTranslation('chat');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('actions.copyFailed'));
    }
  }, [content, t]);

  return (
    <ActionButton
      icon={copied ? 'i-ph:check' : 'i-ph:copy'}
      tooltip={copied ? t('actions.copied') : (tooltip ?? t('actions.copy'))}
      onClick={handleCopy}
      ariaLabel={t('actions.copy')}
      className={copied ? '!text-green-500' : ''}
    />
  );
});

CopyButton.displayName = 'CopyButton';

/*
 * MessageActions - A container for a row of message action buttons.
 * Designed to be placed inside either user or assistant message bubbles.
 *
 * Props:
 *   - align: 'left' | 'right' — determines flex alignment
 *   - children: action buttons or other ReactNode content
 *   - className: optional additional styles
 *
 * Hover-reveal behavior: buttons are semi-transparent by default,
 * becoming fully visible on parent hover (controlled via group class on parent).
 */
interface MessageActionsProps {
  align?: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

export const MessageActions = memo(({ align = 'left', children, className }: MessageActionsProps) => (
  <div
    className={`
      flex items-center gap-0.5
      ${align === 'right' ? 'justify-end' : 'justify-start'}
      ${className ?? ''}
    `}
  >
    {children}
  </div>
));

MessageActions.displayName = 'MessageActions';

/*
 * UserMessageActions - Pre-composed action bar for user messages.
 * Positioned at bottom-right of the user bubble.
 *
 * Actions (right-to-left): Copy | Edit | Delete
 * Edit & Delete logic is intentionally left as stubs for future implementation.
 */
interface UserMessageActionsProps {
  content: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const UserMessageActions = memo(({ content, onEdit, onDelete }: UserMessageActionsProps) => {
  const { t } = useTranslation('chat');

  return (
    <MessageActions align="right">
      {/* Delete message — logic TBD, hover to show */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ActionButton
          icon="i-ph:trash"
          tooltip={t('actions.delete')}
          onClick={onDelete}
          ariaLabel={t('actions.delete')}
        />
      </div>

      {/* Edit message — logic TBD, hover to show */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ActionButton
          icon="i-ph:pencil-simple"
          tooltip={t('actions.edit')}
          onClick={onEdit}
          ariaLabel={t('actions.edit')}
        />
      </div>

      {/* Copy message text — always visible */}
      <CopyButton content={content} />
    </MessageActions>
  );
});

UserMessageActions.displayName = 'UserMessageActions';

/*
 * AssistantMessageActions - Pre-composed action bar for assistant messages.
 * Positioned at bottom-left of the assistant bubble.
 *
 * Actions: Token count badge | Rewind | Fork | Copy | Regenerate (TBD)
 */
interface AssistantMessageActionsProps {
  content: string;
  messageId?: string;
  onRewind?: (messageId: string) => void;
  onFork?: (messageId: string) => void;
  onRegenerate?: () => void;
  /** When true (still streaming), hide the action bar */
  isStreaming?: boolean;
}

export const AssistantMessageActions = memo(
  ({
    content,
    messageId,
    onRewind,
    onFork,
    onRegenerate: _onRegenerate,
    isStreaming,
  }: AssistantMessageActionsProps) => {
    const { t } = useTranslation('chat');

    // Hide entirely while streaming
    if (isStreaming) {
      return null;
    }

    return (
      <MessageActions align="left" className="mt-2">
        {/* Copy — always first */}
        <CopyButton content={content} />

        {/* Rewind */}
        {onRewind && messageId && (
          <ActionButton
            icon="i-ph:arrow-u-up-left"
            tooltip={t('rewindTooltip')}
            onClick={() => onRewind(messageId)}
            ariaLabel={t('rewindTooltip')}
          />
        )}

        {/* Fork */}
        {onFork && messageId && (
          <ActionButton
            icon="i-ph:git-fork"
            tooltip={t('forkTooltip')}
            onClick={() => onFork(messageId)}
            ariaLabel={t('forkTooltip')}
          />
        )}

        {/* Regenerate — logic TBD */}
        {/* <ActionButton
          icon="i-ph:arrow-clockwise"
          tooltip={t('actions.regenerate')}
          onClick={onRegenerate}
          ariaLabel={t('actions.regenerate')}
        /> */}
      </MessageActions>
    );
  },
);

AssistantMessageActions.displayName = 'AssistantMessageActions';
