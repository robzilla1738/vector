// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { makePage } from "../mock/fixtures";
import { sourceRef } from "../browser-context-sources";
import { BrowserContextTray } from "./BrowserContextTray";
const initial = useStore.getState();
const old = makePage(0, { pageId: "original", title: "original", url: "https://example.test/old", documentEpoch: 1, sessionId: "old-session" });
const current = { ...old, url: "https://example.test/current", documentEpoch: 2, sessionId: "current-session" };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const sources = vi.fn();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  useStore.setState({ pages: [current], toasts: [] }); sources.mockReset();
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const render = (disabled = false) => act(async () => root.render(<BrowserContextTray primary="none" sources={[sourceRef(old)]} onPrimary={vi.fn()} onSources={sources} disabled={disabled} />));
const button = () => host.querySelector<HTMLButtonElement>('[data-command-id="update-browser-source"]')!;
it("actual registered button reads genuine current page and publishes its original snapshot once", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async method => { if (method === "browser.recovery.list") return []; if (method === "pages.list") return [current]; throw new Error(method); });
  await render(); expect(button()).not.toBeNull(); await act(async () => button().click());
  expect(sources).toHaveBeenCalledExactlyOnceWith([expect.objectContaining({ pageId: current.pageId, url: current.url, sessionId: current.sessionId, documentEpoch: current.documentEpoch })]);
  expect(invoke.mock.calls.map(([method]) => method)).toEqual(["browser.recovery.list", "pages.list"]);
});
it("same registered command from focused control retains held Promise and refuses later document drift", async () => {
  let finish!: (value: typeof current[]) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async method => { if (method === "browser.recovery.list") return []; if (method === "pages.list") return new Promise(done => { finish = done; }); throw new Error(method); });
  await render(); button().focus(); let completion!: Promise<unknown>;
  await act(async () => { completion = executeCommand("update-browser-source", { payload: { pageId: current.pageId } }); });
  expect(button().disabled).toBe(true); expect(sources).not.toHaveBeenCalled();
  await act(async () => { finish([{ ...current, documentEpoch: 3 }]); await completion; });
  expect(sources).not.toHaveBeenCalled(); expect(useStore.getState().toasts.at(-1)?.text).toContain("changed while updating");
});
it("disabled retirement prevents late page reply replacing original selected source", async () => {
  let finish!: (value: typeof current[]) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async method => { if (method === "browser.recovery.list") return []; if (method === "pages.list") return new Promise(done => { finish = done; }); throw new Error(method); });
  await render(); await act(async () => button().click()); await render(true);
  await act(async () => finish([current])); expect(sources).not.toHaveBeenCalled();
  button().focus(); await expect(executeCommand("update-browser-source", { payload: { pageId: current.pageId } })).rejects.toThrow("Choose");
});
