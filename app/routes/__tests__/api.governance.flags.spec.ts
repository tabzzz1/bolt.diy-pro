import { describe, expect, it } from 'vitest';
import {
  assertGrowthFeatureEnabled,
  resolveGrowthFeatureFlags,
  type GrowthFeatureFlagMap,
} from '~/lib/governance/featureFlags.server';

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
});
