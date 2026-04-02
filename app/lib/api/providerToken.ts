import { getApiKeysFromCookie, parseCookies } from '~/lib/api/cookies';

type EnvContext = {
  cloudflare?: {
    env?: Record<string, string | undefined>;
  };
};

interface ResolveProviderTokenOptions {
  request: Request;
  context?: EnvContext;
  cookieKeys?: string[];
  apiKeyKeys?: string[];
  envKeys?: string[];
}

function normalizeToken(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function extractBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }

  return normalizeToken(authHeader.substring(7));
}

export function resolveProviderToken({
  request,
  context,
  cookieKeys = [],
  apiKeyKeys = [],
  envKeys = [],
}: ResolveProviderTokenOptions): string | undefined {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const apiKeys = getApiKeysFromCookie(cookieHeader);

  const bearerToken = extractBearerToken(request);
  if (bearerToken) {
    return bearerToken;
  }

  for (const key of cookieKeys) {
    const token = normalizeToken(cookies[key]);
    if (token) {
      return token;
    }
  }

  for (const key of apiKeyKeys) {
    const token = normalizeToken(apiKeys[key]);
    if (token) {
      return token;
    }
  }

  for (const key of envKeys) {
    const cloudflareToken = normalizeToken(context?.cloudflare?.env?.[key]);
    if (cloudflareToken) {
      return cloudflareToken;
    }

    const processToken = normalizeToken(process.env[key]);
    if (processToken) {
      return processToken;
    }
  }

  return undefined;
}
