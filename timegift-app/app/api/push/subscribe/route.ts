import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Payload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await request.json()) as Payload;
  if (!p?.endpoint || !p?.keys?.p256dh || !p?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  // Upsert by endpoint so re-subscribing the same browser updates user_id.
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: p.endpoint,
        p256dh: p.keys.p256dh,
        auth: p.keys.auth,
        user_agent: p.userAgent || null,
      },
      { onConflict: 'endpoint' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const endpoint = new URL(request.url).searchParams.get('endpoint');
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
