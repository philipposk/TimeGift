/* Memories — full standalone page (also embedded in dashboard tab) */

const Memories = ({ go }) => {
  const items = window.SAMPLE_MEMORIES;
  return (
    <div className="container fade-in" style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="row between" style={{ alignItems: "flex-end", marginBottom: 48 }}>
        <div className="stack gap-2">
          <div className="eyebrow">Kept · {items.length} memories</div>
          <h1 style={{ fontSize: 56, letterSpacing: "-0.025em", lineHeight: 1 }}>
            <em style={{ color: "var(--accent)" }}>Days</em> we spent.
          </h1>
          <p className="lede muted" style={{ maxWidth: 540, marginTop: 8 }}>
            A photograph and a sentence from each gift you've redeemed. Not a feed. A small private shelf.
          </p>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost">Filter by year</button>
          <button className="btn btn-ghost">Print as zine</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {items.map(m => (
          <div key={m.id} className="polaroid" style={{ transform: `rotate(${(Math.random() - 0.5) * 1.5}deg)` }}>
            <div className="polaroid-img" style={{ background: m.color, position: "relative" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{m.purpose}</span>
            </div>
            <div className="polaroid-cap" style={{ marginTop: 14, fontSize: 16 }}>"{m.caption}"</div>
            <div className="meta center" style={{ marginTop: 10 }}>with <em>{m.with}</em> · {m.when}</div>
          </div>
        ))}

        {/* Add new */}
        <div className="polaroid" style={{ cursor: "pointer", border: "1px dashed var(--hairline)", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
          <Icon name="plus" size={24} className="muted"/>
          <div className="serif italic muted" style={{ marginTop: 12 }}>Add a memory</div>
          <div className="meta center" style={{ maxWidth: 200, marginTop: 6 }}>From any completed gift</div>
        </div>
      </div>
    </div>
  );
};

window.Memories = Memories;
