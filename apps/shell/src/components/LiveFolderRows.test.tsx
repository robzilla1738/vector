// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { performance as nativeTestClock } from "node:perf_hooks";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ read: vi.fn(), command: vi.fn() }));
vi.mock("../store", () => ({ call: calls.read }));
vi.mock("../commands", () => ({ executeCommand: calls.command }));
vi.mock("./SiteTile", () => ({ FavIcon: () => null }));
import { LiveFolderRows } from "./LiveFolderRows";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const name = "aux:liveFolders:refresh";
const item = {
  id: "fixture",
  title: "Fresh fixture row",
  url: "https://fixture.test/",
  unread: true,
  updatedAt: 1,
};
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  calls.read.mockReset();
  calls.command.mockReset();
  vi.stubGlobal("performance", nativeTestClock);
  nativeTestClock.clearMarks();
  nativeTestClock.clearMeasures();
});
afterEach(() => {
  vi.unstubAllGlobals();
  nativeTestClock.clearMarks();
  nativeTestClock.clearMeasures();
});
it("measures ACK, row response and actual React commit before completing refresh", async () => {
  const ack = deferred<unknown>(),
    rows = deferred<{ items: (typeof item)[] }>();
  calls.read.mockResolvedValueOnce({ items: [] }).mockReturnValueOnce(rows.promise);
  calls.command.mockReturnValue(ack.promise);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () => root.render(<LiveFolderRows folderId="fixture-folder" />));
    const refresh = host.querySelector<HTMLButtonElement>('[aria-label="Refresh live folder"]')!;
    await act(async () => {
      refresh.click();
      refresh.click();
    });
    expect(calls.command).toHaveBeenCalledTimes(1);
    expect(calls.command).toHaveBeenCalledWith("refresh-live-folder", {
      payload: { folderId: "fixture-folder" },
    });
    expect(refresh.disabled).toBe(true);
    expect(nativeTestClock.getEntriesByName(name, "measure")).toHaveLength(0);
    await act(async () => ack.resolve({ items: [item] }));
    expect(nativeTestClock.getEntriesByName(name, "measure")).toHaveLength(0);
    expect(host.textContent).not.toContain(item.title);
    await act(async () => rows.resolve({ items: [item] }));
    expect(host.textContent).toContain(item.title);
    expect(refresh.disabled).toBe(false);
    const measured = nativeTestClock.getEntriesByName(name, "measure");
    expect(measured).toHaveLength(1);
    expect(JSON.parse((measured[0] as PerformanceMeasure).detail)).toMatchObject({
      units: 1,
      committed: true,
    });
    expect(nativeTestClock.getEntriesByType("mark")).toHaveLength(0);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
it("rejected ACK retains actionable error without a false completed refresh", async () => {
  const ack = deferred<unknown>();
  calls.read.mockResolvedValue({ items: [] });
  calls.command.mockReturnValue(ack.promise);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  try {
    await act(async () => root.render(<LiveFolderRows folderId="fixture-folder" />));
    const refresh = host.querySelector<HTMLButtonElement>('[aria-label="Refresh live folder"]')!;
    await act(async () => refresh.click());
    await act(async () => ack.reject(new Error("Source refresh unavailable. Try again.")));
    expect(host.textContent).toContain("Source refresh unavailable. Try again.");
    expect(refresh.disabled).toBe(false);
    expect(nativeTestClock.getEntriesByName(name, "measure")).toHaveLength(0);
    expect(nativeTestClock.getEntriesByType("mark")).toHaveLength(0);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
it("unmounted folder retires measurement and late source reply cannot produce a sample", async () => {
  const ack = deferred<unknown>();
  calls.read.mockResolvedValue({ items: [] });
  calls.command.mockReturnValue(ack.promise);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  await act(async () => root.render(<LiveFolderRows folderId="fixture-folder" />));
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Refresh live folder"]')!.click());
  await act(async () => root.unmount());
  host.remove();
  await act(async () => ack.resolve({ items: [item] }));
  expect(nativeTestClock.getEntriesByName(name, "measure")).toHaveLength(0);
  expect(nativeTestClock.getEntriesByType("mark")).toHaveLength(0);
});
