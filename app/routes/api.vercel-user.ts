import { json } from '@remix-run/cloudflare';
import { resolveProviderToken } from '~/lib/api/providerToken';
import { withSecurity } from '~/lib/security';

function resolveVercelToken(request: Request, context: any): string | undefined {
  return resolveProviderToken({
    request,
    context,
    cookieKeys: ['VITE_VERCEL_ACCESS_TOKEN'],
    apiKeyKeys: ['VITE_VERCEL_ACCESS_TOKEN'],
    envKeys: ['VITE_VERCEL_ACCESS_TOKEN'],
  });
}

async function vercelUserLoader({ request, context }: { request: Request; context: any }) {
  try {
    const vercelToken = resolveVercelToken(request, context);

    if (!vercelToken) {
      return json({ error: 'Vercel token not found' }, { status: 401 });
    }

    // Make server-side request to Vercel API
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'User-Agent': 'bolt.diy-app',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return json({ error: 'Invalid Vercel token' }, { status: 401 });
      }

      if (response.status === 403) {
        const details = await response.text().catch(() => '');
        return json(
          {
            error: 'Vercel token is valid but does not have permission to access user info',
            details,
          },
          { status: 403 },
        );
      }

      throw new Error(`Vercel API error: ${response.status}`);
    }

    const userData = (await response.json()) as {
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
        username: string;
      };
    };

    return json({
      id: userData.user.id,
      name: userData.user.name,
      email: userData.user.email,
      avatar: userData.user.avatar,
      username: userData.user.username,
    });
  } catch (error) {
    console.error('Error fetching Vercel user:', error);
    return json(
      {
        error: 'Failed to fetch Vercel user information',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(vercelUserLoader, {
  rateLimit: true,
  allowedMethods: ['GET'],
});

async function vercelUserAction({ request, context }: { request: Request; context: any }) {
  try {
    const formData = await request.formData();
    const action = formData.get('action');

    const vercelToken = resolveVercelToken(request, context);

    if (!vercelToken) {
      return json({ error: 'Vercel token not found' }, { status: 401 });
    }

    if (action === 'get_projects') {
      // Fetch user projects
      const response = await fetch('https://api.vercel.com/v13/projects', {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'User-Agent': 'bolt.diy-app',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          const details = await response.text().catch(() => '');
          return json(
            {
              error: 'Vercel token is valid but does not have permission to list projects',
              details,
            },
            { status: 403 },
          );
        }

        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        projects: Array<{
          id: string;
          name: string;
          framework: string | null;
          public: boolean;
          createdAt: string;
          updatedAt: string;
        }>;
      };

      return json({
        projects: data.projects.map((project) => ({
          id: project.id,
          name: project.name,
          framework: project.framework,
          public: project.public,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })),
        totalProjects: data.projects.length,
      });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in Vercel user action:', error);
    return json(
      {
        error: 'Failed to process Vercel request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const action = withSecurity(vercelUserAction, {
  rateLimit: true,
  allowedMethods: ['POST'],
});
