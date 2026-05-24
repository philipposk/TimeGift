import { NextResponse, NextRequest } from 'next/server';
import { generateGiftSuggestions } from '@/lib/ai';
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

    const allowed = await checkAndRecordRateLimit(user.id, 'suggest-gifts', 30, 3600);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { relationship, occasion } = body;

    if (!relationship) {
      return NextResponse.json({ error: 'Relationship is required' }, { status: 400 });
    }

    const suggestions = await generateGiftSuggestions(relationship, occasion || null);
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    );
  }
}
