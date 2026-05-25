'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { Icon } from '@/components/tg/icon';
import { Brand } from '@/components/tg/brand';
import { formatDuration } from '@/lib/time-format';

interface GroupData {
  gift: {
    id: string;
    message: string;
    time_amount: number;
    purpose_type: string;
    purpose_details?: string | null;
    status: string;
    recipient_email?: string | null;
    recipient_phone?: string | null;
  };
  organizerName: string;
  contributorCount: number;
  totalMinutes: number;
}

export default function GroupJoinPage() {
  const params = useParams() as { token?: string };
  const router = useRouter();
  const token = params.token;
  const [data, setData] = useState<GroupData | null>(null);
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const res = await fetch(`/api/gifts/group/${token}`);
    const j = await res.json();
    if (!res.ok) {
      setError(j.error || 'Could not load this invitation.');
      return;
    }
    setData(j);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function contribute() {
    setBusy(true);
    setError(null);
    const me = await getCurrentUser();
    if (!me) {
      router.push(`/auth/signup?next=/g/group/${token}`);
      return;
    }
    try {
      const res = await fetch(`/api/gifts/group/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursMinutes: hours * 60, message }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || 'Failed.');
        setBusy(false);
        return;
      }
      setDone(true);
      await load();
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container row between" style={{ padding: '24px 32px' }}>
        <Brand />
        <Link href="/auth/signin" className="meta">Sign in</Link>
      </div>
      <div style={{ padding: '40px 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div className="stack gap-8" style={{ width: '100%', maxWidth: 640 }}>
          {error && (
            <div className="envelope center">
              <h2 className="serif" style={{ fontSize: 28 }}>Hmm.</h2>
              <p className="lede muted mt-4">{error}</p>
              <Link href="/" className="btn mt-6">Go to Timegift</Link>
            </div>
          )}

          {!error && !data && (
            <div className="center serif italic muted" style={{ fontSize: 22 }}>Opening…</div>
          )}

          {data && !done && (
            <div className="envelope">
              <div className="eyebrow">A group letter</div>
              <h2 className="serif mt-2" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
                {data.organizerName} is collecting hours.
              </h2>
              <p className="lede mt-3">
                For {data.gift.recipient_email || data.gift.recipient_phone || 'someone'}.{' '}
                {data.gift.purpose_type === 'specific' && data.gift.purpose_details
                  ? data.gift.purpose_details
                  : 'Anything they want.'}
              </p>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--hairline-soft)',
                  borderRadius: 6,
                }}
              >
                <div className="meta">So far</div>
                <div className="serif" style={{ fontSize: 28 }}>
                  {formatDuration(data.totalMinutes)} from {data.contributorCount}{' '}
                  {data.contributorCount === 1 ? 'person' : 'people'}
                </div>
              </div>

              <hr className="hr mt-6 mb-6" />

              <div className="stack gap-4">
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
                  <label className="field-label">A sentence (optional)</label>
                  <textarea
                    className="textarea"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mine is the morning."
                  />
                </div>
                <div className="row between mt-4">
                  <Link href="/" className="btn-quiet">Not now</Link>
                  <button className="btn btn-accent" onClick={contribute} disabled={busy}>
                    {busy ? 'Adding…' : 'Add my hours'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {done && data && (
            <div className="envelope center">
              <div className="seal" style={{ margin: '0 auto 24px', width: 72, height: 72 }}>
                <Icon name="check" size={28} />
              </div>
              <h2 className="serif" style={{ fontSize: 32 }}>Added.</h2>
              <p className="lede muted mt-4">
                {formatDuration(data.totalMinutes)} from {data.contributorCount}{' '}
                {data.contributorCount === 1 ? 'person' : 'people'}. {data.organizerName} will send the letter when it&apos;s
                full.
              </p>
              <div className="row gap-3 mt-6" style={{ justifyContent: 'center' }}>
                <Link href="/dashboard" className="btn">See your ledger</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
