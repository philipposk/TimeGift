import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public-ish endpoint: returns reliability percent + completed/broken counts.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const admin = getSupabaseServiceClient();
  const { data } = await admin
    .from('user_reliability')
    .select('completed_count, broken_count, total_decided, reliability_percent')
    .eq('user_id', userId)
    .maybeSingle();

  return NextResponse.json({ reliability: data || { reliability_percent: null } });
}
