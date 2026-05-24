import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ reminders: [] });
    }

    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: scheduledGifts } = await supabase
      .from('gifts')
      .select('id, recipient_email, message')
      .eq('status', 'scheduled')
      .eq('recipient_id', user.id)
      .gte('scheduled_datetime', now)
      .lte('scheduled_datetime', tomorrow);

    const { data: pendingGifts } = await supabase
      .from('gifts')
      .select('id, message')
      .eq('status', 'pending')
      .eq('recipient_id', user.id)
      .limit(3);

    const reminders = [
      ...(scheduledGifts || []).map((gift) => ({
        type: 'scheduled',
        title: 'Upcoming Scheduled Time',
        message: `You have scheduled time with ${gift.recipient_email || 'someone'} tomorrow!`,
        giftId: gift.id,
        priority: 'high',
      })),
      ...(pendingGifts || []).map((gift) => ({
        type: 'pending',
        title: 'Pending Gift to Accept',
        message: `You have a pending gift: "${(gift.message || '').substring(0, 50)}..."`,
        giftId: gift.id,
        priority: 'medium',
      })),
    ];

    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error('Error getting reminders:', error);
    return NextResponse.json(
      { error: 'Failed to get reminders', details: error.message },
      { status: 500 }
    );
  }
}
