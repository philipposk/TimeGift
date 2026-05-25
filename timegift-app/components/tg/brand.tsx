'use client';
import Link from 'next/link';

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="brand">
      <span className="brand-mark">Time<em>gift</em></span>
      <span className="brand-tag">est. 2026</span>
    </Link>
  );
}
