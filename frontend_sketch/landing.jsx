/* Landing page — editorial, paper-letter feel */

const Landing = ({ go }) => {
  return (
    <div>
      {/* ============ HERO ============ */}
      <section style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 80, alignItems: "center" }}>
            <div className="stack gap-6 fade-up">
              <div className="eyebrow">No. 001 &nbsp;·&nbsp; A small, deliberate idea</div>

              <h1 style={{ fontSize: 80, lineHeight: 0.96, letterSpacing: "-0.025em" }}>
                Give someone<br/>
                <span style={{ fontStyle: "italic", color: "var(--accent)" }}>your time.</span>
              </h1>

              <p className="lede" style={{ maxWidth: 460, marginTop: 12 }}>
                Not a thing you bought. A morning. A long walk. The whole of next Sunday. Write it down, send it across, and mean it.
              </p>

              <div className="row gap-3 mt-4">
                <button className="btn btn-lg" onClick={() => go("create")}>
                  Write a gift
                  <Icon name="arrow-right" size={15}/>
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => go("dashboard")}>
                  See an example
                </button>
              </div>

              <div className="row gap-6 mt-6 muted" style={{ fontSize: 13, flexWrap: "wrap" }}>
                <span className="row gap-2" style={{ whiteSpace: "nowrap" }}><Icon name="lock" size={14}/> Private by default</span>
                <span className="row gap-2" style={{ whiteSpace: "nowrap" }}><Icon name="mail" size={14}/> Works without an account</span>
              </div>
            </div>

            {/* The example letter card */}
            <div className="fade-up" style={{ animationDelay: "0.1s", transform: "rotate(-1.2deg)" }}>
              <ExampleLetter/>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ROW ============ */}
      <section className="section-tight" style={{ background: "var(--paper-warm)", borderTop: "1px solid var(--hairline-soft)", borderBottom: "1px solid var(--hairline-soft)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, alignItems: "start" }}>
            <div className="eyebrow">The idea</div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1.35, color: "var(--ink-soft)", maxWidth: 720 }}>
              We've made gifts about <em>things.</em> Boxes, wrap, the right shade of something. But the people who love you mostly want one thing — <span style={{ color: "var(--ink)" }}>a piece of the week you didn't give to anyone else.</span> Timegift is a way to actually send that.
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section">
        <div className="container">
          <div className="row between" style={{ alignItems: "baseline", marginBottom: 48 }}>
            <h2 style={{ fontSize: 44, letterSpacing: "-0.02em" }}>How it works</h2>
            <div className="eyebrow">Three steps, no app needed on their end</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            <Step n="01" title="Write the letter" body="Pick who, how much time, and what for. Or leave it open. The form reads like a letter, because it is one."/>
            <Step n="02" title="Send it across" body="By email, text, or WhatsApp. They don't need an account. They open a card with your handwriting in it."/>
            <Step n="03" title="Find the day" body="They pick a time that works. You both get the invite. Then the only thing left is to show up."/>
          </div>
        </div>
      </section>

      {/* ============ FEATURE STRIP ============ */}
      <section className="section-tight" style={{ borderTop: "1px solid var(--hairline-soft)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--hairline-soft)", border: "1px solid var(--hairline-soft)" }}>
            <Feature title="A real ledger" body="See every hour you've given and received. Quiet, not gamified."/>
            <Feature title="Photo memories" body="After you redeem, drop a photo and a sentence. It saves."/>
            <Feature title="No pressure to spend" body="Expiry is optional. Most gifts don't need one."/>
            <Feature title="Random exchange" body="Opt in, and once a month you'll be matched with a stranger."/>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <section className="section center">
        <div className="container">
          <h2 className="serif" style={{ fontSize: 56, letterSpacing: "-0.02em", marginBottom: 16 }}>
            What would you do<br/><em>with three hours of someone?</em>
          </h2>
          <p className="lede muted" style={{ maxWidth: 540, margin: "0 auto" }}>
            That's the question. The rest of this app is just trying to make the answer easier to send.
          </p>
          <div className="row gap-3 mt-8" style={{ justifyContent: "center" }}>
            <button className="btn btn-lg" onClick={() => go("create")}>Write your first gift <Icon name="arrow-right" size={15}/></button>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

const Step = ({ n, title, body }) => (
  <div className="stack gap-3">
    <div className="serif" style={{ fontSize: 52, color: "var(--accent)", lineHeight: 1, letterSpacing: "-0.02em" }}>{n}</div>
    <div style={{ width: 32, height: 1, background: "var(--hairline)", marginTop: 4, marginBottom: 4 }}/>
    <h3 className="serif" style={{ fontSize: 24 }}>{title}</h3>
    <p className="muted" style={{ fontSize: 14.5, maxWidth: 320, lineHeight: 1.55 }}>{body}</p>
  </div>
);

const Feature = ({ title, body }) => (
  <div style={{ background: "var(--paper)", padding: "32px 28px" }}>
    <h4 className="serif" style={{ fontSize: 19, marginBottom: 8 }}>{title}</h4>
    <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>{body}</p>
  </div>
);

const ExampleLetter = () => {
  const tweaks = window.__TIMEGIFT_TWEAKS || {};
  return (
    <div className="card-letter" style={{ maxWidth: 460 }}>
      {tweaks.showStamp !== false && (
        <div className="stamp">
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>Timegift</div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: 16 }}>3h</div>
            <div style={{ fontSize: 8, letterSpacing: "0.1em" }}>2026</div>
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: 4 }}>To</div>
      <div className="serif" style={{ fontSize: 22 }}>Leo, my brother</div>

      <div className="eyebrow mt-6" style={{ marginBottom: 4 }}>For</div>
      <div className="serif" style={{ fontSize: 22, fontStyle: "italic", color: "var(--accent)" }}>3 hours · anything you want</div>

      <hr className="hr mt-6 mb-6"/>

      <p className="handwritten" style={{ marginBottom: 14 }}>
        I've been meaning to say this for months. You're the reason I picked up writing again. Three hours — coffee, a long walk, or just sitting on the porch. Pick the day.
      </p>
      <p className="handwritten" style={{ textAlign: "right" }}>— M.</p>

      <hr className="hr mt-6 mb-4"/>
      <div className="row between meta">
        <span>Sent May 19</span>
        <span>No expiry</span>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer style={{ borderTop: "1px solid var(--hairline-soft)", padding: "40px 0", marginTop: 40 }}>
    <div className="container row between" style={{ flexWrap: "wrap", gap: 16 }}>
      <div className="meta">© 2026 Timegift · A small, deliberate thing</div>
      <div className="row gap-6 meta">
        <span style={{ cursor: "pointer" }}>About</span>
        <span style={{ cursor: "pointer" }}>Privacy</span>
        <span style={{ cursor: "pointer" }}>Help</span>
      </div>
    </div>
  </footer>
);

window.Landing = Landing;
window.Footer = Footer;
