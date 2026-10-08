// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { bridge } from "../../bridge";
import { CodingRunActivity } from "./CodingRunActivity";

it("loads final activity while an older live request is pending and ignores its late result", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let finishOld!: (value: never) => void;
  let activityCalls = 0;
  const rpc = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "coding.activity") {
      if (++activityCalls === 1)
        return new Promise<never>((resolve) => {
          finishOld = resolve;
        });
      return {
        processes: [],
        agents: [{ agentId: "final", goal: "Final result", state: "completed" }],
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
    await act(async () => finishOld({ processes: [], agents: [], fileRevision: "old" } as never));
    expect(host.textContent).toContain("Final result");
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
