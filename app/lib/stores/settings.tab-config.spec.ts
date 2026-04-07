import { describe, expect, it } from 'vitest';
import { reconcileUserTabsWithDefaults } from './settings';

describe('tab configuration migration', () => {
  it('appends missing default tabs (including skills) and removes unknown tabs', () => {
    const reconciled = reconcileUserTabsWithDefaults([
      { id: 'features', visible: true, window: 'user', order: 0 },
      { id: 'mcp', visible: true, window: 'user', order: 1 },
      { id: 'unknown-tab', visible: true, window: 'user', order: 2 },
    ]);

    expect(reconciled.some((tab) => tab.id === 'skills')).toBe(true);
    expect((reconciled.map((tab) => tab.id) as string[]).includes('unknown-tab')).toBe(false);
  });

  it('re-indexes order continuously after reconciliation', () => {
    const reconciled = reconcileUserTabsWithDefaults([
      { id: 'mcp', visible: true, window: 'user', order: 50 },
      { id: 'features', visible: true, window: 'user', order: 1 },
    ]);

    expect(reconciled.every((tab, index) => tab.order === index)).toBe(true);
  });
});
