'use client';

import { Stamp } from './stamp';
import { Avatar } from './avatar';
import { VoicePlayer } from './voice-player';
import { formatDuration } from '@/lib/time-format';

interface LetterViewProps {
  amountMinutes: number;
  unit: string;
  purposeType: string;
  purposeDetails?: string | null;
  message: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  senderInitial?: string;
  sentAt?: string | null;
  voiceUrl?: string | null;
  voiceDurationSeconds?: number | null;
  rightColumn?: React.ReactNode;
}

export function LetterView({
  amountMinutes,
  unit,
  purposeType,
  purposeDetails,
  message,
  senderName,
  senderAvatarUrl,
  senderInitial,
  sentAt,
  voiceUrl,
  voiceDurationSeconds,
  rightColumn,
}: LetterViewProps) {
  const initial = senderInitial || (senderName || '?').charAt(0).toUpperCase();
  const purpose = purposeType === 'specific' && purposeDetails ? purposeDetails : 'anything you want';
  const niceAmount = amountMinutes / 60;
  const stampUnit = niceAmount >= 1 ? 'hours' : 'minutes';
  const stampAmount = niceAmount >= 1 ? Math.round(niceAmount) : amountMinutes;
  const sent = sentAt ? new Date(sentAt) : null;

  return (
    <div className="envelope">
      <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>From</div>
          <div className="row gap-3">
            <Avatar name={senderName} url={senderAvatarUrl} size="lg" />
            <div>
              <div className="serif" style={{ fontSize: 22 }}>{senderName}</div>
              {sent && (
                <div className="meta">
                  {sent.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>
        <Stamp amount={stampAmount} unit={stampUnit} />
      </div>

      <hr className="hr mb-8" />

      <div className="stack gap-3" style={{ marginBottom: 32 }}>
        <div className="eyebrow">They&apos;re giving you</div>
        <div className="serif" style={{ fontSize: 52, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {formatDuration(amountMinutes)}
        </div>
        <div className="serif italic" style={{ fontSize: 22, color: 'var(--accent)' }}>
          for {purpose.toLowerCase()}
        </div>
      </div>

      <hr className="hr mb-6" />

      <p className="handwritten" style={{ fontSize: 22, lineHeight: 1.6, marginBottom: 24 }}>
        {message}
      </p>
      <p className="handwritten" style={{ textAlign: 'right', color: 'var(--accent)' }}>
        — {(senderName || '').split(' ')[0] || initial}.
      </p>

      {voiceUrl && (
        <div style={{ marginTop: 24 }}>
          <div className="eyebrow mb-2">In their voice</div>
          <VoicePlayer url={voiceUrl} durationSeconds={voiceDurationSeconds} />
        </div>
      )}

      {rightColumn}
    </div>
  );
}
