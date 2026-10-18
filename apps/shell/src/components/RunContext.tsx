import { useEffect, useMemo, useRef, useState } from "react";
import { RunContextStatsSchema, type RunContextStats } from "@aux/contracts/context-compaction";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { Popover } from "../ui/popover";
import { smallButtonProps } from "../ui/button-props";
import "./RunContext.css";

/** Each subscription and pending response belongs to one original run. */
export function RunContext({ runId, disabled }: { runId: string; active: boolean; disabled: boolean }) {
  const connected = useStore((state) => state.connected);
  const [snapshot, setStats] = useState<RunContextStats | null>(null);
  const owner = useMemo(() => ({ runId, connected }), [runId, connected]);
  const generation = useRef(0);
  const [savingOwner, setSavingOwner] = useState<typeof owner | null>(null);
  const saving = savingOwner === owner;
  const stats = snapshot?.runId === runId ? snapshot : null;
  const [error, setError] = useState("");
  useEffect(() => {
    const originalGeneration = ++generation.current;
    const retire = () => {
      if (generation.current === originalGeneration) generation.current++;
    };
    let current = true;
    let version = 0;
    const refresh = () => {
      const original = ++version;
      void call("runs.context.stats", { runId })
        .then((value) => {
          const next = RunContextStatsSchema.parse(value);
          if (next.runId !== runId) throw new Error("The context response belongs to another run.");
          if (current && original === version) {
            setStats((latest) =>
              latest?.runId === runId && latest.revision > next.revision ? latest : next,
            );
            setError("");
          }
        })
        .catch(() => {
          if (current && original === version) setError("Context usage is unavailable.");
        });
    };
    if (connected) refresh();
    const unsubscribe = bridge.onEvent((event) => {
      if (event.type === "run.context.changed" && event.runId === runId) refresh();
    });
    return () => {
      current = false;
      retire();
      unsubscribe();
    };
  }, [runId, connected, owner]);
  const busy = stats && ["queued", "preparing", "summarizing"].includes(stats.compaction.status);
  const update = async () => {
    if (!stats || saving || disabled || !connected) return;
    const originalGeneration = generation.current;
    setSavingOwner(owner);
    try {
      const next = busy
        ? await call("runs.context.cancelCompaction", { runId, compactionId: stats.compaction.id })
        : await call("runs.context.compact", { runId, expectedRevision: stats.revision });
      const result = RunContextStatsSchema.parse(next);
      if (result.runId !== runId) throw new Error("The context response belongs to another run.");
      if (generation.current === originalGeneration)
        setStats((latest) =>
          latest?.runId === runId && latest.revision > result.revision ? latest : result,
        );
    } catch (reason) {
      if (generation.current === originalGeneration) errToast(reason);
    } finally {
      if (generation.current === originalGeneration) setSavingOwner(null);
    }
  };
  const percent = Math.round((stats?.occupancy ?? 0) * 100);
  return (
    <Popover
      label="Model context"
      className="run-context"
      trigger={
        <>
          <span className="run-context-meter" aria-hidden="true">
            <i style={{ width: `${Math.min(100, percent)}%` }} />
          </span>
          <span>{busy ? "Compacting…" : stats ? `Context · ~${percent}%` : "Context"}</span>
        </>
      }
    >
      {() => (
        <>
          <header>Model context</header>
          {error && <output>{error}</output>}
          {stats && (
            <>
              <p>
                Estimated input: {stats.estimatedInputTokens.toLocaleString()} /{" "}
                {stats.inputBudgetTokens.toLocaleString()} tokens.
              </p>
              <p>
                {stats.outputReserveTokens.toLocaleString()} tokens reserved for the answer. Model window:{" "}
                {stats.contextTokens.toLocaleString()}.
              </p>
              {stats.observedInputTokens !== undefined && (
                <p>Last observed input: {stats.observedInputTokens.toLocaleString()} tokens.</p>
              )}
              <p>
                Compaction summarizes older work while keeping the full encrypted history and exact protected
                instructions and effect records.
              </p>
              {busy && (
                <output>
                  {stats.compaction.status === "queued"
                    ? "Preparing context compaction…"
                    : "Preparing a smaller conversation context…"}
                  {stats.compaction.totalChunks !== undefined &&
                    ` ${stats.compaction.completedChunks ?? 0}/${stats.compaction.totalChunks} parts.`}
                </output>
              )}
              {stats.compaction.message && <output>{stats.compaction.message}</output>}
              <button
                {...smallButtonProps}
                disabled={disabled || !connected || saving}
                onClick={() => void update()}
              >
                {busy ? "Cancel compaction" : "Compact context"}
              </button>
            </>
          )}
        </>
      )}
    </Popover>
  );
}
