'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';
import { Avatar } from '@/components/tg/avatar';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  hours_estimate: number | null;
  owner: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}

const CATEGORIES = ['Skills', 'Help', 'Listen', 'Make', 'Errands', 'Coach', 'Cook'];

export default function BrowsePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<string>('');
  const [hrs, setHrs] = useState<number | ''>('');

  async function load() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    const r = await fetch('/api/offers?' + params.toString());
    if (r.ok) {
      const j = await r.json();
      setOffers(j.offers || []);
    }
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push('/auth/signin?next=/browse');
        return;
      }
      setUser(u);
      load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  async function add() {
    if (!title.trim()) return;
    await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: desc || undefined,
        category: cat || undefined,
        hoursEstimate: typeof hrs === 'number' ? hrs : undefined,
      }),
    });
    setTitle('');
    setDesc('');
    setCat('');
    setHrs('');
    setShowCreate(false);
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
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 32 }}>
            <div className="stack gap-2">
              <div className="eyebrow">What people are offering</div>
              <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
                <em style={{ color: 'var(--accent)' }}>Hours</em> on the table.
              </h1>
            </div>
            <button className="btn" onClick={() => setShowCreate((v) => !v)}>
              <Icon name="plus" size={14} /> Offer something
            </button>
          </div>

          {showCreate && (
            <div className="card mb-8">
              <div className="stack gap-4">
                <div className="field">
                  <label className="field-label">What you offer</label>
                  <input
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Listen for an hour"
                  />
                </div>
                <div className="row gap-4">
                  <div className="field" style={{ flex: 2 }}>
                    <label className="field-label">Description (optional)</label>
                    <input
                      className="input"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="No advice unless asked."
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label className="field-label">Hours</label>
                    <input
                      type="number"
                      className="input-boxed"
                      style={{ width: 80, fontFamily: 'var(--serif)', fontSize: 18, textAlign: 'center' }}
                      value={hrs}
                      onChange={(e) => setHrs(e.target.value ? parseInt(e.target.value) : '')}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Category (optional)</label>
                  <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCat(cat === c ? '' : c)}
                        className={'btn ' + (cat === c ? '' : 'btn-ghost')}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-accent" onClick={add} disabled={!title.trim()}>
                    Post offer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="row gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
            <div className="row gap-2" style={{ borderBottom: '1px solid var(--hairline)', flex: 1, minWidth: 240 }}>
              <Icon name="search" size={16} />
              <input
                className="input"
                style={{ border: 'none' }}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find an offer"
              />
            </div>
            <button
              onClick={() => setCategory(null)}
              className={'btn ' + (category === null ? '' : 'btn-ghost')}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              all
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={'btn ' + (category === c ? '' : 'btn-ghost')}
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                {c}
              </button>
            ))}
          </div>

          {offers.length === 0 ? (
            <div className="card center" style={{ padding: '40px 24px' }}>
              <div className="serif italic muted" style={{ fontSize: 18 }}>No offers yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {offers.map((o) => (
                <div key={o.id} className="card">
                  <div className="row gap-3 mb-2">
                    <Avatar
                      name={o.owner.display_name || o.owner.username}
                      url={o.owner.avatar_url}
                      size="sm"
                    />
                    <div>
                      <div className="serif" style={{ fontSize: 14 }}>{o.owner.display_name || o.owner.username}</div>
                      <div className="meta" style={{ fontSize: 11 }}>@{o.owner.username}</div>
                    </div>
                    {o.category && (
                      <span className="tag" style={{ marginLeft: 'auto' }}>
                        {o.category}
                      </span>
                    )}
                  </div>
                  <div className="serif" style={{ fontSize: 20 }}>{o.title}</div>
                  {o.description && <p className="muted mt-2" style={{ fontSize: 14 }}>{o.description}</p>}
                  {o.hours_estimate && (
                    <div className="meta mt-3">
                      <span className="serif italic" style={{ color: 'var(--accent)' }}>
                        ~{o.hours_estimate} hours
                      </span>
                    </div>
                  )}
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
