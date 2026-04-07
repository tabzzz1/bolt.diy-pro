import { describe, expect, it } from 'vitest';
import { getVisibleTabs, reorderTabs } from './tab-helpers';

describe('tab helpers', () => {
  it('returns sorted visible user tabs', () => {
    const tabs = getVisibleTabs(
      {
        userTabs: [
          { id: 'settings', visible: true, window: 'user', order: 2 },
          { id: 'features', visible: true, window: 'user', order: 1 },
          { id: 'notifications', visible: true, window: 'user', order: 3 },
        ] as any,
      },
      true,
    );

    expect(tabs.map((tab) => tab.id)).toEqual(['features', 'settings', 'notifications']);
  });

  it('filters notifications tab when notifications are disabled', () => {
    const tabs = getVisibleTabs(
      {
        userTabs: [{ id: 'notifications', visible: true, window: 'user', order: 0 }] as any,
      },
      false,
    );

    expect(tabs).toHaveLength(0);
  });

  it('reorders tabs and updates order fields', () => {
    const reordered = reorderTabs(
      [
        { id: 'features', visible: true, window: 'user', order: 0 },
        { id: 'settings', visible: true, window: 'user', order: 1 },
      ] as any,
      0,
      1,
    );

    expect(reordered.map((tab) => tab.id)).toEqual(['settings', 'features']);
    expect(reordered.map((tab) => tab.order)).toEqual([0, 1]);
  });
});
