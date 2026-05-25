interface AvatarProps {
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  url?: string | null;
}

export function Avatar({ name, size = 'md', url }: AvatarProps) {
  const cls = size === 'sm' ? 'avatar sm' : size === 'lg' ? 'avatar lg' : 'avatar';
  if (url) {
    return (
      <div className={cls} style={{ padding: 0, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return <div className={cls}>{initial}</div>;
}
