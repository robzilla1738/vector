const KEY = "aux.in-app-task-notices";
const SYSTEM_KEY = "aux.system-task-notices";
const FOCUS_KEY = "aux.task-focus-mode";
const CHANGE = "aux:task-notice-preference";
let fallback: "all" | "off" = "all";
let systemFallback = false;
let focusFallback = false;

/** Local Profile preference shared by in-app and system delivery. */
export function readInAppNoticePreference(): "all" | "off" {
  try {
    return localStorage.getItem(KEY) === "off" ? "off" : "all";
  } catch {
    return fallback;
  }
}

export function writeInAppNoticePreference(value: "all" | "off"): void {
  fallback = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* The current window still receives the change event. */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE));
}

export function onInAppNoticePreferenceChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE, listener);
    window.removeEventListener("storage", listener);
  };
}

function readBoolean(key: string, fallbackValue: boolean): boolean {
  try {
    return localStorage.getItem(key) === "on";
  } catch {
    return fallbackValue;
  }
}

function writeBoolean(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "on" : "off");
  } catch {
    /* Current window still receives the change. */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE));
}

/** Explicit opt-in; a denied OS notification still leaves in-app attention. */
export function readSystemTaskNotices(): boolean {
  return readBoolean(SYSTEM_KEY, systemFallback);
}
export function writeSystemTaskNotices(value: boolean): void {
  systemFallback = value;
  writeBoolean(SYSTEM_KEY, value);
}
export function readTaskFocusMode(): boolean {
  return readBoolean(FOCUS_KEY, focusFallback);
}
export function writeTaskFocusMode(value: boolean): void {
  focusFallback = value;
  writeBoolean(FOCUS_KEY, value);
}

export type TaskNoticeKinds = { attention: boolean; completion: boolean; routine: boolean };
const KINDS_KEY = "aux.task-notice-kinds";
const SOUND_KEY = "aux.task-completion-sound";
const SELECTED_SOUND_KEY = "aux.task-selected-sound";
let selectedSoundFallback: "soft" | "bell" | "bright" = "soft";
let kindsFallback: TaskNoticeKinds = { attention: true, completion: true, routine: true };
let soundFallback = "off";
export function readTaskNoticeKinds(): TaskNoticeKinds {
  if (readInAppNoticePreference() === "off") return { attention: false, completion: false, routine: false };
  try {
    const value = JSON.parse(localStorage.getItem(KINDS_KEY) ?? "{}");
    return {
      attention: value?.attention !== false,
      completion: value?.completion !== false,
      routine: typeof value?.routine === "boolean" ? value.routine : value?.completion !== false,
    };
  } catch {
    return kindsFallback;
  }
}
export function writeTaskNoticeKinds(value: TaskNoticeKinds): void {
  kindsFallback = value;
  try {
    localStorage.setItem(KINDS_KEY, JSON.stringify(value));
  } catch {
    /* Current window fallback. */
  }
  writeInAppNoticePreference(value.attention || value.completion || value.routine ? "all" : "off");
}
export function readTaskSound(): "off" | "soft" | "bell" | "bright" {
  let value = soundFallback;
  try {
    value = localStorage.getItem(SOUND_KEY) ?? "off";
  } catch {
    /* Current window fallback. */
  }
  return value === "soft" || value === "bell" || value === "bright" ? value : "off";
}
export function readSelectedTaskSound(): "soft" | "bell" | "bright" {
  try {
    const value = localStorage.getItem(SELECTED_SOUND_KEY);
    return value === "bell" || value === "bright" ? value : "soft";
  } catch {
    return selectedSoundFallback;
  }
}
export function writeTaskSound(value: ReturnType<typeof readTaskSound>): void {
  soundFallback = value;
  if (value !== "off") selectedSoundFallback = value;
  try {
    localStorage.setItem(SOUND_KEY, value);
    if (value !== "off") localStorage.setItem(SELECTED_SOUND_KEY, value);
  } catch {
    /* Current window fallback. */
  }
  window.dispatchEvent(new Event(CHANGE));
}
