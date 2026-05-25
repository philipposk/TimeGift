'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

interface Props {
  onToken: (token: string) => void;
  action?: string;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Cloudflare Turnstile widget. No-ops gracefully when NEXT_PUBLIC_TURNSTILE_SITE_KEY
// is missing - the parent can still submit, but server-side verifyTurnstile()
// will let it through too.
export function Turnstile({ onToken, action }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    const id = 'cf-turnstile-loader';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    const tryRender = () => {
      if (window.turnstile && ref.current && widgetId.current === null) {
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          action,
          callback: (token: string) => onToken(token),
          'error-callback': () => onToken(''),
          'expired-callback': () => onToken(''),
        });
      }
    };
    const interval = setInterval(tryRender, 200);
    return () => {
      clearInterval(interval);
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onToken, action]);

  if (!SITE_KEY) return null;
  return <div ref={ref} />;
}
