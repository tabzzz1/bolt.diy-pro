import { describe, expect, it } from 'vitest';
import { buildLifeBeginsFeatures } from './lifebeginsFeatures';

describe('buildLifeBeginsFeatures', () => {
  it('returns five domains in stable id order', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: false,
      lifebeginsForkEnabled: false,
      lifebeginsFailureEnabled: false,
      lifebeginsTimelineEnabled: false,
      lifebeginsDnaEnabled: false,
    });

    expect(features).toHaveLength(5);
    expect(features.map((feature) => feature.id)).toEqual([
      'lifebegins.anchor',
      'lifebegins.fork',
      'lifebegins.failure',
      'lifebegins.timeline',
      'lifebegins.dna',
    ]);
  });

  it('returns i18n key contract for title/description and toggle toasts', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: true,
      lifebeginsForkEnabled: false,
      lifebeginsFailureEnabled: true,
      lifebeginsTimelineEnabled: false,
      lifebeginsDnaEnabled: true,
    });

    expect(
      features.map((feature) => ({
        id: feature.id,
        titleKey: (feature as any).titleKey,
        descriptionKey: (feature as any).descriptionKey,
        enabledToastKey: (feature as any).enabledToastKey,
        disabledToastKey: (feature as any).disabledToastKey,
      })),
    ).toEqual([
      {
        id: 'lifebegins.anchor',
        titleKey: 'lifeBeginsAnchorTitle',
        descriptionKey: 'lifeBeginsAnchorDesc',
        enabledToastKey: 'lifeBeginsAnchorEnabled',
        disabledToastKey: 'lifeBeginsAnchorDisabled',
      },
      {
        id: 'lifebegins.fork',
        titleKey: 'lifeBeginsForkTitle',
        descriptionKey: 'lifeBeginsForkDesc',
        enabledToastKey: 'lifeBeginsForkEnabled',
        disabledToastKey: 'lifeBeginsForkDisabled',
      },
      {
        id: 'lifebegins.failure',
        titleKey: 'lifeBeginsFailureTitle',
        descriptionKey: 'lifeBeginsFailureDesc',
        enabledToastKey: 'lifeBeginsFailureEnabled',
        disabledToastKey: 'lifeBeginsFailureDisabled',
      },
      {
        id: 'lifebegins.timeline',
        titleKey: 'lifeBeginsTimelineTitle',
        descriptionKey: 'lifeBeginsTimelineDesc',
        enabledToastKey: 'lifeBeginsTimelineEnabled',
        disabledToastKey: 'lifeBeginsTimelineDisabled',
      },
      {
        id: 'lifebegins.dna',
        titleKey: 'lifeBeginsDnaTitle',
        descriptionKey: 'lifeBeginsDnaDesc',
        enabledToastKey: 'lifeBeginsDnaEnabled',
        disabledToastKey: 'lifeBeginsDnaDisabled',
      },
    ]);

    features.forEach((feature) => {
      expect(feature).not.toHaveProperty('title');
      expect(feature).not.toHaveProperty('description');
    });
  });

  it('preserves enabled state mapping one-to-one with input flags', () => {
    const features = buildLifeBeginsFeatures({
      lifebeginsAnchorEnabled: false,
      lifebeginsForkEnabled: true,
      lifebeginsFailureEnabled: false,
      lifebeginsTimelineEnabled: true,
      lifebeginsDnaEnabled: false,
    });

    expect(features.map((feature) => feature.enabled)).toEqual([false, true, false, true, false]);
  });
});
