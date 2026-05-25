import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET ?q= ?category= — public-ish browse of active offers.
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  const category = url.searchParams.get('category')?.trim();
  const mine = url.searchParams.get('mine') === '1';

  let query = supabase
    .from('offers')
    .select('*, owner:users!offers_user_id_fkey(id, username, display_name, avatar_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(60);

  if (mine) query = query.eq('user_id', user.id);
  if (category) query = query.eq('category', category);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data } = await query;
  return NextResponse.json({ offers: data || [] });
}

interface OfferPayload {
  title: string;
  description?: string;
  category?: string;
  hoursEstimate?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await request.json()) as OfferPayload;
  if (!p.title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const { data, error } = await supabase
    .from('offers')
    .insert({
      user_id: user.id,
      title: p.title.trim(),
      description: p.description?.trim() || null,
      category: p.category?.trim() || null,
      hours_estimate: p.hoursEstimate || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ offer: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await supabase.from('offers').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
