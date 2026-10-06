// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const native = vi.hoisted(() => ({ windowId: "original", privateMode: false, kind: "normal" }));
vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  bridge: {
    ...(await original<typeof import("../bridge")>()).bridge,
    get windowId() {
      return native.windowId;
    },
    get privateMode() {
      return native.privateMode;
    },
    get windowKind() {
      return native.kind;
    },
  },
}));
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { RunPanel } from "./RunPanel";
import { RunPanelAction } from "./RunPanelAction";
const initial = useStore.getState(),
  retry = vi.fn();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 },
  ] as unknown as DOMRectList);
  native.windowId = "original";
  native.privateMode = false;
  native.kind = "normal";
  retry.mockReset().mockResolvedValue(undefined);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    runs: [
      {
        runId: "turn",
        goal: "Hello",
        status: "completed",
        pageIds: [],
        createdAt: 1,
        endedAt: 2,
        result: { answer: "Hello back" },
        config: { chatId: "chat" },
      },
    ],
    steps: { turn: [] },
    retryRun: retry,
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const render = () =>
  act(async () =>
    root.render(
      <RunPanel
        runId="turn"
        conversation
        latest
        controlsInComposer
        readOnly={native.privateMode || native.windowId !== "original"}
      />,
    ),
  );
const button = (id: string) => host.querySelector<HTMLButtonElement>(`[data-command-id="${id}"]`)!;
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
it("copies original answer through its remapped focused control", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  await render();
  button("copy-run-answer").focus();
  await act(async () =>
    expect(
      dispatchShortcut({ commandId: "copy-run-answer", key: "c", meta: true, shift: true, alt: false }),
    ).toBe(true),
  );
  expect(writeText).toHaveBeenCalledExactlyOnceWith("Hello back");
  expect(button("copy-run-answer").getAttribute("aria-label")).toBe("Copied");
});
it("returns original retry ACK without adding any subsequently selected page", async () => {
  const ack = { original: true };
  retry.mockResolvedValue(ack);
  await render();
  button("retry-run-turn").focus();
  await act(async () => expect(await executeCommand("retry-run-turn")).toBe(ack));
  expect(retry).toHaveBeenCalledExactlyOnceWith("turn");
});
for (const change of ["window", "Private", "run"] as const)
  it(`retires held original copy delivery across ${change} A→B→A`, async () => {
    const copy = held<void>();
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn(() => copy.promise) } });
    await render();
    await act(async () => button("copy-run-answer").click());
    const original = useStore.getState().runs;
    if (change === "window") native.windowId = "other";
    else if (change === "Private") native.privateMode = true;
    else
      await act(async () =>
        useStore.setState({ runs: original.map((run) => ({ ...run, result: { answer: "Fresh answer" } })) }),
      );
    await render();
    native.windowId = "original";
    native.privateMode = false;
    await act(async () => useStore.setState({ runs: original }));
    await render();
    await act(async () => copy.resolve());
    expect(button("copy-run-answer").getAttribute("aria-label")).toBe("Copy answer");
  });
it("refuses hidden disabled and unfocused original actions", async () => {
  await render();
  button("retry-run-turn").focus();
  host.hidden = true;
  await expect(executeCommand("retry-run-turn")).rejects.toThrow();
  host.hidden = false;
  button("retry-run-turn").disabled = true;
  await expect(executeCommand("retry-run-turn")).rejects.toThrow();
  button("retry-run-turn").disabled = false;
  button("copy-run-answer").focus();
  await expect(executeCommand("retry-run-turn")).rejects.toThrow();
  expect(retry).not.toHaveBeenCalled();
});
it("preserves original native rejection identity after its control unmounts", async () => {
  const pending = held<unknown>(),
    reason = new Error("original retry rejection");
  const run = useStore.getState().runs[0]!;
  await act(async () =>
    root.render(
      <RunPanelAction command="retry-run-turn" run={run} invoke={() => pending.promise}>
        Retry
      </RunPanelAction>,
    ),
  );
  button("retry-run-turn").focus();
  const completion = executeCommand("retry-run-turn");
  const observed = completion.catch((error) => error);
  await act(async () => root.unmount());
  host.remove();
  root = createRoot(host);
  pending.reject(reason);
  expect(await observed).toBe(reason);
});
it("opens the exact original permission settings and work-history disclosure", async () => {
  useStore.setState((state) => ({
    runs: state.runs.map((run) => ({
      ...run,
      failure: {
        category: "unknown",
        message: "Permission needed",
        action: "permission_settings",
        retryable: true,
      },
    })),
  }));
  await act(async () => root.render(<RunPanel runId="turn" latest controlsInComposer />));
  await act(async () => button("review-run-permissions").click());
  expect(useStore.getState().settingsCategory).toBe("Permissions");
  expect(useStore.getState().overlay).toBe("settings");
  expect(button("toggle-run-steps").getAttribute("aria-expanded")).toBe("false");
  await act(async () => button("toggle-run-steps").click());
  expect(button("toggle-run-steps").getAttribute("aria-expanded")).toBe("true");
});

it("remaps original run and structured result disclosures without extra markup", async () => {
  await act(async () =>
    useStore.setState((state) => ({
      runs: state.runs.map((run) => ({ ...run, result: { count: 3 }, statusMessage: "Summary" })),
    })),
  );
  await act(async () => root.render(<RunPanel runId="turn" latest controlsInComposer />));
  for (const id of ["toggle-run-details", "toggle-run-result-details"]) {
    const summary = host.querySelector<HTMLElement>(`summary[data-command-id="${id}"]`)!;
    expect(summary).not.toBeNull();
    summary.focus();
    const details = summary.parentElement as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await act(async () =>
      expect(dispatchShortcut({ commandId: id, key: "d", meta: true, shift: true, alt: false })).toBe(true),
    );
    expect(details.open).toBe(true);
  }
});
