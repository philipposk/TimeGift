'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';
import { Polaroid } from '@/components/tg/polaroid';

interface Memory {
  id: string;
  message: string;
  memory_photo_url?: string | null;
  memory_story?: string | null;
  memory_location?: string | null;
  completed_at: string;
  sender_id: string;
  recipient_id: string;
  purpose_type: string;
  purpose_details?: string | null;
}

interface UserMin {
  id: string;
  display_name: string | null;
  username: string | null;
}

export default function MemoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [users, setUsers] = useState<Record<string, UserMin>>({});
  const [completableGifts, setCompletableGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await getCurrentUser();
      if (!me) {
        router.push('/auth/signin?next=/memories');
        return;
      }
      setUser(me);
      const supabase = getSupabaseBrowserClient();

      const { data: mems } = await supabase
        .from('gifts')
        .select('id, message, memory_photo_url, memory_story, memory_location, completed_at, sender_id, recipient_id, purpose_type, purpose_details')
        .or(`sender_id.eq.${me.id},recipient_id.eq.${me.id}`)
        .eq('status', 'completed')
        .or('memory_photo_url.not.is.null,memory_story.not.is.null')
        .order('completed_at', { ascending: false });

      setMemories(mems || []);

      const { data: completable } = await supabase
        .from('gifts')
        .select('id, message, sender_id, recipient_id, purpose_details, purpose_type')
        .or(`sender_id.eq.${me.id},recipient_id.eq.${me.id}`)
        .eq('status', 'completed')
        .is('memory_story', null)
        .is('memory_photo_url', null)
        .order('completed_at', { ascending: false })
        .limit(6);

      setCompletableGifts(completable || []);

      const ids = new Set<string>();
      for (const m of mems || []) {
        if (m.sender_id !== me.id) ids.add(m.sender_id);
        if (m.recipient_id !== me.id) ids.add(m.recipient_id);
      }
      for (const g of completable || []) {
        if (g.sender_id !== me.id) ids.add(g.sender_id);
        if (g.recipient_id !== me.id) ids.add(g.recipient_id);
      }
      if (ids.size > 0) {
        const { data: us } = await supabase
          .from('users')
          .select('id, display_name, username')
          .in('id', Array.from(ids));
        const map: Record<string, UserMin> = {};
        for (const u of us || []) map[u.id] = u;
        setUsers(map);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading || !user) {
    return (
      <>
        <TopNav />
        <main>
          <div className="container" style={{ paddingTop: 80 }}>
            <div className="serif italic muted center" style={{ fontSize: 22 }}>Loading…</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 48 }}>
            <div className="stack gap-2">
              <div className="eyebrow">Kept · {memories.length} memories</div>
              <h1 style={{ fontSize: 56, letterSpacing: '-0.025em', lineHeight: 1 }}>
                <em style={{ color: 'var(--accent)' }}>Days</em> we spent.
              </h1>
              <p className="lede muted" style={{ maxWidth: 540, marginTop: 8 }}>
                A photograph and a sentence from each gift you&apos;ve redeemed. Not a feed. A small private
                shelf.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {memories.map((m, i) => {
              const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
              const other = users[otherId];
              const otherName = other?.display_name || other?.username || 'Together';
              const when = new Date(m.completed_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const purpose = m.purpose_type === 'specific' && m.purpose_details ? m.purpose_details : 'Anything';
              return (
                <Polaroid
                  key={m.id}
                  imageUrl={m.memory_photo_url || null}
                  caption={m.memory_story || undefined}
                  meta={`with ${otherName} · ${when}`}
                  placeholder={purpose}
                  rotate={i % 2 === 0 ? -0.6 : 0.7}
                />
              );
            })}

            {completableGifts.length > 0 && (
              <Link
                href={`/gifts/${completableGifts[0].id}`}
                className="polaroid"
                style={{
                  cursor: 'pointer',
                  border: '1px dashed var(--hairline)',
                  background: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 280,
                }}
              >
                <Icon name="plus" size={24} className="muted" />
                <div className="serif italic muted" style={{ marginTop: 12 }}>Add a memory</div>
                <div className="meta center" style={{ maxWidth: 220, marginTop: 6 }}>
                  {completableGifts.length} completed {completableGifts.length === 1 ? 'gift' : 'gifts'} waiting
                </div>
              </Link>
            )}

            {memories.length === 0 && completableGifts.length === 0 && (
              <div
                className="card center"
                style={{ gridColumn: '1 / -1', padding: '64px 32px' }}
              >
                <div className="serif italic muted" style={{ fontSize: 22, marginBottom: 8 }}>
                  No memories yet.
                </div>
                <div className="meta">Complete a time gift and add a photo or story.</div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
