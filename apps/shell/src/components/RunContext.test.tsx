// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RunContextStats } from "@aux/contracts/context-compaction";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { RunContext } from "./RunContext";

vi.mock("../ui/popover", () => ({
  Popover: ({
    trigger,
    children,
  }: {
    trigger: React.ReactNode;
    children(close: () => void): React.ReactNode;
  }) => (
    <div>
      {trigger}
      {children(() => {})}
    </div>
  ),
}));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const initial = useStore.getState();
const stats = (runId = "r"): RunContextStats => ({
  runId,
  revision: 7,
  modelId: "model",
  contextTokens: 64_000,
  inputBudgetTokens: 53_600,
  outputReserveTokens: 4_000,
  estimatedInputTokens: 40_000,
  observedInputTokens: 0,
  occupancy: 40_000 / 53_600,
  updatedAt: 1,
  compaction: { id: "", status: "idle", reason: "automatic" },
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  root = createRoot(host);
  useStore.setState({ connected: true });
});
afterEach(async () => {
  await act(async () => root.unmount());
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("labels estimates separately from observed zero usage and sends revision-bound compact/cancel controls", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.context.compact")
      return { ...stats(), revision: 8, compaction: { id: "compact-1", status: "queued", reason: "manual" } };
    return stats();
  });
  await act(async () => root.render(<RunContext runId="r" active disabled={false} />));
  expect(host.textContent).toContain("Estimated input: 40,000 / 53,600");
  expect(host.textContent).toContain("Last observed input: 0");
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.compact", { runId: "r", expectedRevision: 7 });
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.cancelCompaction", {
    runId: "r",
    compactionId: "compact-1",
  });
});

it("does not apply a delayed compaction acknowledgement to another run", async () => {
  let finish!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "runs.context.compact")
      return new Promise((resolve) => {
        finish = resolve;
      });
    return stats((params as { runId: string }).runId);
  });
  await act(async () => root.render(<RunContext runId="r" active disabled={false} />));
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  await act(async () => root.render(<RunContext runId="other" active disabled={false} />));
  await act(async () => finish({ ...stats(), estimatedInputTokens: 99 }));
  expect(host.textContent).toContain("40,000 / 53,600");
  expect(host.textContent).not.toContain("Estimated input: 99");
});

it("keeps read-only context visible while the runtime is unavailable", async () => {
  vi.spyOn(bridge, "invoke").mockResolvedValue(stats());
  await act(async () => root.render(<RunContext runId="r" active disabled={false} />));
  await act(async () => useStore.setState({ connected: false }));
  expect(host.querySelector<HTMLButtonElement>("button")?.disabled).toBe(true);
});

it("admits manual compaction of a completed chat and exposes its cancel control", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.context.compact")
      return {
        ...stats(),
        revision: 8,
        compaction: {
          id: "idle-1",
          status: "summarizing",
          reason: "manual",
          totalChunks: 2,
          completedChunks: 1,
        },
      };
    return stats();
  });
  await act(async () => root.render(<RunContext runId="r" active={false} disabled={false} />));
  const button = host.querySelector<HTMLButtonElement>("button")!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.compact", { runId: "r", expectedRevision: 7 });
  expect(host.textContent).toContain("1/2 parts");
  await act(async () => button.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.cancelCompaction", {
    runId: "r",
    compactionId: "idle-1",
  });
});
