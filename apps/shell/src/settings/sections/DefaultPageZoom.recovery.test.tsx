// @vitest-environment jsdom
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DefaultPageZoomSetting } from "./DefaultPageZoom";
const mocks = vi.hoisted(() => ({
  zoom: vi.fn(),
  privateMode: false,
  windowId: "zoom-window",
  available: true,
}));
vi.mock("../../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../bridge")>()),
  bridge: {
    ...(await importOriginal<typeof import("../../bridge")>()).bridge,
    windowKind: "normal",
    get windowId() {
      return mocks.windowId;
    },
    defaultPageZoom: mocks.zoom,
    get privateMode() {
      return mocks.privateMode;
    },
  },
  get inNativeHost() {
    return mocks.available;
  },
  inMock: false,
}));
const diagnostic = `Owned preference read failed: https://aux-owned.invalid/${"UnbrokenPreferenceDiagnostic".repeat(20)}`;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.zoom.mockReset();
  mocks.privateMode = false;
  mocks.windowId = "zoom-window";
  mocks.available = true;
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 } as DOMRect,
  ] as unknown as DOMRectList);
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
  assert.ok(controls?.includes("min-height: 32px"));
  style = document.createElement("style");
  style.textContent = `${wrap}\n${controls}`;
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  vi.restoreAllMocks();
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
  expect(getComputedStyle(retry).minHeight).toBe("32px");
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

import { dispatchShortcut, executeCommand } from "../../commands";
import { COMMANDS } from "@aux/contracts";
function held<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
function control() {
  return host.querySelector<HTMLSelectElement>("select")!;
}
async function render(active = true) {
  await act(async () => root.render(<DefaultPageZoomSetting active={active} />));
}
async function change(percentage: string) {
  await act(async () => {
    control().value = percentage;
    control().dispatchEvent(new Event("change", { bubbles: true }));
  });
}
it("retains all standard and actual nonstandard native choices with remappable scoped rows", async () => {
  for (const id of ["set-default-page-zoom", "retry-default-page-zoom"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      palette: false,
      windows: ["normal"],
      bindings: [],
      intercept: true,
    });
  mocks.zoom.mockResolvedValue({ percentage: 130, managed: false });
  await render();
  expect([...control().options].map((option) => option.value)).toEqual([
    "50",
    "67",
    "75",
    "80",
    "90",
    "100",
    "110",
    "125",
    "150",
    "175",
    "200",
    "130",
  ]);
  control().focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("set-default-page-zoom");
  });
  expect(await completion).toEqual({ percentage: 130, managed: false });
  expect(mocks.zoom).toHaveBeenLastCalledWith(130);
});
it("returns the identical native ACK through a focused remapped select", async () => {
  const ack = { percentage: 125, managed: false };
  mocks.zoom.mockResolvedValueOnce({ percentage: 100, managed: false }).mockResolvedValueOnce(ack);
  await render();
  control().focus();
  control().value = "125";
  await act(async () => expect(await executeCommand("set-default-page-zoom")).toBe(ack));
  expect(control().value).toBe("125");
  mocks.zoom.mockResolvedValueOnce({ percentage: 125, managed: false });
  await act(async () =>
    expect(
      dispatchShortcut({
        commandId: "set-default-page-zoom",
        key: "z",
        meta: true,
        ctrl: false,
        shift: true,
        alt: false,
      }),
    ).toBe(true),
  );
  expect(mocks.zoom).toHaveBeenLastCalledWith(125);
});
it("retains the identical save rejection and then recovers through the native read", async () => {
  const reason = new Error("native zoom refused");
  mocks.zoom
    .mockResolvedValueOnce({ percentage: 100, managed: false })
    .mockRejectedValueOnce(reason)
    .mockResolvedValueOnce({ percentage: 110, managed: false });
  await render();
  control().focus();
  control().value = "125";
  await act(async () => expect(executeCommand("set-default-page-zoom")).rejects.toBe(reason));
  expect(control().disabled).toBe(false);
  const retry = host.querySelector<HTMLButtonElement>("button")!;
  retry.focus();
  await act(async () =>
    expect(await executeCommand("retry-default-page-zoom")).toEqual({ percentage: 110, managed: false }),
  );
  expect(control().value).toBe("110");
});
for (const retirement of ["Private", "window", "inactive"] as const)
  it(`retires held native save delivery across ${retirement} A→B→A`, async () => {
    const pending = held<{ percentage: number; managed: boolean }>();
    mocks.zoom
      .mockResolvedValueOnce({ percentage: 100, managed: false })
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue({ percentage: 110, managed: false });
    await render();
    await change("200");
    if (retirement === "Private") mocks.privateMode = true;
    if (retirement === "window") mocks.windowId = "other-window";
    await render(retirement !== "inactive");
    mocks.privateMode = false;
    mocks.windowId = "zoom-window";
    await render();
    await act(async () => pending.resolve({ percentage: 200, managed: false }));
    expect(control().value).toBe("110");
  });
it("old save cleanup cannot clear fresh busy state", async () => {
  const old = held<{ percentage: number; managed: boolean }>(),
    fresh = held<{ percentage: number; managed: boolean }>();
  mocks.zoom
    .mockResolvedValueOnce({ percentage: 100, managed: false })
    .mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce({ percentage: 110, managed: false })
    .mockReturnValueOnce(fresh.promise);
  await render();
  await change("200");
  await render(false);
  await render();
  await change("125");
  await act(async () => old.resolve({ percentage: 200, managed: false }));
  expect(control().disabled).toBe(true);
  await act(async () => fresh.resolve({ percentage: 125, managed: false }));
  expect(control().disabled).toBe(false);
  expect(control().value).toBe("125");
});
it("refuses hidden, unfocused and managed controls before native mutation", async () => {
  mocks.zoom.mockResolvedValue({ percentage: 100, managed: false });
  await render();
  await expect(executeCommand("set-default-page-zoom")).rejects.toThrow();
  control().focus();
  host.hidden = true;
  await expect(executeCommand("set-default-page-zoom")).rejects.toThrow();
  host.hidden = false;
  await render(false);
  mocks.zoom.mockResolvedValue({ percentage: 100, managed: true });
  await render();
  control().focus();
  await expect(executeCommand("set-default-page-zoom")).rejects.toThrow();
  expect(mocks.zoom.mock.calls.every((args) => args.length === 0)).toBe(true);
});
it("settles synchronous native read and write throws with exact reason and usable controls", async () => {
  const readReason = new Error("sync read"),
    writeReason = new Error("sync write");
  mocks.zoom
    .mockImplementationOnce(() => {
      throw readReason;
    })
    .mockResolvedValueOnce({ percentage: 100, managed: false });
  await render();
  const retry = host.querySelector<HTMLButtonElement>("button")!;
  expect(retry.disabled).toBe(false);
  await act(async () => retry.click());
  mocks.zoom.mockImplementationOnce(() => {
    throw writeReason;
  });
  control().focus();
  control().value = "125";
  await act(async () => expect(executeCommand("set-default-page-zoom")).rejects.toBe(writeReason));
  expect(control().disabled).toBe(false);
  expect(host.textContent).toContain(writeReason.message);
});

it("rechecks actual native capability before a focused zoom change without a rerender", async () => {
  mocks.zoom.mockResolvedValueOnce({ percentage: 100, managed: false });
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  const select = host.querySelector<HTMLSelectElement>("select")!;
  select.focus();
  select.value = "125";
  mocks.available = false;
  await expect(executeCommand("set-default-page-zoom")).rejects.toThrow();
  expect(mocks.zoom.mock.calls).toEqual([[]]);
});
it("retains actual zoom ACK but refuses delivery after live capability loss", async () => {
  let resolve!: (value: { percentage: number; managed: boolean }) => void;
  const held = new Promise<{ percentage: number; managed: boolean }>((done) => {
    resolve = done;
  });
  const ack = { percentage: 125, managed: false };
  mocks.zoom.mockResolvedValueOnce({ percentage: 100, managed: false }).mockReturnValueOnce(held);
  await act(async () => root.render(<DefaultPageZoomSetting active />));
  const select = host.querySelector<HTMLSelectElement>("select")!;
  select.focus();
  select.value = "125";
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("set-default-page-zoom");
  });
  select.value = "100";
  mocks.available = false;
  await act(async () => resolve(ack));
  expect(await completion).toBe(ack);
  expect(select.value).toBe("100");
});
