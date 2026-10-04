// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import type { Run, StepRecord } from "@aux/contracts";
const native = vi.hoisted(() => ({
  windowId: "one",
  privateMode: false,
  kind: "normal",
  openPath: vi.fn(),
  read: vi.fn(),
}));
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
    openPath: native.openPath,
  },
}));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: native.read,
}));
import { useStore } from "../store";
import { RunPanel } from "./RunPanel";
import { StepTimeline } from "./StepTimeline";
import { executeCommand, dispatchShortcut } from "../commands";
import { reportCommandCompletionFailure } from "../command-completion";
import { COMMANDS } from "@aux/contracts";
const initial = useStore.getState(),
  run: Run = { runId: "turn", goal: "Fixture", status: "completed", pageIds: [], createdAt: 1 };
const step: StepRecord = {
  stepId: "s",
  runId: "turn",
  op: "navigate",
  startedAt: 1,
  inputs: {
    url: "https://example.test/a",
    path: "/synthetic/report",
    obsArtifactId: "observation",
    password: "redacted-secret",
  },
  outcome: { stepId: "s", op: "navigate", status: "ok", startedAt: 1, durationMs: 1 },
};
let host: HTMLElement,
  root: ReturnType<typeof createRoot>,
  inspect: ReturnType<typeof vi.fn>,
  foreground: ReturnType<typeof vi.fn>,
  background: ReturnType<typeof vi.fn>;
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  native.windowId = "one";
  native.privateMode = false;
  native.kind = "normal";
  native.openPath.mockReset().mockResolvedValue(null);
  native.read.mockReset().mockImplementation(async (method: string) => {
    if (method === "runs.get") return { run, steps: [step] };
    throw new Error(`Unexpected fixture call ${method}`);
  });
  inspect = vi.fn().mockResolvedValue({ original: true });
  foreground = vi.fn().mockResolvedValue({ original: true });
  background = vi.fn().mockResolvedValue({ original: true });
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 },
  ] as unknown as DOMRectList);
  useStore.setState({
    runs: [run],
    steps: { turn: [step] },
    newTab: foreground,
    openBackgroundTab: background,
  });
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
async function render(source = step, live = false) {
  await act(async () => {
    useStore.setState({ steps: { turn: [source] } });
    root.render(
      <StepTimeline
        run={run}
        windowId={native.windowId}
        privateMode={native.privateMode}
        windowKind={native.kind as "normal"}
        steps={[source]}
        live={live}
        onInspect={inspect}
      />,
    );
  });
}
const control = (id: string) => host.querySelector<HTMLElement>(`[data-command-id="${id}"]`)!;
function invoke(id: string) {
  control(id).focus();
  return executeCommand(id);
}
async function expand() {
  await act(async () => {
    await invoke("toggle-run-step");
  });
}
it("registers all original timeline actions with focused remappable normal metadata", async () => {
  await render();
  for (const id of ["toggle-run-step", "inspect-run-step", "open-run-step-url", "open-run-step-path"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
  await expand();
  expect(host.textContent).not.toContain("redacted-secret");
  expect(host.textContent).toContain("[redacted]");
  expect(control("toggle-run-step").getAttribute("aria-expanded")).toBe("true");
});
it.each([{ metaKey: true }, { ctrlKey: true }, { button: 1 }])(
  "original URL event preserves background modifiers %j",
  async (modifiers) => {
    await render();
    await expand();
    const anchor = control("open-run-step-url");
    await act(async () => {
      anchor.dispatchEvent(
        new MouseEvent(modifiers.button === 1 ? "auxclick" : "click", {
          bubbles: true,
          cancelable: true,
          ...modifiers,
        }),
      );
    });
    expect(background).toHaveBeenCalledOnce();
    expect(background.mock.calls[0]![0]).toBe("https://example.test/a");
    expect(foreground).not.toHaveBeenCalled();
  },
);
it("original regular URL and actual remapped shortcut stay foreground", async () => {
  await render();
  await expand();
  await act(async () => {
    control("open-run-step-url").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  expect(foreground).toHaveBeenCalledOnce();
  control("open-run-step-url").focus();
  await act(async () => {
    expect(
      dispatchShortcut({ commandId: "open-run-step-url", key: "o", meta: true, shift: true, alt: false }),
    ).toBe(true);
  });
  expect(foreground).toHaveBeenCalledTimes(2);
  expect(background).not.toHaveBeenCalled();
});
it("script/credential URLs and relative paths remain inert", async () => {
  await render({ ...step, inputs: { url: "javascript:alert(1)", path: "relative.pdf" } });
  await expand();
  expect(host.querySelector("a")).toBeNull();
  expect(host.querySelector('[data-command-id="open-run-step-path"]')).toBeNull();
  await render({ ...step, inputs: { url: "https://u:p@example.test/a" } });
  expect(host.querySelector("a")).toBeNull();
  expect(foreground).not.toHaveBeenCalled();
});
it("path action retains original native result and identical rejection", async () => {
  await render();
  await expand();
  const ack = "Native refused path";
  native.openPath.mockResolvedValueOnce(ack);
  await act(async () => {
    expect(await invoke("open-run-step-path")).toBe(ack);
  });
  const reason = new Error("original path error");
  native.openPath.mockRejectedValueOnce(reason);
  await act(async () => {
    await expect(invoke("open-run-step-path")).rejects.toBe(reason);
  });
  expect(native.openPath).toHaveBeenCalledWith("/synthetic/report");
});
it("inspect passes exact artifact/step and actual current guard, retaining original ACK", async () => {
  await render();
  const ack = { bytes: "original" };
  inspect.mockResolvedValueOnce(ack);
  await act(async () => {
    expect(await invoke("inspect-run-step")).toBe(ack);
  });
  expect(inspect).toHaveBeenCalledWith("observation", step, expect.any(Function));
  expect(inspect.mock.calls[0]![2]()).toBe(true);
});
it("incidental render does not retire a held original inspection", async () => {
  await render();
  const work = held<object>();
  inspect.mockReturnValueOnce(work.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invoke("inspect-run-step");
  });
  await render(step, true);
  expect(inspect.mock.calls[0]![2]()).toBe(true);
  const ack = { kept: true };
  await act(async () => {
    work.resolve(ack);
    expect(await completion).toBe(ack);
  });
});
it.each(["step", "window", "private"])(
  "held original inspection stays retired after %s ABA and preserves rejection",
  async (kind) => {
    await render();
    const work = held<unknown>();
    inspect.mockReturnValueOnce(work.promise);
    let completion!: Promise<unknown>;
    await act(async () => {
      completion = invoke("inspect-run-step");
    });
    const oldCurrent = inspect.mock.calls[0]![2];
    if (kind === "step") await render({ ...step });
    if (kind === "window") {
      native.windowId = "two";
      await render();
    }
    if (kind === "private") {
      native.privateMode = true;
      await render();
    }
    native.windowId = "one";
    native.privateMode = false;
    await render();
    expect(oldCurrent()).toBe(false);
    const reason = new Error("original retired error"),
      report = vi.fn();
    await act(async () => {
      work.reject(reason);
      await expect(completion).rejects.toBe(reason);
    });
    reportCommandCompletionFailure(completion, reason, report);
    expect(report).not.toHaveBeenCalled();
  },
);
it("actual step replacement without component update refuses before original inspection", async () => {
  await render();
  useStore.setState({ steps: { turn: [{ ...step }] } });
  await act(async () => {
    await expect(invoke("inspect-run-step")).rejects.toThrow("current");
  });
  expect(inspect).not.toHaveBeenCalled();
});
it("hidden/disconnected or foreign run owners cannot inspect", async () => {
  await render();
  host.hidden = true;
  await act(async () => {
    await expect(invoke("inspect-run-step")).rejects.toThrow();
  });
  host.hidden = false;
  useStore.setState({ runs: [{ ...run }] });
  await act(async () => {
    await expect(invoke("inspect-run-step")).rejects.toThrow();
  });
  expect(inspect).not.toHaveBeenCalled();
});

async function panel() {
  await act(async () =>
    root.render(
      <RunPanel
        runId="turn"
        conversation
        latest
        controlsInComposer
        readOnly={native.privateMode || native.windowId !== "one"}
      />,
    ),
  );
  await act(async () => {
    await invoke("toggle-run-steps");
  });
}
it("actual RunPanel observation reader returns genuine original read ACK after unchanged decoder", async () => {
  await panel();
  const ack = {
    dataBase64: btoa(
      JSON.stringify({
        text: "saved original observation",
        refs: [],
        pageId: "p",
        revision: 1,
        url: "https://example.test/a",
      }),
    ),
  };
  native.read.mockResolvedValueOnce(ack);
  await act(async () => {
    expect(await invoke("inspect-run-step")).toBe(ack);
  });
  expect(native.read).toHaveBeenCalledWith("artifacts.read", { artifactId: "observation" });
  expect(host.textContent).toContain("saved original observation");
});
it("actual RunPanel reader keeps original rejection and active inspection diagnostic", async () => {
  await panel();
  const reason = new Error("original snapshot read refused");
  native.read.mockRejectedValueOnce(reason);
  await act(async () => {
    await expect(invoke("inspect-run-step")).rejects.toBe(reason);
  });
  expect(host.textContent).toContain(reason.message);
});
it("actual RunPanel held reader refuses late original run publication after replacement", async () => {
  await panel();
  const work = held<{ dataBase64: string }>();
  native.read.mockReturnValueOnce(work.promise);
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = invoke("inspect-run-step");
  });
  await act(async () => useStore.setState({ runs: [{ ...run }] }));
  const ack = { dataBase64: btoa(JSON.stringify({ text: "retired observation", refs: [] })) };
  await act(async () => {
    work.resolve(ack);
    expect(await completion).toBe(ack);
  });
  expect(useStore.getState().observations.turn).toBeUndefined();
  expect(host.textContent).not.toContain("retired observation");
});

it("original clicked observation refuses actual late run replacement delivery", async () => {
  await panel();
  const work = held<{ dataBase64: string }>();
  native.read.mockReturnValueOnce(work.promise);
  await act(async () => {
    host.querySelector<HTMLButtonElement>(".tl-obs")!.click();
  });
  await act(async () => useStore.setState({ runs: [{ ...run }] }));
  const ack = { dataBase64: btoa(JSON.stringify({ text: "late original snapshot", refs: [] })) };
  await act(async () => {
    work.resolve(ack);
    await work.promise;
  });
  expect(useStore.getState().observations.turn).toBeUndefined();
  expect(host.textContent).not.toContain("late original snapshot");
});
