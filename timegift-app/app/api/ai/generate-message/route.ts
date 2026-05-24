import { NextResponse, NextRequest } from 'next/server';
import { generateGiftMessage } from '@/lib/ai';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkAndRecordRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await checkAndRecordRateLimit(user.id, 'generate-message', 20, 3600);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { occasion, recipientName, relationship, timeAmount, timeUnit } = body;

    if (!occasion || !recipientName || !relationship || !timeAmount || !timeUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await generateGiftMessage(
      occasion,
      recipientName,
      relationship,
      timeAmount,
      timeUnit
    );

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      { error: 'Failed to generate message', details: error.message },
      { status: 500 }
    );
  }
}
