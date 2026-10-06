// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { captureFirstFrame, takeFirstFrame } from "./first-frame";

afterEach(() => {
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
