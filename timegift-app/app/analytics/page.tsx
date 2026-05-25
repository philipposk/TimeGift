'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { toDisplayHours } from '@/lib/time-format';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  time_amount: number;
  status: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const me = await getCurrentUser();
      if (!me) {
        router.push('/auth/signin?next=/analytics');
        return;
      }
      setUser(me);
      const supabase = getSupabaseBrowserClient();
      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from('gifts').select('*').eq('sender_id', me.id).order('created_at', { ascending: false }),
        supabase.from('gifts').select('*').eq('recipient_id', me.id).order('created_at', { ascending: false }),
      ]);
      setStats(computeStats(me.id, sent || [], received || []));
    }
    load();
  }, [router]);

  if (!user || !stats) {
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
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">A quiet ledger</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
              <em style={{ color: 'var(--accent)' }}>Time</em> you gave, time you got.
            </h1>
          </div>

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
            <Stat label="Hours given" num={stats.totalHoursGifted} />
            <Stat label="Hours received" num={stats.totalHoursReceived} />
            <Stat label="Total gifts" num={stats.totalGifts} />
            <Stat label="Completed" num={stats.completedGifts} accent />
          </div>

          {stats.totalGifts === 0 ? (
            <div className="card center" style={{ padding: '64px 32px' }}>
              <div className="serif italic muted" style={{ fontSize: 22 }}>No data yet.</div>
              <div className="meta mt-2">Write a few gifts and come back.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                <Card title="Monthly trend">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={stats.monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" />
                      <XAxis dataKey="month" stroke="var(--muted)" />
                      <YAxis stroke="var(--muted)" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="var(--accent)" strokeWidth={2} name="Given" />
                      <Line type="monotone" dataKey="received" stroke="var(--moss)" strokeWidth={2} name="Received" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="Status">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.statusChartData}
                        cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {stats.statusChartData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {stats.topRecipients.length > 0 && (
                <Card title="Top recipients">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.topRecipients}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" />
                      <XAxis dataKey="name" stroke="var(--muted)" />
                      <YAxis stroke="var(--muted)" />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--accent)" name="Gifts sent" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}

function Stat({ label, num, accent }: { label: string; num: number; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--paper)', padding: '28px 28px 24px' }}>
      <div className="stat-label" style={{ marginBottom: 14 }}>{label}</div>
      <div className="stat-num" style={{ color: accent ? 'var(--accent)' : 'var(--ink)' }}>{num}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="eyebrow mb-4">{title}</div>
      {children}
    </div>
  );
}

function computeStats(myId: string, sent: Gift[], received: Gift[]) {
  const allGifts = [...sent, ...received];
  const totalHoursGifted = toDisplayHours(sent.reduce((s, g) => s + g.time_amount, 0));
  const totalHoursReceived = toDisplayHours(received.reduce((s, g) => s + g.time_amount, 0));

  const monthlyData: Record<string, { sent: number; received: number }> = {};
  for (const g of allGifts) {
    const d = new Date(g.created_at);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[k]) monthlyData[k] = { sent: 0, received: 0 };
    const hrs = g.time_amount / 60;
    if (g.sender_id === myId) monthlyData[k].sent += hrs;
    else monthlyData[k].received += hrs;
  }
  const monthlyChartData = Object.entries(monthlyData)
    .sort()
    .slice(-12)
    .map(([k, v]) => ({
      month: new Date(k + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      sent: Math.round(v.sent * 10) / 10,
      received: Math.round(v.received * 10) / 10,
    }));

  const counts = {
    pending: allGifts.filter((g) => g.status === 'pending').length,
    accepted: allGifts.filter((g) => g.status === 'accepted').length,
    scheduled: allGifts.filter((g) => g.status === 'scheduled').length,
    completed: allGifts.filter((g) => g.status === 'completed').length,
    expired: allGifts.filter((g) => g.status === 'expired').length,
  };
  const statusChartData = [
    { name: 'Pending', value: counts.pending, color: '#a8501e' },
    { name: 'Accepted', value: counts.accepted, color: '#4f7a99' },
    { name: 'Scheduled', value: counts.scheduled, color: '#6b5b8b' },
    { name: 'Completed', value: counts.completed, color: '#4e6b3d' },
    { name: 'Expired', value: counts.expired, color: '#9c3f4a' },
  ].filter((i) => i.value > 0);

  const recipientCounts: Record<string, number> = {};
  for (const g of sent) {
    const name = g.recipient_email || g.recipient_phone || 'Unknown';
    recipientCounts[name] = (recipientCounts[name] || 0) + 1;
  }
  const topRecipients = Object.entries(recipientCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.substring(0, 20), count }));

  return {
    totalHoursGifted,
    totalHoursReceived,
    totalGifts: allGifts.length,
    completedGifts: counts.completed,
    monthlyChartData,
    statusChartData,
    topRecipients,
  };
}
