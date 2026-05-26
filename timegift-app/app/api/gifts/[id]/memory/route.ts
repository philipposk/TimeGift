import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { checkContent } from '@/lib/moderation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Payload {
  story?: string | null;
  location?: string | null;
  photoUrl?: string | null;
}

// Save a memory on a completed gift. Routes through server so we can run
// obscenity check and set flagged_for_review without trusting the client.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseServiceClient();
  const { data: gift } = await admin.from('gifts').select('sender_id, recipient_id, status').eq('id', id).single();
  if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  if (gift.sender_id !== user.id && gift.recipient_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (gift.status !== 'completed') {
    return NextResponse.json({ error: 'Gift must be completed to add a memory' }, { status: 400 });
  }

  const p = (await request.json()) as Payload;
  const story = (p.story || '').trim() || null;
  const location = (p.location || '').trim() || null;
  const photoUrl = (p.photoUrl || '').trim() || null;
  if (!story && !photoUrl) {
    return NextResponse.json({ error: 'Add a photo or a sentence' }, { status: 400 });
  }

  const moderation = checkContent(story);
  const updates: any = {
    memory_story: story,
    memory_location: location,
    memory_photo_url: photoUrl,
    memory_created_at: new Date().toISOString(),
  };
  if (moderation.flagged) {
    updates.flagged_for_review = true;
    updates.flag_reason = `memory: ${moderation.reason}`;
  }

  const { error } = await admin.from('gifts').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, flagged: moderation.flagged });
}
