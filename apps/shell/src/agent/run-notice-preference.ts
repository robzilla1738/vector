const KEY = "aux.in-app-task-notices";
const SYSTEM_KEY = "aux.system-task-notices";
const FOCUS_KEY = "aux.task-focus-mode";
const CHANGE = "aux:task-notice-preference";
let fallback: "all" | "off" = "all";
let systemFallback = false;
let focusFallback = false;

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

function readBoolean(key: string, fallbackValue: boolean): boolean {
  try { return localStorage.getItem(key) === "on"; }
  catch { return fallbackValue; }
}

function writeBoolean(key: string, value: boolean): void {
  try { localStorage.setItem(key, value ? "on" : "off"); }
  catch { /* Current window still receives the change. */ }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE));
}

/** Explicit opt-in; a denied OS notification still leaves in-app attention. */
export function readSystemTaskNotices(): boolean { return readBoolean(SYSTEM_KEY, systemFallback); }
export function writeSystemTaskNotices(value: boolean): void { systemFallback = value; writeBoolean(SYSTEM_KEY, value); }
export function readTaskFocusMode(): boolean { return readBoolean(FOCUS_KEY, focusFallback); }
export function writeTaskFocusMode(value: boolean): void { focusFallback = value; writeBoolean(FOCUS_KEY, value); }
