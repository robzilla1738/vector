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
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 184 });
    host.querySelector("textarea")!.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenCalledTimes(1);
    contentHeight = 900;
    host.querySelector("textarea")!.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 360 });
    await act(async () => root.render(<Window conversation />));
    await flush();
    expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: true, draftHeight: 184 });
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
