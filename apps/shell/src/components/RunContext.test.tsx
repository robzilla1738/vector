// @vitest-environment jsdom
import { act, Suspense, startTransition, useLayoutEffect, useState } from "react";
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
  await act(async () => root.render(<RunContext runId="r" status="running" disabled={false} />));
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
  await act(async () => root.render(<RunContext runId="r" status="running" disabled={false} />));
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  await act(async () => root.render(<RunContext runId="other" status="running" disabled={false} />));
  await act(async () => finish({ ...stats(), estimatedInputTokens: 99 }));
  expect(host.textContent).toContain("40,000 / 53,600");
  expect(host.textContent).not.toContain("Estimated input: 99");
});

it("keeps read-only context visible while the runtime is unavailable", async () => {
  vi.spyOn(bridge, "invoke").mockResolvedValue(stats());
  await act(async () => root.render(<RunContext runId="r" status="running" disabled={false} />));
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
  await act(async () => root.render(<RunContext runId="r" status="completed" disabled={false} />));
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

it.each(["queued", "planning", "paused", "needs_input"] as const)(
  "keeps %s context readable without offering inadmissible compaction",
  async (status) => {
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(stats());
    await act(async () => root.render(<RunContext runId="r" status={status} disabled={false} />));
    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.disabled).toBe(true);
    expect(host.textContent).toContain("Wait until this turn is running or finished");
    await act(async () => button.click());
    expect(invoke).not.toHaveBeenCalledWith("runs.context.compact", expect.anything());
  },
);

it.each(["completed", "partially_completed", "failed", "cancelled", "interrupted"] as const)(
  "retains valid saved-history compaction for %s",
  async (status) => {
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(stats());
    await act(async () => root.render(<RunContext runId="r" status={status} disabled={false} />));
    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.disabled).toBe(false);
    await act(async () => button.click());
    expect(invoke).toHaveBeenCalledWith("runs.context.compact", { runId: "r", expectedRevision: 7 });
  },
);

it.each(["paused", "needs_input"] as const)(
  "allows original pending cancellation while %s, then disables starting another compaction",
  async (status) => {
    const pending = {
      ...stats(),
      compaction: { id: "original-pending", reason: "manual" as const, status: "queued" as const },
    };
    const invoke = vi
      .spyOn(bridge, "invoke")
      .mockImplementation(async (method) => (method === "runs.context.stats" ? pending : stats()));
    await act(async () => root.render(<RunContext runId="r" status={status} disabled={false} />));
    const button = host.querySelector<HTMLButtonElement>("button")!;
    expect(button.disabled).toBe(false);
    await act(async () => button.click());
    expect(invoke).toHaveBeenCalledWith("runs.context.cancelCompaction", {
      runId: "r",
      compactionId: "original-pending",
    });
    expect(button.disabled).toBe(true);
  },
);

it("retires an original status click and delayed ACK when the turn enters an inadmissible wait", async () => {
  let finish!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) =>
    method === "runs.context.compact"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : stats(),
  );
  await act(async () => root.render(<RunContext runId="r" status="running" disabled={false} />));
  const button = host.querySelector<HTMLButtonElement>("button")!;
  await act(async () => button.click());
  await act(async () => root.render(<RunContext runId="r" status="needs_input" disabled={false} />));
  expect(button.disabled).toBe(true);
  await act(async () => button.click());
  expect(invoke.mock.calls.filter(([method]) => method === "runs.context.compact")).toHaveLength(1);
  await act(async () =>
    finish({
      ...stats(),
      revision: 8,
      compaction: { id: "retired-ack", status: "queued", reason: "manual" },
    }),
  );
  expect(button.disabled).toBe(true);
  expect(host.textContent).not.toContain("Compacting…");
});

it("ignores a held original ACK released by the exact new-status layout commit", async () => {
  let finish!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) =>
    method === "runs.context.compact"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : stats(),
  );
  function CommittedStatus({ status }: { status: "running" | "needs_input" }) {
    useLayoutEffect(() => {
      if (status === "needs_input")
        finish({
          ...stats(),
          revision: 8,
          compaction: { id: "retired-layout-ack", status: "queued", reason: "manual" },
        });
    }, [status]);
    return <RunContext runId="r" status={status} disabled={false} />;
  }
  await act(async () => root.render(<CommittedStatus status="running" />));
  await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
  await act(async () => root.render(<CommittedStatus status="needs_input" />));
  expect(host.querySelector<HTMLButtonElement>("button")!.disabled).toBe(true);
  expect(host.textContent).not.toContain("Compacting…");
});

it("retains the committed original click owner while a new-status concurrent render suspends", async () => {
  let change!: (status: "running" | "needs_input") => void;
  const never = new Promise<void>(() => {});
  function Suspends({ status }: { status: "running" | "needs_input" }) {
    if (status === "needs_input") throw never;
    return null;
  }
  function Harness() {
    const [status, setStatus] = useState<"running" | "needs_input">("running");
    useLayoutEffect(() => {
      change = setStatus;
    }, []);
    return (
      <Suspense fallback={<span>Pending replacement</span>}>
        <RunContext runId="r" status={status} disabled={false} />
        <Suspends status={status} />
      </Suspense>
    );
  }
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue(stats());
  await act(async () => root.render(<Harness />));
  await act(async () => startTransition(() => change("needs_input")));
  const button = host.querySelector<HTMLButtonElement>("button")!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
  expect(invoke).toHaveBeenCalledWith("runs.context.compact", { runId: "r", expectedRevision: 7 });
});
