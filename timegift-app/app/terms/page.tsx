import { TopNav } from '@/components/tg/nav';
import { Footer } from '@/components/tg/footer';

export const metadata = {
  title: 'Terms — Timegift',
  description: 'The agreement between you and Timegift.',
};

export default function TermsPage() {
  return (
    <>
      <TopNav />
      <main>
        <article className="container" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 720 }}>
          <div className="eyebrow">Effective May 2026</div>
          <h1 style={{ fontSize: 56, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 12 }}>
            Terms.
          </h1>
          <p className="lede mt-6">Short version. Read all of it - it&apos;s short for a reason.</p>

          <section
            className="mt-12 stack gap-6"
            style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--ink-soft)' }}
          >
            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>What Timegift is</h2>
              <p>
                A service for writing and sending personal &ldquo;time gifts&rdquo; — promises of hours, days,
                or moments you spend with someone. Timegift does not guarantee that anyone will actually
                show up; that&apos;s on the people involved.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Your account</h2>
              <p>
                You must be at least 13. Keep your password safe. You&apos;re responsible for the gifts and
                memories created from your account.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Acceptable use</h2>
              <p>Don&apos;t use Timegift for:</p>
              <ul>
                <li>Harassment, threats, slurs, sexual content involving minors, doxxing, or stalking.</li>
                <li>Spamming people who haven&apos;t consented to receive messages from you.</li>
                <li>Anything illegal in your jurisdiction.</li>
                <li>Scraping the service or attempting to break it.</li>
              </ul>
              <p>
                We may suspend or delete accounts that violate these rules. We may flag letters for review;
                we don&apos;t auto-reject unless content is plainly illegal.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Your content</h2>
              <p>
                You own what you write, record, and photograph. You grant us a non-exclusive license to
                store and display it so the service works (e.g. show your letter to the recipient). We
                don&apos;t use your content for advertising or model training.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Cost</h2>
              <p>The core app is free. There are no paid tiers. If we ever add a paid feature (e.g. printed
                postcards via a fulfillment partner), it will be clearly opt-in.</p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>No warranty</h2>
              <p>
                We provide Timegift &ldquo;as is.&rdquo; We try hard to keep it up but make no guarantees about
                uptime, delivery, or that a gift will produce the relationship you hoped for.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Liability</h2>
              <p>
                To the maximum extent permitted by law, our liability is limited to what you paid us, which
                is currently zero.
              </p>
            </div>

            <div>
              <h2 className="serif" style={{ fontSize: 24 }}>Changes</h2>
              <p>
                We may update these terms. Material changes will be announced in-app. Continued use means
                you accept the new terms.
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
