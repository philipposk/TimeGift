import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cron-triggered. Two-phase decay:
//  Phase 1 (warning): when gift first crosses grace period, notify recipient
//                     ONCE that decay is about to start, give them 24h grace.
//  Phase 2 (apply):   apply % decay per interval to gifts past grace + warned.
// Gifts with decay_enabled=false are skipped entirely (still expire by date).
// Expired gifts get a final notification to both parties.
// Auth: requires `Authorization: Bearer ${CRON_SECRET}` if CRON_SECRET is set.
async function run(request: Request) {
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
    rate_percent: 2,
    interval_days: 7,
    grace_period_days: 7,
    warning_lead_days: 1,
  };

  if (!decayConfig.enabled) {
    return NextResponse.json({ message: 'Time decay is disabled' });
  }

  const warnLead = decayConfig.warning_lead_days ?? 1;
  const gracePeriodDate = new Date();
  gracePeriodDate.setDate(gracePeriodDate.getDate() - decayConfig.grace_period_days);

  // Phase 1: warn pending gifts approaching the grace boundary that we have
  // not yet warned.
  const warnBoundary = new Date();
  warnBoundary.setDate(warnBoundary.getDate() - (decayConfig.grace_period_days - warnLead));

  const { data: toWarn } = await admin
    .from('gifts')
    .select('id, recipient_id, sender_id, message')
    .eq('status', 'pending')
    .eq('decay_enabled', true)
    .is('decay_warned_at', null)
    .lte('created_at', warnBoundary.toISOString());

  let warned = 0;
  for (const gift of toWarn || []) {
    if (gift.recipient_id) {
      await insertNotification({
        userId: gift.recipient_id,
        giftId: gift.id,
        type: 'gift_decay_warning',
        title: 'Your TimeGift is about to start decaying',
        message: `Accept "${(gift.message || '').substring(0, 60)}" soon - it loses ${decayConfig.rate_percent}% every ${decayConfig.interval_days} days starting now.`,
      });
    }
    await admin
      .from('gifts')
      .update({ decay_warned_at: new Date().toISOString() })
      .eq('id', gift.id);
    warned++;
  }

  // Phase 2: apply decay to gifts past grace period.
  const { data: gifts, error } = await admin
    .from('gifts')
    .select('id, sender_id, recipient_id, original_time_amount, created_at')
    .eq('status', 'pending')
    .eq('decay_enabled', true)
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
      for (const uid of [gift.sender_id, gift.recipient_id]) {
        if (!uid) continue;
        await insertNotification({
          userId: uid,
          giftId: gift.id,
          type: 'gift_decay_warning',
          title: 'TimeGift expired',
          message: 'A TimeGift fully decayed and is now expired.',
        });
      }
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
    warned,
    processed: processedCount,
    expired: expiredCount,
    total: gifts?.length || 0,
  });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
