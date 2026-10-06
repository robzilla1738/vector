// @vitest-environment jsdom
import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  memoryControlElement,
  useMemoryCallbackControl,
  useMemoryElementControl,
} from "./memory-control-construction";
import { invokeScopedControl } from "../scoped-control-commands";
const mocks = vi.hoisted(() => ({ errors: vi.fn(), privateMode: false }));
vi.mock("../bridge", () => ({
  bridge: {
    get privateMode() {
      return mocks.privateMode;
    },
  },
}));
vi.mock("../store", () => ({ errToast: mocks.errors }));
vi.mock("../commands", async () => {
  const { invokeScopedControl } = await import("../scoped-control-commands");
  return {
    executeCommand: (command: string, context: unknown) => {
      try {
        return Promise.resolve(invokeScopedControl(command, context as never));
      } catch (reason) {
        return Promise.reject(reason);
      }
    },
  };
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  mocks.errors.mockReset();
  mocks.privateMode = false;
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("retains original intrinsic element props, children, ref and DOM attributes for the closed control tags", () => {
  const ref = () => {},
    run = () => {},
    children = <span key="original">Full source text</span>;
  const button = (
    <button
      type="button"
      aria-expanded={false}
      ref={ref}
      data-command-id="save-memory-note"
      className="btn sm"
      disabled={false}
      onClick={run}
    >
      {children}
    </button>
  );
  const summary = (
    <summary data-command-id="toggle-memory-exclusions" ref={ref} onClick={run}>
      {children}
    </summary>
  );
  const input = (
    <input
      id="original-checkbox"
      type="checkbox"
      data-command-id="toggle-browsing-memory"
      ref={ref}
      checked
      disabled={false}
      onChange={run}
    />
  );
  const select = (
    <select
      id="original-select"
      aria-label="Page-content retention"
      data-command-id="set-browsing-memory-retention"
      ref={ref}
      disabled={false}
      value={30}
      onChange={run}
    >
      {children}
    </select>
  );
  const originals: ReactElement[] = [button, summary, input, select];
  for (const original of originals) {
    const props = { ...(original.props as Record<string, unknown>) };
    delete props.children;
    const result = memoryControlElement(
      original.type as "button" | "input" | "summary" | "select",
      props,
      children,
    );
    expect(result.type).toBe(original.type);
    expect(result.key).toBe(original.key);
    expect(Object.keys(result.props)).toEqual(Object.keys(original.props as object));
    expect(result.props).toEqual(original.props);
  }
});
function Mounted({ action, summary = false }: { action(element: HTMLElement): unknown; summary?: boolean }) {
  const [ref, run] = useMemoryElementControl(
    "toggle-memory-exclusions",
    "original-scope",
    action,
    mocks.errors,
    summary,
  );
  return summary ? (
    <details>
      <summary ref={ref} onClick={run}>
        Original disclosure
      </summary>
    </details>
  ) : (
    <button ref={ref} onClick={run}>
      Original action
    </button>
  );
}
it("dispatches the actual summary event once and preserves native-toggle prevention with original element identity", async () => {
  const action = vi.fn((node: HTMLElement) => {
    (node.parentElement as HTMLDetailsElement).open = true;
  });
  await act(async () => root.render(<Mounted action={action} summary />));
  const original = host.querySelector("summary")!;
  await act(async () => original.click());
  expect(action).toHaveBeenCalledExactlyOnceWith(original);
  expect(host.querySelector("details")!.open).toBe(true);
  await act(async () => root.render(<div>retired</div>));
  expect(() =>
    invokeScopedControl("toggle-memory-exclusions", { payload: { scopeId: "original-scope" } }),
  ).toThrow();
});
function Callback({ invoke, oneUse }: { invoke(element: HTMLElement): unknown; oneUse: boolean }) {
  const [ref, run] = useMemoryCallbackControl(
    "retry-browsing-memory-load",
    "original-scope",
    invoke,
    "Original current error",
    "Original event error",
    oneUse,
  );
  return (
    <button ref={ref} onClick={run}>
      Original Retry
    </button>
  );
}
it("retains callback-ref one-use, Private refusal, detach and fresh original callback publication", async () => {
  const invoke = vi.fn();
  await act(async () => root.render(<Callback invoke={invoke} oneUse />));
  const first = host.querySelector("button")!;
  await act(async () => first.click());
  await act(async () => first.click());
  expect(invoke).toHaveBeenCalledExactlyOnceWith(first);
  expect(mocks.errors.mock.calls[0]![0].message).toBe("Original current error");
  const next = vi.fn();
  await act(async () => root.render(<Callback invoke={next} oneUse />));
  mocks.privateMode = true;
  await act(async () => first.click());
  expect(next).not.toHaveBeenCalled();
  mocks.privateMode = false;
  await act(async () => first.click());
  expect(next).toHaveBeenCalledExactlyOnceWith(first);
});
