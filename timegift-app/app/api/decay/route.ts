import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cron-triggered. Applies % decay to pending gifts past their grace period;
// expires gifts whose decayed amount hits zero.
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
      .eq('setting_key', 'time_decay')
      .maybeSingle();

    const decayConfig = (settingsRow?.setting_value as any) || {
      enabled: true,
      rate_percent: 5,
      interval_days: 7,
      grace_period_days: 3,
    };

    if (!decayConfig.enabled) {
      return NextResponse.json({ message: 'Time decay is disabled' });
    }

    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - decayConfig.grace_period_days);

    const { data: gifts, error } = await admin
      .from('gifts')
      .select('id, original_time_amount, created_at')
      .eq('status', 'pending')
      .lt('created_at', gracePeriodDate.toISOString());

    if (error) throw error;

    let processedCount = 0;
    let expiredCount = 0;

    for (const gift of gifts || []) {
      const createdAt = new Date(gift.created_at);
      const daysSinceCreation = Math.floor(
        (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysSinceGracePeriod = daysSinceCreation - decayConfig.grace_period_days;
      const intervalsElapsed = Math.floor(daysSinceGracePeriod / decayConfig.interval_days);
      if (intervalsElapsed <= 0) continue;

      const decayFactor = Math.pow(1 - decayConfig.rate_percent / 100, intervalsElapsed);
      const newTimeAmount = Math.max(0, Math.floor(gift.original_time_amount * decayFactor));

      if (newTimeAmount === 0) {
        await admin
          .from('gifts')
          .update({ status: 'expired', time_amount: 0 })
          .eq('id', gift.id);
        expiredCount++;
      } else {
        await admin
          .from('gifts')
          .update({ time_amount: newTimeAmount })
          .eq('id', gift.id);
        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      expired: expiredCount,
      total: gifts?.length || 0,
    });
  } catch (error: any) {
    console.error('Time decay error:', error);
    return NextResponse.json(
      { error: 'Failed to process time decay', details: error.message },
      { status: 500 }
    );
  }
}
