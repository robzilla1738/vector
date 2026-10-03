// @vitest-environment jsdom
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DefaultPageZoomSetting } from "./DefaultPageZoom";
const mocks = vi.hoisted(() => ({ zoom: vi.fn(), privateMode: false }));
vi.mock("../../bridge", () => ({
  bridge: {
    defaultPageZoom: mocks.zoom,
    get privateMode() {
      return mocks.privateMode;
    },
  },
  inNativeHost: true,
  inMock: false,
}));
const diagnostic = `Owned preference read failed: https://aux-owned.invalid/${"UnbrokenPreferenceDiagnostic".repeat(20)}`;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.zoom.mockReset();
  mocks.privateMode = false;
  host = document.createElement("div");
  host.className = "settings-content";
  document.body.append(host);
  root = createRoot(host);
  const css = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../components/Settings.css"),
    "utf8",
  );
  // Parse shipped scoped rules without layers/containers: jsdom does not lay out native text or pixels.
  const wrap = css.match(/\.settings-content :is\(\[role="alert"\], \.hint\) \{[^}]+\}/)?.[0];
  assert.ok(wrap);
  const controls = css.match(/\.settings-content \.btn \{[^}]+\}/)?.[0];
  assert.ok(controls?.includes("min-height: 36px"));
  style = document.createElement("style");
  style.textContent = `${wrap}\n${controls}`;
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  vi.unstubAllGlobals();
});
it("retains complete unbroken initial native diagnostic with readable wrapping and focused Retry recovery", async () => {
  mocks.zoom
    .mockRejectedValueOnce(new Error(diagnostic))
    .mockResolvedValueOnce({ percentage: 100, managed: false });
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  const hint = host.querySelector<HTMLElement>(".hint")!;
  expect(hint.textContent).toContain(diagnostic);
  expect(getComputedStyle(hint).overflowWrap).toBe("anywhere");
  expect(getComputedStyle(hint).minWidth).toBe("0");
  const retry = host.querySelector<HTMLButtonElement>("button")!;
  retry.focus();
  expect(document.activeElement).toBe(retry);
  expect(retry.disabled).toBe(false);
  expect(getComputedStyle(retry).minHeight).toBe("36px");
  await act(async () => retry.click());
  expect(mocks.zoom.mock.calls).toEqual([[], []]);
  expect(host.textContent).not.toContain(diagnostic);
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Default page zoom"]')!.value).toBe("100");
});
it("contains a real save rejection and preserves exact native retry read and selection", async () => {
  mocks.zoom
    .mockResolvedValueOnce({ percentage: 100, managed: false })
    .mockRejectedValueOnce(new Error(diagnostic))
    .mockResolvedValueOnce({ percentage: 125, managed: false });
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  const select = host.querySelector<HTMLSelectElement>("select")!;
  await act(async () => {
    select.value = "200";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const alert = host.querySelector<HTMLElement>('[role="alert"]')!;
  expect(alert.textContent).toContain(diagnostic);
  expect(getComputedStyle(alert).overflowWrap).toBe("anywhere");
  expect(select.disabled).toBe(false);
  expect(select.value).toBe("100");
  const retry = alert.querySelector<HTMLButtonElement>("button")!;
  retry.focus();
  expect(document.activeElement).toBe(retry);
  await act(async () => retry.click());
  expect(mocks.zoom.mock.calls).toEqual([[], [200], []]);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(select.value).toBe("125");
});
it("retains the managed and private refusal boundaries", async () => {
  mocks.zoom.mockResolvedValueOnce({ percentage: 100, managed: true });
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  expect(host.querySelector<HTMLSelectElement>("select")!.disabled).toBe(true);
  expect(host.textContent).toContain("Managed by your organization");
  mocks.privateMode = true;
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  expect(host.querySelector("select")).toBeNull();
  expect(host.textContent).toContain("cannot be changed in Private mode");
  expect(mocks.zoom).toHaveBeenCalledTimes(1);
});
