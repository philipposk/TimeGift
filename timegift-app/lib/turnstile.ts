// Server-side Cloudflare Turnstile verify.
// When TURNSTILE_SECRET_KEY is missing the function returns true (passthrough)
// so the app keeps working in dev / before Cloudflare is wired.
export async function verifyTurnstile(token: string | undefined | null, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    return !!json.success;
  } catch (err) {
    console.error('Turnstile verify failed:', err);
    return false;
  }
}
