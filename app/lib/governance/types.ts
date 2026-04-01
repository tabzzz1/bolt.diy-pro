export const GROWTH_FEATURE_DOMAINS = [
  'lifebegins.anchor',
  'lifebegins.fork',
  'lifebegins.failure',
  'lifebegins.timeline',
  'lifebegins.dna',
] as const;

export type GrowthFeatureDomain = (typeof GROWTH_FEATURE_DOMAINS)[number];

export type GrowthFeatureFlagMap = Record<GrowthFeatureDomain, boolean>;

export type GrowthFeatureFlagOverrides = Partial<GrowthFeatureFlagMap>;
