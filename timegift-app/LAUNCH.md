# Timegift — launch checklist

Everything you need to take the app from "code shipped" to "real users".
Steps are ordered: do them top-to-bottom and you're live.

---

## 0. State right now

- Live: <https://timegift.fly.dev> (built on commit `db857f0` from the previous round)
- Code in `main`: commit `288f0b3` — includes all new features below but **not yet deployed**
- Supabase project: `jgcrxqwbckaztkxpbkxv` (eu-west-1), migrations #1 + #2 applied
- Migration #3 is in `timegift-app/supabase-migrations-3.sql` — **not yet applied**
- GitHub Actions cron workflow is live and hitting `timegift.fly.dev`

---

## 1. Generate / paste credentials

Paste these to me in the chat (whatever you have — features without
matching creds just stay dormant):

```
SUPABASE_PAT      = sbp_...                   # Supabase dashboard → Account → Tokens
FLY_TOKEN         = FlyV1 fm2_...             # fly.io dashboard → Tokens → Create
RESEND_API_KEY    = re_...                    # resend.com → API Keys
RESEND_FROM_EMAIL = "Timegift <hello@..>"     # must be on a Resend-verified domain
TURNSTILE_SITE_KEY    = 0x4AAA...             # dash.cloudflare.com → Turnstile (optional)
TURNSTILE_SECRET_KEY  = 0x4AAA...
SENTRY_DSN              = https://..@sentry.io/...    # optional
NEXT_PUBLIC_SENTRY_DSN  = https://..@sentry.io/...    # same value, exposed to browser
```

### VAPID keys (push notifications) — already generated:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BBN_NppYjV2V0fPtnxOPWOelOta2A72jbXkLp4B_qhqwmnbSDa9UXyLL0kcfQRDbx_Hw_xUYBhewCQ3NFzD-NJI
VAPID_PRIVATE_KEY            = jcZeVWrC9fBR_U00Uxiwjfv68Iki_TqkpS7vxfGIX2g
VAPID_SUBJECT                = mailto:hello@timegift.fly.dev
```

(If you want fresh ones, run `npx web-push generate-vapid-keys` in `timegift-app/`.)

---

## 2. Apply migration #3 to Supabase

Open Supabase Studio → SQL Editor → paste the contents of
`timegift-app/supabase-migrations-3.sql` → Run.

It adds:
- `push_subscriptions`, `gift_contributions`, `group_gift_invites`, `wishes`,
  `offers` tables
- new columns on `gifts` (`voice_url`, `voice_duration_seconds`,
  `legacy_visible_at`, `flagged_for_review`, `flag_reason`, `is_group`,
  `group_closed_at`)
- new columns on `friendships` (`cadence_days`, `last_gift_at`,
  `cadence_warned_at`)
- the `user_reliability` SQL view
- the `voice` storage bucket + its RLS policies
- index on `gifts.completed_at` (for the on-this-day cron)

It's idempotent — safe to re-run.

---

## 3. Set Fly secrets

```bash
fly secrets set \
  RESEND_API_KEY="re_..." \
  RESEND_FROM_EMAIL="Timegift <hello@your-domain>" \
  NEXT_PUBLIC_VAPID_PUBLIC_KEY="BBN_NppYjV2V0fPtnxOPWOelOta2A72jbXkLp4B_qhqwmnbSDa9UXyLL0kcfQRDbx_Hw_xUYBhewCQ3NFzD-NJI" \
  VAPID_PRIVATE_KEY="jcZeVWrC9fBR_U00Uxiwjfv68Iki_TqkpS7vxfGIX2g" \
  VAPID_SUBJECT="mailto:hello@timegift.fly.dev" \
  NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x..." \
  TURNSTILE_SECRET_KEY="0x..." \
  SENTRY_DSN="https://..@sentry.io/..." \
  NEXT_PUBLIC_SENTRY_DSN="https://..@sentry.io/..." \
  -a timegift
```

Existing secrets stay (Supabase URL/keys, OPENAI_API_KEY, CRON_SECRET).

`fly secrets set` triggers a deploy automatically.

---

## 4. Custom domain (timegift.6x7.gr)

```bash
fly certs add timegift.6x7.gr -a timegift
fly certs show timegift.6x7.gr -a timegift
```

Add the DNS records it asks for (one A/AAAA record + one TXT for ACME challenge)
in your DNS provider. Wait 1-5 minutes, then `fly certs show` will report
`Status: Ready`.

Then update the env var so emails + OG image URLs are correct:

```bash
fly secrets set NEXT_PUBLIC_APP_URL="https://timegift.6x7.gr" -a timegift
```

And update the GitHub repo secret:

```bash
gh secret set APP_BASE_URL --body "https://timegift.6x7.gr" --repo philipposk/TimeGift
```

---

## 5. Supabase: turn off email confirmation (or wire SMTP)

In Supabase Studio → Authentication → Providers → Email:

**Fast option (good for soft launch):**
- Toggle off "Confirm email"
- Users sign up + sign in immediately

**Proper option (recommended for public launch):**
- Settings → Auth → SMTP Settings → enable custom SMTP
  - Host: `smtp.resend.com`
  - Port: `465`
  - User: `resend`
  - Password: your Resend API key
  - Sender email: same as `RESEND_FROM_EMAIL`
- Leave "Confirm email" on
- Confirmation emails now deliver via Resend with no rate limit

---

## 6. OAuth providers (Google + Facebook)

Supabase Studio → Authentication → Providers:

- **Google**: console.cloud.google.com → APIs → Credentials → OAuth client ID
  → Web application. Authorized redirect URI:
  `https://jgcrxqwbckaztkxpbkxv.supabase.co/auth/v1/callback`.
  Paste client ID + secret into Supabase.
- **Facebook**: developers.facebook.com → My Apps → Facebook Login → Web.
  Same redirect URI. Paste app ID + secret into Supabase.

(If you don't want OAuth, just remove the Google/Facebook buttons from
`app/auth/signin/page.tsx` + `app/auth/signup/page.tsx`.)

---

## 7. Create the first admin / test account

After steps 1-5: go to `https://timegift.fly.dev/auth/signup` (or your custom
domain) and sign up normally with your real email.

Then in Supabase Studio → SQL Editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

This lets you visit `/admin` to tweak settings (decay rate, notification
channels) without redeploying.

---

## 8. Smoke test (after deploy + migration)

```bash
# Home + public pages
curl -fsS -o /dev/null -w "HTTP %{http_code} /\n"          https://timegift.fly.dev/
curl -fsS -o /dev/null -w "HTTP %{http_code} /privacy\n"   https://timegift.fly.dev/privacy
curl -fsS -o /dev/null -w "HTTP %{http_code} /terms\n"     https://timegift.fly.dev/terms
curl -fsS -o /dev/null -w "HTTP %{http_code} OG\n"         https://timegift.fly.dev/opengraph-image
curl -fsS -o /dev/null -w "HTTP %{http_code} robots\n"     https://timegift.fly.dev/robots.txt
curl -fsS -o /dev/null -w "HTTP %{http_code} sitemap\n"    https://timegift.fly.dev/sitemap.xml
curl -fsS -o /dev/null -w "HTTP %{http_code} manifest\n"   https://timegift.fly.dev/manifest.json
curl -fsS -o /dev/null -w "HTTP %{http_code} sw\n"         https://timegift.fly.dev/sw.js

# Auth required (expect 401)
curl -fsS -o /dev/null -w "HTTP %{http_code} reminders\n"  https://timegift.fly.dev/api/reminders

# Cron auth check (expect 401 without bearer)
curl -fsS -o /dev/null -w "HTTP %{http_code} cron\n" -X POST https://timegift.fly.dev/api/cron/cadence

# End-to-end as a real user:
# 1. Sign up → confirm you land on /dashboard
# 2. /create → write a gift to your other email → click Send
# 3. Check your other email → click the link in the gift-received email
# 4. /g/[token] page opens → click "Claim this gift"
# 5. Accept + pick a date → check that an .ics is in your acceptance email
# 6. Mark complete → /gifts/[id]/memory → add a photo + sentence
# 7. /memories → polaroid appears
# 8. /friends → import .vcf, set a cadence
# 9. /wishlist → add a wish
# 10. /browse → post an offer
```

---

## 9. Manual cron trigger (sanity-check it fires)

```bash
gh workflow run cron.yml --repo philipposk/TimeGift -f route=all
gh run watch --repo philipposk/TimeGift
```

Each call prints the cron route's JSON response.

---

## 10. What's still optional / nice-to-have

These are not blockers — ship without them, add later:

- **Lob postcard upsell** — opt-in print of a gift as a real card. Schema +
  Stripe needed. The only revenue path that doesn't paywall the core.
- **Storyworth-style yearly book** — `@react-pdf/renderer` is already
  installed, the cron could generate a per-user PDF in December.
- **Birthday/anniversary auto-import** — Google People API or the `.vcf`
  importer already in `/friends`.
- **PWA install banner copy** — currently we only ask for push, not install.
  Worth adding a tiny "Install Timegift to your home screen" once per device.
- **Cookie consent banner** — only if you target EU + add analytics.

---

## 11. Day-2 ops

- **Daily backups**: Supabase free tier keeps 7 days. Once you have real
  users, upgrade to Pro for point-in-time recovery.
- **Logs**: `fly logs -a timegift` for app logs. Sentry catches errors
  (once `SENTRY_DSN` is set).
- **Storage costs**: voice memos + memory photos go in Supabase Storage.
  Free tier is 1 GB. Set up a monthly check.
- **Email volume**: Resend free tier is 3,000 emails/month. With cadence
  reminders + on-this-day for ~500 users you'll cross it. Upgrade to Pro
  at that point (~$20/mo for 50k).
