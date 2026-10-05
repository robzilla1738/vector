// @vitest-environment jsdom
import { act, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { executeCommand } from "../commands";
import { useStore } from "../store";
import {
  useCommittedConversationOwner,
  useCurrentConversationCommand,
} from "./conversation-control-construction";

vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  inMock: true,
}));
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("retains each committed callback, exact predicate arguments, and newer owner after stale callback refusal", async () => {
  const callbacks: ((value: object) => boolean)[] = [];
  const admitted = vi.fn((_value: object) => true),
    record = {};
  function Owner({ revision }: { revision: string }) {
    const identity = useMemo(() => ({ revision }), [revision]);
    callbacks.push(useCommittedConversationOwner(identity, admitted, [identity, admitted]));
    return null;
  }
  await act(async () => root.render(<Owner revision="a" />));
  const a = callbacks.at(-1)!;
  expect(a(record)).toBe(true);
  expect(admitted.mock.calls.at(-1)).toEqual([record]);
  await act(async () => root.render(<Owner revision="a" />));
  expect(callbacks.at(-1)).toBe(a);
  await act(async () => root.render(<Owner revision="b" />));
  const b = callbacks.at(-1)!;
  admitted.mockClear();
  expect(a(record)).toBe(false);
  expect(admitted).not.toHaveBeenCalled();
  expect(b(record)).toBe(true);
  admitted.mockReturnValueOnce(false);
  expect(b(record)).toBe(false);
  admitted.mockClear();
  expect(b(record)).toBe(false);
  expect(admitted).not.toHaveBeenCalled();
  await act(async () => root.render(<Owner revision="a" />));
  expect(a(record)).toBe(false);
  expect(callbacks.at(-1)!(record)).toBe(true);
});

it("dispatches actual original event/ref and retains admitted result and rejection identity", async () => {
  const original = new Event("click", { bubbles: true });
  const result = {},
    reason = new Error("original failure");
  const invoke = vi.fn((_element: HTMLButtonElement, _event?: Event): unknown => result);
  function Control() {
    const [ref, run] = useCurrentConversationCommand<HTMLButtonElement>(
      "toggle-conversation-preview-menu",
      () => true,
      invoke,
      "refusal",
      true,
      vi.fn(),
    );
    return (
      <button ref={ref} data-command-id="toggle-conversation-preview-menu" onClick={run}>
        Original
      </button>
    );
  }
  await act(async () => root.render(<Control />));
  const button = host.querySelector("button")!;
  await act(async () => button.dispatchEvent(original));
  expect(invoke).toHaveBeenCalledWith(button, original);
  button.focus();
  await act(async () => {
    expect(await executeCommand("toggle-conversation-preview-menu")).toBe(result);
  });
  invoke.mockImplementation(() => Promise.reject(reason));
  await act(async () => {
    await expect(executeCommand("toggle-conversation-preview-menu")).rejects.toBe(reason);
  });
});

it("preserves guarded versus synchronous refusal reporting on real mounted pointer dispatch", async () => {
  const invoke = vi.fn(),
    report = vi.fn();
  function Control({ guarded }: { guarded: boolean }) {
    const [ref, run] = useCurrentConversationCommand<HTMLButtonElement>(
      "toggle-conversation-preview-menu",
      () => false,
      invoke,
      "original refusal",
      guarded,
      report,
    );
    return (
      <button ref={ref} data-command-id="toggle-conversation-preview-menu" onClick={run}>
        Original
      </button>
    );
  }
  await act(async () => root.render(<Control guarded />));
  await act(async () => host.querySelector("button")!.click());
  expect(invoke).not.toHaveBeenCalled();
  expect(report).not.toHaveBeenCalled();
  await act(async () => root.render(<Control guarded={false} />));
  await act(async () => host.querySelector("button")!.click());
  expect(invoke).not.toHaveBeenCalled();
  expect(report).toHaveBeenCalledTimes(1);
  expect(report.mock.calls[0]![0]).toBeInstanceOf(Error);
  expect((report.mock.calls[0]![0] as Error).message).toBe("original refusal");
});
