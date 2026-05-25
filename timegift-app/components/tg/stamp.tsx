interface StampProps {
  amount: number;
  unit: string; // 'minutes' | 'hours' | 'days'
  year?: number | string;
  className?: string;
}

// Postage-stamp motif in the top-right of letter/envelope cards.
export function Stamp({ amount, unit, year = new Date().getFullYear(), className }: StampProps) {
  const short = unit ? unit[0] : '';
  return (
    <div className={`stamp ${className || ''}`}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
          Timegift
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: 16 }}>
          {amount}{short}
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.1em' }}>{year}</div>
      </div>
    </div>
  );
}
