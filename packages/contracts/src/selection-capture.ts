import { z } from "zod";
import { bindingKey, effectiveShortcuts, matchShortcut, type ShortcutOverrides } from "./shortcut-defs.js";

const clean = (value: string) => !/[\p{Cc}\p{Cf}]/u.test(value.replace(/[\n\t]/g, ""));
export const SelectionActionSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,79}$/),
  name: z.string().trim().min(1).max(60).refine(clean, "Remove invisible control characters."),
  enabled: z.boolean(),
  template: z.string().trim().min(1).max(2000).refine(clean, "Remove invisible control characters.")
    .refine(value => /\{(?:text|code|image)\}/.test(value), "Include {text}, {code}, or {image}.")
    .refine(value => ![...value.matchAll(/\{([a-zA-Z][\w]*)\}/g)].some(match => !["text", "code", "image"].includes(match[1]!)),
      "Only {text}, {code}, and {image} are supported.")
    .refine(value => [...value.matchAll(/\{(?:text|code|image)\}/g)].length <= 3, "Use at most three content tokens."),
}).strict();
export type SelectionAction = z.infer<typeof SelectionActionSchema>;

/** One modified chord; modifier-only gestures and bare typing keys are not hotkeys. */
export const CaptureHotkeySchema = z.object({
  key: z.string().regex(/^(?:[a-z0-9]| |f(?:[1-9]|1\d|2[0-4]))$/),
  command: z.boolean(), ctrl: z.boolean(), alt: z.boolean(), shift: z.boolean(),
}).strict().refine(value => value.command || value.ctrl || value.alt, "Use Command, Control, or Option with a key.");
export type CaptureHotkey = z.infer<typeof CaptureHotkeySchema>;

export const SelectionCaptureSettingsSchema = z.object({
  /** settings.set compares this revision, then stores revision + 1. */
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
  actions: z.array(SelectionActionSchema).max(12).refine(actions => new Set(actions.map(action => action.id)).size === actions.length,
    "Selection action IDs must be unique."),
  inlineAssist: z.boolean(),
  selectionDoubleTap: CaptureHotkeySchema.nullable(),
  regionCapture: CaptureHotkeySchema.nullable(),
}).strict();
export type SelectionCaptureSettings = z.infer<typeof SelectionCaptureSettingsSchema>;

export function defaultSelectionCaptureSettings(): SelectionCaptureSettings {
  return { revision: 0, inlineAssist: true, selectionDoubleTap: null, regionCapture: null, actions: [
    { id: "ask", name: "Ask Aux", enabled: true, template: "Help me understand this selected text.\n\n{text}" },
    { id: "explain", name: "Explain", enabled: true, template: "Explain this selected text clearly.\n\n{text}" },
    { id: "summarize", name: "Summarize", enabled: true, template: "Summarize this source and its key points.\n\n{text}" },
    { id: "image", name: "Ask about image", enabled: true, template: "Help me understand this image.\n\n{image}" },
  ] };
}

/** Invalid persisted data must not silently enable capture or reuse default actions. */
export function readSelectionCaptureSettings(value: unknown): SelectionCaptureSettings {
  if (value === undefined) return defaultSelectionCaptureSettings();
  const parsed = SelectionCaptureSettingsSchema.safeParse(value);
  return parsed.success ? parsed.data : { revision: 0, actions: [], inlineAssist: false, selectionDoubleTap: null, regionCapture: null };
}

export function captureShortcutConflict(value: SelectionCaptureSettings, overrides?: ShortcutOverrides, platform = "darwin"): string | null {
  const chords = [value.selectionDoubleTap, value.regionCapture].filter((chord): chord is CaptureHotkey => !!chord);
  if (chords.length === 2 && bindingKey(chords[0]!) === bindingKey(chords[1]!)) return "Use different shortcuts for selection and region capture.";
  for (const chord of chords) {
    const conflict = matchShortcut(effectiveShortcuts(overrides), { key: chord.key, meta: chord.command,
      ctrl: chord.ctrl, alt: chord.alt, shift: chord.shift }, { platform });
    if (conflict) return `This shortcut is already used by ${conflict.label}. Record a different shortcut.`;
  }
  return null;
}

/** Local preview only. Page text is quoted, never recursively expanded as a template. */
export function renderSelectionTemplate(template: string, content: { text: string; image?: string }): string {
  const parsed = SelectionActionSchema.shape.template.parse(template);
  if (content.text.length > 12_000 || (content.image?.length ?? 0) > 5000) throw new Error("The captured content is too large.");
  const quote = (text: string) => text.split("\n").map(line => `> ${line}`).join("\n");
  return parsed.replace(/\{(text|code|image)\}/g, (_token, kind: string) => {
    if (kind === "image") {
      if (!content.image) throw new Error("This action requires an attached image. Capture one before trying again.");
      return `Image supplied for review:\n${quote(content.image)}`;
    }
    if (!content.text) {
      if (kind === "code") throw new Error("This action requires selected code.");
      return "Use the explicitly attached page source.";
    }
    return `${kind === "code" ? "Selected code" : "Selected text"} (source content):\n${quote(content.text)}`;
  });
}
