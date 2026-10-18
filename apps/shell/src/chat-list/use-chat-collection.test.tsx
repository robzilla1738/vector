// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useChatCollection } from "./use-chat-collection";
import { call } from "../store";
const source = vi.hoisted(() => ({
  connected: true,
  status: undefined as undefined | ((value: { connected: boolean }) => void),
  off: vi.fn(),
}));
vi.mock("../bridge", () => ({
  bridge: {
    windowId: "window",
    windowKind: "normal",
    privateMode: false,
    onEvent: () => () => {},
    onRuntimeStatus: (callback: (value: { connected: boolean }) => void) => {
      source.status = (value) => {
        source.connected = value.connected;
        callback(value);
      };
      return source.off;
    },
  },
}));
vi.mock("../store", () => ({
  call: vi.fn(async () => []),
  useStore: (select: (state: { connected: boolean }) => unknown) => select({ connected: source.connected }),
}));
vi.mock("../run-history", () => ({ mergeHistory: vi.fn() }));
it("invalidates a stalled read and refreshes only conversation reads on native recovery", async () => {
  source.connected = true;
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div"),
    root = createRoot(host);
  document.body.append(host);
  let pending!: () => void;
  vi.mocked(call).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        pending = () => resolve([] as never);
      }),
  );
  function View() {
    const { state } = useChatCollection({ archived: false, policy: "paged" });
    return <div>{state.loading ? "Loading" : state.error || "Ready"}</div>;
  }
  try {
    await act(async () => root.render(<View />));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(110);
    });
    expect(call).toHaveBeenCalledOnce();
    await act(async () => source.status!({ connected: false }));
    expect(host.textContent).toContain("not responding");
    await act(async () => pending());
    expect(host.textContent).toContain("not responding");
    await act(async () => source.status!({ connected: true }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(110);
    });
    expect(call).toHaveBeenCalledTimes(2);
    expect(vi.mocked(call).mock.calls.every(([method]) => method === "conversations.list")).toBe(true);
    await act(async () => await Promise.resolve());
    expect(host.textContent).toBe("Ready");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.mocked(call).mockReset();
  }
  expect(source.off).toHaveBeenCalledTimes(3);
});
