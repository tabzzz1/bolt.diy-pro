import { beforeEach, describe, expect, it } from 'vitest';
import {
  assertGrowthFeatureEnabled,
  getPersistedGrowthFeatureFlags,
  resetPersistedGrowthFeatureFlags,
  resolveGrowthFeatureFlags,
  type GrowthFeatureFlagMap,
} from '~/lib/governance/featureFlags.server';
import { action, loader } from '~/routes/api.governance.flags';

function getAllDisabledFlags(): GrowthFeatureFlagMap {
  return {
    'lifebegins.anchor': false,
    'lifebegins.fork': false,
    'lifebegins.failure': false,
    'lifebegins.timeline': false,
    'lifebegins.dna': false,
  };
}

describe('governance feature flags', () => {
  beforeEach(() => {
    resetPersistedGrowthFeatureFlags();
  });

  it('returns all growth domains false when no env or persisted config', () => {
    const result = resolveGrowthFeatureFlags({ env: {}, persisted: undefined });

    expect(result.effective).toEqual(getAllDisabledFlags());
    expect(result.defaults).toEqual(getAllDisabledFlags());
    expect(result.precedence).toBe('env>persisted>default');
  });

  it('applies precedence env > persisted > default', () => {
    const result = resolveGrowthFeatureFlags({
      env: {
        LIFEBEGINS_ANCHOR_ENABLED: 'true',
        LIFEBEGINS_FORK_ENABLED: 'false',
      },
      persisted: {
        'lifebegins.anchor': false,
        'lifebegins.fork': true,
        'lifebegins.failure': true,
      },
    });

    expect(result.effective['lifebegins.anchor']).toBe(true);
    expect(result.effective['lifebegins.fork']).toBe(false);
    expect(result.effective['lifebegins.failure']).toBe(true);
    expect(result.effective['lifebegins.timeline']).toBe(false);
    expect(result.effective['lifebegins.dna']).toBe(false);
  });

  it('rejects disabled feature with 403 and feature_disabled payload', async () => {
    const flags = getAllDisabledFlags();

    try {
      assertGrowthFeatureEnabled('lifebegins.anchor', flags);
      throw new Error('Expected assertGrowthFeatureEnabled to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;

      expect(response.status).toBe(403);
      const payload = (await response.json()) as {
        error: string;
        feature: string;
        message: string;
      };

      expect(payload).toEqual({
        error: 'feature_disabled',
        feature: 'lifebegins.anchor',
        message: 'Feature is disabled by governance policy',
      });
    }
  });

  it('returns defaults/persisted/effective values for GET', async () => {
    const request = new Request('http://localhost/api/governance/flags', { method: 'GET' });
    const response = await loader({ request, context: {} as any, params: {} });

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      defaults: GrowthFeatureFlagMap;
      persisted: GrowthFeatureFlagMap;
      effective: GrowthFeatureFlagMap;
      precedence: string;
    };

    expect(Object.keys(payload.effective)).toHaveLength(5);
    expect(payload.precedence).toBe('env>persisted>default');
  });

  it('updates persisted flags via PATCH while env override remains dominant', async () => {
    const patchRequest = new Request('http://localhost/api/governance/flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        growthFeatureFlags: {
          'lifebegins.anchor': true,
          'lifebegins.fork': true,
        },
      }),
    });

    const patchResponse = await action({
      request: patchRequest,
      context: { cloudflare: { env: { LIFEBEGINS_ANCHOR_ENABLED: 'false' } } } as any,
      params: {},
    });

    expect(patchResponse.status).toBe(200);
    const patchPayload = (await patchResponse.json()) as { persisted: GrowthFeatureFlagMap; effective: GrowthFeatureFlagMap };

    expect(patchPayload.persisted['lifebegins.anchor']).toBe(true);
    expect(patchPayload.effective['lifebegins.anchor']).toBe(false);
    expect(getPersistedGrowthFeatureFlags()['lifebegins.fork']).toBe(true);
  });

  it('rejects non-allowed methods with 405 from security wrapper', async () => {
    const request = new Request('http://localhost/api/governance/flags', { method: 'DELETE' });
    const response = await action({ request, context: {} as any, params: {} });

    expect(response.status).toBe(405);
  });

  it('rejects non-whitelisted keys with 400', async () => {
    const request = new Request('http://localhost/api/governance/flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        growthFeatureFlags: {
          'lifebegins.unknown': true,
        },
      }),
    });

    const response = await action({ request, context: {} as any, params: {} });
    expect(response.status).toBe(400);
  });
});
