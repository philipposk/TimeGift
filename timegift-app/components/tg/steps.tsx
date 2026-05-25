import React from 'react';

interface StepsProps {
  current: number;
  items: { n: number; label: string }[];
}

export function Steps({ current, items }: StepsProps) {
  return (
    <div className="steps">
      {items.map((it, i) => (
        <React.Fragment key={it.n}>
          <div className={'step ' + (current === it.n ? 'active' : current > it.n ? 'done' : '')}>
            <span className="step-num">{current > it.n ? '✓' : it.n}</span>
            <span className="step-label">{it.label}</span>
          </div>
          {i < items.length - 1 && <span className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}
