import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: list current user's blocks.
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('blocks')
    .select('id, blocked_user_id, blocked_email, blocked_phone, reason, created_at')
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ blocks: data || [] });
}

interface BlockPayload {
  blockedUserId?: string;
  blockedEmail?: string;
  blockedPhone?: string;
  reason?: string;
}

// POST: add a block. Pass any one of user_id, email, phone.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as BlockPayload;
  if (!payload.blockedUserId && !payload.blockedEmail && !payload.blockedPhone) {
    return NextResponse.json(
      { error: 'blockedUserId, blockedEmail, or blockedPhone required' },
      { status: 400 }
    );
  }
  if (payload.blockedUserId === user.id) {
    return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 });
  }

  const { error } = await supabase.from('blocks').insert({
    blocker_id: user.id,
    blocked_user_id: payload.blockedUserId || null,
    blocked_email: payload.blockedEmail || null,
    blocked_phone: payload.blockedPhone || null,
    reason: payload.reason || null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE: remove a block by id.
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 });

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)
    .eq('blocker_id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
