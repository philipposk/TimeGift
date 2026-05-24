import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cron-triggered. Pairs unmatched random-exchange queue entries via the
// match_random_exchange_pair() RPC (atomic per pair).
// Auth: requires `Authorization: Bearer ${CRON_SECRET}` if CRON_SECRET is set.
export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseServiceClient();

    const { data: settingsRow } = await admin
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'random_exchange')
      .maybeSingle();

    const exchangeConfig = (settingsRow?.setting_value as any) || {
      enabled: true,
      match_similar_time: true,
    };

    if (!exchangeConfig.enabled) {
      return NextResponse.json({ message: 'Random exchange is disabled' });
    }

    let matchedPairs = 0;
    // Drain queue one pair at a time. RPC returns empty when no pair available.
    for (let i = 0; i < 100; i++) {
      const { data, error } = await admin.rpc('match_random_exchange_pair');
      if (error) throw error;
      if (!data || data.length === 0) break;
      matchedPairs++;
    }

    const { count: remaining } = await admin
      .from('random_exchange_queue')
      .select('*', { count: 'exact', head: true })
      .eq('matched', false);

    return NextResponse.json({
      success: true,
      matchedPairs,
      remainingInQueue: remaining ?? 0,
    });
  } catch (error: any) {
    console.error('Random exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to process random exchange', details: error.message },
      { status: 500 }
    );
  }
}
