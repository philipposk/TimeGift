/* App shell — router, nav, and the Tweaks panel */

const NAV_ITEMS = [
  { id: "landing", label: "Home" },
  { id: "dashboard", label: "Ledger" },
  { id: "create", label: "Write" },
  { id: "gift", label: "Inbox" },
  { id: "memories", label: "Memories" },
];

const TopNav = ({ route, go }) => (
  <div style={{ borderBottom: "1px solid var(--hairline-soft)", background: "rgba(244, 239, 230, 0.85)", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
    <div className="nav">
      <window.Brand onClick={() => go("landing")}/>
      <div className="nav-links">
        {NAV_ITEMS.filter(n => n.id !== "landing").map(n => (
          <span key={n.id} className={"nav-link " + (route === n.id ? "active" : "")} onClick={() => go(n.id)}>
            {n.label}
          </span>
        ))}
        <span style={{ width: 1, height: 16, background: "var(--hairline)" }}/>
        <div className="row gap-3">
          <span className="meta">Mira</span>
          <div className="avatar sm" style={{ width: 30, height: 30, fontSize: 13 }}>M</div>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [route, setRoute] = React.useState("landing");
  const [openedGift, setOpenedGift] = React.useState(null);

  const [t, setTweak] = window.useTweaks(window.__TIMEGIFT_TWEAKS);

  React.useEffect(() => { window.applyAccent(t.accent); }, [t.accent]);
  React.useEffect(() => {
    document.body.classList.toggle("no-grain", t.showPaperGrain === false);
  }, [t.showPaperGrain]);

  const go = (id) => {
    setRoute(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const openGift = (gift) => {
    setOpenedGift(gift);
    go("gift");
  };

  const routeLabel = NAV_ITEMS.find(n => n.id === route)?.label || "Home";

  return (
    <div data-screen-label={routeLabel}>
      <TopNav route={route} go={go}/>
      <main>
        {route === "landing" && <window.Landing go={go}/>}
        {route === "dashboard" && <window.Dashboard go={go} openGift={openGift}/>}
        {route === "create" && <window.Create go={go}/>}
        {route === "gift" && <window.GiftView go={go} gift={openedGift}/>}
        {route === "memories" && <window.Memories go={go}/>}
      </main>

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Accent">
          <window.TweakSelect
            label="Color"
            value={t.accent}
            onChange={v => setTweak("accent", v)}
            options={[
              { value: "amber",    label: "Amber"    },
              { value: "moss",     label: "Moss"     },
              { value: "ink",      label: "Ink"      },
              { value: "rose",     label: "Rose"     },
              { value: "graphite", label: "Graphite" },
            ]}
          />
        </window.TweakSection>

        <window.TweakSection label="Feel">
          <window.TweakToggle
            label="Paper grain"
            value={t.showPaperGrain !== false}
            onChange={v => setTweak("showPaperGrain", v)}
          />
          <window.TweakToggle
            label="Postage stamp on cards"
            value={t.showStamp !== false}
            onChange={v => setTweak("showStamp", v)}
          />
        </window.TweakSection>

        <window.TweakSection label="Jump to screen">
          {NAV_ITEMS.map(n => (
            <window.TweakButton key={n.id} label={n.label} onClick={() => go(n.id)} secondary={route !== n.id}/>
          ))}
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
};

// Mount once all sibling babel scripts have populated window.*
const mount = () => {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App/>);
};

const ready = () => window.Landing && window.Dashboard && window.Create && window.GiftView && window.Memories && window.useTweaks && window.TweaksPanel;

if (ready()) {
  mount();
} else {
  const poll = setInterval(() => {
    if (ready()) {
      clearInterval(poll);
      mount();
    }
  }, 20);
}
