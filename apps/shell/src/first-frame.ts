/** Hand the static Home editor to React without losing early input or its original Enter. */
export interface FirstFrameActivation {
  text: string;
  mode: "search" | "ask";
  newTab: boolean;
  current(): boolean;
  consume(): boolean;
  retire(): void;
}
export interface FirstFrameEntry {
  text: string;
  mode: "search" | "ask";
  focused: boolean;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: "forward" | "backward" | "none";
  activation?: FirstFrameActivation;
}
let entry: FirstFrameEntry | undefined;
let listening: { input: HTMLInputElement; activation?: FirstFrameActivation; stop(): void } | undefined;

/** Installed before importing React or the application graph. */
export function listenFirstFrame(): void {
  listening?.activation?.retire();
  listening?.stop();
  const input = document.querySelector<HTMLInputElement>("#first-frame-entry");
  if (!input) return;
  const mode = () =>
    document.querySelector<HTMLInputElement>("#first-frame-ask")?.checked ? "ask" : "search";
  let composing = false;
  const compositionStart = () => {
    composing = true;
  };
  const compositionEnd = () => {
    composing = false;
  };
  const change = (event: Event) => {
    if ((event.target as Element).matches('[name="first-frame-mode"]')) owner.activation?.retire();
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.target !== input ||
      document.activeElement !== input ||
      event.key !== "Enter" ||
      composing ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.repeat ||
      (mode() === "ask" && event.shiftKey) ||
      !input.value.trim()
    )
      return;
    event.preventDefault();
    if (owner.activation?.current()) return;
    let live = true,
      consumed = false;
    owner.activation = {
      text: input.value,
      mode: mode(),
      newTab: event.metaKey || event.ctrlKey,
      current: () => live,
      consume: () => {
        if (!live || consumed) return false;
        consumed = true;
        return true;
      },
      retire: () => {
        live = false;
      },
    };
  };
  const removed = (records: MutationRecord[]) => {
    if (
      records.some((record) =>
        [...record.removedNodes].some((node) => node === input || node.contains(input)),
      )
    )
      owner.activation?.retire();
  };
  const observer = new MutationObserver(removed);
  observer.observe(document.body, { childList: true, subtree: true });
  const owner: NonNullable<typeof listening> = {
    input,
    stop: () => {
      removed(observer.takeRecords());
      observer.disconnect();
      input.removeEventListener("keydown", keydown);
      input.removeEventListener("compositionstart", compositionStart);
      input.removeEventListener("compositionend", compositionEnd);
      document.removeEventListener("change", change);
      if (listening === owner) listening = undefined;
    },
  };
  listening = owner;
  input.addEventListener("keydown", keydown);
  input.addEventListener("compositionstart", compositionStart);
  input.addEventListener("compositionend", compositionEnd);
  document.addEventListener("change", change);
}

export function captureFirstFrame(): FirstFrameEntry | undefined {
  const original = listening;
  original?.stop();
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
    ...(original?.input === input && original.activation?.current()
      ? { activation: original.activation }
      : {}),
  };
  return entry;
}

export function takeFirstFrame(): FirstFrameEntry | undefined {
  const result = entry;
  entry = undefined;
  return result;
}
