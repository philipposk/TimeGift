'use client';

// Simple native audio player for voice memos. Wavesurfer can come later -
// the native control already matches the editorial aesthetic when wrapped
// in our paper card.
interface Props {
  url: string;
  durationSeconds?: number | null;
}

export function VoicePlayer({ url, durationSeconds }: Props) {
  return (
    <div
      style={{
        padding: 12,
        background: 'var(--paper-warm)',
        border: '1px solid var(--hairline-soft)',
        borderRadius: 6,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <audio src={url} controls style={{ flex: 1 }} />
      {durationSeconds && <span className="meta">{durationSeconds}s</span>}
    </div>
  );
}
