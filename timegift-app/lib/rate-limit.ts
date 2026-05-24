import { getSupabaseServiceClient } from '@/lib/supabase';

// Per-user sliding window rate limit. Returns true if under limit (allowed),
// false if over. Logs the usage when allowed.
export async function checkAndRecordRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const admin = getSupabaseServiceClient();
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count } = await admin
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart);

  if ((count ?? 0) >= maxRequests) return false;

  await admin.from('ai_usage').insert({ user_id: userId, endpoint });
  return true;
}
