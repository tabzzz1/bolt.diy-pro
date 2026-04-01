import { json } from '@remix-run/cloudflare';
import { exportGrowthDomainData } from '~/lib/governance/growthDataRights.server';
import { withSecurity } from '~/lib/security';

async function growthExportHandler() {
  try {
    const payload = await exportGrowthDomainData();
    return json(payload);
  } catch (error) {
    return json(
      {
        error: 'growth_export_failed',
        message: error instanceof Error ? error.message : 'Unknown export error',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(growthExportHandler, {
  allowedMethods: ["GET"],
  rateLimit: true,
});
