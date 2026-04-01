import {
  createFeatureDisabledResponse,
  FEATURE_DISABLED_ERROR,
  FEATURE_DISABLED_MESSAGE,
  type FeatureDisabledPayload,
} from '~/lib/governance/errors';
import {
  GROWTH_FEATURE_DOMAINS,
  type GrowthFeatureDomain,
  type GrowthFeatureFlagMap,
  type GrowthFeatureFlagOverrides,
} from '~/lib/governance/types';

const GROWTH_FEATURE_ENV_KEYS: Record<GrowthFeatureDomain, string> = {
  'lifebegins.anchor': 'LIFEBEGINS_ANCHOR_ENABLED',
  'lifebegins.fork': 'LIFEBEGINS_FORK_ENABLED',
  'lifebegins.failure': 'LIFEBEGINS_FAILURE_ENABLED',
  'lifebegins.timeline': 'LIFEBEGINS_TIMELINE_ENABLED',
  'lifebegins.dna': 'LIFEBEGINS_DNA_ENABLED',
};

const DEFAULT_GROWTH_FEATURE_FLAGS: GrowthFeatureFlagMap = {
  'lifebegins.anchor': false,
  'lifebegins.fork': false,
  'lifebegins.failure': false,
  'lifebegins.timeline': false,
  'lifebegins.dna': false,
};

let persistedGrowthFeatureFlags: GrowthFeatureFlagOverrides = {};

type EnvShape = Record<string, unknown>;

interface ResolveGrowthFeatureFlagsOptions {
  env?: EnvShape;
  persisted?: GrowthFeatureFlagOverrides;
}

interface ResolvedGrowthFeatureFlags {
  defaults: GrowthFeatureFlagMap;
  persisted: GrowthFeatureFlagMap;
  effective: GrowthFeatureFlagMap;
  precedence: 'env>persisted>default';
}

function normalizePersistedFlags(flags?: GrowthFeatureFlagOverrides): GrowthFeatureFlagMap {
  const normalized: GrowthFeatureFlagMap = { ...DEFAULT_GROWTH_FEATURE_FLAGS };

  if (!flags) {
    return normalized;
  }

  for (const domain of GROWTH_FEATURE_DOMAINS) {
    if (typeof flags[domain] === 'boolean') {
      normalized[domain] = flags[domain] as boolean;
    }
  }

  return normalized;
}

function parseEnvBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return undefined;
}

export function getGrowthFeatureDefaults(): GrowthFeatureFlagMap {
  return { ...DEFAULT_GROWTH_FEATURE_FLAGS };
}

export function getPersistedGrowthFeatureFlags(): GrowthFeatureFlagMap {
  return normalizePersistedFlags(persistedGrowthFeatureFlags);
}

export function setPersistedGrowthFeatureFlags(flags: GrowthFeatureFlagOverrides): GrowthFeatureFlagMap {
  persistedGrowthFeatureFlags = normalizePersistedFlags(flags);
  return getPersistedGrowthFeatureFlags();
}

export function resetPersistedGrowthFeatureFlags() {
  persistedGrowthFeatureFlags = {};
}

export function resolveGrowthFeatureFlags(options: ResolveGrowthFeatureFlagsOptions = {}): ResolvedGrowthFeatureFlags {
  const defaults = getGrowthFeatureDefaults();
  const persisted = normalizePersistedFlags(options.persisted ?? persistedGrowthFeatureFlags);
  const env = options.env ?? process.env;

  const effective: GrowthFeatureFlagMap = { ...defaults };

  for (const domain of GROWTH_FEATURE_DOMAINS) {
    // Fixed precedence: env > persisted > default.
    const envValue = parseEnvBoolean(env[GROWTH_FEATURE_ENV_KEYS[domain]]);

    if (typeof envValue === 'boolean') {
      effective[domain] = envValue;
      continue;
    }

    if (typeof persisted[domain] === 'boolean') {
      effective[domain] = persisted[domain];
      continue;
    }

    effective[domain] = defaults[domain];
  }

  return {
    defaults,
    persisted,
    effective,
    precedence: 'env>persisted>default',
  };
}

export function assertGrowthFeatureEnabled(domain: GrowthFeatureDomain, flags: GrowthFeatureFlagMap) {
  if (!flags[domain]) {
    throw createFeatureDisabledResponse(domain);
  }
}

export type { GrowthFeatureDomain, GrowthFeatureFlagMap, GrowthFeatureFlagOverrides, FeatureDisabledPayload };
export { FEATURE_DISABLED_ERROR, FEATURE_DISABLED_MESSAGE };
