/* Dashboard — "Your ledger" */

const Dashboard = ({ go, openGift }) => {
  const [tab, setTab] = useState("incoming");
  const user = window.SAMPLE_USER;
  const received = window.SAMPLE_GIFTS_RECEIVED;
  const sent = window.SAMPLE_GIFTS_SENT;

  const pendingIncoming = received.filter(g => g.status === "pending").length;
  const activeIncoming = received.filter(g => g.status === "accepted").length;
  const pendingOutgoing = sent.filter(g => g.status === "pending").length;

  return (
    <div className="container fade-in" style={{ paddingTop: 24, paddingBottom: 80 }}>
      {/* Header */}
      <div className="row between" style={{ alignItems: "flex-end", marginBottom: 48 }}>
        <div className="stack gap-2">
          <div className="eyebrow">Your ledger · {window.formatDateLong(new Date("2026-05-24"))}</div>
          <h1 style={{ fontSize: 56, letterSpacing: "-0.025em", lineHeight: 1 }}>
            Good morning, <em style={{ color: "var(--accent)" }}>Mira.</em>
          </h1>
        </div>
        <button className="btn btn-lg" onClick={() => go("create")}>
          <Icon name="feather" size={15}/> Write a gift
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--hairline-soft)", border: "1px solid var(--hairline-soft)", borderRadius: 6, overflow: "hidden", marginBottom: 48 }}>
        <Stat label="Hours given" num={user.hoursGiven} sublabel="across 28 gifts"/>
        <Stat label="Hours received" num={user.hoursReceived} sublabel="from 19 people"/>
        <Stat label="Pending" num={user.pending} sublabel="waiting on the other side" accent/>
        <Stat label="Completed" num={user.completed} sublabel="this year"/>
      </div>

      {/* Smart suggestion */}
      <div style={{ background: "var(--paper-warm)", border: "1px solid var(--hairline-soft)", borderRadius: 6, padding: "20px 24px", marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div className="row gap-4">
          <div className="serif" style={{ fontStyle: "italic", color: "var(--accent)", fontSize: 22 }}>P.S.</div>
          <div>
            <div className="serif" style={{ fontSize: 18 }}>Aunt Ros' birthday is in 12 days.</div>
            <div className="meta">Last year you gifted her an afternoon. She redeemed it within the week.</div>
          </div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost" onClick={() => go("create")}>Write something</button>
          <button className="btn-quiet" style={{ fontSize: 13 }}>Dismiss</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={"tab " + (tab === "incoming" ? "active" : "")} onClick={() => setTab("incoming")}>
          Incoming<span className="tab-count">{received.length}</span>
        </button>
        <button className={"tab " + (tab === "outgoing" ? "active" : "")} onClick={() => setTab("outgoing")}>
          Outgoing<span className="tab-count">{sent.length}</span>
        </button>
        <button className={"tab " + (tab === "memories" ? "active" : "")} onClick={() => setTab("memories")}>
          Memories<span className="tab-count">{window.SAMPLE_MEMORIES.length}</span>
        </button>
      </div>

      {/* Tab content */}
      <div style={{ marginTop: 32 }}>
        {tab === "incoming" && <GiftTable rows={received} kind="incoming" onOpen={openGift}/>}
        {tab === "outgoing" && <GiftTable rows={sent} kind="outgoing" onOpen={openGift}/>}
        {tab === "memories" && <MemoriesGrid items={window.SAMPLE_MEMORIES}/>}
      </div>
    </div>
  );
};

const Stat = ({ label, num, sublabel, accent }) => (
  <div style={{ background: "var(--paper)", padding: "28px 28px 24px" }}>
    <div className="stat-label" style={{ marginBottom: 14 }}>{label}</div>
    <div className="stat-num" style={{ color: accent ? "var(--accent)" : "var(--ink)" }}>{num}</div>
    <div className="meta" style={{ marginTop: 8 }}>{sublabel}</div>
  </div>
);

const GiftTable = ({ rows, kind, onOpen }) => {
  if (!rows.length) return <Empty kind={kind}/>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ width: "30%" }}>{kind === "incoming" ? "From" : "To"}</th>
          <th style={{ width: "12%" }}>Time</th>
          <th style={{ width: "32%" }}>Message</th>
          <th style={{ width: "13%" }}>Sent</th>
          <th style={{ width: "13%" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(g => {
          const other = kind === "incoming" ? g.from : g.to;
          return (
            <tr key={g.id} onClick={() => onOpen && onOpen(g)}>
              <td>
                <div className="row gap-3">
                  <div className="avatar">{other.initial}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 17 }}>{other.name}</div>
                    {other.contact && <div className="meta">{other.contact}</div>}
                    {g.purpose && !other.contact && <div className="meta">{g.purpose}</div>}
                  </div>
                </div>
              </td>
              <td>
                <div className="col-time">{g.amount}<span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>{g.unit}</span></div>
                {g.purpose && other.contact && <div className="meta" style={{ marginTop: 2 }}>{g.purpose}</div>}
              </td>
              <td>
                <div style={{ fontFamily: "var(--serif)", fontSize: 15.5, color: "var(--ink-soft)", lineHeight: 1.45, fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  "{g.message}"
                </div>
              </td>
              <td className="meta">{window.formatDate(g.sentAt)}</td>
              <td>
                <span className={"tag " + g.status}>
                  <span className="tag-dot"/> {g.status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const Empty = ({ kind }) => (
  <div className="card center" style={{ padding: "64px 32px" }}>
    <div className="serif italic muted" style={{ fontSize: 22, marginBottom: 8 }}>Nothing here yet.</div>
    <div className="meta">{kind === "incoming" ? "No one's sent you time yet." : "You haven't written any gifts."}</div>
  </div>
);

const MemoriesGrid = ({ items }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
    {items.map(m => (
      <div key={m.id} className="polaroid">
        <div className="polaroid-img" style={{ background: m.color }}>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>{m.with}</span>
        </div>
        <div className="polaroid-cap">"{m.caption}"</div>
        <div className="meta center" style={{ marginTop: 8 }}>{m.when} · {m.purpose}</div>
      </div>
    ))}
  </div>
);

window.Dashboard = Dashboard;
window.MemoriesGrid = MemoriesGrid;
