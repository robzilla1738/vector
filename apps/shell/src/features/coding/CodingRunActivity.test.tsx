// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { CodingRunActivity } from "./CodingRunActivity";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as never);
      }
      disconnect() {}
    },
  );
});

it("loads final activity while an older live request is pending and ignores its late result", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let finishOld!: (value: never) => void;
  let activityCalls = 0;
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "coding.activity") {
      if (++activityCalls === 1)
        return new Promise<never>((resolve) => {
          finishOld = resolve;
        });
      return {
        processes: [],
        agents: [
          {
            agentId: "final",
            goal:
              params && "runId" in params && params.runId === "replacement"
                ? "Replacement result"
                : "Final result",
            state: "completed",
          },
        ],
        fileRevision: "done",
      } as never;
    }
    if (method === "coding.changes") return [] as never;
    throw new Error(`Unexpected method ${method}`);
  });
  try {
    await act(async () => root.render(<CodingRunActivity runId="run" live />));
    await act(async () => {
      const details = host.querySelector("details")!;
      details.open = true;
      details.dispatchEvent(new Event("toggle"));
    });
    expect(activityCalls).toBe(1);
    await act(async () => root.render(<CodingRunActivity runId="run" live={false} />));
    expect(activityCalls).toBe(2);
    expect(host.textContent).toContain("Final result");
    await act(async () => root.render(<CodingRunActivity runId="replacement" live={false} />));
    expect(host.textContent).not.toContain("Final result");
    await act(async () => {
      const details = host.querySelector("details")!;
      details.open = true;
      details.dispatchEvent(new Event("toggle"));
    });
    expect(activityCalls).toBe(3);
    expect(host.textContent).toContain("Replacement result");
    await act(async () => finishOld({ processes: [], agents: [], fileRevision: "old" } as never));
    expect(host.textContent).toContain("Replacement result");
  } finally {
    act(() => root.unmount());
    host.remove();
    rpc.mockRestore();
    vi.unstubAllGlobals();
  }
});

it.each([true, false])(
  "offers uncertain cloud Stop only with its original command identity (%s)",
  async (hasCommand) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const process = {
      processId: "original-process",
      runId: "original-run",
      actionId: "start",
      command: "npm run dev",
      workdir: "/vercel/sandbox/project",
      startedAt: 1,
      state: "uncertain",
      execution: {
        backend: "cloud",
        resourceId: "original-resource",
        sandboxName: "original-sandbox",
        sessionId: "original-session",
        root: "/vercel/sandbox/project",
        ...(hasCommand ? { commandId: "original-command" } : {}),
      },
    };
    let attempts = 0;
    const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
      if (method === "coding.activity")
        return { processes: [{ ...process }], agents: [], fileRevision: "unchanged" } as never;
      if (method === "coding.changes") return [] as never;
      if (method === "coding.stop") {
        if (++attempts === 1) throw new Error("Original command Stop was not acknowledged.");
        process.state = "stopped";
        return { ...process } as never;
      }
      throw new Error(`Unexpected method ${method}`);
    });
    const retry = () =>
      [...host.querySelectorAll("button")].find((button) => button.textContent === "Retry Stop");
    try {
      await act(async () => root.render(<CodingRunActivity runId="original-run" live={false} />));
      await act(async () => {
        const details = host.querySelector("details")!;
        details.open = true;
        details.dispatchEvent(new Event("toggle"));
      });
      expect(Boolean(retry())).toBe(hasCommand);
      expect(host.textContent).toContain(
        hasCommand ? "Retry Stop to confirm" : "reconcile the original process",
      );
      expect(attempts).toBe(0);
      if (!hasCommand) return;
      await act(async () => retry()!.click());
      expect(host.querySelector('[role="alert"]')?.textContent).toContain("not acknowledged");
      expect(retry()).toBeDefined();
      await act(async () => retry()!.click());
      expect(attempts).toBe(2);
      expect(
        rpc.mock.calls.filter(([method]) => method === "coding.stop").map(([, params]) => params),
      ).toEqual([
        { runId: "original-run", processId: "original-process" },
        { runId: "original-run", processId: "original-process" },
      ]);
      expect(host.querySelector('[role="alert"]')).toBeNull();
      expect(retry()).toBeUndefined();
      expect(host.textContent).toContain("stopped");
    } finally {
      act(() => root.unmount());
      host.remove();
      rpc.mockRestore();
      vi.unstubAllGlobals();
    }
  },
);

it.each(["completed", "unlocated"] as const)(
  "refreshes a completed turn's retained server until %s and pauses invisible activity",
  async (ending) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    let intersect!: (visible: boolean) => void;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private callback: IntersectionObserverCallback) {}
        observe(target: Element) {
          intersect = (visible) =>
            this.callback([{ target, isIntersecting: visible } as IntersectionObserverEntry], this as never);
          intersect(true);
        }
        disconnect() {}
      },
    );
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    let state = "running",
      commandId: string | undefined = "original-command";
    const activity = vi.fn(async () => ({
      processes: [
        {
          processId: "retained-process",
          runId: "completed-run",
          actionId: "start",
          command: "original dev server",
          workdir: "/vercel/sandbox/project",
          startedAt: 1,
          state,
          execution: {
            backend: "cloud",
            resourceId: "original-resource",
            sessionId: "original-session",
            sandboxName: "original-sandbox",
            root: "/vercel/sandbox/project",
            commandId,
          },
        },
      ],
      agents: [],
      fileRevision: "unchanged",
    }));
    const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
      if (method === "coding.activity") return (await activity()) as never;
      if (method === "coding.changes") return [] as never;
      throw new Error(`Unexpected method ${method}`);
    });
    const toggle = async (open: boolean) =>
      act(async () => {
        const details = host.querySelector("details")!;
        details.open = open;
        details.dispatchEvent(new Event("toggle"));
      });
    try {
      await act(async () => root.render(<CodingRunActivity runId="completed-run" live />));
      await toggle(true);
      await act(async () => root.render(<CodingRunActivity runId="completed-run" live={false} />));
      expect(host.textContent).toContain("original dev server");
      state = "uncertain";
      await act(async () => vi.advanceTimersByTimeAsync(2000));
      expect(host.textContent).toContain("Retry Stop");

      await act(async () => intersect(false));
      const offscreen = activity.mock.calls.length;
      await act(async () => vi.advanceTimersByTimeAsync(4000));
      expect(activity).toHaveBeenCalledTimes(offscreen);
      visibility.mockReturnValue("hidden");
      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
        intersect(true);
      });
      await act(async () => vi.advanceTimersByTimeAsync(4000));
      expect(activity).toHaveBeenCalledTimes(offscreen);
      visibility.mockReturnValue("visible");
      await act(async () => document.dispatchEvent(new Event("visibilitychange")));
      expect(activity).toHaveBeenCalledTimes(offscreen + 1);
      await toggle(false);
      await act(async () => vi.advanceTimersByTimeAsync(4000));
      expect(activity).toHaveBeenCalledTimes(offscreen + 1);
      await toggle(true);
      expect(activity).toHaveBeenCalledTimes(offscreen + 2);

      state = ending === "completed" ? "completed" : "uncertain";
      commandId = ending === "unlocated" ? undefined : "original-command";
      await act(async () => vi.advanceTimersByTimeAsync(2000));
      expect(host.textContent).toContain(
        ending === "completed" ? "completed" : "reconcile the original process",
      );
      const settled = activity.mock.calls.length;
      await act(async () => vi.advanceTimersByTimeAsync(6000));
      expect(activity).toHaveBeenCalledTimes(settled);
    } finally {
      act(() => root.unmount());
      host.remove();
      rpc.mockRestore();
      visibility.mockRestore();
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  },
);
