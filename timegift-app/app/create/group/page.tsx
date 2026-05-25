'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Icon } from '@/components/tg/icon';

export default function GroupGiftCreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recipientType, setRecipientType] = useState<'email' | 'phone'>('email');
  const [recipientContact, setRecipientContact] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [hours, setHours] = useState(2);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ joinUrl: string; giftId: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.push('/auth/signin?next=/create/group');
      else setUser(u);
    });
  }, [router]);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/gifts/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          recipientEmail: recipientType === 'email' ? recipientContact : undefined,
          recipientPhone: recipientType === 'phone' ? recipientContact : undefined,
          recipientName,
          purposeType: 'anything',
          hoursMinutes: hours * 60,
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed.');
        return;
      }
      setResult({ joinUrl: json.joinUrl, giftId: json.gift.id });
    } catch (e: any) {
      setError(e.message || 'Network error.');
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

  if (result) {
    return (
      <>
        <TopNav />
        <main>
          <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 640 }}>
            <div className="envelope center">
              <div className="seal" style={{ margin: '0 auto 24px', width: 72, height: 72 }}>
                <Icon name="users" size={28} />
              </div>
              <h2 className="serif" style={{ fontSize: 32 }}>Share this with the others.</h2>
              <p className="lede muted mt-4">Anyone with this link can drop in their hours and a line. We&apos;ll send the letter signed by everyone.</p>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  background: 'var(--paper)',
                  padding: 12,
                  borderRadius: 4,
                  border: '1px solid var(--hairline)',
                  wordBreak: 'break-all',
                  marginTop: 24,
                }}
              >
                {result.joinUrl}
              </div>
              <div className="row gap-2 mt-4" style={{ justifyContent: 'center' }}>
                <button className="btn" onClick={() => navigator.clipboard?.writeText(result.joinUrl)}>
                  Copy link
                </button>
                <a className="btn btn-ghost" href={`/gifts/${result.giftId}`}>See gift</a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 640 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">A group letter</div>
            <h1 style={{ fontSize: 40, letterSpacing: '-0.02em' }}>
              <em style={{ color: 'var(--accent)' }}>Together</em>, give someone a Sunday.
            </h1>
            <p className="muted">You start it. Others add their hours and a sentence. The recipient gets one letter signed by everyone.</p>
          </div>

          <div className="stack gap-6">
            <div className="field">
              <label className="field-label">Who is it for?</label>
              <input className="input" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Mom" />
            </div>
            <div className="field">
              <label className="field-label">Send by</label>
              <div className="toggle-group" style={{ alignSelf: 'flex-start' }}>
                <button className={'toggle-opt ' + (recipientType === 'email' ? 'active' : '')} onClick={() => setRecipientType('email')}>
                  <Icon name="mail" size={13} /> Email
                </button>
                <button className={'toggle-opt ' + (recipientType === 'phone' ? 'active' : '')} onClick={() => setRecipientType('phone')}>
                  <Icon name="phone" size={13} /> Text
                </button>
              </div>
            </div>
            <div className="field">
              <label className="field-label">{recipientType === 'email' ? 'Their email' : 'Their phone'}</label>
              <input
                className="input"
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Your share (hours)</label>
              <input
                type="number"
                className="input-boxed"
                style={{ width: 100, fontFamily: 'var(--serif)', fontSize: 22, textAlign: 'center' }}
                value={hours}
                onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="field">
              <label className="field-label">Your sentence</label>
              <textarea
                className="textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="My share of the day. Whatever you want."
              />
            </div>

            {error && (
              <div style={{ padding: 12, border: '1px solid var(--rose-soft)', background: 'var(--rose-soft)', color: '#5b2228', borderRadius: 6 }}>
                {error}
              </div>
            )}

            <div className="row between mt-4" style={{ paddingTop: 16, borderTop: '1px solid var(--hairline-soft)' }}>
              <a className="btn btn-ghost" href="/create">
                <Icon name="arrow-left" size={14} /> Solo letter instead
              </a>
              <button className="btn btn-accent" onClick={submit} disabled={busy || !recipientContact || !message}>
                {busy ? 'Starting…' : 'Start the group letter'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
