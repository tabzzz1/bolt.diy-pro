import { describe, expect, it } from 'vitest';
import { buildLifeBeginsFeatures } from './lifebeginsFeatures';

describe('buildLifeBeginsFeatures', () => {
  it('returns five switches even when all lifebegins flags are false', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: false,
      lifebeginsForkEnabled: false,
      lifebeginsFailureEnabled: false,
      lifebeginsTimelineEnabled: false,
      lifebeginsDnaEnabled: false,
    });

    expect(features).toHaveLength(5);
  });

  it('preserves domain ids and enabled states for each returned switch', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: true,
      lifebeginsForkEnabled: false,
      lifebeginsFailureEnabled: true,
      lifebeginsTimelineEnabled: false,
      lifebeginsDnaEnabled: true,
    });

    expect(features.map((feature) => feature.id)).toEqual([
      'lifebegins.anchor',
      'lifebegins.fork',
      'lifebegins.failure',
      'lifebegins.timeline',
      'lifebegins.dna',
    ]);
    expect(features.map((feature) => feature.enabled)).toEqual([true, false, true, false, true]);
  });

  it('returns all five items for mixed true/false flags without filtering by enabled', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: false,
      lifebeginsForkEnabled: true,
      lifebeginsFailureEnabled: false,
      lifebeginsTimelineEnabled: true,
      lifebeginsDnaEnabled: false,
    });

    expect(features).toHaveLength(5);
    expect(features.some((feature) => feature.id === 'lifebegins.anchor' && feature.enabled === false)).toBe(true);
    expect(features.some((feature) => feature.id === 'lifebegins.fork' && feature.enabled === true)).toBe(true);
    expect(features.some((feature) => feature.id === 'lifebegins.timeline' && feature.enabled === true)).toBe(true);
  });
});
