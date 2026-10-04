// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { usePreferenceCommand } from "./preference-command";
import { guardCommandCompletion } from "../../command-completion";
import { executeCommand } from "../../commands";
import { useStore } from "../../store";
const id = "retry-saved-result-read",
  scope = "original-mounted-preference";
const initial = useStore.getState();
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
function Control({
  invoke,
  report,
}: {
  invoke(original: HTMLButtonElement, event?: Event): unknown;
  report?: (reason: unknown) => void;
}) {
  const [ref, run] = usePreferenceCommand<HTMLButtonElement>(id, scope, invoke, report);
  return (
    <button ref={ref} data-command-id={id} onClick={run}>
      Original control
    </button>
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  useStore.setState({ ...initial, toasts: [] }, true);
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
const button = () => host.querySelector<HTMLButtonElement>("button")!;
it("actual native input and mounted original button reach unchanged callback", async () => {
  const seen: unknown[] = [];
  const report = vi.fn();
  await act(async () =>
    root.render(
      <Control
        invoke={(original, event) => {
          seen.push(original, event);
          return "Original ACK";
        }}
        report={report}
      />,
    ),
  );
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => button().dispatchEvent(event));
  expect(seen).toEqual([button(), event]);
  expect(report).not.toHaveBeenCalled();
});
it("default original reporter stays silent for exact primitive rejection", async () => {
  await act(async () => root.render(<Control invoke={() => Promise.reject("Original rejection")} />));
  await act(async () => button().click());
  expect(useStore.getState().toasts).toEqual([]);
  button().focus();
  await expect(executeCommand(id)).rejects.toBe("Original rejection");
});
it("opt-in reporter receives exact original rejection once", async () => {
  const reason = { fixture: "Original reason" },
    report = vi.fn();
  await act(async () => root.render(<Control invoke={() => Promise.reject(reason)} report={report} />));
  await act(async () => button().click());
  expect(report).toHaveBeenCalledExactlyOnceWith(reason);
});
it("guarded original completion retains identity/result and rejects retired reporting", async () => {
  let resolve!: (value: unknown) => void;
  const native = new Promise((yes) => {
    resolve = yes;
  });
  let current = true;
  const original = guardCommandCompletion(native, () => current),
    report = vi.fn();
  await act(async () => root.render(<Control invoke={() => original} report={report} />));
  button().focus();
  const completion = executeCommand(id);
  expect(completion).toBe(original);
  const ack = { original: true };
  await act(async () => resolve(ack));
  await expect(completion).resolves.toBe(ack);
  expect(report).not.toHaveBeenCalled();
  let reject!: (reason: unknown) => void;
  const failure = guardCommandCompletion(
    new Promise((_, fail) => {
      reject = fail;
    }),
    () => current,
  );
  await act(async () => root.render(<Control invoke={() => failure} report={report} />));
  await act(async () => button().click());
  current = false;
  const reason = new Error("Retained native failure");
  await act(async () => reject(reason));
  await expect(failure).rejects.toBe(reason);
  expect(report).not.toHaveBeenCalled();
});
it("new committed callback and mounted ref stay exact while retired control is refused", async () => {
  const old = vi.fn(),
    fresh = vi.fn();
  await act(async () => root.render(<Control invoke={old} />));
  const original = button();
  await act(async () => root.render(<Control invoke={fresh} />));
  await act(async () => button().click());
  expect(old).not.toHaveBeenCalled();
  expect(fresh).toHaveBeenCalledExactlyOnceWith(original, expect.any(MouseEvent));
  await act(async () => root.render(null));
  original.focus();
  await expect(executeCommand(id, { payload: { scopeId: scope } })).rejects.toThrow();
  expect(fresh).toHaveBeenCalledTimes(1);
});
