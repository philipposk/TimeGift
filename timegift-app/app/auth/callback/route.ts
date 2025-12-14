import { NextResponse } from 'next/server';

// Firebase handles OAuth callbacks automatically via popup/redirect
// This route is kept for compatibility but Firebase handles auth state client-side
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/dashboard';
  
  // Firebase OAuth completes on the client side
  // Just redirect to the intended destination
  return NextResponse.redirect(`${origin}${next}`);
}
