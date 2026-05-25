/* Shared components, icons, fixtures, formatters */

const { useState, useEffect, useMemo, useRef } = React;

/* ============ Icons (tiny stroke set) ============ */

const Icon = ({ name, size = 16, className = "" }) => {
  const stroke = "currentColor";
  const sw = 1.4;
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke, strokeWidth: sw,
    strokeLinecap: "round", strokeLinejoin: "round",
    className: "ico " + className,
    style: { width: size, height: size }
  };
  switch (name) {
    case "arrow-right":
      return (<svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "arrow-left":
      return (<svg {...props}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>);
    case "plus":
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case "clock":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "envelope":
      return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 7 9-7"/></svg>);
    case "heart":
      return (<svg {...props}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>);
    case "user":
      return (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></svg>);
    case "users":
      return (<svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 4-5 7-5s6.2 1.5 7 5"/><circle cx="17" cy="7" r="2.5"/><path d="M16 14c2.5 0 5 1.2 6 4"/></svg>);
    case "send":
      return (<svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>);
    case "check":
      return (<svg {...props}><path d="M5 12l4 4 10-10"/></svg>);
    case "calendar":
      return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case "camera":
      return (<svg {...props}><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/></svg>);
    case "feather":
      return (<svg {...props}><path d="M20 4c-7 0-13 6-13 13l-3 3h9c6 0 11-5 11-11V4z"/><path d="M16 8L7 17M14 13H9"/></svg>);
    case "spark":
      return (<svg {...props}><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3"/></svg>);
    case "moon":
      return (<svg {...props}><path d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z"/></svg>);
    case "x":
      return (<svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>);
    case "edit":
      return (<svg {...props}><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>);
    case "search":
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>);
    case "dot":
      return (<svg {...props}><circle cx="12" cy="12" r="1.5" fill={stroke}/></svg>);
    case "globe":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "lock":
      return (<svg {...props}><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    case "phone":
      return (<svg {...props}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>);
    case "mail":
      return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>);
    default:
      return null;
  }
};

window.Icon = Icon;

/* ============ Brand mark ============ */

const Brand = ({ onClick }) => (
  <div className="brand" onClick={onClick}>
    <span className="brand-mark">Time<em>gift</em></span>
    <span className="brand-tag">est. 2026</span>
  </div>
);
window.Brand = Brand;

/* ============ Formatting helpers ============ */

const formatTime = (amount, unit) => {
  return `${amount} ${unit}`;
};

const formatDate = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDateLong = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

const relTime = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.round(diff/60)}m ago`;
  if (diff < 86400) return `${Math.round(diff/3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.round(diff/86400)}d ago`;
  return formatDate(date);
};

window.formatTime = formatTime;
window.formatDate = formatDate;
window.formatDateLong = formatDateLong;
window.relTime = relTime;

/* ============ Fixture data ============ */

const SAMPLE_USER = {
  name: "Mira Okafor",
  username: "mira",
  initial: "M",
  hoursGiven: 47,
  hoursReceived: 32,
  pending: 3,
  completed: 14,
};

const SAMPLE_GIFTS_RECEIVED = [
  {
    id: "g1",
    from: { name: "Leo Wen", initial: "L" },
    direction: "received",
    amount: 3, unit: "hours",
    purpose: "Anything you want",
    message: "I've been meaning to tell you — you're the reason I picked up writing again. Three hours, on me. Coffee, a long walk, or just sitting on the porch.",
    sentAt: "2026-05-19",
    status: "pending",
    expires: "2026-07-19"
  },
  {
    id: "g2",
    from: { name: "Aunt Ros", initial: "R" },
    direction: "received",
    amount: 1, unit: "day",
    purpose: "Garden project",
    message: "A whole Saturday. We'll finally tear out that hedge and put in the dahlias you've been talking about. Bring nothing but yourself.",
    sentAt: "2026-05-12",
    status: "accepted",
    scheduledFor: "2026-06-07"
  },
  {
    id: "g3",
    from: { name: "Devin Park", initial: "D" },
    direction: "received",
    amount: 2, unit: "hours",
    purpose: "Help moving",
    message: "Trade. You helped me move in '23. Tuesday after work, I bring the truck and the pizza.",
    sentAt: "2026-04-28",
    status: "completed",
    completedAt: "2026-05-04",
    hasMemory: true,
  },
];

const SAMPLE_GIFTS_SENT = [
  {
    id: "s1",
    to: { name: "Sana K.", contact: "sana@email.com", initial: "S" },
    direction: "sent",
    amount: 4, unit: "hours",
    purpose: "Anything",
    message: "For your birthday — four hours of me, anywhere in the city. Pick the place.",
    sentAt: "2026-05-20",
    status: "pending",
  },
  {
    id: "s2",
    to: { name: "Dad", contact: "+1 ••• 4429", initial: "D" },
    direction: "sent",
    amount: 1, unit: "day",
    purpose: "Just hanging out",
    message: "Father's day. No agenda.",
    sentAt: "2026-05-11",
    status: "accepted",
    scheduledFor: "2026-06-15"
  },
  {
    id: "s3",
    to: { name: "Kai", contact: "kai@email.com", initial: "K" },
    direction: "sent",
    amount: 30, unit: "minutes",
    purpose: "Phone call",
    message: "Heard about your week. Call when you can.",
    sentAt: "2026-05-08",
    status: "completed",
    completedAt: "2026-05-09",
  },
  {
    id: "s4",
    to: { name: "Imani", contact: "imani@email.com", initial: "I" },
    direction: "sent",
    amount: 2, unit: "hours",
    purpose: "Coffee",
    message: "It's been too long.",
    sentAt: "2026-03-02",
    status: "expired",
  },
];

const SAMPLE_MEMORIES = [
  {
    id: "m1",
    with: "Devin Park",
    when: "May 4, 2026",
    purpose: "Help moving",
    caption: "Five trips, one couch through a window, pizza at 9pm. Worth it.",
    color: "#c9a06a"
  },
  {
    id: "m2",
    with: "Kai",
    when: "May 9, 2026",
    purpose: "Phone call",
    caption: "Forty minutes that turned into ninety. He's doing okay.",
    color: "#8aa089"
  },
  {
    id: "m3",
    with: "Mum",
    when: "Apr 21, 2026",
    purpose: "Sunday lunch",
    caption: "She taught me how to make her pie crust. Photographed the flour-dust.",
    color: "#b87a72"
  },
  {
    id: "m4",
    with: "Wren",
    when: "Mar 14, 2026",
    purpose: "Studio visit",
    caption: "Watched her paint for two hours and didn't say a word.",
    color: "#7d8aa0"
  },
];

window.SAMPLE_USER = SAMPLE_USER;
window.SAMPLE_GIFTS_RECEIVED = SAMPLE_GIFTS_RECEIVED;
window.SAMPLE_GIFTS_SENT = SAMPLE_GIFTS_SENT;
window.SAMPLE_MEMORIES = SAMPLE_MEMORIES;

/* ============ Accent presets ============ */

const ACCENT_PRESETS = {
  amber:    { "--accent": "#a8501e", "--accent-ink": "#5d2c10", "--accent-soft": "#f1d9c2" },
  moss:     { "--accent": "#4e6b3d", "--accent-ink": "#2c3e21", "--accent-soft": "#d9e0c8" },
  ink:      { "--accent": "#2b3f5c", "--accent-ink": "#162237", "--accent-soft": "#d2dbe6" },
  rose:     { "--accent": "#9c3f4a", "--accent-ink": "#5a1f27", "--accent-soft": "#ecd0d2" },
  graphite: { "--accent": "#3a3631", "--accent-ink": "#1b1816", "--accent-soft": "#e0d9cc" },
};

const applyAccent = (key) => {
  const preset = ACCENT_PRESETS[key] || ACCENT_PRESETS.amber;
  Object.entries(preset).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
};

window.ACCENT_PRESETS = ACCENT_PRESETS;
window.applyAccent = applyAccent;
