import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser client (use in client components). Persists session in cookies via
// @supabase/ssr so that server route handlers can read auth.
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    browserClient = createBrowserClient(url, key) as unknown as SupabaseClient;
  }
  return browserClient;
}

// Service-role client. Server-side only. Bypasses RLS - never import from
// client code.
let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY missing - service client unavailable');
    }
    serviceClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

// Backwards-compatible exports. Prefer the getters above in new code.
export const supabase: SupabaseClient =
  typeof window !== 'undefined'
    ? getSupabaseBrowserClient()
    : (null as unknown as SupabaseClient);

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop: string) {
    return (getSupabaseServiceClient() as any)[prop];
  },
});
