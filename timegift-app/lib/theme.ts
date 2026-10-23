export type ThemeMode = "light" | "dark" | "auto";
export const THEME_KEY = "tg_theme";

/** Inline, render-blocking: sets data-theme before first paint (no flash). */
export const themeInitScript = `(function(){try{var m=localStorage.getItem("${THEME_KEY}");if(m!=="light"&&m!=="dark")m="auto";var d=m==="dark"||(m==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

export function readMode(): ThemeMode {
  try {
    const m = localStorage.getItem(THEME_KEY);
    return m === "light" || m === "dark" ? m : "auto";
  } catch {
    return "auto";
  }
}

export function applyMode(mode: ThemeMode) {
  try {
    if (mode === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, mode);
  } catch {}
  const dark = mode === "dark" || (mode === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}
