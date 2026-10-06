// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Checkbox, Select, Switch } from "./index";
it("opt-in input refs publish exact original controls and preserve classes, disabled state and original change events", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const checkboxRef = vi.fn(),
    selectRef = vi.fn(),
    changed = vi.fn();
  try {
    await act(async () =>
      root.render(
        <>
          <Checkbox controlRef={checkboxRef} aria-label="Original consent" disabled checked readOnly />
          <Select controlRef={selectRef} aria-label="Original filter" value="all" onChange={changed}>
            <option value="all">All</option>
            <option value="active">Active</option>
          </Select>
        </>,
      ),
    );
    const checkbox = host.querySelector<HTMLInputElement>("input")!,
      select = host.querySelector<HTMLSelectElement>("select")!;
    expect(checkboxRef.mock.calls.at(-1)?.[0]).toBe(checkbox);
    expect(selectRef.mock.calls.at(-1)?.[0]).toBe(select);
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.checked).toBe(true);
    expect(checkbox.className).toBe("ui-checkbox ");
    expect(select.className).toBe("ui-select ");
    const original = new Event("change", { bubbles: true });
    await act(async () => {
      select.value = "active";
      select.dispatchEvent(original);
    });
    expect(changed.mock.calls[0]?.[0].nativeEvent).toBe(original);
    await act(async () => root.render(null));
    expect(checkboxRef.mock.calls.at(-1)?.[0]).toBeNull();
    expect(selectRef.mock.calls.at(-1)?.[0]).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});

it("Switch forwards only its original opt-in input ref, preserving role/class and event", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const controlRef = vi.fn(),
    changed = vi.fn();
  try {
    await act(async () =>
      root.render(
        <Switch controlRef={controlRef} aria-label="Original switch" checked={false} onChange={changed} />,
      ),
    );
    const input = host.querySelector("input")!;
    expect(controlRef.mock.calls.at(-1)?.[0]).toBe(input);
    expect(input.getAttribute("role")).toBe("switch");
    expect(input.className).toBe("ui-switch ");
    expect(input.hasAttribute("controlRef")).toBe(false);
    await act(async () => input.click());
    expect(changed.mock.calls[0]?.[0].nativeEvent.target).toBe(input);
    await act(async () => root.render(null));
    expect(controlRef.mock.calls.at(-1)?.[0]).toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
  }
});
