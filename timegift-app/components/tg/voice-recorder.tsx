'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';

interface Props {
  onRecorded: (blob: Blob, durationSeconds: number) => void;
  maxSeconds?: number;
}

// Editorial inline voice recorder for the gift composer.
// Records up to maxSeconds (default 90s) of audio/webm and hands the blob
// back to the parent for upload.
export function VoiceRecorder({ onRecorded, maxSeconds = 90 }: Props) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      setSupported(false);
    }
  }, []);

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setRecording(false);
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const rec = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stream.getTracks().forEach((t) => t.stop());
        setPreview(URL.createObjectURL(blob));
        onRecorded(blob, elapsedRef.current);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      tickRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= maxSeconds) stop();
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Microphone access denied.');
    }
  }

  const elapsedRef = useRef(0);

  if (!supported) {
    return <div className="meta">Voice memos need a browser with microphone support.</div>;
  }

  return (
    <div className="stack gap-3">
      {preview ? (
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <audio src={preview} controls style={{ flex: 1 }} />
          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              setPreview(null);
              chunksRef.current = [];
              onRecorded(new Blob(), 0);
            }}
            style={{ fontSize: 12.5 }}
          >
            <Icon name="x" size={12} /> Discard
          </button>
        </div>
      ) : recording ? (
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--accent)',
              animation: 'tg-pulse 1s infinite',
            }}
          />
          <span className="serif italic" style={{ fontSize: 16, flex: 1 }}>
            Recording… {elapsed}s
          </span>
          <button type="button" className="btn" onClick={stop} style={{ padding: '8px 14px', fontSize: 12.5 }}>
            <Icon name="check" size={12} /> Stop
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost" onClick={start} style={{ padding: '8px 14px', fontSize: 12.5, alignSelf: 'flex-start' }}>
          <Icon name="phone" size={12} /> Record a voice memo (up to {maxSeconds}s)
        </button>
      )}
      {error && <div className="meta" style={{ color: '#5b2228' }}>{error}</div>}
      <style jsx>{`
        @keyframes tg-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
