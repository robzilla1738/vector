const KEY = "aux.in-app-task-notices";
const CHANGE = "aux:task-notice-preference";
let fallback: "all" | "off" = "all";

/** Local shell preference for in-app notices. OS delivery awaits a native method. */
export function readInAppNoticePreference(): "all" | "off" {
  try { return localStorage.getItem(KEY) === "off" ? "off" : "all"; }
  catch { return fallback; }
}

export function writeInAppNoticePreference(value: "all" | "off"): void {
  fallback = value;
  try { localStorage.setItem(KEY, value); }
  catch { /* The current window still receives the change event. */ }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE));
}

export function onInAppNoticePreferenceChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE, listener);
  window.addEventListener("storage", listener);
  return () => { window.removeEventListener(CHANGE, listener); window.removeEventListener("storage", listener); };
}
