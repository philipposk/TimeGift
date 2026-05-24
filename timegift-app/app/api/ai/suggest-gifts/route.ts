import { NextResponse, NextRequest } from 'next/server';
import { generateGiftSuggestions } from '@/lib/ai';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkAndRecordRateLimit } from '@/lib/rate-limit';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await checkAndRecordRateLimit(user.id, 'suggest-gifts', 30, 3600);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { relationship, occasion } = body;

    if (!relationship) {
      return NextResponse.json({ error: 'Relationship is required' }, { status: 400 });
    }

    // Pull recent context for personalization.
    const admin = getSupabaseServiceClient();
    const { data: recent } = await admin
      .from('gifts')
      .select('recipient_email, recipient_phone, purpose_details')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const suggestions = await generateGiftSuggestions(relationship, occasion || null, {
      recentRecipients: (recent || [])
        .map((g) => (g.recipient_email || g.recipient_phone || '').split('@')[0])
        .filter(Boolean),
      recentPurposes: (recent || [])
        .map((g) => g.purpose_details)
        .filter((s): s is string => !!s),
      occasion: occasion || null,
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    );
  }
}
