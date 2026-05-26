'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signInWithGoogle, signInWithFacebook } from '@/utils/auth';
import { TopNav } from '@/components/tg/nav';
import { Icon } from '@/components/tg/icon';
import { Turnstile } from '@/components/tg/turnstile';

function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turnstileRequired = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          username: username.trim(),
          displayName: displayName.trim() || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Sign-up failed.');
        setBusy(false);
        return;
      }
      if (json.requireConfirmation) {
        setNeedsConfirm(true);
        setBusy(false);
        return;
      }
      // Auto-confirmed: sign in immediately to get the cookie session.
      await signIn(email.trim(), password);
      router.push(next);
    } catch (e: any) {
      setError(e?.message || 'Sign-up failed.');
      setBusy(false);
    }
  }

  if (needsConfirm) {
    return (
      <div className="stack gap-4 center">
        <div className="serif" style={{ fontSize: 22 }}>Check your email.</div>
        <div className="meta">
          We sent a confirmation link to <strong>{email}</strong>. Open it to finish signing up, then come
          back here.
        </div>
        <Link href={`/auth/signin?next=${encodeURIComponent(next)}`} className="btn mt-4">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="stack gap-6">
      <div className="field">
        <label className="field-label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div className="field">
        <label className="field-label">Username</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          required
          pattern="[a-z0-9_]{2,24}"
          minLength={2}
          maxLength={24}
        />
        <span className="meta">a-z, 0-9 and _, 2-24 chars</span>
      </div>
      <div className="field">
        <label className="field-label">Display name (optional)</label>
        <input
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <span className="meta">at least 8 characters</span>
      </div>

      <Turnstile onToken={setTurnstileToken} action="signup" />

      {error && (
        <div
          style={{
            padding: 12,
            border: '1px solid var(--rose-soft)',
            background: 'var(--rose-soft)',
            color: '#5b2228',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-lg"
        disabled={busy || (turnstileRequired && !turnstileToken)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {busy ? 'Creating account...' : 'Create account'}
      </button>

      <div className="row gap-3" style={{ marginTop: 4 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
        <span className="meta">or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
      </div>

      <div className="stack gap-3">
        <button
          type="button"
          onClick={() => signInWithGoogle().catch((e) => setError(e.message))}
          className="btn btn-ghost"
          style={{ justifyContent: 'center' }}
        >
          <Icon name="globe" size={14} /> Continue with Google
        </button>
        <button
          type="button"
          onClick={() => signInWithFacebook().catch((e) => setError(e.message))}
          className="btn btn-ghost"
          style={{ justifyContent: 'center' }}
        >
          <Icon name="user" size={14} /> Continue with Facebook
        </button>
      </div>

      <div className="center meta mt-4">
        Already have an account?{' '}
        <Link
          href={`/auth/signin${next !== '/dashboard' ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="link"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <>
      <TopNav />
      <main>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px 80px' }}>
          <div className="card-letter" style={{ width: '100%', maxWidth: 440 }}>
            <div className="eyebrow mb-2">A small, deliberate thing</div>
            <h1 className="serif mb-6" style={{ fontSize: 32, letterSpacing: '-0.01em' }}>
              Create your account
            </h1>
            <Suspense fallback={<div className="muted">Loading...</div>}>
              <SignUpForm />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
