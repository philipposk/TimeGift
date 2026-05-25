/* Create gift flow — composes a letter, with live preview */

const Create = ({ go }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    recipientType: "email",
    recipientName: "",
    recipientContact: "",
    amount: 2,
    unit: "hours",
    purposeType: "anything",
    purposeDetails: "",
    message: "",
    expiryType: "none",
    expiryDate: "",
  });

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  const canAdvance = () => {
    if (step === 1) return data.recipientName.trim() && data.recipientContact.trim();
    if (step === 2) return data.amount > 0;
    if (step === 3) return data.message.trim().length > 5;
    return true;
  };

  const next = () => canAdvance() && setStep(s => Math.min(4, s + 1));
  const back = () => step > 1 ? setStep(s => s - 1) : go("dashboard");

  return (
    <div className="container fade-in" style={{ paddingTop: 24, paddingBottom: 80 }}>
      {/* Top bar */}
      <div className="row between mb-8">
        <div className="stack gap-1">
          <div className="eyebrow">Composing</div>
          <h1 style={{ fontSize: 36, letterSpacing: "-0.02em" }}>A new time gift</h1>
        </div>
        <button className="btn-quiet" onClick={() => go("dashboard")}>
          Save draft & close
        </button>
      </div>

      {/* Step indicator */}
      <Steps step={step}/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, marginTop: 40, alignItems: "start" }}>
        {/* LEFT — form */}
        <div className="stack gap-8">
          {step === 1 && <StepRecipient data={data} update={update}/>}
          {step === 2 && <StepTime data={data} update={update}/>}
          {step === 3 && <StepMessage data={data} update={update}/>}
          {step === 4 && <StepReview data={data} update={update} setStep={setStep}/>}

          <div className="row between mt-8" style={{ paddingTop: 24, borderTop: "1px solid var(--hairline-soft)" }}>
            <button className="btn btn-ghost" onClick={back}>
              <Icon name="arrow-left" size={14}/> {step === 1 ? "Cancel" : "Back"}
            </button>
            {step < 4 ? (
              <button className="btn" onClick={next} disabled={!canAdvance()} style={{ opacity: canAdvance() ? 1 : 0.5 }}>
                Continue <Icon name="arrow-right" size={14}/>
              </button>
            ) : (
              <button className="btn btn-accent" onClick={() => go("gift")}>
                <Icon name="send" size={14}/> Send the gift
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — live letter preview */}
        <div style={{ position: "sticky", top: 32 }}>
          <div className="eyebrow mb-4">Live preview</div>
          <LivePreview data={data}/>
        </div>
      </div>
    </div>
  );
};

const Steps = ({ step }) => {
  const items = [
    { n: 1, label: "Recipient" },
    { n: 2, label: "Time" },
    { n: 3, label: "Message" },
    { n: 4, label: "Review" },
  ];
  return (
    <div className="steps">
      {items.map((it, i) => (
        <React.Fragment key={it.n}>
          <div className={"step " + (step === it.n ? "active" : step > it.n ? "done" : "")}>
            <span className="step-num">{step > it.n ? "✓" : it.n}</span>
            <span className="step-label" style={{ marginLeft: 8 }}>{it.label}</span>
          </div>
          {i < items.length - 1 && <span className="step-line"/>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ===== Step 1: recipient ===== */
const StepRecipient = ({ data, update }) => (
  <div className="stack gap-8">
    <div className="stack gap-2">
      <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>Who is this for?</h2>
      <p className="muted" style={{ fontSize: 14.5 }}>They don't need an account. We'll deliver the card by email or text.</p>
    </div>

    <div className="stack gap-6">
      <div className="field">
        <label className="field-label">Their name</label>
        <input
          className="input"
          placeholder="Aunt Ros"
          value={data.recipientName}
          onChange={e => update({ recipientName: e.target.value })}
        />
      </div>

      <div className="field">
        <label className="field-label">Send by</label>
        <div className="toggle-group" style={{ alignSelf: "flex-start" }}>
          <button className={"toggle-opt " + (data.recipientType === "email" ? "active" : "")} onClick={() => update({ recipientType: "email", recipientContact: "" })}>
            <Icon name="mail" size={13} className="mr-2"/> Email
          </button>
          <button className={"toggle-opt " + (data.recipientType === "phone" ? "active" : "")} onClick={() => update({ recipientType: "phone", recipientContact: "" })}>
            <Icon name="phone" size={13}/> Text / WhatsApp
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">{data.recipientType === "email" ? "Email address" : "Phone number"}</label>
        <input
          className="input"
          placeholder={data.recipientType === "email" ? "ros@email.com" : "+1 555 0100"}
          value={data.recipientContact}
          onChange={e => update({ recipientContact: e.target.value })}
        />
      </div>
    </div>
  </div>
);

/* ===== Step 2: time ===== */
const StepTime = ({ data, update }) => {
  const quickPicks = [
    { a: 30, u: "minutes", label: "Quick call" },
    { a: 1, u: "hours", label: "Coffee" },
    { a: 3, u: "hours", label: "An afternoon" },
    { a: 1, u: "days", label: "A whole day" },
  ];
  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>How much time?</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>Pick something that feels right. You can always adjust later.</p>
      </div>

      <div className="stack gap-3">
        <label className="field-label">Quick picks</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {quickPicks.map(qp => {
            const active = data.amount === qp.a && data.unit === qp.u;
            return (
              <button
                key={qp.label}
                onClick={() => update({ amount: qp.a, unit: qp.u })}
                style={{
                  background: active ? "var(--ink)" : "#fbf7ee",
                  color: active ? "var(--paper)" : "var(--ink)",
                  border: "1px solid " + (active ? "var(--ink)" : "var(--hairline)"),
                  borderRadius: 6,
                  padding: "16px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>{qp.a}<span style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}>{qp.u}</span></div>
                <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 8, letterSpacing: "0.04em" }}>{qp.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stack gap-3">
        <label className="field-label">Or set your own</label>
        <div className="row gap-4">
          <input type="number" min="1" className="input-boxed" style={{ width: 100, textAlign: "center", fontFamily: "var(--serif)", fontSize: 22 }} value={data.amount} onChange={e => update({ amount: parseInt(e.target.value) || 1 })}/>
          <div className="toggle-group">
            {["minutes", "hours", "days"].map(u => (
              <button key={u} className={"toggle-opt " + (data.unit === u ? "active" : "")} onClick={() => update({ unit: u })}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="stack gap-3">
        <label className="field-label">What's it for?</label>
        <div className="stack gap-2">
          <PurposeOpt active={data.purposeType === "anything"} onClick={() => update({ purposeType: "anything" })}
            title="Anything they want" body="They decide. Most thoughtful when you trust them with it."/>
          <PurposeOpt active={data.purposeType === "specific"} onClick={() => update({ purposeType: "specific" })}
            title="Something specific" body="A walk, a call, help with a project, dinner together."/>
        </div>
        {data.purposeType === "specific" && (
          <input className="input mt-2" placeholder="Tearing out the hedge, planting dahlias…" value={data.purposeDetails} onChange={e => update({ purposeDetails: e.target.value })}/>
        )}
      </div>
    </div>
  );
};

const PurposeOpt = ({ active, onClick, title, body }) => (
  <button onClick={onClick} style={{
    background: active ? "var(--paper-warm)" : "transparent",
    border: "1px solid " + (active ? "var(--ink)" : "var(--hairline)"),
    padding: "16px 18px",
    borderRadius: 6,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  }}>
    <div className="row gap-3" style={{ alignItems: "flex-start" }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid " + (active ? "var(--ink)" : "var(--hairline)"), marginTop: 4, position: "relative", flexShrink: 0 }}>
        {active && <span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "var(--accent)" }}/>}
      </div>
      <div>
        <div className="serif" style={{ fontSize: 17 }}>{title}</div>
        <div className="meta" style={{ marginTop: 2 }}>{body}</div>
      </div>
    </div>
  </button>
);

/* ===== Step 3: message ===== */
const StepMessage = ({ data, update }) => {
  const templates = [
    "I've been meaning to tell you — ",
    "For your birthday — ",
    "Trade. You did this for me once. ",
    "No reason, just because. ",
  ];
  return (
    <div className="stack gap-8">
      <div className="stack gap-2">
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>Write to them.</h2>
        <p className="muted" style={{ fontSize: 14.5 }}>This is the part that matters. Short is fine. Mean it.</p>
      </div>

      <div className="field">
        <label className="field-label">Message</label>
        <textarea
          className="textarea"
          rows={7}
          placeholder="Write your letter…"
          value={data.message}
          onChange={e => update({ message: e.target.value })}
        />
        <div className="row between" style={{ marginTop: 4 }}>
          <span className="meta">{data.message.length} characters</span>
          <span className="meta italic">Keep it like a letter, not a notification.</span>
        </div>
      </div>

      <div className="stack gap-3">
        <label className="field-label">Or start from</label>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {templates.map(t => (
            <button key={t} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12.5 }} onClick={() => update({ message: t })}>
              {t.trim()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ===== Step 4: review ===== */
const StepReview = ({ data, update, setStep }) => (
  <div className="stack gap-8">
    <div className="stack gap-2">
      <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>One last look.</h2>
      <p className="muted" style={{ fontSize: 14.5 }}>This is what they'll see when they open it.</p>
    </div>

    <div className="stack gap-4">
      <ReviewRow label="Recipient" value={data.recipientName + " · " + data.recipientContact} onEdit={() => setStep(1)}/>
      <ReviewRow label="Time" value={data.amount + " " + data.unit + (data.purposeType === "specific" && data.purposeDetails ? " · " + data.purposeDetails : " · anything")} onEdit={() => setStep(2)}/>
      <ReviewRow label="Message" value={data.message || "—"} onEdit={() => setStep(3)} multiline/>
    </div>

    <div className="field">
      <label className="field-label">Expiry (optional)</label>
      <div className="row gap-2">
        {[
          { v: "none", l: "No expiry" },
          { v: "1m", l: "1 month" },
          { v: "3m", l: "3 months" },
          { v: "1y", l: "1 year" },
        ].map(o => (
          <button key={o.v} className={"btn " + (data.expiryType === o.v ? "" : "btn-ghost")} style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => update({ expiryType: o.v })}>
            {o.l}
          </button>
        ))}
      </div>
    </div>

    <div className="row gap-3" style={{ alignItems: "flex-start", padding: 16, background: "var(--paper-warm)", borderRadius: 6, border: "1px solid var(--hairline-soft)" }}>
      <Icon name="lock" size={16} className="mt-1"/>
      <div className="meta" style={{ fontSize: 13 }}>
        Only you and the recipient will see this. We'll send them a link by {data.recipientType === "email" ? "email" : "text"}. They don't need an account to open it.
      </div>
    </div>
  </div>
);

const ReviewRow = ({ label, value, onEdit, multiline }) => (
  <div style={{ borderBottom: "1px solid var(--hairline-soft)", paddingBottom: 16 }}>
    <div className="row between" style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div className="field-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="serif" style={{ fontSize: multiline ? 17 : 19, lineHeight: 1.45, fontStyle: multiline ? "italic" : "normal", color: "var(--ink-soft)", whiteSpace: "pre-wrap" }}>
          {value}
        </div>
      </div>
      <button className="btn-quiet" onClick={onEdit} style={{ fontSize: 12.5 }}>
        <Icon name="edit" size={12}/> Edit
      </button>
    </div>
  </div>
);

/* ===== Live preview card ===== */
const LivePreview = ({ data }) => {
  const tweaks = window.__TIMEGIFT_TWEAKS || {};
  const hasContent = data.recipientName || data.message || data.amount;
  const purpose = data.purposeType === "specific" && data.purposeDetails ? data.purposeDetails : "anything you want";

  return (
    <div className="card-letter" style={{ transform: "rotate(0.5deg)" }}>
      {tweaks.showStamp !== false && (
        <div className="stamp">
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>Timegift</div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: 16 }}>{data.amount}{data.unit[0]}</div>
            <div style={{ fontSize: 8, letterSpacing: "0.1em" }}>2026</div>
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: 4 }}>To</div>
      <div className="serif" style={{ fontSize: 22, color: data.recipientName ? "var(--ink)" : "var(--muted-2)" }}>
        {data.recipientName || "Their name"}
      </div>

      <div className="eyebrow mt-6" style={{ marginBottom: 4 }}>For</div>
      <div className="serif" style={{ fontSize: 22, fontStyle: "italic", color: "var(--accent)" }}>
        {data.amount} {data.unit} · {purpose}
      </div>

      <hr className="hr mt-6 mb-6"/>

      <p className="handwritten" style={{ marginBottom: 14, minHeight: 80, color: data.message ? "var(--ink-soft)" : "var(--muted-2)" }}>
        {data.message || "Your letter will appear here as you write it…"}
      </p>
      <p className="handwritten" style={{ textAlign: "right" }}>— M.</p>

      <hr className="hr mt-6 mb-4"/>
      <div className="row between meta">
        <span>Will send to {data.recipientContact || "—"}</span>
        <span>{data.expiryType === "none" || !data.expiryType ? "No expiry" : data.expiryType}</span>
      </div>
    </div>
  );
};

window.Create = Create;
