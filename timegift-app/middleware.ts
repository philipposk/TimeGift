import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { sharedCookieOptions } from './lib/supabase/cookies';
import { trackAppAccess } from './lib/app-access';

// Refreshes the shared 6x7 session (cookie sb-6x7-auth on .6x7.gr) on every page
// load and records TimeGift usage in public.app_access, like the other 6x7 apps.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder')) return response;

  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name === sharedCookieOptions.name || c.name.startsWith(`${sharedCookieOptions.name}.`));
  if (!hasSession) return response;

  const supabase = createServerClient(url, key, {
    cookieOptions: sharedCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const result = (await Promise.race([
    supabase.auth.getUser(),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ])) as { data?: { user?: { id: string } | null } } | undefined;
  await trackAppAccess(supabase, result?.data?.user, request, response, 'timegift');
  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
