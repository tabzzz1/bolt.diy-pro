import { beforeEach, describe, expect, it } from 'vitest';
import { loader as exportLoader } from '~/routes/api.growth.export';
import { action as deleteAction } from '~/routes/api.growth.delete';
import {
  exportGrowthDomainData,
  resetGrowthDomainData,
  seedGrowthDomainData,
} from '~/lib/governance/growthDataRights.server';
import { listGovernanceAuditEvents, resetGovernanceAuditEvents } from '~/lib/governance/audit.server';

describe('growth export/delete routes', () => {
  beforeEach(() => {
    resetGrowthDomainData();
    resetGovernanceAuditEvents();
  });

  it('returns growth-only export payload from export route', async () => {
    seedGrowthDomainData({
      goals: [{ id: 'g1' }],
      decisions: [{ id: 'd1' }],
      chats: [{ id: 'legacy-chat-1' }],
    });

    const request = new Request('http://localhost/api/growth/export', { method: 'GET' });
    const response = await exportLoader({ request, context: {} as any, params: {} });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as Awaited<ReturnType<typeof exportGrowthDomainData>>;

    expect(payload.schema).toBe('lifebegins.growth.v1');
    expect(payload.data.goals).toEqual([{ id: 'g1' }]);
    expect(payload.data.decisions).toEqual([{ id: 'd1' }]);
    expect(payload.data).not.toHaveProperty('chats');
  });

  it('deletes growth data synchronously and returns completed result in same request', async () => {
    seedGrowthDomainData({
      goals: [{ id: 'g1' }, { id: 'g2' }],
      decisions: [{ id: 'd1' }],
    });

    const request = new Request('http://localhost/api/growth/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    });

    const response = await deleteAction({ request, context: {} as any, params: {} });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      deletedCount: number;
      durationMs: number;
      result: 'success' | 'partial' | 'failed';
      completed: boolean;
    };

    expect(payload.completed).toBe(true);
    expect(payload.result).toBe('success');
    expect(payload.deletedCount).toBe(3);
    expect(payload.durationMs).toBeGreaterThanOrEqual(0);

    const postDeleteExport = await exportGrowthDomainData();
    expect(postDeleteExport.data.goals).toEqual([]);
    expect(postDeleteExport.data.decisions).toEqual([]);
  });

  it('records anonymous audit metadata only for delete route', async () => {
    seedGrowthDomainData({
      goals: [{ id: 'g1', note: 'should not leak' }],
    });

    const request = new Request('http://localhost/api/growth/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    });

    const response = await deleteAction({ request, context: {} as any, params: {} });

    expect(response.status).toBe(200);

    const events = listGovernanceAuditEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      timestamp: events[0].timestamp,
      action: 'growth_data_delete',
      result: 'success',
      featureDomain: 'lifebegins.growth',
    });
    expect(events[0]).not.toHaveProperty('data');
    expect(events[0]).not.toHaveProperty('payload');
  });

  it('rejects unsupported methods via withSecurity', async () => {
    const request = new Request('http://localhost/api/growth/delete', { method: 'GET' });
    const response = await deleteAction({ request, context: {} as any, params: {} });

    expect(response.status).toBe(405);
  });
});
