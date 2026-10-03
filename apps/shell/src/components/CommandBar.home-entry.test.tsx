// @vitest-environment jsdom
import { act, type ReactNode, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { CommandBar } from "./CommandBar";

// Keep actual CommandBar and HomeAsk mode/state wiring; omit unrelated chat RPCs.
vi.mock("./Conversation", () => ({ Conversation: ({ entryControls, composerRef }: { entryControls?: ReactNode; composerRef: RefObject<HTMLTextAreaElement | null> }) => <section><textarea aria-label="Home conversation draft" ref={composerRef} />{entryControls}</section> }));
const initial = useStore.getState(), originalPrivate = bridge.privateMode;
const legacyKey = "aux.home.entry-mode.v1";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let values: Map<string, string>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  values = new Map();
  vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
  Element.prototype.scrollIntoView ??= () => {};
  bridge.privateMode = false;
  useStore.setState({ ...initial, settings: {}, railOpen: false, agentDraft: "", conversationId: null, toasts: [] }, true);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue({} as never);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); bridge.privateMode = originalPrivate;
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
async function render(hero = true) {
  // Resolve the actual lazy component, rather than guessing a module-load delay.
  await act(async () => { await import("./HomeAsk"); root.render(<CommandBar hero={hero} />); });
}
function modeButton(label: string) { return [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === label)!; }

it("opens fresh regular Home directly in the existing Ask composer", async () => {
  await render();
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  expect(modeButton("Ask").getAttribute("aria-pressed")).toBe("true");
  expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
});
it.each([{ mode: "search", selector: ".cmdbar input", other: "ask" }, { mode: "ask", selector: ".home-ask textarea", other: "search" }] as const)(
  "retains explicit $mode ahead of opposite legacy preference", async ({ mode, selector, other }) => {
    values.set(legacyKey, other); useStore.setState({ settings: { homeEntryMode: mode, dataDir: "/disposable" } });
    await render(); expect(host.querySelector(selector)).not.toBeNull();
    expect(modeButton(mode === "ask" ? "Ask" : "Search").getAttribute("aria-pressed")).toBe("true");
    expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
  });
it.each([{ mode: "search", selector: ".cmdbar input" }, { mode: "ask", selector: ".home-ask textarea" }] as const)(
  "migrates legacy $mode only after real preference ACK while retaining its entry choice", async ({ mode, selector }) => {
    values.set(legacyKey, mode); useStore.setState({ settings: { dataDir: "/disposable" } });
    let resolve!: (value: unknown) => void;
    vi.mocked(bridge.invoke).mockImplementation((method) => method === "settings.set" ? new Promise(r => { resolve = r; }) as never : Promise.resolve({}) as never);
    await render(); expect(host.querySelector(selector)).not.toBeNull();
    expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: mode });
    expect(values.get(legacyKey)).toBe(mode);
    await act(async () => resolve({})); expect(values.has(legacyKey)).toBe(false);
  });
it("restores fresh effective Ask after switching to Search fails", async () => {
  await render();
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Preference save failed"));
  await act(async () => modeButton("Search").click());
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
  expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: "search" });
});
it("restores explicit Search after switching to Ask fails", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } }); await render();
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Preference save failed"));
  await act(async () => modeButton("Ask").click());
  expect(host.querySelector(".cmdbar input")).not.toBeNull();
  expect(bridge.invoke).toHaveBeenCalledWith("settings.set", { homeEntryMode: "ask" });
});
it("retains legacy Search when its migration save rejects", async () => {
  values.set(legacyKey, "search"); useStore.setState({ settings: { dataDir: "/disposable" } });
  vi.mocked(bridge.invoke).mockRejectedValueOnce(new Error("Migration failed")); await render();
  expect(host.querySelector(".cmdbar input")).not.toBeNull(); expect(values.get(legacyKey)).toBe("search");
});
it("uses fresh Ask even when optional legacy storage is unavailable", async () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw new Error("Storage unavailable"); }, removeItem: () => {} });
  await render(); expect(host.querySelector(".home-ask textarea")).not.toBeNull();
});
it.each([{ name: "private Home", hero: true, privateMode: true }, { name: "address", hero: false, privateMode: false }] as const)(
  "keeps $name on existing Search policy without migrating legacy Ask", async ({ hero, privateMode }) => {
    bridge.privateMode = privateMode; values.set(legacyKey, "ask"); useStore.setState({ settings: { homeEntryMode: "ask", dataDir: "/disposable" } });
    await render(hero); expect(host.querySelector(".cmdbar input")).not.toBeNull(); expect(host.querySelector(".home-ask")).toBeNull();
    expect(bridge.invoke).not.toHaveBeenCalledWith("settings.set", expect.anything());
  });

it("does not remove a newer legacy choice when original migration ACK arrives", async () => {
  values.set(legacyKey, "search"); useStore.setState({ settings: { dataDir: "/disposable" } });
  let resolve!: (value: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation(method => method === "settings.set" ? new Promise(r => { resolve = r; }) as never : Promise.resolve({}) as never);
  await render(); values.set(legacyKey, "ask");
  await act(async () => resolve({})); expect(values.get(legacyKey)).toBe("ask");
});
it("keeps a newer acknowledged preference when an older mode save rejects", async () => {
  useStore.setState({ settings: { homeEntryMode: "search" } }); await render();
  let reject!: (error: unknown) => void;
  vi.mocked(bridge.invoke).mockImplementation(method => method === "settings.set" ? new Promise((_, r) => { reject = r; }) as never : Promise.resolve({}) as never);
  await act(async () => modeButton("Ask").click());
  await act(async () => useStore.setState({ settings: { homeEntryMode: "ask" } }));
  await act(async () => reject(new Error("Old save failed")));
  expect(host.querySelector(".home-ask textarea")).not.toBeNull();
});
