// Centralized display helpers for time-amount values.
// All gift.time_amount values in the DB are stored as MINUTES regardless of
// the unit the sender chose. These helpers turn minutes into human strings
// without ugly leftover-minutes artifacts caused by decay.

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0 minutes';

  const totalMin = Math.round(minutes);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (mins > 0 && days === 0) parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ') || '0 minutes';
}

// Rounded display for analytics: show in hours with 1 decimal.
export function toDisplayHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}
