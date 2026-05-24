import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { notifyGiftCreated } from '@/utils/notifications';
import { canReceiveGift, isBlocked } from '@/lib/access';
import { checkAndRecordRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CreateGiftPayload {
  recipientType: 'email' | 'phone';
  recipientEmail?: string;
  recipientPhone?: string;
  message: string;
  timeAmount: number;
  timeUnit: 'minutes' | 'hours' | 'days';
  purposeType: 'anything' | 'specific';
  purposeDetails?: string | null;
  availabilityData?: any;
  expiryDate?: string | null;
  isRandomExchange?: boolean;
  decayEnabled?: boolean;
}

function minutesFromAmount(amount: number, unit: 'minutes' | 'hours' | 'days') {
  if (unit === 'hours') return amount * 60;
  if (unit === 'days') return amount * 60 * 24;
  return amount;
}

// Per-sender hourly + daily cap to prevent spam.
const HOURLY_LIMIT = 5;
const DAILY_LIMIT = 20;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hourlyOk = await checkAndRecordRateLimit(user.id, 'gift-create-hour', HOURLY_LIMIT, 3600);
    if (!hourlyOk) {
      return NextResponse.json(
        { error: `Rate limit: max ${HOURLY_LIMIT} gifts per hour` },
        { status: 429 }
      );
    }
    const dailyOk = await checkAndRecordRateLimit(user.id, 'gift-create-day', DAILY_LIMIT, 86400);
    if (!dailyOk) {
      return NextResponse.json(
        { error: `Rate limit: max ${DAILY_LIMIT} gifts per day` },
        { status: 429 }
      );
    }

    const payload = (await request.json()) as CreateGiftPayload;
    if (!payload.message || !payload.timeAmount || !payload.timeUnit) {
      return NextResponse.json({ error: 'Missing required gift fields' }, { status: 400 });
    }
    if (payload.recipientType === 'email' && !payload.recipientEmail) {
      return NextResponse.json({ error: 'recipientEmail required' }, { status: 400 });
    }
    if (payload.recipientType === 'phone' && !payload.recipientPhone) {
      return NextResponse.json({ error: 'recipientPhone required' }, { status: 400 });
    }

    const admin = getSupabaseServiceClient();

    // Resolve recipient to user if registered.
    let recipientId: string | null = null;
    if (payload.recipientType === 'email' && payload.recipientEmail) {
      const { data } = await admin
        .from('users')
        .select('id')
        .eq('email', payload.recipientEmail)
        .maybeSingle();
      recipientId = data?.id ?? null;
    } else if (payload.recipientType === 'phone' && payload.recipientPhone) {
      const { data } = await admin
        .from('users')
        .select('id')
        .eq('phone', payload.recipientPhone)
        .maybeSingle();
      recipientId = data?.id ?? null;
    }

    // Privacy + friends + stranger check.
    const access = await canReceiveGift({ senderId: user.id, recipientId });
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || 'Not allowed' }, { status: 403 });
    }

    // Block check.
    if (
      await isBlocked({
        senderId: user.id,
        recipientId,
        recipientEmail: payload.recipientEmail,
        recipientPhone: payload.recipientPhone,
      })
    ) {
      // Don't reveal block - return generic refusal.
      return NextResponse.json({ error: 'Recipient is not accepting gifts' }, { status: 403 });
    }

    const timeInMinutes = minutesFromAmount(payload.timeAmount, payload.timeUnit);

    const { data: senderProfile } = await supabase
      .from('users')
      .select('display_name, username, email')
      .eq('id', user.id)
      .single();

    const { data: insertedGift, error: insertError } = await supabase
      .from('gifts')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        recipient_email: payload.recipientEmail || null,
        recipient_phone: payload.recipientPhone || null,
        message: payload.message,
        time_amount: timeInMinutes,
        original_time_amount: timeInMinutes,
        time_unit: payload.timeUnit,
        purpose_type: payload.purposeType,
        purpose_details: payload.purposeDetails || null,
        availability_data: payload.availabilityData || null,
        expiry_date: payload.expiryDate ? new Date(payload.expiryDate).toISOString() : null,
        status: 'pending',
        is_random_exchange: payload.isRandomExchange ?? false,
        decay_enabled: payload.decayEnabled ?? true,
      })
      .select()
      .single();

    if (insertError || !insertedGift) {
      throw insertError || new Error('Insert failed');
    }

    // Issue a claim token for non-user recipients (30-day expiry).
    let claimToken: string | null = null;
    if (!recipientId && (payload.recipientEmail || payload.recipientPhone)) {
      claimToken = crypto.randomBytes(24).toString('base64url');
      await admin.from('claim_tokens').insert({
        token: claimToken,
        gift_id: insertedGift.id,
        recipient_email: payload.recipientEmail || null,
        recipient_phone: payload.recipientPhone || null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const claimUrl = claimToken
      ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${claimToken}`
      : null;

    await notifyGiftCreated({
      giftId: insertedGift.id,
      recipientId,
      recipientEmail: insertedGift.recipient_email,
      recipientPhone: insertedGift.recipient_phone,
      senderId: user.id,
      senderName:
        senderProfile?.display_name ||
        senderProfile?.username ||
        senderProfile?.email ||
        'A friend',
      message: payload.message,
      claimUrl,
    });

    return NextResponse.json({ success: true, gift: insertedGift, claimUrl });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Failed to create gift', details: error.message },
      { status: 500 }
    );
  }
}
