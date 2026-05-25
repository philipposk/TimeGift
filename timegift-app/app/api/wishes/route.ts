import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET ?userId= — list wishes for a user (RLS handles visibility).
//   Omit userId to list your own.
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = new URL(request.url).searchParams.get('userId') || user.id;
  const { data } = await supabase
    .from('wishes')
    .select('*')
    .eq('user_id', userId)
    .eq('fulfilled', false)
    .order('created_at', { ascending: false });
  return NextResponse.json({ wishes: data || [] });
}

interface WishPayload {
  title: string;
  description?: string;
  hoursEstimate?: number;
  isPublic?: boolean;
}

// POST: create a wish.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await request.json()) as WishPayload;
  if (!p.title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const { data, error } = await supabase
    .from('wishes')
    .insert({
      user_id: user.id,
      title: p.title.trim(),
      description: p.description?.trim() || null,
      hours_estimate: p.hoursEstimate || null,
      is_public: p.isPublic ?? true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wish: data });
}

// DELETE ?id= — remove a wish.
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await supabase.from('wishes').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}

// PATCH: mark fulfilled or claim.
interface PatchPayload {
  id: string;
  action: 'fulfill' | 'claim' | 'unclaim';
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await request.json()) as PatchPayload;
  if (!p.id || !['fulfill', 'claim', 'unclaim'].includes(p.action)) {
    return NextResponse.json({ error: 'id + action required' }, { status: 400 });
  }

  const admin = getSupabaseServiceClient();
  const { data: wish } = await admin.from('wishes').select('*').eq('id', p.id).single();
  if (!wish) return NextResponse.json({ error: 'Wish not found' }, { status: 404 });

  if (p.action === 'fulfill') {
    if (wish.user_id !== user.id) {
      return NextResponse.json({ error: 'Only the wisher can mark fulfilled' }, { status: 403 });
    }
    await admin.from('wishes').update({ fulfilled: true }).eq('id', p.id);
  } else if (p.action === 'claim') {
    if (wish.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot claim your own wish' }, { status: 400 });
    }
    if (wish.claimed_by) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
    }
    await admin
      .from('wishes')
      .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
      .eq('id', p.id);
  } else if (p.action === 'unclaim') {
    if (wish.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Not the claimer' }, { status: 403 });
    }
    await admin.from('wishes').update({ claimed_by: null, claimed_at: null }).eq('id', p.id);
  }

  return NextResponse.json({ success: true });
}
