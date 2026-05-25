'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Icon } from '@/components/tg/icon';
import { Stamp } from '@/components/tg/stamp';
import { Steps } from '@/components/tg/steps';
import { VoiceRecorder } from '@/components/tg/voice-recorder';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Unit = 'minutes' | 'hours' | 'days';
type RecipientType = 'email' | 'phone';

interface Draft {
  recipientType: RecipientType;
  recipientName: string;
  recipientContact: string;
  amount: number;
  unit: Unit;
  purposeType: 'anything' | 'specific';
  purposeDetails: string;
  message: string;
  expiryType: 'none' | '1m' | '3m' | '1y';
  voiceUrl: string | null;
  voiceDurationSeconds: number | null;
}

const STEP_ITEMS = [
  { n: 1, label: 'Recipient' },
  { n: 2, label: 'Time' },
  { n: 3, label: 'Message' },
  { n: 4, label: 'Review' },
];

function expiryDateFor(type: Draft['expiryType']): string | null {
  if (type === 'none') return null;
  const d = new Date();
  if (type === '1m') d.setMonth(d.getMonth() + 1);
  if (type === '3m') d.setMonth(d.getMonth() + 3);
  if (type === '1y') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export default function CreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Draft>({
    recipientType: 'email',
    recipientName: '',
    recipientContact: '',
    amount: 2,
    unit: 'hours',
    purposeType: 'anything',
    purposeDetails: '',
    message: '',
    expiryType: 'none',
    voiceUrl: null,
    voiceDurationSeconds: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ giftId: string; claimUrl: string | null } | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.push('/auth/signin?next=/create');
        return;
      }
      setUser(u);
      setAuthChecked(true);
    });
  }, [router]);

  const update = (patch: Partial<Draft>) => setData((d) => ({ ...d, ...patch }));

  const canAdvance = () => {
    if (step === 1) return data.recipientName.trim() && data.recipientContact.trim();
    if (step === 2) return data.amount > 0;
    if (step === 3) return data.message.trim().length > 5;
    return true;
  };

  const next = () => canAdvance() && setStep((s) => Math.min(4, s + 1));
  const back = () => (step > 1 ? setStep((s) => s - 1) : router.push('/dashboard'));

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        recipientType: data.recipientType,
        recipientEmail: data.recipientType === 'email' ? data.recipientContact : undefined,
        recipientPhone: data.recipientType === 'phone' ? data.recipientContact : undefined,
        message: data.message,
        timeAmount: data.amount,
        timeUnit: data.unit,
        purposeType: data.purposeType,
        purposeDetails: data.purposeType === 'specific' ? data.purposeDetails : null,
        expiryDate: expiryDateFor(data.expiryType),
        voiceUrl: data.voiceUrl,
        voiceDurationSeconds: data.voiceDurationSeconds,
      };
      const res = await fetch('/api/gifts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to send gift.');
        return;
      }
      setResult({ giftId: json.gift?.id, claimUrl: json.claimUrl || null });
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
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
          <SuccessView result={result} data={data} onWriteAnother={() => { setResult(null); setStep(1); }} />
        </main>
      </>
    );
  }

  const senderInitial = (user?.displayName || user?.username || 'M').trim().charAt(0).toUpperCase();

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          {/* Top bar */}
          <div className="row between mb-8">
            <div className="stack gap-1">
              <div className="eyebrow">Composing</div>
              <h1 style={{ fontSize: 36, letterSpacing: '-0.02em' }}>A new time gift</h1>
            </div>
            <button className="btn-quiet" onClick={() => router.push('/dashboard')}>
              Save draft & close
            </button>
          </div>

          <Steps current={step} items={STEP_ITEMS} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 56,
              marginTop: 40,
              alignItems: 'start',
            }}
          >
            <div className="stack gap-8">
              {step === 1 && <StepRecipient data={data} update={update} />}
              {step === 2 && <StepTime data={data} update={update} />}
              {step === 3 && <StepMessage data={data} update={update} userId={user?.id || ''} />}
              {step === 4 && <StepReview data={data} setStep={setStep} update={update} />}

              {error && (
                <div
                  style={{
                    padding: 16,
                    border: '1px solid var(--rose-soft)',
                    background: 'var(--rose-soft)',
                    color: '#5b2228',
                    borderRadius: 6,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                className="row between mt-8"
                style={{ paddingTop: 24, borderTop: '1px solid var(--hairline-soft)' }}
              >
                <button className="btn btn-ghost" onClick={back}>
                  <Icon name="arrow-left" size={14} /> {step === 1 ? 'Cancel' : 'Back'}
                </button>
                {step < 4 ? (
                  <button className="btn" onClick={next} disabled={!canAdvance()}>
                    Continue <Icon name="arrow-right" size={14} />
                  </button>
                ) : (
                  <button className="btn btn-accent" onClick={submit} disabled={submitting}>
                    <Icon name="send" size={14} /> {submitting ? 'Sending…' : 'Send the gift'}
                  </button>
                )}
              </div>
            </div>

            <div style={{ position: 'sticky', top: 32 }}>
              <div className="eyebrow mb-4">Live preview</div>
              <LivePreview data={data} senderInitial={senderInitial} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* === Steps === */

function StepRecipient({ data, update }: { data: Draft; update: (p: Partial<Draft>) => void }) {
  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>Who is this for?</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>
          They don&apos;t need an account. We&apos;ll deliver the card by email or text.
        </p>
      </div>
      <div className="stack gap-6">
        <div className="field">
          <label className="field-label">Their name</label>
          <input
            className="input"
            placeholder="Aunt Ros"
            value={data.recipientName}
            onChange={(e) => update({ recipientName: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="field-label">Send by</label>
          <div className="toggle-group" style={{ alignSelf: 'flex-start' }}>
            <button
              className={'toggle-opt ' + (data.recipientType === 'email' ? 'active' : '')}
              onClick={() => update({ recipientType: 'email', recipientContact: '' })}
            >
              <Icon name="mail" size={13} /> Email
            </button>
            <button
              className={'toggle-opt ' + (data.recipientType === 'phone' ? 'active' : '')}
              onClick={() => update({ recipientType: 'phone', recipientContact: '' })}
            >
              <Icon name="phone" size={13} /> Text / WhatsApp
            </button>
          </div>
        </div>
        <div className="field">
          <label className="field-label">
            {data.recipientType === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <input
            className="input"
            type={data.recipientType === 'email' ? 'email' : 'tel'}
            placeholder={data.recipientType === 'email' ? 'ros@email.com' : '+1 555 0100'}
            value={data.recipientContact}
            onChange={(e) => update({ recipientContact: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function StepTime({ data, update }: { data: Draft; update: (p: Partial<Draft>) => void }) {
  const quickPicks: { a: number; u: Unit; label: string }[] = [
    { a: 30, u: 'minutes', label: 'Quick call' },
    { a: 1, u: 'hours', label: 'Coffee' },
    { a: 3, u: 'hours', label: 'An afternoon' },
    { a: 1, u: 'days', label: 'A whole day' },
  ];

  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>How much time?</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>Pick something that feels right. You can always adjust later.</p>
      </div>

      <div className="stack gap-3">
        <label className="field-label">Quick picks</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {quickPicks.map((qp) => {
            const active = data.amount === qp.a && data.unit === qp.u;
            return (
              <button
                key={qp.label}
                onClick={() => update({ amount: qp.a, unit: qp.u })}
                style={{
                  background: active ? 'var(--ink)' : '#fbf7ee',
                  color: active ? 'var(--paper)' : 'var(--ink)',
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--hairline)'),
                  borderRadius: 6,
                  padding: '16px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>
                  {qp.a}
                  <span style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}>{qp.u}</span>
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 8, letterSpacing: '0.04em' }}>
                  {qp.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack gap-3">
        <label className="field-label">Or set your own</label>
        <div className="row gap-4">
          <input
            type="number"
            min="1"
            className="input-boxed"
            style={{ width: 100, textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 22 }}
            value={data.amount}
            onChange={(e) => update({ amount: parseInt(e.target.value) || 1 })}
          />
          <div className="toggle-group">
            {(['minutes', 'hours', 'days'] as Unit[]).map((u) => (
              <button
                key={u}
                className={'toggle-opt ' + (data.unit === u ? 'active' : '')}
                onClick={() => update({ unit: u })}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stack gap-3">
        <label className="field-label">What&apos;s it for?</label>
        <div className="stack gap-2">
          <PurposeOpt
            active={data.purposeType === 'anything'}
            onClick={() => update({ purposeType: 'anything' })}
            title="Anything they want"
            body="They decide. Most thoughtful when you trust them with it."
          />
          <PurposeOpt
            active={data.purposeType === 'specific'}
            onClick={() => update({ purposeType: 'specific' })}
            title="Something specific"
            body="A walk, a call, help with a project, dinner together."
          />
        </div>
        {data.purposeType === 'specific' && (
          <input
            className="input mt-2"
            placeholder="Tearing out the hedge, planting dahlias…"
            value={data.purposeDetails}
            onChange={(e) => update({ purposeDetails: e.target.value })}
          />
        )}
      </div>
    </div>
  );
}

function PurposeOpt({
  active,
  onClick,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--paper-warm)' : 'transparent',
        border: '1px solid ' + (active ? 'var(--ink)' : 'var(--hairline)'),
        padding: '16px 18px',
        borderRadius: 6,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '1px solid ' + (active ? 'var(--ink)' : 'var(--hairline)'),
            marginTop: 4,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {active && (
            <span
              style={{
                position: 'absolute',
                inset: 3,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          )}
        </div>
        <div>
          <div className="serif" style={{ fontSize: 17 }}>{title}</div>
          <div className="meta" style={{ marginTop: 2 }}>{body}</div>
        </div>
      </div>
    </button>
  );
}

function StepMessage({ data, update, userId }: { data: Draft; update: (p: Partial<Draft>) => void; userId: string }) {
  const templates = [
    'I’ve been meaning to tell you — ',
    'For your birthday — ',
    'Trade. You did this for me once. ',
    'No reason, just because. ',
  ];

  async function generate() {
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: 'just_because',
          recipientName: data.recipientName || 'friend',
          relationship: 'friend',
          timeAmount: data.amount,
          timeUnit: data.unit,
        }),
      });
      const json = await res.json();
      if (res.ok && json.message) update({ message: json.message });
    } catch {
      // ignore
    }
  }

  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>Write to them.</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>This is the part that matters. Short is fine. Mean it.</p>
      </div>
      <div className="field">
        <label className="field-label">Message</label>
        <textarea
          className="textarea"
          rows={7}
          placeholder="Write your letter…"
          value={data.message}
          onChange={(e) => update({ message: e.target.value })}
        />
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="meta">{data.message.length} characters</span>
          <span className="meta italic">Keep it like a letter, not a notification.</span>
        </div>
      </div>
      <div className="stack gap-3">
        <label className="field-label">Or start from</label>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {templates.map((t) => (
            <button
              key={t}
              className="btn btn-ghost"
              style={{ padding: '8px 12px', fontSize: 12.5 }}
              onClick={() => update({ message: t })}
            >
              {t.trim()}
            </button>
          ))}
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 12px', fontSize: 12.5 }}
            onClick={generate}
            disabled={!data.recipientName}
          >
            <Icon name="spark" size={12} /> Help me write it
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Voice memo (optional)</label>
        <VoiceRecorder
          onRecorded={async (blob, duration) => {
            if (!blob || blob.size === 0) {
              update({ voiceUrl: null, voiceDurationSeconds: null });
              return;
            }
            const supabase = getSupabaseBrowserClient();
            const path = `${userId}/${Date.now()}.webm`;
            const { error: upErr } = await supabase.storage.from('voice').upload(path, blob, {
              contentType: blob.type,
              upsert: false,
            });
            if (upErr) {
              console.error(upErr);
              return;
            }
            const { data: pub } = supabase.storage.from('voice').getPublicUrl(path);
            update({ voiceUrl: pub.publicUrl, voiceDurationSeconds: duration });
          }}
        />
        <span className="meta">Recipients hear your voice on the letter. Up to 90 seconds.</span>
      </div>
    </div>
  );
}

function StepReview({
  data,
  setStep,
  update,
}: {
  data: Draft;
  setStep: (n: number) => void;
  update: (p: Partial<Draft>) => void;
}) {
  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>One last look.</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>This is what they&apos;ll see when they open it.</p>
      </div>

      <div className="stack gap-4">
        <ReviewRow
          label="Recipient"
          value={`${data.recipientName} · ${data.recipientContact}`}
          onEdit={() => setStep(1)}
        />
        <ReviewRow
          label="Time"
          value={
            `${data.amount} ${data.unit}` +
            (data.purposeType === 'specific' && data.purposeDetails
              ? ` · ${data.purposeDetails}`
              : ' · anything')
          }
          onEdit={() => setStep(2)}
        />
        <ReviewRow label="Message" value={data.message || '—'} onEdit={() => setStep(3)} multiline />
      </div>

      <div className="field">
        <label className="field-label">Expiry (optional)</label>
        <div className="row gap-2">
          {[
            { v: 'none', l: 'No expiry' },
            { v: '1m', l: '1 month' },
            { v: '3m', l: '3 months' },
            { v: '1y', l: '1 year' },
          ].map((o) => (
            <button
              key={o.v}
              className={'btn ' + (data.expiryType === o.v ? '' : 'btn-ghost')}
              style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => update({ expiryType: o.v as Draft['expiryType'] })}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div
        className="row gap-3"
        style={{
          alignItems: 'flex-start',
          padding: 16,
          background: 'var(--paper-warm)',
          borderRadius: 6,
          border: '1px solid var(--hairline-soft)',
        }}
      >
        <Icon name="lock" size={16} />
        <div className="meta" style={{ fontSize: 13 }}>
          Only you and the recipient will see this. We&apos;ll send them a link by{' '}
          {data.recipientType === 'email' ? 'email' : 'text'}. They don&apos;t need an account to open it.
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  multiline,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  multiline?: boolean;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--hairline-soft)', paddingBottom: 16 }}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>{label}</div>
          <div
            className="serif"
            style={{
              fontSize: multiline ? 17 : 19,
              lineHeight: 1.45,
              fontStyle: multiline ? 'italic' : 'normal',
              color: 'var(--ink-soft)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {value}
          </div>
        </div>
        <button className="btn-quiet" onClick={onEdit} style={{ fontSize: 12.5 }}>
          <Icon name="edit" size={12} /> Edit
        </button>
      </div>
    </div>
  );
}

function LivePreview({ data, senderInitial }: { data: Draft; senderInitial: string }) {
  const purpose =
    data.purposeType === 'specific' && data.purposeDetails ? data.purposeDetails : 'anything you want';
  return (
    <div className="card-letter" style={{ transform: 'rotate(0.5deg)' }}>
      <Stamp amount={data.amount} unit={data.unit} />
      <div className="eyebrow" style={{ marginBottom: 4 }}>To</div>
      <div className="serif" style={{ fontSize: 22, color: data.recipientName ? 'var(--ink)' : 'var(--muted-2)' }}>
        {data.recipientName || 'Their name'}
      </div>
      <div className="eyebrow mt-6" style={{ marginBottom: 4 }}>For</div>
      <div className="serif" style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--accent)' }}>
        {data.amount} {data.unit} · {purpose}
      </div>
      <hr className="hr mt-6 mb-6" />
      <p
        className="handwritten"
        style={{ marginBottom: 14, minHeight: 80, color: data.message ? 'var(--ink-soft)' : 'var(--muted-2)' }}
      >
        {data.message || 'Your letter will appear here as you write it…'}
      </p>
      <p className="handwritten" style={{ textAlign: 'right' }}>— {senderInitial}.</p>
      <hr className="hr mt-6 mb-4" />
      <div className="row between meta">
        <span>Will send to {data.recipientContact || '—'}</span>
        <span>{data.expiryType === 'none' ? 'No expiry' : data.expiryType}</span>
      </div>
    </div>
  );
}

function SuccessView({
  result,
  data,
  onWriteAnother,
}: {
  result: { giftId: string; claimUrl: string | null };
  data: Draft;
  onWriteAnother: () => void;
}) {
  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className="envelope center">
        <div className="seal" style={{ margin: '0 auto 24px', width: 72, height: 72 }}>
          <Icon name="check" size={28} />
        </div>
        <h2 className="serif" style={{ fontSize: 36, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Sent.
        </h2>
        <p className="lede muted" style={{ maxWidth: 460, margin: '0 auto 24px' }}>
          Your letter is on its way to <em style={{ color: 'var(--accent)' }}>{data.recipientName}</em>.
        </p>

        {result.claimUrl && (
          <div
            className="card"
            style={{ background: 'var(--paper-warm)', textAlign: 'left', marginTop: 32 }}
          >
            <div className="eyebrow mb-2">Claim link</div>
            <div className="meta mb-4">
              They&apos;re not on Timegift yet. Share this link if the email doesn&apos;t reach them:
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                background: 'var(--paper)',
                padding: 12,
                borderRadius: 4,
                border: '1px solid var(--hairline)',
                wordBreak: 'break-all',
              }}
            >
              {result.claimUrl}
            </div>
            <button
              className="btn btn-ghost mt-4"
              style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => navigator.clipboard?.writeText(result.claimUrl!)}
            >
              Copy link
            </button>
          </div>
        )}

        <div className="row gap-3 mt-8" style={{ justifyContent: 'center' }}>
          <a className="btn" href={`/gifts/${result.giftId}`}>
            See the gift
          </a>
          <button className="btn btn-ghost" onClick={onWriteAnother}>
            Write another
          </button>
        </div>
      </div>
    </div>
  );
}
