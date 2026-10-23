'use client';
import { useEffect, useState } from 'react';
import { applyMode, readMode, type ThemeMode } from '@/lib/theme';

const OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
];

export function ThemePicker() {
  const [mode, setMode] = useState<ThemeMode>('auto');
  useEffect(() => {
    setMode(readMode());
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (readMode() === 'auto') applyMode('auto'); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return (
    <div role="radiogroup" aria-label="Appearance" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={mode === o.id}
          className={mode === o.id ? 'btn' : 'btn btn-ghost'}
          style={{ minWidth: 88, minHeight: 44 }}
          onClick={() => { setMode(o.id); applyMode(o.id); }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
