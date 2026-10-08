// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { captureFirstFrame, listenFirstFrame, takeFirstFrame } from "./first-frame";

afterEach(() => {
  captureFirstFrame();
  takeFirstFrame();
  document.body.replaceChildren();
});

it("hands early typing, mode and backward selection to React once", () => {
  document.body.innerHTML = '<input id="first-frame-entry"><input type="radio" id="first-frame-ask" checked>';
  const input = document.querySelector<HTMLInputElement>("#first-frame-entry")!;
  input.value = "plan a trip";
  input.focus();
  input.setSelectionRange(5, 11, "backward");
  const captured = captureFirstFrame();
  document.body.replaceChildren();
  expect(takeFirstFrame()).toEqual({
    text: "plan a trip",
    mode: "ask",
    focused: true,
    selectionStart: 5,
    selectionEnd: 11,
    selectionDirection: "backward",
  });
  expect(captured?.text).toBe("plan a trip");
  expect(takeFirstFrame()).toBeUndefined();
});

it("does not override a saved Home preference with an untouched skeleton", () => {
  document.body.innerHTML = '<input id="first-frame-entry">';
  expect(captureFirstFrame()).toBeUndefined();
  expect(takeFirstFrame()).toBeUndefined();
});

function staticEditor(mode: "search" | "ask" = "search") {
  document.body.innerHTML =
    '<div id="first-frame"><input id="first-frame-entry"><input id="first-frame-ask" name="first-frame-mode" type="radio"></div>';
  const input = document.querySelector<HTMLInputElement>("#first-frame-entry")!;
  document.querySelector<HTMLInputElement>("#first-frame-ask")!.checked = mode === "ask";
  input.value = "original text";
  input.focus();
  return input;
}
function enter(input: HTMLInputElement, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...options });
  input.dispatchEvent(event);
  return event;
}
it("captures Enter before a held application import, preserving later typing and claiming only once", async () => {
  const input = staticEditor();
  let release!: (module: object) => void;
  vi.doMock(
    "./main",
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  await import("./bootstrap");
  expect(enter(input, { metaKey: true }).defaultPrevented).toBe(true);
  input.value = "newer unsent text";
  input.setSelectionRange(2, 5, "backward");
  const captured = captureFirstFrame()!;
  expect(captured.text).toBe("newer unsent text");
  expect(captured.selectionDirection).toBe("backward");
  expect(captured.activation).toMatchObject({ text: "original text", mode: "search", newTab: true });
  expect(captured.activation!.consume()).toBe(true);
  expect(captured.activation!.consume()).toBe(false);
  release({});
  vi.doUnmock("./main");
});
it.each([{ isComposing: true }, { keyCode: 229 }, { repeat: true }, { shiftKey: true }])(
  "does not activate Ask for composition, repeat or newline: %j",
  (options) => {
    const input = staticEditor("ask");
    listenFirstFrame();
    expect(enter(input, options).defaultPrevented).toBe(false);
    expect(captureFirstFrame()?.activation).toBeUndefined();
  },
);
it("respects the active composition lifetime even when a key event omits its flag", () => {
  const input = staticEditor();
  listenFirstFrame();
  input.dispatchEvent(new CompositionEvent("compositionstart"));
  enter(input);
  input.dispatchEvent(new CompositionEvent("compositionend"));
  expect(captureFirstFrame()?.activation).toBeUndefined();
});
it.each(["mode", "target"])("permanently retires an observed %s ABA before handoff", (kind) => {
  const input = staticEditor();
  listenFirstFrame();
  enter(input);
  if (kind === "mode") {
    const mode = document.querySelector<HTMLInputElement>("#first-frame-ask")!;
    mode.checked = true;
    mode.dispatchEvent(new Event("change", { bubbles: true }));
    mode.checked = false;
    mode.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    const parent = input.parentElement!;
    input.remove();
    parent.append(input);
    input.focus();
  }
  expect(captureFirstFrame()?.activation).toBeUndefined();
});
