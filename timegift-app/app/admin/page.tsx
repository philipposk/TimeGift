'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';

export const dynamic = 'force-dynamic';

interface Setting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  updated_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const me = await getCurrentUser();
      if (!me) {
        router.push('/auth/signin?next=/admin');
        return;
      }
      if (!me.isAdmin) {
        setUser({ ...me, isAdmin: false });
        return;
      }
      setUser(me);
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('admin_settings').select('*').order('setting_key');
      setSettings(data || []);
      const map: Record<string, string> = {};
      for (const s of data || []) map[s.id] = JSON.stringify(s.setting_value, null, 2);
      setEditing(map);
    }
    load();
  }, [router]);

  async function save(s: Setting) {
    setMsg(null);
    setErr(null);
    let parsed: any;
    try {
      parsed = JSON.parse(editing[s.id]);
    } catch {
      setErr('Invalid JSON.');
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('admin_settings')
      .update({ setting_value: parsed })
      .eq('id', s.id);
    if (error) setErr(error.message);
    else setMsg(`Saved ${s.setting_key}.`);
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

  if (!user.isAdmin) {
    return (
      <>
        <TopNav />
        <main>
          <div className="container" style={{ paddingTop: 80 }}>
            <div className="envelope center">
              <h2 className="serif" style={{ fontSize: 28 }}>Admin only.</h2>
              <p className="lede muted mt-4">You don&apos;t have access to this page.</p>
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
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 900 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">Admin · settings</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>Knobs &amp; dials</h1>
          </div>

          {(msg || err) && (
            <div
              style={{
                padding: 12,
                border: '1px solid ' + (err ? 'var(--rose-soft)' : 'var(--moss-soft)'),
                background: err ? 'var(--rose-soft)' : 'var(--moss-soft)',
                color: err ? '#5b2228' : '#2d4a25',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {err || msg}
            </div>
          )}

          <div className="stack gap-6">
            {settings.map((s) => (
              <div key={s.id} className="card">
                <div className="row between mb-2">
                  <div>
                    <div className="serif" style={{ fontSize: 18 }}>{s.setting_key}</div>
                    {s.description && <div className="meta">{s.description}</div>}
                  </div>
                  <button className="btn" onClick={() => save(s)}>Save</button>
                </div>
                <textarea
                  className="input-boxed mono"
                  style={{ width: '100%', minHeight: 120, fontFamily: 'var(--mono)', fontSize: 13 }}
                  value={editing[s.id] || ''}
                  onChange={(e) => setEditing({ ...editing, [s.id]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
