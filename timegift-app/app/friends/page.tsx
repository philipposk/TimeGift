'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';
import { Avatar } from '@/components/tg/avatar';
import { parseVcf, type VCard } from '@/lib/vcf';
import Link from 'next/link';

interface UserMin {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  cadence_days?: number | null;
  last_gift_at?: string | null;
  friend?: UserMin | null;
  user?: UserMin | null;
}

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserMin[]>([]);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [imported, setImported] = useState<VCard[] | null>(null);
  const [matched, setMatched] = useState<Record<string, UserMin>>({});

  async function load() {
    const res = await fetch('/api/friends');
    if (res.ok) {
      const j = await res.json();
      setFriendships(j.friendships || []);
    }
  }

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push('/auth/signin?next=/friends');
        return;
      }
      setUser(u);
      load();
    });
  }, [router]);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const r = await fetch('/api/friends/search?q=' + encodeURIComponent(q.trim()));
    setSearching(false);
    if (r.ok) {
      const j = await r.json();
      setResults(j.results || []);
    }
  }

  async function sendRequest(target: UserMin) {
    setErr(null);
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendUserId: target.id }),
    });
    if (!res.ok) {
      const j = await res.json();
      setErr(j.error || 'Request failed.');
      return;
    }
    setResults((prev) => prev.filter((u) => u.id !== target.id));
    await load();
  }

  async function onVcf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const cards = parseVcf(text).slice(0, 200);
    setImported(cards);
    const emails = cards.map((c) => c.email).filter((x): x is string => !!x);
    const phones = cards.map((c) => c.phone).filter((x): x is string => !!x);
    const r = await fetch('/api/contacts/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, phones }),
    });
    if (r.ok) {
      const j = await r.json();
      const map: Record<string, UserMin> = {};
      for (const u of j.matched || []) {
        if (u.email) map['email:' + u.email] = u;
        if (u.phone) map['phone:' + u.phone] = u;
      }
      setMatched(map);
    }
  }

  async function respond(f: Friendship, action: 'accept' | 'reject' | 'block') {
    const res = await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendshipId: f.id, action }),
    });
    if (res.ok) await load();
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

  const incoming = friendships.filter((f) => f.status === 'pending' && f.friend_id === user.id);
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.user_id === user.id);
  const accepted = friendships.filter((f) => f.status === 'accepted');

  function counterpart(f: Friendship): UserMin | null {
    return f.user_id === user.id ? f.friend || null : f.user || null;
  }

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 880 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">Connections</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>Friends</h1>
            <p className="muted">Friends bypass your privacy settings and show up in your gift composer.</p>
          </div>

          {/* .vcf import */}
          <div className="card mb-8">
            <div className="row between mb-2">
              <div>
                <div className="serif" style={{ fontSize: 18 }}>Import your contacts</div>
                <div className="meta">Drop a .vcf file. We&apos;ll match anyone who&apos;s already on Timegift.</div>
              </div>
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                <Icon name="plus" size={14} /> Choose .vcf
                <input type="file" accept=".vcf,text/vcard" onChange={onVcf} style={{ display: 'none' }} />
              </label>
            </div>
            {imported && (
              <div className="stack gap-2 mt-4">
                {imported.length === 0 && <div className="meta">No contacts parsed.</div>}
                {imported.slice(0, 30).map((c, i) => {
                  const u = (c.email && matched['email:' + c.email]) || (c.phone && matched['phone:' + c.phone]) || null;
                  return (
                    <div
                      key={i}
                      className="row between"
                      style={{ padding: 10, border: '1px solid var(--hairline-soft)', borderRadius: 6 }}
                    >
                      <div className="row gap-3">
                        <Avatar name={u?.display_name || c.fullName} url={u?.avatar_url} size="sm" />
                        <div>
                          <div className="serif" style={{ fontSize: 15 }}>{c.fullName}</div>
                          <div className="meta" style={{ fontSize: 11 }}>{c.email || c.phone}</div>
                        </div>
                      </div>
                      {u ? (
                        <button
                          className="btn"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => sendRequest(u as UserMin)}
                        >
                          <Icon name="plus" size={12} /> Add friend
                        </button>
                      ) : (
                        <Link
                          href={`/create?email=${encodeURIComponent(c.email || '')}`}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                        >
                          Send gift
                        </Link>
                      )}
                    </div>
                  );
                })}
                {imported.length > 30 && (
                  <div className="meta">+{imported.length - 30} more not shown.</div>
                )}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="field mb-8">
            <label className="field-label">Find people by username or name</label>
            <div className="row gap-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <Icon name="search" size={16} />
              <input
                className="input"
                style={{ border: 'none' }}
                value={query}
                onChange={(e) => search(e.target.value)}
                placeholder="leo or @leo"
              />
            </div>
            {searching && <div className="meta mt-2">Searching…</div>}
            {results.length > 0 && (
              <div className="stack gap-2 mt-4">
                {results.map((u) => (
                  <div
                    key={u.id}
                    className="row between"
                    style={{ padding: 12, border: '1px solid var(--hairline)', borderRadius: 6 }}
                  >
                    <div className="row gap-3">
                      <Avatar name={u.display_name || u.username} url={u.avatar_url} />
                      <div>
                        <div className="serif" style={{ fontSize: 16 }}>{u.display_name || u.username}</div>
                        <div className="meta">@{u.username}</div>
                      </div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => sendRequest(u)}>
                      <Icon name="plus" size={14} /> Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {err && (
            <div
              style={{
                padding: 12,
                border: '1px solid var(--rose-soft)',
                background: 'var(--rose-soft)',
                color: '#5b2228',
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              {err}
            </div>
          )}

          {/* Incoming */}
          {incoming.length > 0 && (
            <Section title="Incoming requests" count={incoming.length}>
              {incoming.map((f) => {
                const u = counterpart(f);
                return (
                  <Row key={f.id} user={u}>
                    <button className="btn-quiet" onClick={() => respond(f, 'reject')}>Reject</button>
                    <button className="btn btn-accent" onClick={() => respond(f, 'accept')}>
                      <Icon name="check" size={14} /> Accept
                    </button>
                  </Row>
                );
              })}
            </Section>
          )}

          {outgoing.length > 0 && (
            <Section title="Sent requests" count={outgoing.length}>
              {outgoing.map((f) => {
                const u = counterpart(f);
                return (
                  <Row key={f.id} user={u}>
                    <span className="meta">Awaiting reply</span>
                    <button className="btn-quiet" onClick={() => respond(f, 'reject')}>Cancel</button>
                  </Row>
                );
              })}
            </Section>
          )}

          <Section title="Your friends" count={accepted.length}>
            {accepted.length === 0 ? (
              <div className="card center" style={{ padding: '40px 24px' }}>
                <div className="serif italic muted" style={{ fontSize: 18 }}>No friends yet.</div>
                <div className="meta mt-2">Search above to send your first request.</div>
              </div>
            ) : (
              accepted.map((f) => {
                const u = counterpart(f);
                const isRequester = f.user_id === user.id;
                return (
                  <Row key={f.id} user={u}>
                    {isRequester ? (
                      <CadencePicker
                        current={f.cadence_days ?? null}
                        onChange={async (v) => {
                          await fetch('/api/friends', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ friendshipId: f.id, action: 'set-cadence', cadenceDays: v }),
                          });
                          load();
                        }}
                      />
                    ) : (
                      <span className="meta">Friend</span>
                    )}
                    <button className="btn-quiet" onClick={() => respond(f, 'block')}>Block</button>
                  </Row>
                );
              })
            )}
          </Section>
        </div>
        <Footer />
      </main>
    </>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="stack gap-3 mt-8">
      <div className="eyebrow">{title} · {count}</div>
      <div className="stack gap-2">{children}</div>
    </div>
  );
}

function CadencePicker({ current, onChange }: { current: number | null; onChange: (v: number | null) => void }) {
  const opts: { label: string; v: number | null }[] = [
    { label: 'no nudge', v: null },
    { label: '30d', v: 30 },
    { label: '60d', v: 60 },
    { label: '90d', v: 90 },
    { label: '6mo', v: 180 },
    { label: '1y', v: 365 },
  ];
  return (
    <div className="toggle-group" style={{ fontSize: 11 }}>
      {opts.map((o) => (
        <button
          key={String(o.v)}
          className={'toggle-opt ' + (current === o.v ? 'active' : '')}
          style={{ padding: '6px 8px', fontSize: 11 }}
          onClick={() => onChange(o.v)}
          title={o.v ? `Remind every ${o.v} days` : 'No cadence reminder'}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ user, children }: { user: UserMin | null; children: React.ReactNode }) {
  return (
    <div
      className="row between"
      style={{ padding: 12, border: '1px solid var(--hairline)', borderRadius: 6 }}
    >
      <div className="row gap-3">
        <Avatar name={user?.display_name || user?.username || '?'} url={user?.avatar_url} />
        <div>
          <div className="serif" style={{ fontSize: 16 }}>{user?.display_name || user?.username || 'Unknown'}</div>
          <div className="meta">@{user?.username}</div>
        </div>
      </div>
      <div className="row gap-2">{children}</div>
    </div>
  );
}
