import Avatar from 'boring-avatars';

interface AvatarProps {
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  url?: string | null;
}

// Paper-tone palette for boring-avatars marble fallbacks.
const PALETTE = ['#a8501e', '#4e6b3d', '#6b5b8b', '#ebe2d0', '#1b1816'];

const SIZES = { sm: 28, md: 36, lg: 52 };

export function Avatar({ name, size = 'md', url }: AvatarProps) {
  const px = SIZES[size];
  const cls = size === 'sm' ? 'avatar sm' : size === 'lg' ? 'avatar lg' : 'avatar';

  if (url) {
    return (
      <div className={cls} style={{ padding: 0, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  // Deterministic boring-avatar from the display name (or '?'). Wrapped in our
  // existing .avatar shell for border/background parity.
  const seed = (name || '?').trim();
  return (
    <div className={cls} style={{ padding: 0, overflow: 'hidden', background: 'transparent' }}>
      <Avatar size={px} name={seed} variant="marble" colors={PALETTE} />
    </div>
  );
}
