import type { Metadata } from 'next';
import Link from 'next/link';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { ThemePicker } from '@/components/tg/theme-picker';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: true },
};

export default function SettingsPage() {
  return (
    <>
      <TopNav />
      <main>
        <section style={{ paddingTop: 60, paddingBottom: 60 }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div className="eyebrow">Settings</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1.05, marginTop: 16 }}>Settings</h1>
            <div className="card" style={{ marginTop: 32, padding: 24 }}>
              <h2 style={{ fontSize: 22, margin: 0 }}>Appearance</h2>
              <p style={{ color: 'var(--muted)', marginTop: 6, marginBottom: 16 }}>
                Auto follows your device&apos;s light or dark setting.
              </p>
              <ThemePicker />
            </div>
            <div className="card" style={{ marginTop: 16, padding: 24 }}>
              <h2 style={{ fontSize: 22, margin: 0 }}>Account</h2>
              <p style={{ color: 'var(--muted)', marginTop: 6, marginBottom: 0 }}>
                Name, photo, privacy and gift preferences live on your{' '}
                <Link href="/profile" style={{ color: 'var(--accent-ink)', textDecoration: 'underline' }}>profile</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
