import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('SupabaseAuth');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Supabase client for Auth / Profiles / Storage only.
 * Completely independent from the existing Supabase Management API integration.
 */
function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    if (!supabaseUrl && !supabaseAnonKey) {
      logger.info('Supabase Auth not configured (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set)');
    } else if (!isValidUrl(supabaseUrl)) {
      logger.warn('VITE_SUPABASE_URL is not a valid HTTP/HTTPS URL, skipping Supabase Auth init');
    } else {
      logger.warn('VITE_SUPABASE_ANON_KEY not set, skipping Supabase Auth init');
    }

    return null;
  }

  logger.info('Supabase Auth client initialized');

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabaseClient = createSupabaseClient();
