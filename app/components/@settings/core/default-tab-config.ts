import type { UserTabConfig } from './types';

export const DEFAULT_TAB_CONFIG: UserTabConfig[] = [
  { id: 'features', visible: true, window: 'user', order: 0 },
  { id: 'data', visible: true, window: 'user', order: 1 },
  { id: 'cloud-providers', visible: true, window: 'user', order: 2 },
  { id: 'local-providers', visible: true, window: 'user', order: 3 },
  { id: 'github', visible: true, window: 'user', order: 4 },
  { id: 'gitlab', visible: true, window: 'user', order: 5 },
  { id: 'netlify', visible: true, window: 'user', order: 6 },
  { id: 'vercel', visible: true, window: 'user', order: 7 },
  { id: 'supabase', visible: true, window: 'user', order: 8 },
  { id: 'notifications', visible: true, window: 'user', order: 9 },
  { id: 'event-logs', visible: true, window: 'user', order: 10 },
  { id: 'mcp', visible: true, window: 'user', order: 11 },
  { id: 'skills', visible: true, window: 'user', order: 12 },
];
