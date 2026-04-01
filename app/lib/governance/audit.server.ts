export type GovernanceAuditResult = 'success' | 'partial' | 'failed';

export interface GovernanceAuditEvent {
  timestamp: string;
  action: string;
  result: GovernanceAuditResult;
  featureDomain: 'lifebegins.growth';
}

const governanceAuditEvents: GovernanceAuditEvent[] = [];

export function appendGovernanceAuditEvent(event: Omit<GovernanceAuditEvent, 'timestamp'> & { timestamp?: string }) {
  const nextEvent: GovernanceAuditEvent = {
    timestamp: event.timestamp ?? new Date().toISOString(),
    action: event.action,
    result: event.result,
    featureDomain: event.featureDomain,
  };

  governanceAuditEvents.push(nextEvent);

  return nextEvent;
}

export function listGovernanceAuditEvents(): GovernanceAuditEvent[] {
  return governanceAuditEvents.map((event) => ({ ...event }));
}

export function resetGovernanceAuditEvents() {
  governanceAuditEvents.length = 0;
}
