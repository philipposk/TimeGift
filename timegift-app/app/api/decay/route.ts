import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// to process time decay for unredeemed gifts
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get decay settings
    const { data: settings } = await supabaseAdmin
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'time_decay')
      .single();

    const decayConfig = settings?.setting_value || {
      enabled: true,
      rate_percent: 5,
      interval_days: 7,
      grace_period_days: 3
    };

    if (!decayConfig.enabled) {
      return NextResponse.json({ message: 'Time decay is disabled' });
    }

    // Get all pending gifts that are past the grace period
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - decayConfig.grace_period_days);

    const { data: gifts, error } = await supabaseAdmin
      .from('gifts')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', gracePeriodDate.toISOString());

    if (error) throw error;

    let processedCount = 0;
    let expiredCount = 0;

    for (const gift of gifts || []) {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(gift.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const daysSinceGracePeriod = daysSinceCreation - decayConfig.grace_period_days;
      const intervalsElapsed = Math.floor(daysSinceGracePeriod / decayConfig.interval_days);

      if (intervalsElapsed > 0) {
        // Calculate decayed time
        const decayFactor = Math.pow(1 - (decayConfig.rate_percent / 100), intervalsElapsed);
        const newTimeAmount = Math.max(0, Math.floor(gift.original_time_amount * decayFactor));

        if (newTimeAmount === 0) {
          // Gift has completely decayed - mark as expired
          await supabaseAdmin
            .from('gifts')
            .update({ status: 'expired', time_amount: 0 })
            .eq('id', gift.id);
          
          expiredCount++;
        } else {
          // Update with decayed time
          await supabaseAdmin
            .from('gifts')
            .update({ time_amount: newTimeAmount })
            .eq('id', gift.id);
          
          processedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      expired: expiredCount,
      total: gifts?.length || 0
    });
  } catch (error: any) {
    console.error('Time decay error:', error);
    return NextResponse.json(
      { error: 'Failed to process time decay', details: error.message },
      { status: 500 }
    );
  }
}
