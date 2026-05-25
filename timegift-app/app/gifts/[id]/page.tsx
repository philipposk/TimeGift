'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Icon } from '@/components/tg/icon';
import { LetterView } from '@/components/tg/letter-view';
import { StatusTag } from '@/components/tg/tag';

interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  message: string;
  time_amount: number;
  time_unit: string;
  purpose_type: string;
  purpose_details: string | null;
  status: string;
  scheduled_datetime: string | null;
  created_at: string;
  expiry_date: string | null;
  memory_photo_url: string | null;
  memory_story: string | null;
  memory_location: string | null;
}

interface UserMin {
  id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function GiftDetailPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id;
  const [user, setUser] = useState<any>(null);
  const [gift, setGift] = useState<Gift | null>(null);
  const [sender, setSender] = useState<UserMin | null>(null);
  const [recipient, setRecipient] = useState<UserMin | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');

  async function reload() {
    if (!id) return;
    const supabase = getSupabaseBrowserClient();
    const { data: g } = await supabase.from('gifts').select('*').eq('id', id).single();
    setGift(g as Gift | null);
    if (g) {
      if (g.sender_id) {
        const { data: s } = await supabase
          .from('users')
          .select('id, display_name, username, email, avatar_url')
          .eq('id', g.sender_id)
          .maybeSingle();
        setSender(s);
      }
      if (g.recipient_id) {
        const { data: r } = await supabase
          .from('users')
          .select('id, display_name, username, email, avatar_url')
          .eq('id', g.recipient_id)
          .maybeSingle();
        setRecipient(r);
      }
    }
  }

  useEffect(() => {
    async function init() {
      const me = await getCurrentUser();
      if (!me) {
        router.push(`/auth/signin?next=/gifts/${id}`);
        return;
      }
      setUser(me);
      await reload();
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  async function action(path: string, body?: any) {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/gifts/${id}/${path}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || `Failed to ${path}`);
        return;
      }
      await reload();
      setScheduling(false);
    } catch (e: any) {
      setError(e.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !gift || !user) {
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

  const isSender = gift.sender_id === user.id;
  const isRecipient = gift.recipient_id === user.id;
  const isParty = isSender || isRecipient;

  if (!isParty) {
    return (
      <>
        <TopNav />
        <main>
          <div className="container" style={{ paddingTop: 80 }}>
            <div className="envelope center">
              <h2 className="serif" style={{ fontSize: 28 }}>This letter isn&apos;t for you.</h2>
              <p className="lede muted" style={{ marginTop: 12 }}>
                Only the sender or recipient can view a TimeGift.
              </p>
              <Link href="/dashboard" className="btn mt-6">Back to your ledger</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const senderName = sender?.display_name || sender?.username || sender?.email || 'Someone';
  const recipientLabel =
    recipient?.display_name ||
    recipient?.username ||
    gift.recipient_email ||
    gift.recipient_phone ||
    'Recipient';

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          <div className="row between mb-8">
            <Link href="/dashboard" className="btn-quiet">
              <Icon name="arrow-left" size={14} /> Back to ledger
            </Link>
            <StatusTag status={gift.status} />
          </div>

          <LetterView
            amountMinutes={gift.time_amount}
            unit={gift.time_unit}
            purposeType={gift.purpose_type}
            purposeDetails={gift.purpose_details}
            message={gift.message}
            senderName={senderName}
            senderAvatarUrl={sender?.avatar_url}
            sentAt={gift.created_at}
          />

          {gift.scheduled_datetime && (
            <div
              className="row gap-3 mt-6"
              style={{
                maxWidth: 620,
                margin: '24px auto 0',
                padding: 16,
                background: 'var(--paper-warm)',
                border: '1px solid var(--hairline-soft)',
                borderRadius: 6,
              }}
            >
              <Icon name="calendar" size={16} />
              <div>
                <div className="serif" style={{ fontSize: 17 }}>
                  Scheduled for {new Date(gift.scheduled_datetime).toLocaleString()}
                </div>
                {recipient && isSender && (
                  <div className="meta">With {recipientLabel}</div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div
              className="mt-6"
              style={{
                maxWidth: 620,
                margin: '24px auto 0',
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

          {/* Action bar */}
          <div
            style={{
              maxWidth: 620,
              margin: '32px auto 0',
              padding: '20px 0',
              borderTop: '1px solid var(--hairline-soft)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            {/* Recipient actions */}
            {isRecipient && gift.status === 'pending' && !scheduling && (
              <>
                <button className="btn-quiet" onClick={() => action('decline')} disabled={busy}>
                  Decline
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => action('accept', {})}
                  disabled={busy}
                >
                  Accept without a date
                </button>
                <button className="btn btn-accent" onClick={() => setScheduling(true)} disabled={busy}>
                  <Icon name="calendar" size={14} /> Pick a date
                </button>
              </>
            )}

            {isRecipient && (gift.status === 'accepted' || gift.status === 'scheduled') && !scheduling && (
              <>
                <button className="btn-quiet" onClick={() => action('decline')} disabled={busy}>
                  Decline
                </button>
                <button className="btn btn-ghost" onClick={() => setScheduling(true)} disabled={busy}>
                  <Icon name="calendar" size={14} /> {gift.scheduled_datetime ? 'Reschedule' : 'Pick a date'}
                </button>
                <button className="btn btn-accent" onClick={() => action('complete')} disabled={busy}>
                  <Icon name="check" size={14} /> Mark complete
                </button>
              </>
            )}

            {/* Sender actions */}
            {isSender && ['pending', 'accepted', 'scheduled'].includes(gift.status) && !scheduling && (
              <button className="btn-quiet" onClick={() => action('cancel')} disabled={busy}>
                Cancel gift
              </button>
            )}

            {isSender && (gift.status === 'accepted' || gift.status === 'scheduled') && !scheduling && (
              <button className="btn btn-accent" onClick={() => action('complete')} disabled={busy}>
                <Icon name="check" size={14} /> Mark complete
              </button>
            )}

            {/* Scheduling form */}
            {scheduling && (
              <div className="row gap-3" style={{ width: '100%', justifyContent: 'flex-end' }}>
                <input
                  type="datetime-local"
                  className="input-boxed"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <button className="btn-quiet" onClick={() => setScheduling(false)} disabled={busy}>
                  Cancel
                </button>
                <button
                  className="btn btn-accent"
                  disabled={busy || !scheduleDate}
                  onClick={() =>
                    gift.status === 'pending'
                      ? action('accept', { scheduledDate: new Date(scheduleDate).toISOString() })
                      : action('reschedule', { scheduledDate: new Date(scheduleDate).toISOString() })
                  }
                >
                  Save date
                </button>
              </div>
            )}

            {/* Completed → add memory */}
            {gift.status === 'completed' && !gift.memory_story && !gift.memory_photo_url && (
              <Link href={`/gifts/${gift.id}/memory`} className="btn btn-accent">
                <Icon name="camera" size={14} /> Add a memory
              </Link>
            )}
          </div>

          {/* Memory display */}
          {gift.status === 'completed' && (gift.memory_story || gift.memory_photo_url) && (
            <div
              style={{
                maxWidth: 620,
                margin: '40px auto 0',
                padding: 24,
                background: '#fbf7ee',
                border: '1px solid var(--hairline)',
                borderRadius: 6,
              }}
            >
              <div className="eyebrow mb-4">Memory</div>
              {gift.memory_photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gift.memory_photo_url}
                  alt="Memory"
                  style={{ width: '100%', borderRadius: 4, marginBottom: 16 }}
                />
              )}
              {gift.memory_story && (
                <p className="handwritten" style={{ fontSize: 18, lineHeight: 1.55 }}>
                  {gift.memory_story}
                </p>
              )}
              {gift.memory_location && (
                <div className="meta mt-3">📍 {gift.memory_location}</div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
