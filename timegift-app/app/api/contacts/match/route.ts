import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Payload {
  emails?: string[];
  phones?: string[];
}

// POST: given an arbitrary list of emails/phones (e.g. parsed from a .vcf),
// return which ones are registered Timegift users. Service-role lookup so the
// match works regardless of privacy_level (only the existence is returned,
// not the profile to non-friends).
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await request.json()) as Payload;
  const emails = (p.emails || []).filter(Boolean).slice(0, 200);
  const phones = (p.phones || []).filter(Boolean).slice(0, 200);
  if (!emails.length && !phones.length) {
    return NextResponse.json({ matched: [] });
  }

  const admin = getSupabaseServiceClient();
  const matches: { id: string; username: string; display_name: string | null; avatar_url: string | null; email?: string; phone?: string }[] = [];

  if (emails.length) {
    const { data } = await admin
      .from('users')
      .select('id, username, display_name, avatar_url, email')
      .in('email', emails);
    for (const u of data || []) {
      if (u.id === user.id) continue;
      matches.push({ ...u });
    }
  }
  if (phones.length) {
    const { data } = await admin
      .from('users')
      .select('id, username, display_name, avatar_url, phone')
      .in('phone', phones);
    for (const u of data || []) {
      if (u.id === user.id) continue;
      if (matches.find((m) => m.id === u.id)) continue;
      matches.push({ ...u });
    }
  }

  return NextResponse.json({ matched: matches });
}
