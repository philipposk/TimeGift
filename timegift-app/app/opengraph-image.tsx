import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Timegift — give someone your time';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f4efe6',
          color: '#1b1816',
          padding: 64,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
          }}
        >
          Time<span style={{ color: '#a8501e', fontStyle: 'italic' }}>gift</span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6f6962',
              borderLeft: '1px solid #d9d0bf',
              paddingLeft: 12,
              alignSelf: 'center',
            }}
          >
            Est. 2026
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6f6962',
              marginBottom: 24,
            }}
          >
            No. 001 · A small, deliberate idea
          </div>
          <div style={{ fontSize: 132, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
            Give someone
          </div>
          <div
            style={{
              fontSize: 132,
              lineHeight: 0.95,
              letterSpacing: '-0.025em',
              color: '#a8501e',
              fontStyle: 'italic',
            }}
          >
            your time.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#6f6962',
            fontSize: 22,
            borderTop: '1px solid #d9d0bf',
            paddingTop: 24,
          }}
        >
          <div>A morning. A long walk. The whole of next Sunday.</div>
          <div style={{ fontStyle: 'italic' }}>timegift.fly.dev</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
