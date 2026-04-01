import { json } from '@remix-run/cloudflare';
import { deleteGrowthDomainData } from '~/lib/governance/growthDataRights.server';
import { withSecurity } from '~/lib/security';

interface DeleteGrowthRequest {
  confirm?: boolean;
}

async function growthDeleteHandler({ request }: { request: Request }) {
  let body: DeleteGrowthRequest;

  try {
    body = (await request.json()) as DeleteGrowthRequest;
  } catch {
    return json({ error: 'invalid_request_body', message: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (body.confirm !== true) {
    return json(
      {
        error: 'confirmation_required',
        message: 'Set confirm=true to perform growth-domain hard delete',
      },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteGrowthDomainData();

    return json({
      completed: true,
      deletedCount: deleted.deletedCount,
      durationMs: deleted.durationMs,
      result: deleted.result,
    });
  } catch (error) {
    return json(
      {
        error: 'growth_delete_failed',
        message: error instanceof Error ? error.message : 'Unknown delete error',
      },
      { status: 500 },
    );
  }
}

export const action = withSecurity(growthDeleteHandler, {
  allowedMethods: ["POST"],
  rateLimit: true,
});
