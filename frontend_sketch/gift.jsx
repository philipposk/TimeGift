/* Gift view — what the recipient sees when they open the link */

const GiftView = ({ go, gift }) => {
  const [opened, setOpened] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // Default gift if none passed (for direct demo)
  const g = gift || {
    from: { name: "Mira Okafor", initial: "M" },
    amount: 3, unit: "hours",
    purpose: "Anything you want",
    message: "I've been meaning to tell you — you're the reason I picked up writing again. Three hours, on me. Coffee, a long walk, or just sitting on the porch. Pick the day.",
    sentAt: "2026-05-19",
    expires: null,
  };

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px 80px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div className="stack gap-8" style={{ width: "100%", maxWidth: 680 }}>

        {/* Top crumb */}
        <div className="center stack gap-2">
          <div className="eyebrow">A letter for you · {window.formatDateLong(g.sentAt)}</div>
          <div className="serif italic muted" style={{ fontSize: 17 }}>via Timegift</div>
        </div>

        {/* Envelope / Letter */}
        {!opened && !accepted ? (
          <ClosedEnvelope g={g} onOpen={() => setOpened(true)}/>
        ) : !accepted ? (
          <OpenLetter g={g} onAccept={() => setAccepted(true)} onDecline={() => go("dashboard")}/>
        ) : !scheduling ? (
          <Accepted g={g} onSchedule={() => setScheduling(true)} go={go}/>
        ) : (
          <ScheduleView g={g} onDone={() => go("dashboard")}/>
        )}

        {/* Footnote */}
        {!accepted && (
          <div className="center meta" style={{ marginTop: 32 }}>
            Timegift is a small thing for sending time, not stuff. <span className="link">What is this?</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============ Closed envelope ============ */
const ClosedEnvelope = ({ g, onOpen }) => (
  <div className="fade-up" style={{ position: "relative" }}>
    <div onClick={onOpen} style={{
      maxWidth: 520, margin: "0 auto", aspectRatio: "1.7 / 1",
      background: "#fbf7ee", border: "1px solid var(--hairline)",
      borderRadius: 4, position: "relative", cursor: "pointer",
      boxShadow: "0 30px 60px -30px rgba(60, 40, 20, 0.35)",
      transition: "transform 0.3s, box-shadow 0.3s",
      overflow: "hidden",
    }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
       onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>

      {/* Envelope flap */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55%",
        background: "var(--paper-warm)",
        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        borderBottom: "1px solid var(--hairline)",
      }}/>

      {/* Seal */}
      <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <div className="seal">M</div>
      </div>

      {/* Address */}
      <div style={{ position: "absolute", bottom: 32, left: 40, right: 120 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>To you, from</div>
        <div className="serif" style={{ fontSize: 24 }}>{g.from.name}</div>
      </div>

      {/* Stamp */}
      <div className="stamp" style={{ position: "absolute", top: 18, right: 18, background: "#fbf7ee" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>Timegift</div>
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: 16 }}>{g.amount}{g.unit[0]}</div>
          <div style={{ fontSize: 8, letterSpacing: "0.1em" }}>2026</div>
        </div>
      </div>
    </div>

    <div className="center mt-6">
      <button className="btn btn-lg" onClick={onOpen}>
        <Icon name="envelope" size={15}/> Open the letter
      </button>
    </div>
  </div>
);

/* ============ Open letter ============ */
const OpenLetter = ({ g, onAccept, onDecline }) => (
  <div className="envelope fade-up">
    <div className="row between" style={{ alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>From</div>
        <div className="row gap-3">
          <div className="avatar lg">{g.from.initial}</div>
          <div>
            <div className="serif" style={{ fontSize: 22 }}>{g.from.name}</div>
            <div className="meta">{window.formatDateLong(g.sentAt)}</div>
          </div>
        </div>
      </div>
      <div className="stamp">
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 2 }}>Timegift</div>
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)", fontSize: 16 }}>{g.amount}{g.unit[0]}</div>
          <div style={{ fontSize: 8, letterSpacing: "0.1em" }}>2026</div>
        </div>
      </div>
    </div>

    <hr className="hr mb-8"/>

    {/* The gift itself */}
    <div className="stack gap-3" style={{ marginBottom: 32 }}>
      <div className="eyebrow">They're giving you</div>
      <div className="serif" style={{ fontSize: 52, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {g.amount} {g.unit}
      </div>
      <div className="serif italic" style={{ fontSize: 22, color: "var(--accent)" }}>
        for {g.purpose.toLowerCase()}
      </div>
    </div>

    <hr className="hr mb-6"/>

    {/* Message */}
    <p className="handwritten" style={{ fontSize: 22, lineHeight: 1.6, marginBottom: 24 }}>
      {g.message}
    </p>
    <p className="handwritten" style={{ textAlign: "right", color: "var(--accent)" }}>
      — {g.from.name.split(" ")[0]}.
    </p>

    <hr className="hr mt-8 mb-6"/>

    <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
      <button className="btn-quiet" onClick={onDecline} style={{ fontSize: 13.5 }}>Not now</button>
      <button className="btn btn-accent btn-lg" onClick={onAccept}>
        <Icon name="check" size={15}/> Accept this gift
      </button>
    </div>
  </div>
);

/* ============ Accepted state ============ */
const Accepted = ({ g, onSchedule, go }) => (
  <div className="envelope fade-up center">
    <div className="seal" style={{ margin: "0 auto 24px", width: 80, height: 80, fontSize: 36 }}>
      <Icon name="check" size={30}/>
    </div>
    <h2 className="serif" style={{ fontSize: 38, letterSpacing: "-0.02em", marginBottom: 8 }}>
      Accepted.
    </h2>
    <p className="lede muted" style={{ maxWidth: 440, margin: "0 auto 32px" }}>
      You've got <span style={{ color: "var(--accent)", fontStyle: "italic" }}>{g.amount} {g.unit}</span> of {g.from.name.split(" ")[0]}'s time. Now find a day that works for you both.
    </p>

    <div className="row gap-3" style={{ justifyContent: "center" }}>
      <button className="btn btn-lg" onClick={onSchedule}>
        <Icon name="calendar" size={15}/> Pick a time
      </button>
      <button className="btn btn-ghost btn-lg" onClick={() => go("dashboard")}>
        Save for later
      </button>
    </div>

    <div className="row gap-6 mt-8 meta" style={{ justifyContent: "center" }}>
      <span className="row gap-2"><Icon name="calendar" size={14}/> No rush — no expiry on this one</span>
    </div>
  </div>
);

/* ============ Schedule view ============ */
const ScheduleView = ({ g, onDone }) => {
  const [selected, setSelected] = useState(null);
  const slots = [
    { day: "Sat", date: "Jun 7", time: "Morning" },
    { day: "Sat", date: "Jun 7", time: "Afternoon" },
    { day: "Sun", date: "Jun 8", time: "Afternoon" },
    { day: "Sat", date: "Jun 14", time: "Morning" },
    { day: "Sat", date: "Jun 14", time: "Afternoon" },
    { day: "Sun", date: "Jun 15", time: "Evening" },
  ];

  return (
    <div className="envelope fade-up">
      <div className="stack gap-2 mb-8">
        <div className="eyebrow">Step two</div>
        <h2 className="serif" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>
          When works for you?
        </h2>
        <p className="muted">
          These are the days {g.from.name.split(" ")[0]} marked as available. Pick one and we'll both get a calendar invite.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {slots.map((s, i) => {
          const active = selected === i;
          return (
            <button key={i} onClick={() => setSelected(i)} style={{
              background: active ? "var(--ink)" : "#fbf7ee",
              color: active ? "var(--paper)" : "var(--ink)",
              border: "1px solid " + (active ? "var(--ink)" : "var(--hairline)"),
              padding: "16px 14px", borderRadius: 6, cursor: "pointer", textAlign: "left",
              transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>{s.day}</div>
              <div className="serif" style={{ fontSize: 22, lineHeight: 1, margin: "4px 0" }}>{s.date}</div>
              <div style={{ fontSize: 12.5, opacity: 0.75 }}>{s.time}</div>
            </button>
          );
        })}
      </div>

      <hr className="hr mb-6"/>

      <div className="row between">
        <button className="btn-quiet" onClick={onDone}>Decide later</button>
        <button className="btn btn-accent" onClick={onDone} disabled={selected === null} style={{ opacity: selected === null ? 0.5 : 1 }}>
          Send to both calendars <Icon name="arrow-right" size={14}/>
        </button>
      </div>
    </div>
  );
};

window.GiftView = GiftView;
