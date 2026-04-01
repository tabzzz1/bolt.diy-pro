import type { GrowthFeatureDomain } from '~/lib/governance/types';

export const FEATURE_DISABLED_ERROR = 'feature_disabled';
export const FEATURE_DISABLED_MESSAGE = 'Feature is disabled by governance policy';

export interface FeatureDisabledPayload {
  error: typeof FEATURE_DISABLED_ERROR;
  feature: GrowthFeatureDomain;
  message: string;
}

export function createFeatureDisabledPayload(feature: GrowthFeatureDomain): FeatureDisabledPayload {
  return {
    error: FEATURE_DISABLED_ERROR,
    feature,
    message: FEATURE_DISABLED_MESSAGE,
  };
}

export function createFeatureDisabledResponse(feature: GrowthFeatureDomain): Response {
  return new Response(JSON.stringify(createFeatureDisabledPayload(feature)), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
