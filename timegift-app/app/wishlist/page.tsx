'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';

interface Wish {
  id: string;
  title: string;
  description: string | null;
  hours_estimate: number | null;
  is_public: boolean;
  fulfilled: boolean;
  created_at: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [desc, setDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch('/api/wishes');
    if (r.ok) {
      const j = await r.json();
      setWishes(j.wishes || []);
    }
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push('/auth/signin?next=/wishlist');
        return;
      }
      setUser(u);
      load();
    });
  }, [router]);

  async function add() {
    if (!title.trim()) return;
    setBusy(true);
    await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: desc || undefined,
        hoursEstimate: typeof hours === 'number' ? hours : undefined,
        isPublic,
      }),
    });
    setTitle('');
    setHours('');
    setDesc('');
    setBusy(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/wishes?id=${id}`, { method: 'DELETE' });
    load();
  }

  if (!user) {
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
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 720 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">If anyone asks</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
              <em style={{ color: 'var(--accent)' }}>Your</em> wishlist.
            </h1>
            <p className="lede muted" style={{ marginTop: 8 }}>
              Times you&apos;d actually love someone to spend with you. Friends see this when they go to write you a letter.
            </p>
          </div>

          <div className="card mb-8">
            <div className="stack gap-4">
              <div className="field">
                <label className="field-label">Wish</label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A long walk and a coffee"
                />
              </div>
              <div className="row gap-4">
                <div className="field" style={{ flex: 1 }}>
                  <label className="field-label">Hours (optional)</label>
                  <input
                    type="number"
                    className="input-boxed"
                    style={{ width: 100, fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'center' }}
                    value={hours}
                    onChange={(e) => setHours(e.target.value ? parseInt(e.target.value) : '')}
                  />
                </div>
                <div className="field" style={{ flex: 2 }}>
                  <label className="field-label">A line (optional)</label>
                  <input
                    className="input"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Doesn't have to be deep."
                  />
                </div>
              </div>
              <label className="row gap-2 meta" style={{ alignItems: 'center' }}>
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Friends can see this
              </label>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-accent" onClick={add} disabled={busy || !title.trim()}>
                  <Icon name="plus" size={14} /> Add wish
                </button>
              </div>
            </div>
          </div>

          {wishes.length === 0 ? (
            <div className="card center" style={{ padding: '40px 24px' }}>
              <div className="serif italic muted" style={{ fontSize: 18 }}>Nothing on your wishlist yet.</div>
            </div>
          ) : (
            <div className="stack gap-3">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="row between"
                  style={{ padding: 16, border: '1px solid var(--hairline)', borderRadius: 6, alignItems: 'flex-start' }}
                >
                  <div>
                    <div className="serif" style={{ fontSize: 18 }}>{w.title}</div>
                    {w.description && <div className="meta mt-1">{w.description}</div>}
                    <div className="meta mt-2">
                      {w.hours_estimate ? `${w.hours_estimate} hours · ` : ''}
                      {w.is_public ? 'visible to friends' : 'private'}
                    </div>
                  </div>
                  <button className="btn-quiet" onClick={() => remove(w.id)} title="Remove">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
