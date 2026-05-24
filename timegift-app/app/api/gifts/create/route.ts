import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { notifyGiftCreated } from '@/utils/notifications';

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
}

function minutesFromAmount(amount: number, unit: 'minutes' | 'hours' | 'days') {
  if (unit === 'hours') return amount * 60;
  if (unit === 'days') return amount * 60 * 24;
  return amount;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as CreateGiftPayload;

    if (!payload.message || !payload.timeAmount || !payload.timeUnit) {
      return NextResponse.json({ error: 'Missing required gift fields' }, { status: 400 });
    }

    const userId = user.id;
    const timeInMinutes = minutesFromAmount(payload.timeAmount, payload.timeUnit);

    // Resolve recipient by email/phone (uses service client - need to look up any
    // user, RLS would hide non-friends).
    const admin = getSupabaseServiceClient();
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

    const { data: senderProfile } = await supabase
      .from('users')
      .select('display_name, username, email')
      .eq('id', userId)
      .single();

    const { data: insertedGift, error: insertError } = await supabase
      .from('gifts')
      .insert({
        sender_id: userId,
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
      })
      .select()
      .single();

    if (insertError || !insertedGift) {
      throw insertError || new Error('Insert failed');
    }

    await notifyGiftCreated({
      giftId: insertedGift.id,
      recipientId,
      recipientEmail: insertedGift.recipient_email,
      recipientPhone: insertedGift.recipient_phone,
      senderId: userId,
      senderName:
        senderProfile?.display_name ||
        senderProfile?.username ||
        senderProfile?.email ||
        'A friend',
      message: payload.message,
    });

    return NextResponse.json({ success: true, gift: insertedGift });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Failed to create gift', details: error.message },
      { status: 500 }
    );
  }
}
