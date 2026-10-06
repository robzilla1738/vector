import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call, useStore } from "../../store";
import { Button } from "../../ui";
import { errorMessage } from "../../error-message";
import { pushSettingsPath } from "../../settings/routes";

const LABELS = { model_calls: "Model calls", steps: "Steps", time: "Run time", spend: "Spend", tokens: "Tokens" } as const;

/** Budget rows cannot be answered as questions or redeemed by an approval decision. */
export function BudgetPrompt({ run, suspension }: { run: Run; suspension: Suspension }) {
  const budget = suspension.request.budget;
  const owner = useMemo(
    () => ({
      runId: run.runId,
      suspensionId: suspension.suspensionId,
      windowId: bridge.windowId,
      kind: bridge.windowKind,
      privateMode: bridge.privateMode,
    }),
    [run.runId, suspension.suspensionId, bridge.windowId, bridge.windowKind, bridge.privateMode],
  );
  const currentRef = useRef<typeof owner | null>(null);
  useLayoutEffect(() => {
    currentRef.current = owner;
    return () => {
      if (currentRef.current === owner) currentRef.current = null;
    };
  }, [owner]);
  const current = () =>
    currentRef.current === owner &&
    bridge.windowId === owner.windowId &&
    bridge.windowKind === owner.kind &&
    bridge.privateMode === owner.privateMode;
  const [limit, setLimit] = useState(() =>
    String(budget?.reason === "time" ? 10 : Math.max((budget?.limit ?? 0) * 2, (budget?.used ?? 0) + (budget?.requiredTokens ?? budget?.requiredUsd ?? 1))),
  );
  const [unlimited, setUnlimited] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [completed, setCompleted] = useState(false);
  const pending = useRef(false);
  if (
    !budget ||
    suspension.kind !== "budget" ||
    suspension.state !== "pending" ||
    suspension.runId !== run.runId ||
    suspension.turnId !== run.runId ||
    run.status !== "needs_input"
  )
    return null;
  const spend = budget.reason === "spend",
    time = budget.reason === "time",
    funded = budget.funding !== undefined;
  async function continueRun() {
    if (!budget || pending.current || completed || !current()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const fresh = await call("runs.get", { runId: owner.runId });
      if (!current()) return;
      const row = fresh.suspension;
      if (
        fresh.run.status !== "needs_input" ||
        row?.state !== "pending" ||
        row.kind !== "budget" ||
        row.runId !== owner.runId ||
        row.turnId !== owner.runId ||
        row.suspensionId !== owner.suspensionId ||
        row.request.budget?.reason !== budget.reason ||
        JSON.stringify(row.request.budget?.funding) !== JSON.stringify(budget.funding)
      )
        throw new Error("This budget request changed. Review the current run before continuing.");
      const value = Number(limit);
      if (
        (!spend || funded) &&
        (!unlimited || funded) &&
        (!Number.isFinite(value) || value <= 0 || (!time && !spend && !Number.isSafeInteger(value)))
      )
        throw new Error("Choose a positive new limit or explicitly choose unlimited.");
      const next = unlimited && !funded
        ? 0
        : time
          ? Math.max(
              Date.now() - (fresh.run.startedAt ?? fresh.run.createdAt),
              row.request.budget.used,
              row.request.budget.limit,
            ) +
            value * 60_000
          : value;
      if ((!spend || funded) && next !== 0 && next <= Math.max(row.request.budget.used, row.request.budget.limit))
        throw new Error("The new limit must exceed both the previous limit and work already consumed.");
      const limits = funded
        ? { funding: budget.reason === "tokens" ? { maxTokens: next } : spend ? { maxCostUsd: next } : { deadlineMs: next } }
        : spend
        ? undefined
        : budget.reason === "model_calls"
          ? { maxModelCalls: next }
          : budget.reason === "steps"
            ? { maxSteps: next }
            : { deadlineMs: next };
      await call("runs.continueBudget", {
        runId: owner.runId,
        suspensionId: owner.suspensionId,
        ...(limits ? { limits } : {}),
      });
      if (current()) setCompleted(true);
    } catch (reason) {
      if (current()) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      if (current()) setBusy(false);
    }
  }
  function reviewBudget() {
    if (!current()) return;
    const category =
      budget?.scope === "routine" || budget?.scope === "nightShift" ? "Automations" : "Usage & Budgets";
    useStore.setState({ overlay: "settings", settingsCategory: category });
    pushSettingsPath(category);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  return (
    <section className="composer-question" aria-label="Budget reached" aria-busy={busy}>
      <strong>{LABELS[budget.reason]} budget reached</strong>
      <p>
        {funded
          ? `This ${budget.funding!.kind === "goal" ? "Goal" : budget.funding!.kind === "subagent" ? "subagent allocation" : "subagent group"} reached its ${LABELS[budget.reason].toLowerCase()} budget. Raise this original funding limit explicitly to continue. Uncertain charges remain held.`
          : spend
          ? `Used $${budget.used.toFixed(2)} of $${budget.limit.toFixed(2)}. Increase the actual budget in Settings, then continue. Aux will check the current ledger again.`
          : time
            ? `The run reached its time limit (${Math.ceil(budget.limit / 60_000)} minutes). Choose additional time before continuing.`
            : `Used ${budget.used} of ${budget.limit}. Choose a new total limit before continuing.`}
      </p>
      {(!spend || funded) && (
        <>
          {!funded && <label>
            <input
              type="checkbox"
              checked={unlimited}
              disabled={busy || completed}
              onChange={(event) => setUnlimited(event.target.checked)}
            />
            Continue without a {time ? "time" : budget.reason === "steps" ? "step" : "model call"} limit
          </label>}
          <label>
            {time ? "Additional minutes" : "New total limit"}
            <input
              type="number"
              aria-label={time ? "Additional minutes" : "New total limit"}
              min="1"
              step={spend ? "any" : "1"}
              value={limit}
              disabled={(!funded && unlimited) || busy || completed}
              onChange={(event) => setLimit(event.target.value)}
            />
          </label>
        </>
      )}
      {spend && !funded && (
        <Button size={28} disabled={busy || completed} onClick={reviewBudget}>
          Review budget
        </Button>
      )}
      <Button size={28} disabled={busy || completed} onClick={() => void continueRun()}>
        {completed ? "Continuing…" : "Continue"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
