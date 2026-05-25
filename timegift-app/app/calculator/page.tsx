'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';
import { Icon } from '@/components/tg/icon';

export default function CalculatorPage() {
  const [age, setAge] = useState(30);
  const [target, setTarget] = useState(80);

  const yearsLeft = Math.max(0, target - age);
  const weeksLeft = yearsLeft * 52;
  const sundaysLeft = weeksLeft;
  const hoursLeft = yearsLeft * 365 * 24;

  return (
    <>
      <TopNav />
      <main>
        <div className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 720 }}>
          <div className="eyebrow">A small reminder</div>
          <h1 style={{ fontSize: 56, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 12 }}>
            How many <em style={{ color: 'var(--accent)' }}>Sundays</em> are left?
          </h1>
          <p className="lede mt-6">
            Not the morbid version. The version where you write one of them down and send it to someone.
          </p>

          <div className="stack gap-6 mt-12">
            <div className="field">
              <label className="field-label">Your age</label>
              <input
                type="number"
                className="input-boxed"
                style={{ width: 120, fontFamily: 'var(--serif)', fontSize: 28, textAlign: 'center' }}
                value={age}
                onChange={(e) => setAge(Math.max(0, Math.min(120, parseInt(e.target.value) || 0)))}
              />
            </div>
            <div className="field">
              <label className="field-label">Years you&apos;d like to plan for</label>
              <input
                type="number"
                className="input-boxed"
                style={{ width: 120, fontFamily: 'var(--serif)', fontSize: 28, textAlign: 'center' }}
                value={target}
                onChange={(e) => setTarget(Math.max(age, Math.min(120, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              background: 'var(--hairline-soft)',
              border: '1px solid var(--hairline-soft)',
              borderRadius: 6,
              overflow: 'hidden',
              marginTop: 48,
            }}
          >
            <Stat label="Sundays left" num={sundaysLeft.toLocaleString()} />
            <Stat label="Weeks left" num={weeksLeft.toLocaleString()} accent />
            <Stat label="Hours left" num={hoursLeft.toLocaleString()} />
          </div>

          <p className="lede mt-12 muted">
            Of those, how many will you spend with the people who matter? Maybe one less needs to be a question mark.
          </p>

          <div className="row gap-3 mt-8">
            <Link href="/create" className="btn btn-lg">
              <Icon name="feather" size={14} /> Write someone a Sunday
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

function Stat({ label, num, accent }: { label: string; num: string | number; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--paper)', padding: '28px 24px' }}>
      <div className="stat-label" style={{ marginBottom: 12 }}>{label}</div>
      <div className="stat-num" style={{ color: accent ? 'var(--accent)' : 'var(--ink)', fontSize: 44 }}>{num}</div>
    </div>
  );
}
