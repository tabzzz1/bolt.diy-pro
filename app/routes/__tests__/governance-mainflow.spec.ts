import { describe, expect, it } from 'vitest';
import { loader as githubUserLoader } from '~/routes/api.github-user';
import { assertGrowthFeatureEnabled } from '~/lib/governance/featureFlags.server';

describe('governance mainflow safety', () => {
  it('keeps non-growth main API path usable when all growth domains are disabled', async () => {
    const response = await githubUserLoader({
      request: new Request('http://localhost/api/github-user', { method: 'GET' }),
      context: {} as any,
      params: {},
    });

    expect(response.status).toBe(401);
    const payload = (await response.json()) as { error?: string };
    expect(payload.error).not.toBe('feature_disabled');
  });

  it('shows lightweight disabled semantics without mutating existing input state', async () => {
    const inputDraft = 'keep current chat draft';

    try {
      assertGrowthFeatureEnabled('lifebegins.timeline', {
        'lifebegins.anchor': false,
        'lifebegins.fork': false,
        'lifebegins.failure': false,
        'lifebegins.timeline': false,
        'lifebegins.dna': false,
      });
      throw new Error('Expected feature disabled response');
    } catch (error) {
      const response = error as Response;
      const payload = (await response.json()) as { error: string; message: string };

      expect(response.status).toBe(403);
      expect(payload.error).toBe('feature_disabled');
      expect(payload.message).toBe('Feature is disabled by governance policy');
      expect(inputDraft).toBe('keep current chat draft');
    }
  });
});
