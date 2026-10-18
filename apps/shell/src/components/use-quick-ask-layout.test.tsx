// @vitest-environment jsdom
import { act, useRef } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useQuickAskLayout } from "./use-quick-ask-layout";
import { bridge } from "../bridge";

vi.mock("../bridge", () => ({
  inNativeHost: true,
  bridge: {
    windowId: "quick-window",
    windowKind: "quick-ask",
    quickAskLayout: vi.fn(async () => true),
  },
}));

it("resizes only for changed draft geometry or conversation state and retires with its window", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  let scheduled: FrameRequestCallback | undefined;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    scheduled = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    scheduled = undefined;
  });
  const flush = async () =>
    act(async () => {
      const callback = scheduled;
      scheduled = undefined;
      callback?.(0);
    });
  let contentHeight = 40;
  vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => contentHeight);
  function Window({ conversation }: { conversation: boolean }) {
    const input = useRef<HTMLTextAreaElement>(null);
    useQuickAskLayout(input, "draft");
    return (
      <div className="quick-ask-panel">
        <div className="conversation" data-empty-transcript={conversation ? undefined : ""}>
          <textarea ref={input} />
          <div className="composer-footer" />
        </div>
      </div>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Window conversation={false} />));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 92 });
    host.querySelector("textarea")!.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(1);
    contentHeight = 900;
    host.querySelector("textarea")!.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 360 });
    await act(async () => root.render(<Window conversation />));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: true, draftHeight: 92 });
    bridge.windowId = "replacement-window";
    await act(async () => root.render(<Window conversation={false} />));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(3);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    bridge.windowId = "quick-window";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});

it("sizes only reachable composer dialogs, coalesces pending bounds, and retires queued layouts with the original window", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.mocked(bridge.quickAskLayout).mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const frames = new Map<number, FrameRequestCallback>();
  let next = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++next, callback);
    return next;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  const flush = async () =>
    act(async () => {
      const batch = [...frames.values()];
      frames.clear();
      for (const callback of batch) callback(0);
    });
  vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockReturnValue(32);
  vi.spyOn(HTMLDialogElement.prototype, "scrollHeight", "get").mockReturnValue(700);
  const { ownedDialogs } = await import("../ui/modal-stack");
  const { requestStageReport } = await import("../stage-obstruction");
  const host = document.createElement("div"),
    foreign = document.createElement("dialog"),
    owned = document.createElement("dialog");
  foreign.id = "foreign-quick-dialog";
  owned.id = "owned-quick-dialog";
  foreign.open = owned.open = true;
  ownedDialogs.add(foreign);
  ownedDialogs.add(owned);
  document.body.append(host, foreign, owned);
  const root = createRoot(host);
  function Window() {
    const input = useRef<HTMLTextAreaElement>(null);
    useQuickAskLayout(input, "draft");
    return (
      <div className="quick-ask-panel">
        <div className="conversation" data-empty-transcript="">
          <textarea ref={input} />
          <button aria-controls={owned.id} aria-expanded="false">
            Context
          </button>
          <div className="composer-footer" />
        </div>
      </div>
    );
  }
  let release!: () => void;
  try {
    await act(async () => root.render(<Window />));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 92 });
    // Global dialogs are not evidence of ownership by this composer.
    requestStageReport();
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(1);
    vi.mocked(bridge.quickAskLayout).mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          release = () => done(true);
        }),
    );
    host.querySelector("button")!.setAttribute("aria-expanded", "true");
    requestStageReport();
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 360 });
    owned.open = false;
    requestStageReport();
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(2);
    await act(async () => release());
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 92 });
    vi.mocked(bridge.quickAskLayout).mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          release = () => done(true);
        }),
    );
    owned.open = true;
    requestStageReport();
    await flush();
    owned.open = false;
    requestStageReport();
    await flush();
    bridge.windowId = "retired-window";
    await act(async () => release());
    bridge.windowId = "quick-window";
    requestStageReport();
    await flush();
    // The old owner never publishes the queued close, even after identity returns.
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(4);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    foreign.remove();
    owned.remove();
    ownedDialogs.delete(foreign);
    ownedDialogs.delete(owned);
    bridge.windowId = "quick-window";
    vi.mocked(bridge.quickAskLayout).mockResolvedValue(true);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
