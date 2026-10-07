import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge, type OmniboxResult } from "../bridge";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { COMMANDS } from "@aux/contracts";
import { CommandBar } from "./CommandBar";
vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  inMock: true,
}));
const initial = useStore.getState();
const originalWindow = { id: bridge.windowId, kind: bridge.windowKind, private: bridge.privateMode };
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([{ width: 40, height: 28 }] as never);
  bridge.windowId = "original";
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  useStore.setState(
    { ...initial, settings: { homeEntryMode: "search" }, pages: normalizePages([]), runs: [], toasts: [] },
    true,
  );
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  vi.spyOn(bridge, "extensions").mockResolvedValue([]);
  vi.spyOn(bridge, "omnibox.start").mockRejectedValue(new Error("Original failure"));
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = originalWindow.id;
  bridge.windowKind = originalWindow.kind;
  bridge.privateMode = originalWindow.private;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function query(value = "original query") {
  await act(async () => root.render(<CommandBar surfaceMode="new-tab" />));
  const input = host.querySelector("input[role=combobox]") as HTMLInputElement;
  vi.mocked(bridge["omnibox.start"]).mockClear();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return input;
}
function retry() {
  return host.querySelector('[data-command-id="retry-browser-autocomplete"]') as HTMLButtonElement;
}
it("registers one focused remappable retry preserving original query and private policy", async () => {
  bridge.windowKind = "private";
  bridge.privateMode = true;
  await query();
  expect(retry()).not.toBeNull();
  retry().focus();
  await act(async () => {
    await executeCommand("retry-browser-autocomplete");
  });
  expect(bridge["omnibox.start"]).toHaveBeenCalledTimes(2);
  expect(bridge["omnibox.start"]).toHaveBeenLastCalledWith(
    expect.objectContaining({ input: "original query" }),
  );
  const row = COMMANDS.find((row) => row.id === "retry-browser-autocomplete")!;
  expect(row.dispatch).toBe("scoped");
  expect(row.bindings).toEqual([]);
  expect("windows" in row).toBe(false);
});
it("recovers a synchronous original transport failure through the same Retry", async () => {
  vi.mocked(bridge["omnibox.start"]).mockImplementation(() => {
    throw new Error("Synchronous original failure");
  });
  await query();
  expect(host.textContent).toContain("Browser suggestions couldn’t load");
  vi.mocked(bridge["omnibox.start"]).mockResolvedValue(true);
  await act(async () => retry().click());
  expect(bridge["omnibox.start"]).toHaveBeenCalledTimes(2);
  expect(retry()).toBeNull();
});
it("reserves an original failed owner once before held response and refuses foreign window", async () => {
  await query();
  retry().focus();
  bridge.windowId = "replacement";
  await expect(executeCommand("retry-browser-autocomplete")).rejects.toThrow("current browser suggestions");
  expect(bridge["omnibox.start"]).toHaveBeenCalledTimes(1);
  bridge.windowId = "original";
  let release!: (value: boolean) => void;
  vi.mocked(bridge["omnibox.start"]).mockImplementation(
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  );
  await act(async () => {
    await executeCommand("retry-browser-autocomplete");
    await expect(executeCommand("retry-browser-autocomplete")).rejects.toThrow("current browser suggestions");
  });
  expect(bridge["omnibox.start"]).toHaveBeenCalledTimes(2);
  await act(async () => release(true));
  expect(retry()).toBeNull();
});
it("retires an old failed query through A B A and retains current input", async () => {
  const input = await query("query A");
  const old = retry();
  await query("query B");
  await query("query A");
  old.focus();
  await expect(executeCommand("retry-browser-autocomplete")).rejects.toThrow();
  expect(input.value).toBe("query A");
  retry().focus();
  await act(async () => {
    await executeCommand("retry-browser-autocomplete");
  });
  expect(bridge["omnibox.start"]).toHaveBeenLastCalledWith(expect.objectContaining({ input: "query A" }));
});

it("does not publish original suggestions after its native window retires", async () => {
  let fail!: (reason: Error) => void;
  vi.mocked(bridge["omnibox.start"]).mockImplementation(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  await query();
  bridge.windowId = "replacement";
  await act(async () => fail(new Error("Retired protected failure")));
  expect(retry()).toBeNull();
  expect(host.textContent).not.toContain("Retired protected failure");
});

it("acknowledges only committed current native rows to an opted-in native benchmark", async () => {
  const performanceCommit = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("auxChromiumHost", { performanceCommit });
  let receive: ((result: OmniboxResult) => void) | undefined;
  vi.spyOn(bridge, "onOmniboxResult").mockImplementation((callback) => {
    receive = callback;
    return () => {};
  });
  vi.mocked(bridge["omnibox.start"]).mockResolvedValue(true);
  await query("native fixture");
  const request = vi.mocked(bridge["omnibox.start"]).mock.calls.at(-1)![0];
  const result: OmniboxResult = {
    queryId: request.queryId,
    sequenceId: 1,
    input: request.input,
    done: true,
    items: [
      {
        id: "original-history",
        index: 0,
        type: "history",
        title: "Original native fixture",
        url: "http://127.0.0.1:9000/aux-native-perf/fixture",
      },
    ],
  };
  expect(performanceCommit).not.toHaveBeenCalled();
  await act(async () => receive?.({ ...result, queryId: request.queryId + 1 }));
  expect(performanceCommit).not.toHaveBeenCalled();
  await act(async () => receive?.({ ...result, items: [] }));
  expect(performanceCommit).not.toHaveBeenCalled();
  await act(async () => receive?.(result));
  expect(host.textContent).toContain("Original native fixture");
  expect(performanceCommit).toHaveBeenCalledExactlyOnceWith(request.queryId);
  await act(async () => receive?.({ ...result, sequenceId: 2 }));
  expect(performanceCommit).toHaveBeenCalledTimes(1);
});
