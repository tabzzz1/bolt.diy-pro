// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { useShortcuts, shortcutEventEmitter } from './useShortcuts';
import { isSidebarOpen } from '~/lib/stores/sidebar';
import { themeStore } from '~/lib/stores/theme';
import { STORAGE_KEY_THEME } from '~/lib/persistence/storageKeys';

function ShortcutHarness() {
  useShortcuts();
  return null;
}

describe('useShortcuts', () => {
  beforeEach(() => {
    isSidebarOpen.set(false);
    themeStore.set('light');
    localStorage.setItem(STORAGE_KEY_THEME, 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    cleanup();
  });

  it('toggles sidebar with Cmd/Ctrl+B', () => {
    render(<ShortcutHarness />);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        metaKey: true,
      }),
    );

    expect(isSidebarOpen.get()).toBe(true);
  });

  it('dispatches openSettings with Cmd/Ctrl+,', () => {
    let dispatched = false;
    const unsubscribe = shortcutEventEmitter.on('openSettings', () => {
      dispatched = true;
    });

    render(<ShortcutHarness />);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: ',',
        ctrlKey: true,
        metaKey: true,
      }),
    );

    unsubscribe();
    expect(dispatched).toBe(true);
  });

  it('dispatches toggleTerminal with Cmd/Ctrl+`', () => {
    let dispatched = false;
    const unsubscribe = shortcutEventEmitter.on('toggleTerminal', () => {
      dispatched = true;
    });

    render(<ShortcutHarness />);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: '`',
        ctrlKey: true,
        metaKey: true,
      }),
    );

    unsubscribe();
    expect(dispatched).toBe(true);
  });

  it('toggles theme with Cmd/Ctrl+Shift+D', () => {
    render(<ShortcutHarness />);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'd',
        shiftKey: true,
        ctrlKey: true,
        metaKey: true,
      }),
    );

    expect(themeStore.get()).toBe('dark');
  });
});

