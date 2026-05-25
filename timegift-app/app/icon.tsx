import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Editorial paper-stamp favicon. Tg in serif on warm paper, amber accent.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4efe6',
          color: '#1b1816',
          fontFamily: 'Georgia, serif',
          fontSize: 40,
          letterSpacing: '-0.04em',
          borderRadius: 8,
          border: '2px solid #d9d0bf',
        }}
      >
        T<span style={{ color: '#a8501e', fontStyle: 'italic' }}>g</span>
      </div>
    ),
    { ...size }
  );
}
