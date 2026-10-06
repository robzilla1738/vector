/** Hand the static Home editor to React without losing early typing or selection. */
export interface FirstFrameEntry {
  text: string;
  mode: "search" | "ask";
  focused: boolean;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: "forward" | "backward" | "none";
}
let entry: FirstFrameEntry | undefined;

export function captureFirstFrame(): FirstFrameEntry | undefined {
  const input = document.querySelector<HTMLInputElement>("#first-frame-entry");
  if (!input) return undefined;
  const focused = document.activeElement === input;
  const ask = document.querySelector<HTMLInputElement>("#first-frame-ask")?.checked ?? false;
  const modeFocused = document.activeElement?.matches('[name="first-frame-mode"]') ?? false;
  if (!input.value && !focused && !ask && !modeFocused) return undefined;
  entry = {
    text: input.value,
    mode: ask ? "ask" : "search",
    focused,
    selectionStart: input.selectionStart ?? input.value.length,
    selectionEnd: input.selectionEnd ?? input.value.length,
    selectionDirection: input.selectionDirection ?? "none",
  };
  return entry;
}

export function takeFirstFrame(): FirstFrameEntry | undefined {
  const result = entry;
  entry = undefined;
  return result;
}
