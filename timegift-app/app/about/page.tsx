import Link from 'next/link';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <main>
        <section style={{ paddingTop: 60, paddingBottom: 40 }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div className="eyebrow">About</div>
            <h1 style={{ fontSize: 64, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 16 }}>
              A small, deliberate <em style={{ color: 'var(--accent)' }}>thing</em>.
            </h1>
            <p className="lede mt-6">
              Most gift apps want you to spend money. Timegift wants you to spend a Sunday. Or a phone
              call. Or the afternoon you keep meaning to give someone and haven&apos;t.
            </p>
          </div>
        </section>

        <section
          className="section-tight"
          style={{
            background: 'var(--paper-warm)',
            borderTop: '1px solid var(--hairline-soft)',
            borderBottom: '1px solid var(--hairline-soft)',
          }}
        >
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 className="serif" style={{ fontSize: 32 }}>How it works</h2>
            <ol
              className="stack gap-3 mt-4"
              style={{ paddingLeft: 18, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)' }}
            >
              <li>You write a letter. Pick who, how much time, what for.</li>
              <li>We send the letter via email or text. They don&apos;t need an account.</li>
              <li>They open it, accept it, pick a time. You both get the date.</li>
              <li>After it happens, drop a photo or a sentence. It stays in your private shelf.</li>
            </ol>
          </div>
        </section>

        <section className="section" id="privacy">
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 className="serif" style={{ fontSize: 32 }}>Privacy</h2>
            <p className="muted mt-4" style={{ fontSize: 15, lineHeight: 1.65 }}>
              Only you and the recipient can see a gift. Memories are private to the two of you. We
              don&apos;t sell your data. We never have ads on letters. The rest of our policy is the boring,
              honest version of the same thing.
            </p>
          </div>
        </section>

        <section className="section-tight" id="help" style={{ borderTop: '1px solid var(--hairline-soft)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <h2 className="serif" style={{ fontSize: 32 }}>Help</h2>
            <p className="muted mt-4" style={{ fontSize: 15, lineHeight: 1.65 }}>
              Something not working? Email us at hi@timegift — we&apos;ll write back. We&apos;re a small team
              and a few people.
            </p>
            <div className="row gap-3 mt-6">
              <Link href="/create" className="btn">
                <Icon name="feather" size={14} /> Write a gift
              </Link>
              <Link href="/" className="btn btn-ghost">
                Back home
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
