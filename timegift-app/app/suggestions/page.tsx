'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';

interface Suggestion {
  timeAmount: number;
  timeUnit: string;
  message: string;
  occasion?: string;
}

const RELATIONSHIPS = ['friend', 'family', 'partner', 'colleague', 'mentor', 'stranger'];
const OCCASIONS = ['birthday', 'apology', 'thank_you', 'holiday', 'just_because'];

export default function SuggestionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [relationship, setRelationship] = useState('friend');
  const [occasion, setOccasion] = useState<string>('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.push('/auth/signin?next=/suggestions');
      else setUser(u);
    });
  }, [router]);

  async function generate() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/ai/suggest-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationship, occasion: occasion || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || 'Failed.');
      } else {
        setItems(json.suggestions || []);
      }
    } catch (e: any) {
      setErr(e.message || 'Network error.');
    } finally {
      setBusy(false);
    }
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
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 880 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">A nudge</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
              <em style={{ color: 'var(--accent)' }}>Ideas</em>, on tap.
            </h1>
            <p className="lede muted" style={{ maxWidth: 540, marginTop: 8 }}>
              Tell us who and why. We&apos;ll throw three letters at the wall. Take what sticks.
            </p>
          </div>

          <div className="stack gap-6">
            <div className="field">
              <label className="field-label">For whom</label>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRelationship(r)}
                    className={'btn ' + (relationship === r ? '' : 'btn-ghost')}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Why (optional)</label>
              <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOccasion('')}
                  className={'btn ' + (occasion === '' ? '' : 'btn-ghost')}
                  style={{ padding: '8px 14px', fontSize: 13 }}
                >
                  any
                </button>
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={'btn ' + (occasion === o ? '' : 'btn-ghost')}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    {o.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <button className="btn btn-accent btn-lg" onClick={generate} disabled={busy}>
                <Icon name="spark" size={14} /> {busy ? 'Thinking…' : 'Give me ideas'}
              </button>
            </div>
          </div>

          {err && (
            <div
              style={{
                padding: 12,
                border: '1px solid var(--rose-soft)',
                background: 'var(--rose-soft)',
                color: '#5b2228',
                borderRadius: 6,
                marginTop: 16,
              }}
            >
              {err}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-12 stack gap-4">
              {items.map((s, i) => (
                <div key={i} className="card-letter">
                  <div className="row between mb-3">
                    <div className="serif" style={{ fontSize: 22 }}>
                      {s.timeAmount} <span className="muted" style={{ fontSize: 14 }}>{s.timeUnit}</span>
                    </div>
                    {s.occasion && <div className="meta">{s.occasion}</div>}
                  </div>
                  <p className="handwritten" style={{ fontSize: 19 }}>{s.message}</p>
                  <Link
                    href={`/create?message=${encodeURIComponent(s.message)}`}
                    className="btn btn-ghost mt-6"
                    style={{ padding: '8px 14px', fontSize: 12.5 }}
                  >
                    Start a letter from this
                  </Link>
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
