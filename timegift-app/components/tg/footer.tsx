import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--hairline-soft)', padding: '40px 0', marginTop: 40 }}>
      <div className="container row between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="meta">© 2026 Timegift · A small, deliberate thing</div>
        <div className="row gap-6 meta">
          <Link href="/about">About</Link>
          <Link href="/about#privacy">Privacy</Link>
          <Link href="/about#help">Help</Link>
        </div>
      </div>
    </footer>
  );
}
