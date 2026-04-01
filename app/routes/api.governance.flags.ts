import { json } from '@remix-run/cloudflare';
import {
  GROWTH_FEATURE_DOMAINS,
  type GrowthFeatureDomain,
  type GrowthFeatureFlagOverrides,
} from '~/lib/governance/types';
import {
  getPersistedGrowthFeatureFlags,
  resolveGrowthFeatureFlags,
  setPersistedGrowthFeatureFlags,
} from '~/lib/governance/featureFlags.server';
import { withSecurity } from '~/lib/security';

const ALLOWED_METHODS = ["GET", "PATCH"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveGovernanceEnv(context: any): Record<string, unknown> {
  return context?.cloudflare?.env ?? process.env;
}

function normalizePatchPayload(input: unknown): { ok: true; flags: GrowthFeatureFlagOverrides } | { ok: false; error: string } {
  if (!isPlainObject(input)) {
    return { ok: false, error: 'growthFeatureFlags must be an object' };
  }

  const entries = Object.entries(input);
  const normalized: GrowthFeatureFlagOverrides = {};

  for (const [key, value] of entries) {
    if (!(GROWTH_FEATURE_DOMAINS as readonly string[]).includes(key)) {
      return { ok: false, error: `Unknown feature key: ${key}` };
    }

    if (typeof value !== 'boolean') {
      return { ok: false, error: `Feature key ${key} must be boolean` };
    }

    normalized[key as GrowthFeatureDomain] = value;
  }

  return { ok: true, flags: normalized };
}

async function governanceFlagsHandler({ request, context }: { request: Request; context: any }) {
  const env = resolveGovernanceEnv(context);

  if (request.method === 'GET') {
    const resolved = resolveGrowthFeatureFlags({ env });

    return json({
      defaults: resolved.defaults,
      persisted: resolved.persisted,
      effective: resolved.effective,
      precedence: "env>persisted>default",
    });
  }

  if (request.method === 'PATCH') {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!isPlainObject(body) || !('growthFeatureFlags' in body)) {
      return json({ error: 'growthFeatureFlags is required' }, { status: 400 });
    }

    const parsed = normalizePatchPayload(body.growthFeatureFlags);

    if (!parsed.ok) {
      return json({ error: parsed.error }, { status: 400 });
    }

    const nextPersisted = setPersistedGrowthFeatureFlags({
      ...getPersistedGrowthFeatureFlags(),
      ...parsed.flags,
    });

    const resolved = resolveGrowthFeatureFlags({
      env,
      persisted: nextPersisted,
    });

    return json({
      defaults: resolved.defaults,
      persisted: resolved.persisted,
      effective: resolved.effective,
      precedence: "env>persisted>default",
    });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}

export const loader = withSecurity(governanceFlagsHandler, {
  allowedMethods: ALLOWED_METHODS,
  rateLimit: true,
});

export const action = withSecurity(governanceFlagsHandler, {
  allowedMethods: ALLOWED_METHODS,
  rateLimit: true,
});
