import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';

export const metadata = {
  title: 'Privacy — Timegift',
  description: 'How Timegift handles your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <TopNav />
      <main>
        <article className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 720 }}>
          <div className="eyebrow">Effective May 2026</div>
          <h1 style={{ fontSize: 56, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 12 }}>
            Privacy.
          </h1>
          <p className="lede mt-6">
            Plain English. The boring legal version says the same thing.
          </p>

          <section className="mt-12 stack gap-6" style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>What we collect</h2>
              <ul>
                <li>Your email, optional phone, username, display name, optional avatar URL.</li>
                <li>The TimeGifts you send and receive: message text, time amount, scheduled date, optional voice memo, optional memory photo + sentence.</li>
                <li>Friendships you create and any blocks or reports you file.</li>
                <li>Push notification subscription tokens, if you turn push on.</li>
                <li>Basic operational logs (errors, request paths) for keeping the app up.</li>
              </ul>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Who can see what</h2>
              <ul>
                <li><strong>Gift letters</strong> are visible only to you, the recipient, and (for group gifts) the people you invite.</li>
                <li><strong>Memories</strong> are visible only to the sender and the recipient.</li>
                <li><strong>Profile</strong> visibility is governed by your privacy setting: public, friends-only, or closed.</li>
                <li><strong>Wishlist</strong> items marked &ldquo;visible to friends&rdquo; are visible only to accepted friends.</li>
                <li><strong>Offers on /browse</strong> are visible to any signed-in user.</li>
              </ul>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Third parties we share data with</h2>
              <ul>
                <li><strong>Supabase</strong> hosts our database, authentication, and storage (EU-West region).</li>
                <li><strong>Fly.io</strong> hosts our app servers.</li>
                <li><strong>Resend</strong> sends our transactional emails (gift letters, reminders).</li>
                <li><strong>Vonage / WhatsApp</strong> deliver SMS / WhatsApp messages when those channels are configured.</li>
                <li><strong>OpenAI / Groq</strong> generate AI message drafts and suggestions; only the prompt context is sent.</li>
                <li><strong>Cloudflare Turnstile</strong> protects sign-up and public claim flows from bots; no PII shared.</li>
              </ul>
              <p>We do not sell your data. We do not run ads inside letters.</p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Your rights</h2>
              <ul>
                <li>Export everything you&apos;ve put in: email hello@timegift.fly.dev and we&apos;ll send you a JSON dump.</li>
                <li>Delete your account: same email, we remove the row and cascade everything associated.</li>
                <li>Object to any specific processing: ask, we will explain or remove.</li>
              </ul>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>How long we keep things</h2>
              <p>
                Gifts and memories: until you delete them or your account. Notification rows: 12 months.
                Push subscriptions: until the browser invalidates them. Operational logs: 30 days.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Cookies</h2>
              <p>
                We use one essential cookie for your sign-in session. We do not run third-party tracking
                cookies or analytics that profile you.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Contact</h2>
              <p>hello@timegift.fly.dev</p>
            </div>
          </section>
        </article>
        <Footer />
      </main>
    </>
  );
}
