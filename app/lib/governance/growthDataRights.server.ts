import { appendGovernanceAuditEvent, type GovernanceAuditResult } from '~/lib/governance/audit.server';

const GROWTH_DATA_SCHEMA = 'lifebegins.growth.v1' as const;

const GROWTH_SCOPE_KEYS = ['goals', 'decisions', 'experiments', 'failures', 'timeline', 'dnaSignals'] as const;

type GrowthScopeKey = (typeof GROWTH_SCOPE_KEYS)[number];
type GrowthDomainData = Record<GrowthScopeKey, unknown[]>;

export interface GrowthExportPayload {
  schema: typeof GROWTH_DATA_SCHEMA;
  exportDate: string;
  data: GrowthDomainData;
}

export interface GrowthDeleteResult {
  deletedCount: number;
  durationMs: number;
  result: GovernanceAuditResult;
}

const growthDataStore: GrowthDomainData = {
  goals: [],
  decisions: [],
  experiments: [],
  failures: [],
  timeline: [],
  dnaSignals: [],
};

function cloneGrowthData(source: GrowthDomainData): GrowthDomainData {
  return {
    goals: [...source.goals],
    decisions: [...source.decisions],
    experiments: [...source.experiments],
    failures: [...source.failures],
    timeline: [...source.timeline],
    dnaSignals: [...source.dnaSignals],
  };
}

function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? [...value] : [];
}

export function seedGrowthDomainData(input: Record<string, unknown>) {
  for (const key of GROWTH_SCOPE_KEYS) {
    growthDataStore[key] = ensureArray(input[key]);
  }
}

export function resetGrowthDomainData() {
  for (const key of GROWTH_SCOPE_KEYS) {
    growthDataStore[key] = [];
  }
}

export function getGrowthSchema() {
  return GROWTH_DATA_SCHEMA;
}

export async function exportGrowthDomainData(): Promise<GrowthExportPayload> {
  return {
    schema: "lifebegins.growth.v1",
    exportDate: new Date().toISOString(),
    data: cloneGrowthData(growthDataStore),
  };
}

export async function deleteGrowthDomainData(): Promise<GrowthDeleteResult> {
  const startedAt = Date.now();
  let deletedCount = 0;
  let failedDeletes = 0;

  for (const key of GROWTH_SCOPE_KEYS) {
    try {
      deletedCount += growthDataStore[key].length;
      growthDataStore[key] = [];
    } catch {
      failedDeletes += 1;
    }
  }

  let result: GovernanceAuditResult = 'success';

  if (failedDeletes === GROWTH_SCOPE_KEYS.length) {
    result = 'failed';
  } else if (failedDeletes > 0) {
    result = 'partial';
  }

  appendGovernanceAuditEvent({
    action: 'growth_data_delete',
    result,
    featureDomain: 'lifebegins.growth',
  });

  return {
    deletedCount,
    durationMs: Date.now() - startedAt,
    result,
  };
}
