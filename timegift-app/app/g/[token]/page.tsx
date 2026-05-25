'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { Icon } from '@/components/tg/icon';
import { Brand } from '@/components/tg/brand';
import { LetterView } from '@/components/tg/letter-view';

interface ClaimData {
  gift: {
    id: string;
    message: string;
    timeAmount: number;
    timeUnit: string;
    purposeType: string;
    purposeDetails?: string | null;
    status: string;
    sender: { displayName: string; avatarUrl: string | null };
  };
  recipient: { email: string | null; phone: string | null };
}

type Stage = 'closed' | 'opened' | 'auth' | 'claimed' | 'error';

export default function ClaimPage() {
  const params = useParams() as { token?: string };
  const router = useRouter();
  const token = params.token;
  const [data, setData] = useState<ClaimData | null>(null);
  const [stage, setStage] = useState<Stage>('closed');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/gifts/claim/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setStage('error');
          setError(json.error || 'Could not load this gift.');
          return;
        }
        setData(json);
      })
      .catch(() => {
        setStage('error');
        setError('Network error.');
      });
  }, [token]);

  async function attemptClaim() {
    if (!token) return;
    setBusy(true);
    setError(null);
    const me = await getCurrentUser();
    if (!me) {
      // Send them to sign up; come back here.
      router.push(`/auth/signup?next=/g/${token}`);
      return;
    }
    try {
      const res = await fetch(`/api/gifts/claim/${token}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Claim failed.');
        setBusy(false);
        return;
      }
      setStage('claimed');
      router.push(`/gifts/${json.giftId}`);
    } catch (e: any) {
      setError(e.message || 'Network error.');
      setBusy(false);
    }
  }

  if (stage === 'error') {
    return (
      <Shell>
        <div className="envelope center">
          <h2 className="serif" style={{ fontSize: 32, marginBottom: 12 }}>
            Hmm.
          </h2>
          <p className="lede muted" style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            {error || 'This link is no longer valid.'}
          </p>
          <Link href="/" className="btn">
            Go to Timegift
          </Link>
        </div>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <div className="center serif italic muted" style={{ fontSize: 22 }}>Opening…</div>
      </Shell>
    );
  }

  const g = data.gift;

  return (
    <Shell>
      <div className="center stack gap-2 mb-8">
        <div className="eyebrow">A letter for you</div>
        <div className="serif italic muted" style={{ fontSize: 17 }}>via Timegift</div>
      </div>

      {stage === 'closed' ? (
        <ClosedEnvelope
          senderName={g.sender.displayName}
          amount={g.timeAmount}
          unit={g.timeUnit}
          onOpen={() => setStage('opened')}
        />
      ) : (
        <>
          <LetterView
            amountMinutes={g.timeAmount}
            unit={g.timeUnit}
            purposeType={g.purposeType}
            purposeDetails={g.purposeDetails}
            message={g.message}
            senderName={g.sender.displayName}
            senderAvatarUrl={g.sender.avatarUrl}
          />

          {error && (
            <div
              className="mt-6"
              style={{
                padding: 16,
                border: '1px solid var(--rose-soft)',
                background: 'var(--rose-soft)',
                color: '#5b2228',
                borderRadius: 6,
                maxWidth: 620,
                margin: '24px auto 0',
              }}
            >
              {error}
            </div>
          )}

          <div className="center mt-8">
            <p className="muted mb-4" style={{ fontSize: 14 }}>
              {g.status === 'pending'
                ? 'Accept this gift to add it to your account and schedule a time.'
                : `Status: ${g.status}`}
            </p>
            {g.status === 'pending' && (
              <div className="row gap-3" style={{ justifyContent: 'center' }}>
                <button className="btn btn-accent btn-lg" onClick={attemptClaim} disabled={busy}>
                  <Icon name="check" size={15} /> {busy ? 'Working…' : 'Claim this gift'}
                </button>
                <Link href="/" className="btn btn-ghost btn-lg">
                  Not now
                </Link>
              </div>
            )}
          </div>

          <div className="center meta mt-8" style={{ maxWidth: 480, margin: '32px auto 0' }}>
            Timegift is a small thing for sending time, not stuff.{' '}
            <Link href="/" className="link">What is this?</Link>
          </div>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container row between" style={{ padding: '24px 32px' }}>
        <Brand />
        <Link href="/auth/signin" className="meta">Sign in</Link>
      </div>
      <div
        style={{
          padding: '40px 24px 80px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div className="stack gap-8" style={{ width: '100%', maxWidth: 680 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ClosedEnvelope({
  senderName,
  amount,
  unit,
  onOpen,
}: {
  senderName: string;
  amount: number;
  unit: string;
  onOpen: () => void;
}) {
  const niceAmount = amount / 60;
  const stampUnit = niceAmount >= 1 ? 'hours' : 'minutes';
  const stampAmount = niceAmount >= 1 ? Math.round(niceAmount) : amount;
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={onOpen}
        style={{
          maxWidth: 520,
          margin: '0 auto',
          aspectRatio: '1.7 / 1',
          background: '#fbf7ee',
          border: '1px solid var(--hairline)',
          borderRadius: 4,
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 30px 60px -30px rgba(60, 40, 20, 0.35)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '55%',
            background: 'var(--paper-warm)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            borderBottom: '1px solid var(--hairline)',
          }}
        />
        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="seal">{(senderName || '?').charAt(0).toUpperCase()}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 32, left: 40, right: 120 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>To you, from</div>
          <div className="serif" style={{ fontSize: 24 }}>{senderName}</div>
        </div>
        <div className="stamp" style={{ position: 'absolute', top: 18, right: 18, background: '#fbf7ee' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
              Timegift
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: 16 }}>
              {stampAmount}
              {stampUnit[0]}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.1em' }}>{new Date().getFullYear()}</div>
          </div>
        </div>
      </div>
      <div className="center mt-6">
        <button className="btn btn-lg" onClick={onOpen}>
          <Icon name="envelope" size={15} /> Open the letter
        </button>
      </div>
    </div>
  );
}
