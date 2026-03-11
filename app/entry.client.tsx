import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { initAuth } from '~/lib/stores/auth';

startTransition(() => {
  hydrateRoot(document.getElementById('root')!, <RemixBrowser />);
});

// Initialize Supabase Auth listener after hydration
initAuth().catch(console.error);
