/* Tiny inline stroke icon set. Single Icon component, name prop chooses path. */

type IconName =
  | "arrow-right" | "arrow-left" | "plus" | "clock" | "envelope" | "heart"
  | "user" | "users" | "send" | "check" | "calendar" | "camera" | "feather"
  | "spark" | "moon" | "x" | "edit" | "search" | "dot" | "globe" | "lock"
  | "phone" | "mail" | "bell" | "more" | "trash" | "share";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className = "" }: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "ico " + className,
    style: { width: size, height: size, flexShrink: 0 },
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
      return (<svg {...props}><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>);
    case "globe":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "lock":
      return (<svg {...props}><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    case "phone":
      return (<svg {...props}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>);
    case "mail":
      return (<svg {...props}><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>);
    case "bell":
      return (<svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
    case "more":
      return (<svg {...props}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>);
    case "trash":
      return (<svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>);
    case "share":
      return (<svg {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>);
    default:
      return null;
  }
}
