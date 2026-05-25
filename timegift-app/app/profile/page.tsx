'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';
import { Avatar } from '@/components/tg/avatar';

interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  privacy_level: 'closed' | 'friends' | 'public';
  accept_stranger_gifts: boolean;
  opt_in_random_exchange: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reliability, setReliability] = useState<{ percent: number | null; completed: number; broken: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const me = await getCurrentUser();
      if (!me) {
        router.push('/auth/signin?next=/profile');
        return;
      }
      setUser(me);
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from('users').select('*').eq('id', me.id).single();
      setProfile(data);
      try {
        const r = await fetch(`/api/reliability/${me.id}`);
        if (r.ok) {
          const j = await r.json();
          setReliability({
            percent: j.reliability?.reliability_percent ?? null,
            completed: j.reliability?.completed_count ?? 0,
            broken: j.reliability?.broken_count ?? 0,
          });
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [router]);

  function update<K extends keyof Profile>(key: K, val: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: val } : p));
  }

  async function save() {
    if (!profile) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('users')
      .update({
        display_name: profile.display_name,
        phone: profile.phone,
        privacy_level: profile.privacy_level,
        accept_stranger_gifts: profile.accept_stranger_gifts,
        opt_in_random_exchange: profile.opt_in_random_exchange,
        avatar_url: profile.avatar_url,
      })
      .eq('id', profile.id);
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg('Saved.');
  }

  if (!user || !profile) {
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
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80, maxWidth: 720 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">You</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>Your profile</h1>
          </div>

          <div className="row gap-6 mb-8" style={{ alignItems: 'center' }}>
            <Avatar name={profile.display_name || profile.username} url={profile.avatar_url} size="lg" />
            <div>
              <div className="serif" style={{ fontSize: 22 }}>{profile.display_name || profile.username}</div>
              <div className="meta">@{profile.username}</div>
              {reliability && reliability.percent !== null && (
                <div className="meta mt-2">
                  <span
                    className="tag"
                    style={{
                      background: 'var(--moss-soft)',
                      borderColor: 'var(--moss-soft)',
                      color: '#2d4a25',
                      fontSize: 10,
                    }}
                  >
                    <span className="tag-dot" style={{ background: 'var(--moss)' }} />
                    Showed up {reliability.percent}% — {reliability.completed} kept, {reliability.broken} not
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="stack gap-6">
            <div className="field">
              <label className="field-label">Display name</label>
              <input
                className="input"
                value={profile.display_name || ''}
                onChange={(e) => update('display_name', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="input" value={profile.email || ''} disabled />
              <span className="meta">Email is managed by your account provider.</span>
            </div>
            <div className="field">
              <label className="field-label">Phone (for SMS / WhatsApp gifts)</label>
              <input
                className="input"
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 555 0100"
              />
            </div>

            <div className="field">
              <label className="field-label">Avatar URL (optional)</label>
              <input
                className="input"
                value={profile.avatar_url || ''}
                onChange={(e) => update('avatar_url', e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="stack gap-6 mt-12">
            <div className="eyebrow">Who can send you gifts</div>
            <div className="stack gap-3">
              {(['public', 'friends', 'closed'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => update('privacy_level', level)}
                  style={{
                    background: profile.privacy_level === level ? 'var(--paper-warm)' : 'transparent',
                    border:
                      '1px solid ' +
                      (profile.privacy_level === level ? 'var(--ink)' : 'var(--hairline)'),
                    padding: '16px 18px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div className="serif" style={{ fontSize: 17 }}>
                    {level === 'public' && 'Anyone'}
                    {level === 'friends' && 'Friends only'}
                    {level === 'closed' && 'Closed'}
                  </div>
                  <div className="meta mt-1">
                    {level === 'public' && 'Any user can send you a gift.'}
                    {level === 'friends' && 'Only people you’ve accepted as friends can send.'}
                    {level === 'closed' && 'No one can send you gifts. Email/phone strangers still need accept_stranger_gifts on.'}
                  </div>
                </button>
              ))}
            </div>

            <label
              className="row gap-3"
              style={{ alignItems: 'flex-start', cursor: 'pointer', padding: 16, border: '1px solid var(--hairline)', borderRadius: 6 }}
            >
              <input
                type="checkbox"
                checked={profile.accept_stranger_gifts}
                onChange={(e) => update('accept_stranger_gifts', e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <div>
                <div className="serif" style={{ fontSize: 16 }}>Accept gifts from strangers</div>
                <div className="meta">Allows email/phone-only senders even if you’re friends-only or closed.</div>
              </div>
            </label>

            <label
              className="row gap-3"
              style={{ alignItems: 'flex-start', cursor: 'pointer', padding: 16, border: '1px solid var(--hairline)', borderRadius: 6 }}
            >
              <input
                type="checkbox"
                checked={profile.opt_in_random_exchange}
                onChange={(e) => update('opt_in_random_exchange', e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <div>
                <div className="serif" style={{ fontSize: 16 }}>Opt in to random exchange</div>
                <div className="meta">Once a month you’ll be matched with another opted-in user for a mutual gift.</div>
              </div>
            </label>
          </div>

          {(msg || err) && (
            <div
              className="mt-6"
              style={{
                padding: 12,
                border: '1px solid ' + (err ? 'var(--rose-soft)' : 'var(--moss-soft)'),
                background: err ? 'var(--rose-soft)' : 'var(--moss-soft)',
                color: err ? '#5b2228' : '#2d4a25',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              {err || msg}
            </div>
          )}

          <div className="row between mt-8" style={{ paddingTop: 24, borderTop: '1px solid var(--hairline-soft)' }}>
            <a href="/auth/signout" className="btn-quiet">
              <Icon name="x" size={14} /> Sign out
            </a>
            <button className="btn btn-accent" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
