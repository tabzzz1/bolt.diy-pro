// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Header } from './Header';
import { shortcutEventEmitter } from '~/lib/hooks/useShortcuts';
import { chatStore } from '~/lib/stores/chat';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('remix-utils/client-only', () => ({
  ClientOnly: ({ children }: { children: (() => React.ReactNode) | React.ReactNode }) =>
    typeof children === 'function' ? <>{children()}</> : <>{children}</>,
}));

vi.mock('./HeaderActionButtons.client', () => ({
  HeaderActionButtons: () => <div data-testid="header-actions" />,
}));

vi.mock('~/lib/persistence/ChatDescription.client', () => ({
  ChatDescription: () => <div data-testid="chat-description" />,
}));

vi.mock('~/components/ui/SettingsButton', () => ({
  SettingsButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="settings-button" onClick={onClick}>
      settings
    </button>
  ),
}));

vi.mock('~/components/@settings/core/ControlPanel', () => ({
  ControlPanel: ({ open }: { open: boolean }) => <div data-testid="control-panel">{open ? 'open' : 'closed'}</div>,
}));

describe('Header keyboard shortcuts integration', () => {
  beforeEach(() => {
    chatStore.set({
      started: false,
      aborted: false,
      showChat: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('opens settings panel when openSettings shortcut event is dispatched', () => {
    render(<Header />);

    expect(screen.getByTestId('control-panel').textContent).toBe('closed');

    act(() => {
      shortcutEventEmitter.dispatch('openSettings');
    });

    expect(screen.getByTestId('control-panel').textContent).toBe('open');
  });
});
