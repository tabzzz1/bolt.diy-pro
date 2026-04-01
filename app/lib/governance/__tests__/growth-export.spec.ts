import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteGrowthDomainData,
  exportGrowthDomainData,
  resetGrowthDomainData,
  seedGrowthDomainData,
} from '~/lib/governance/growthDataRights.server';
import { listGovernanceAuditEvents, resetGovernanceAuditEvents } from '~/lib/governance/audit.server';

describe('growth data rights service', () => {
  beforeEach(() => {
    resetGrowthDomainData();
    resetGovernanceAuditEvents();
  });

  it('exports growth namespace data only with lifebegins.growth.v1 schema', async () => {
    seedGrowthDomainData({
      goals: [{ id: 'g1', title: 'Ship phase 1' }],
      decisions: [{ id: 'd1', selected: 'A' }],
      chats: [{ id: 'legacy-chat-1' }],
      settings: [{ id: 'legacy-settings-1' }],
      providers: [{ id: 'legacy-provider-1' }],
    });

    const exported = await exportGrowthDomainData();

    expect(exported.schema).toBe('lifebegins.growth.v1');
    expect(exported.data).toEqual(
      expect.objectContaining({
        goals: [{ id: 'g1', title: 'Ship phase 1' }],
        decisions: [{ id: 'd1', selected: 'A' }],
      }),
    );

    expect(exported.data).not.toHaveProperty('chats');
    expect(exported.data).not.toHaveProperty('settings');
    expect(exported.data).not.toHaveProperty('providers');
  });

  it('returns a single JSON-object export payload with schema marker', async () => {
    seedGrowthDomainData({
      experiments: [{ id: 'exp-1', name: 'CTA variant test' }],
    });

    const exported = await exportGrowthDomainData();
    const serialized = JSON.stringify(exported);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    expect(parsed).toHaveProperty('schema', 'lifebegins.growth.v1');
    expect(parsed).toHaveProperty('exportDate');
    expect(parsed).toHaveProperty('data');
    expect(Array.isArray(parsed)).toBe(false);
  });

  it('deletes growth records synchronously and returns result summary only for growth scope', async () => {
    seedGrowthDomainData({
      goals: [{ id: 'g1' }, { id: 'g2' }],
      decisions: [{ id: 'd1' }],
      chats: [{ id: 'legacy-chat-1' }],
    });

    const deletion = await deleteGrowthDomainData();

    expect(deletion.result).toBe('success');
    expect(deletion.deletedCount).toBe(3);
    expect(deletion.durationMs).toBeGreaterThanOrEqual(0);

    const exportedAfterDeletion = await exportGrowthDomainData();
    expect(exportedAfterDeletion.data).toEqual({
      goals: [],
      decisions: [],
      experiments: [],
      failures: [],
      timeline: [],
      dnaSignals: [],
    });

    const events = listGovernanceAuditEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      timestamp: events[0].timestamp,
      action: 'growth_data_delete',
      result: 'success',
      featureDomain: 'lifebegins.growth',
    });
  });
});
