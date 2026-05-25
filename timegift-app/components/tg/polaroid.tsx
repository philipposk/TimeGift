interface PolaroidProps {
  caption?: string | null;
  meta?: string;
  imageUrl?: string | null;
  placeholder?: string;
  rotate?: number;
  onClick?: () => void;
}

export function Polaroid({ caption, meta, imageUrl, placeholder, rotate = 0, onClick }: PolaroidProps) {
  return (
    <div
      className="polaroid"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      <div className="polaroid-img" style={{ background: imageUrl ? 'transparent' : 'var(--paper-warm)' }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={caption || 'memory'} />
        ) : (
          <span style={{ color: 'var(--muted-2)', fontStyle: 'italic' }}>{placeholder || '·'}</span>
        )}
      </div>
      {caption && <div className="polaroid-cap">&ldquo;{caption}&rdquo;</div>}
      {meta && <div className="meta center" style={{ marginTop: 8 }}>{meta}</div>}
    </div>
  );
}
