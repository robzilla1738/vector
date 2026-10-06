import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { PageRecovery } from "./PageRecovery";

let host: HTMLDivElement,
  root: ReturnType<typeof createRoot>,
  originalState: ReturnType<typeof useStore.getState>;
const originalBridge = {
  windowId: bridge.windowId,
  windowKind: bridge.windowKind,
  privateMode: bridge.privateMode,
};
let page: PageTarget;
const toast = vi.fn();
const held = <T,>() => {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
const button = (name: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find((node) => node.textContent === name)!;
async function mount() {
  await act(async () => root.render(<PageRecovery page={page} />));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 160, height: 36 },
  ] as unknown as DOMRectList);
  originalState = useStore.getState();
  bridge.windowId = "original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  page = {
    pageId: "page",
    windowId: "original",
    backend: "aux",
    targetId: "original-target",
    sessionId: "original-session",
    documentEpoch: 1,
    lastRevision: 0,
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
    title: "Fixture",
    url: "https://fixture.test/",
    viewStatus: "visible",
    canGoBack: true,
    navigationError: { url: "https://fixture.test/", code: -105, message: "ERR_NAME_NOT_RESOLVED" },
  };
  toast.mockReset();
  useStore.setState({ mode: "focus", pages: normalizePages([page]), activePageId: page.pageId, toast });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Object.assign(bridge, originalBridge);
  useStore.setState(originalState, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("permanently refuses observed foreign-window ABA through the real registered dispatcher", async () => {
  const producer = vi.spyOn(bridge, "invoke").mockResolvedValue({ actual: "ACK" });
  await mount();
  button("Try again").focus();
  bridge.windowId = "foreign";
  await expect(executeCommand("retry-page-recovery")).rejects.toThrow("current");
  bridge.windowId = "original";
  await expect(executeCommand("retry-page-recovery")).rejects.toThrow("current");
  expect(producer).not.toHaveBeenCalled();
});
it("keeps the original rejection but retires its presentation after observed live-page ABA", async () => {
  const response = held<unknown>();
  const producer = vi.spyOn(bridge, "invoke").mockReturnValue(response.promise);
  await mount();
  button("Try again").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("retry-page-recovery");
  });
  const reason = new Error("Original private producer diagnostic");
  const observed = completion.catch((error) => error);
  useStore.setState({ pages: normalizePages([{ ...page, documentEpoch: 2 }]) });
  button("Edit address").focus();
  await expect(executeCommand("edit-page-recovery-address")).rejects.toThrow("current");
  useStore.setState({ pages: normalizePages([page]) });
  await act(async () => response.reject(reason));
  expect(await observed).toBe(reason);
  expect(host.textContent).not.toContain(reason.message);
  expect(toast).not.toHaveBeenCalled();
  expect(producer.mock.calls).toEqual([["pages.reload", { pageId: "page" }]]);
});
it("retains unknown ACK and a fresh action's busy state after original observed retirement", async () => {
  const old = held<unknown>(),
    fresh = held<unknown>();
  const producer = vi
    .spyOn(bridge, "invoke")
    .mockReturnValueOnce(old.promise)
    .mockReturnValueOnce(fresh.promise);
  await mount();
  button("Try again").focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand("retry-page-recovery");
  });
  bridge.privateMode = true;
  button("Edit address").focus();
  await expect(executeCommand("edit-page-recovery-address")).rejects.toThrow("current");
  bridge.privateMode = false;
  page = { ...page, documentEpoch: 2 };
  useStore.setState({ pages: normalizePages([page]) });
  await mount();
  await act(async () => button("Go back").click());
  const ack = { original: "truthful ACK" };
  await act(async () => old.resolve(ack));
  expect(await completion).toBe(ack);
  expect(button("Going back…").disabled).toBe(true);
  await act(async () => fresh.resolve({ fresh: "ACK" }));
  expect(button("Go back").disabled).toBe(false);
  expect(producer.mock.calls).toEqual([
    ["pages.reload", { pageId: "page" }],
    ["pages.back", { pageId: "page" }],
  ]);
});
