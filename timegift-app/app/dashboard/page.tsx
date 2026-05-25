'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';
import { Avatar } from '@/components/tg/avatar';
import { StatusTag } from '@/components/tg/tag';
import { Polaroid } from '@/components/tg/polaroid';
import { formatDuration, toDisplayHours } from '@/lib/time-format';

const ACTIVE_STATUSES = ['pending', 'accepted', 'scheduled', 'completed'];

type Tab = 'incoming' | 'outgoing' | 'memories';

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
  created_at: string;
  memory_photo_url?: string | null;
  memory_story?: string | null;
  memory_location?: string | null;
  completed_at?: string | null;
}

interface UserMin {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sent, setSent] = useState<Gift[]>([]);
  const [received, setReceived] = useState<Gift[]>([]);
  const [memories, setMemories] = useState<Gift[]>([]);
  const [counterparts, setCounterparts] = useState<Record<string, UserMin>>({});
  const [tab, setTab] = useState<Tab>('incoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await getCurrentUser();
        if (!me) {
          router.push('/auth/signin?next=/dashboard');
          return;
        }
        setUser(me);

        const supabase = getSupabaseBrowserClient();

        const [{ data: profileData }, { data: sentRows }, { data: recRows }, { data: memRows }] = await Promise.all([
          supabase.from('users').select('*').eq('id', me.id).single(),
          supabase
            .from('gifts')
            .select('*')
            .eq('sender_id', me.id)
            .in('status', ACTIVE_STATUSES)
            .eq('archived_by_sender', false)
            .order('created_at', { ascending: false }),
          supabase
            .from('gifts')
            .select('*')
            .eq('recipient_id', me.id)
            .in('status', ACTIVE_STATUSES)
            .eq('archived_by_recipient', false)
            .order('created_at', { ascending: false }),
          supabase
            .from('gifts')
            .select('*')
            .or(`sender_id.eq.${me.id},recipient_id.eq.${me.id}`)
            .eq('status', 'completed')
            .not('memory_story', 'is', null)
            .order('completed_at', { ascending: false })
            .limit(8),
        ]);

        setProfile(profileData);
        setSent(sentRows || []);
        setReceived(recRows || []);
        setMemories(memRows || []);

        // Resolve counterpart user rows for everyone we owe an avatar to.
        const ids = new Set<string>();
        for (const g of [...(sentRows || []), ...(recRows || [])]) {
          if (g.sender_id && g.sender_id !== me.id) ids.add(g.sender_id);
          if (g.recipient_id && g.recipient_id !== me.id) ids.add(g.recipient_id);
        }
        if (ids.size > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, display_name, username, avatar_url')
            .in('id', Array.from(ids));
          const map: Record<string, UserMin> = {};
          for (const u of users || []) map[u.id] = u;
          setCounterparts(map);
        }
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading || !user) {
    return (
      <>
        <TopNav />
        <main>
          <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="serif italic muted center" style={{ fontSize: 22 }}>Loading…</div>
          </div>
        </main>
      </>
    );
  }

  const hoursGiven = toDisplayHours(sent.reduce((s, g) => s + g.time_amount, 0));
  const hoursReceived = toDisplayHours(received.reduce((s, g) => s + g.time_amount, 0));
  const pending = [...received, ...sent].filter((g) => g.status === 'pending').length;
  const completed = [...sent, ...received].filter((g) => g.status === 'completed').length;

  const firstName = (profile?.display_name || profile?.username || user.username || 'friend').split(' ')[0];
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          {/* Header */}
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 48 }}>
            <div className="stack gap-2">
              <div className="eyebrow">Your ledger · {today}</div>
              <h1 style={{ fontSize: 56, letterSpacing: '-0.025em', lineHeight: 1 }}>
                Good morning, <em style={{ color: 'var(--accent)' }}>{firstName}.</em>
              </h1>
            </div>
            <Link href="/create" className="btn btn-lg">
              <Icon name="feather" size={15} /> Write a gift
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: 'var(--hairline-soft)',
              border: '1px solid var(--hairline-soft)',
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: 48,
            }}
          >
            <Stat label="Hours given" num={hoursGiven} sublabel={`across ${sent.length} gifts`} />
            <Stat label="Hours received" num={hoursReceived} sublabel={`from ${new Set(received.map((g) => g.sender_id)).size} people`} />
            <Stat label="Pending" num={pending} sublabel="waiting on the other side" accent />
            <Stat label="Completed" num={completed} sublabel="this year" />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={'tab ' + (tab === 'incoming' ? 'active' : '')} onClick={() => setTab('incoming')}>
              Incoming<span className="tab-count">{received.length}</span>
            </button>
            <button className={'tab ' + (tab === 'outgoing' ? 'active' : '')} onClick={() => setTab('outgoing')}>
              Outgoing<span className="tab-count">{sent.length}</span>
            </button>
            <button className={'tab ' + (tab === 'memories' ? 'active' : '')} onClick={() => setTab('memories')}>
              Memories<span className="tab-count">{memories.length}</span>
            </button>
          </div>

          <div style={{ marginTop: 32 }}>
            {tab === 'incoming' && <GiftTable rows={received} kind="incoming" counterparts={counterparts} />}
            {tab === 'outgoing' && <GiftTable rows={sent} kind="outgoing" counterparts={counterparts} />}
            {tab === 'memories' && <MemoryGrid rows={memories} counterparts={counterparts} userId={user.id} />}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

function Stat({ label, num, sublabel, accent }: { label: string; num: number; sublabel: string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--paper)', padding: '28px 28px 24px' }}>
      <div className="stat-label" style={{ marginBottom: 14 }}>{label}</div>
      <div className="stat-num" style={{ color: accent ? 'var(--accent)' : 'var(--ink)' }}>{num}</div>
      <div className="meta" style={{ marginTop: 8 }}>{sublabel}</div>
    </div>
  );
}

interface RowsProps {
  rows: Gift[];
  kind: 'incoming' | 'outgoing';
  counterparts: Record<string, UserMin>;
}

function GiftTable({ rows, kind, counterparts }: RowsProps) {
  if (rows.length === 0) {
    return (
      <div className="card center" style={{ padding: '64px 32px' }}>
        <div className="serif italic muted" style={{ fontSize: 22, marginBottom: 8 }}>Nothing here yet.</div>
        <div className="meta">
          {kind === 'incoming' ? "No one's sent you time yet." : "You haven't written any gifts."}
        </div>
      </div>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ width: '30%' }}>{kind === 'incoming' ? 'From' : 'To'}</th>
          <th style={{ width: '12%' }}>Time</th>
          <th style={{ width: '32%' }}>Message</th>
          <th style={{ width: '13%' }}>Sent</th>
          <th style={{ width: '13%' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((g) => {
          const otherId = kind === 'incoming' ? g.sender_id : g.recipient_id;
          const other = otherId ? counterparts[otherId] : null;
          const otherName =
            other?.display_name ||
            other?.username ||
            g.recipient_email ||
            g.recipient_phone ||
            (kind === 'incoming' ? 'Someone' : 'Unknown');
          const otherContact = !other && (g.recipient_email || g.recipient_phone) ? null : g.recipient_email || g.recipient_phone;
          const purpose =
            g.purpose_type === 'specific' && g.purpose_details ? g.purpose_details : 'Anything you want';
          const sentAt = new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <tr key={g.id} onClick={() => (window.location.href = `/gifts/${g.id}`)}>
              <td>
                <div className="row gap-3">
                  <Avatar name={otherName} url={other?.avatar_url} />
                  <div>
                    <div className="serif" style={{ fontSize: 17 }}>{otherName}</div>
                    {otherContact ? (
                      <div className="meta">{otherContact}</div>
                    ) : (
                      <div className="meta">{purpose}</div>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div className="col-time">{formatDuration(g.time_amount)}</div>
              </td>
              <td>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 15.5,
                    color: 'var(--ink-soft)',
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  &ldquo;{g.message}&rdquo;
                </div>
              </td>
              <td className="meta">{sentAt}</td>
              <td><StatusTag status={g.status} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MemoryGrid({ rows, counterparts, userId }: { rows: Gift[]; counterparts: Record<string, UserMin>; userId: string }) {
  if (rows.length === 0) {
    return (
      <div className="card center" style={{ padding: '64px 32px' }}>
        <div className="serif italic muted" style={{ fontSize: 22, marginBottom: 8 }}>No memories yet.</div>
        <div className="meta">Complete a gift and add a photo or story to start your shelf.</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
      {rows.map((g) => {
        const otherId = g.sender_id === userId ? g.recipient_id : g.sender_id;
        const other = otherId ? counterparts[otherId] : null;
        const otherName = other?.display_name || other?.username || 'Together';
        const when = new Date(g.completed_at || g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const purpose = g.purpose_type === 'specific' && g.purpose_details ? g.purpose_details : 'Anything';
        return (
          <Polaroid
            key={g.id}
            imageUrl={g.memory_photo_url || null}
            caption={g.memory_story || undefined}
            meta={`with ${otherName} · ${when}`}
            placeholder={purpose}
          />
        );
      })}
    </div>
  );
}
