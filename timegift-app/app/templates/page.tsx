'use client';

import Link from 'next/link';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';

const TEMPLATES = [
  {
    occasion: 'Birthday',
    snippet: 'For your birthday — three hours of me, anywhere in the city. Pick the place.',
    amount: '3 hours',
  },
  {
    occasion: 'Apology',
    snippet: "I'm sorry. I'd like to make it right with an hour and a real conversation.",
    amount: '1 hour',
  },
  {
    occasion: 'Thank you',
    snippet: 'You helped me through a hard month. Whatever you need this Saturday, I&apos;m there.',
    amount: 'A day',
  },
  {
    occasion: 'Just because',
    snippet: 'No reason. Saw something the other day and thought of you. Coffee?',
    amount: '90 minutes',
  },
  {
    occasion: 'Holiday',
    snippet: 'Happy holidays. The afternoon of the 27th is yours if you want it.',
    amount: '4 hours',
  },
  {
    occasion: 'Help with a project',
    snippet: "Saturday I bring the truck and the pizza. You point at things and I lift them.",
    amount: '2 hours',
  },
];

export default function TemplatesPage() {
  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
          <div className="stack gap-2 mb-8">
            <div className="eyebrow">Letters that already worked</div>
            <h1 style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
              <em style={{ color: 'var(--accent)' }}>Starting</em> points.
            </h1>
            <p className="lede muted" style={{ maxWidth: 540, marginTop: 8 }}>
              Borrow one if you&apos;re stuck. Rewrite it in your voice — that&apos;s the part that matters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TEMPLATES.map((t) => (
              <div key={t.occasion} className="card-letter">
                <div className="eyebrow mb-2">{t.occasion}</div>
                <div className="serif italic" style={{ fontSize: 16, color: 'var(--accent)' }}>{t.amount}</div>
                <hr className="hr mt-4 mb-4" />
                <p className="handwritten" style={{ fontSize: 17, lineHeight: 1.5 }}>
                  {t.snippet}
                </p>
                <Link
                  href={`/create?occasion=${encodeURIComponent(t.occasion)}`}
                  className="btn btn-ghost mt-6"
                  style={{ fontSize: 12.5, padding: '8px 14px' }}
                >
                  Start from this
                </Link>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
