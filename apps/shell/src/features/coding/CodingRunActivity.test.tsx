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
