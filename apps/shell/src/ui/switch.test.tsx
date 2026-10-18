// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Switch } from "./index";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function pointer(input: HTMLInputElement, type: string, clientX: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button: 0 });
  Object.defineProperty(event, "pointerId", { value: 1 });
  input.dispatchEvent(event);
}

it("commits a controlled drag once and suppresses the browser's following pointer click", async () => {
  const changed = vi.fn();
  function Fixture() {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        aria-label="Remember pages"
        checked={checked}
        onChange={(event) => {
          changed(event.currentTarget.checked);
          setChecked(event.currentTarget.checked);
        }}
      />
    );
  }
  await act(async () => root.render(<Fixture />));
  const input = host.querySelector("input")!;
  await act(async () => {
    pointer(input, "pointerdown", 10);
    pointer(input, "pointermove", 22);
  });
  expect(input.hasAttribute("data-dragging")).toBe(true);
  expect(input.style.getPropertyValue("--switch-thumb-center")).toBe("26px");
  expect(changed).not.toHaveBeenCalled();
  await act(async () => pointer(input, "pointerup", 22));
  expect(input.checked).toBe(true);
  expect(changed.mock.calls).toEqual([[true]]);
  await act(async () =>
    input.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })),
  );
  expect(input.checked).toBe(true);
  expect(changed).toHaveBeenCalledTimes(1);
  expect(input.hasAttribute("data-dragging")).toBe(false);
  expect(input.style.getPropertyValue("--switch-thumb-center")).toBe("");
  await act(async () => input.click());
  expect(input.checked).toBe(false);
  expect(changed.mock.calls).toEqual([[true], [false]]);
});

it("keeps an uncontrolled checkbox unchanged on a cancelled drag and commits a later left drag", async () => {
  const changed = vi.fn();
  await act(async () => root.render(<Switch aria-label="Show previews" defaultChecked onChange={changed} />));
  const input = host.querySelector("input")!;
  await act(async () => {
    pointer(input, "pointerdown", 30);
    pointer(input, "pointermove", 18);
    pointer(input, "pointercancel", 18);
  });
  expect(input.checked).toBe(true);
  expect(changed).not.toHaveBeenCalled();
  expect(input.hasAttribute("data-dragging")).toBe(false);
  await act(async () => {
    pointer(input, "pointerdown", 30);
    pointer(input, "pointermove", 18);
    pointer(input, "pointerup", 18);
  });
  expect(input.checked).toBe(false);
  expect(changed).toHaveBeenCalledTimes(1);
});

it("retains click behavior below the drag threshold and retires a preview when disabled", async () => {
  const changed = vi.fn();
  const render = (disabled: boolean) => (
    <Switch aria-label="Automatic suggestions" disabled={disabled} onChange={changed} />
  );
  await act(async () => root.render(render(false)));
  const input = host.querySelector("input")!;
  await act(async () => {
    pointer(input, "pointerdown", 10);
    pointer(input, "pointermove", 13);
    pointer(input, "pointerup", 13);
    input.click();
  });
  expect(input.checked).toBe(true);
  expect(changed).toHaveBeenCalledTimes(1);
  await act(async () => {
    pointer(input, "pointerdown", 24);
    pointer(input, "pointermove", 12);
  });
  expect(input.hasAttribute("data-dragging")).toBe(true);
  await act(async () => root.render(render(true)));
  expect(input.hasAttribute("data-dragging")).toBe(false);
  await act(async () => pointer(input, "pointerup", 12));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(input.getAttribute("role")).toBe("switch");
});
