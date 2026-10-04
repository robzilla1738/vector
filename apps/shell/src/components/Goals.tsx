import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import type { Goal } from "@aux/contracts";
import { call } from "../store";

type Props = {
  workspaceId: string;
  chatId?: string | null;
  activePageId: string | null;
  modelConfigured: boolean;
  openRun: (runId: string) => void;
};

const cancellable = new Set<Goal["status"]>(["active", "paused", "blocked", "needs_input"]);

function positiveNumber(value: string, max: number): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= max ? number : undefined;
}

export function Goals({ workspaceId, chatId, activePageId, modelConfigured, openRun }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [objective, setObjective] = useState("");
  const [tokens, setTokens] = useState("200000");
  const [cost, setCost] = useState("1");
  const [minutes, setMinutes] = useState("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    setGoals(await call("goals.list", { workspaceId, limit: 100 }));
  }

  useEffect(() => {
    let live = true;
    setGoals([]);
    void call("goals.list", { workspaceId, limit: 100 })
      .then((items) => {
        if (live) setGoals(items);
      })
      .catch((reason) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!goals.some(goal => ["starting", "active"].includes(goal.status))) return;
    const timer = window.setInterval(() => {
      void call("goals.list", { workspaceId, limit: 100 }).then(setGoals).catch(() => {});
    }, 3_000);
    return () => window.clearInterval(timer);
  }, [workspaceId, goals]);

  async function act(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  const maxTokens = positiveNumber(tokens, 10_000_000);
  const maxCostUsd = positiveNumber(cost, 50);
  const deadlineMinutes = positiveNumber(minutes, 30 * 24 * 60);
  const valid =
    !!objective.trim() &&
    (!tokens.trim() || Number.isInteger(maxTokens)) &&
    (!cost.trim() || maxCostUsd !== undefined) &&
    (!minutes.trim() || Number.isInteger(deadlineMinutes)) &&
    (maxTokens !== undefined || maxCostUsd !== undefined || deadlineMinutes !== undefined);
  const unfinishedHere = !!chatId && goals.some(goal => goal.chatId === chatId &&
    !["completed", "failed", "cancelled"].includes(goal.status));

  return (
    <section className="field goals-panel" aria-label="Goals">
      <div className="row">
        <h4 className="grow">Goals</h4>
        <button className="btn sm" onClick={() => void act(async () => {})} disabled={busy}>
          Refresh
        </button>
        <button className="btn sm" onClick={() => setShowForm((value) => !value)} disabled={unfinishedHere}>
          {showForm ? "Close" : "New Goal"}
        </button>
      </div>
      <p className="hint">
        Give a Goal an objective and limits before it runs. Defaults are 200,000 tokens, $1 and 30 minutes.
        Aux reserves the prompt, tool descriptions and maximum output before each model call. Clear the cost
        limit for a local model without a price. You can pause or cancel at any time.
      </p>
      {chatId && <p className="hint">{unfinishedHere ? "Finish or cancel this conversation’s current Goal before creating another." : "New Goals belong to the current conversation."}</p>}
      {error && <p role="alert">{error}</p>}
      {showForm && (
        <div className="goals-form">
          <label>
            Objective
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              maxLength={10000}
              rows={3}
            />
          </label>
          <div className="goals-limits">
            <label>
              Maximum tokens
              <input
                aria-label="Goal maximum tokens"
                type="number"
                min="1"
                max="10000000"
                step="1"
                value={tokens}
                onChange={(event) => setTokens(event.target.value)}
              />
            </label>
            <label>
              Maximum cost (USD)
              <input
                aria-label="Goal maximum cost"
                type="number"
                min="0.01"
                max="50"
                step="0.01"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </label>
            <label>
              Time limit (minutes)
              <input
                aria-label="Goal time limit"
                type="number"
                min="1"
                max="43200"
                step="1"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </label>
          </div>
          <button
            className="btn"
            disabled={busy || !valid}
            onClick={() =>
              void act(async () => {
                await call("goals.create", {
                  workspaceId,
                  ...(chatId ? { chatId } : {}),
                  objective: objective.trim(),
                  budget: {
                    ...(maxTokens !== undefined ? { maxTokens } : {}),
                    ...(maxCostUsd !== undefined ? { maxCostUsd } : {}),
                    ...(deadlineMinutes !== undefined ? { deadlineMs: deadlineMinutes * 60_000 } : {}),
                  },
                });
                setObjective("");
                setShowForm(false);
              })
            }
          >
            Save Goal
          </button>
        </div>
      )}
      {!goals.length && <p className="hint">No Goals in this Space yet.</p>}
      {goals.map((goal) => (
        <article className="goals-item" key={goal.goalId}>
          <div className="row">
            <strong className="grow">{goal.objective}</strong>
            <span className="work-status">{goal.status.replaceAll("_", " ")}</span>
          </div>
          {goal.chatId && <p className="hint">{goal.chatId === chatId ? "Current conversation" : "Conversation Goal"}</p>}
          {goal.status === "blocked" && goal.blocker && <p className="hint">Blocked: {goal.blocker}</p>}
          {goal.status === "needs_input" && <p className="hint">This Goal needs your review. A stopped model call or run may have had an effect or a charge; Aux will not resume it automatically.</p>}
          <p className="hint">
            {goal.usedTokens.toLocaleString()} / {goal.budget.maxTokens?.toLocaleString() ?? "unlimited"}{" "}
            tokens
            {goal.budget.maxCostUsd !== undefined && (
              <>
                {" "}
                · ${goal.knownCostUsd.toFixed(2)} / ${goal.budget.maxCostUsd.toFixed(2)}
                {goal.costComplete ? "" : " (some charges unconfirmed)"}
              </>
            )}
            {goal.budget.deadlineMs !== undefined && (
              <> · {Math.round(goal.budget.deadlineMs / 60_000)} minute limit</>
            )}
          </p>
          {!!(goal.reservedTokens || goal.reservedCostUsd) && <p className="hint">
            Held capacity: {(goal.reservedTokens ?? 0).toLocaleString()} tokens
            {goal.budget.maxCostUsd !== undefined && <> · ${(goal.reservedCostUsd ?? 0).toFixed(2)}</>}
            . This includes in-flight or uncertain calls and is not confirmed provider usage.
          </p>}
          <div className="row">
            {goal.status === "draft" && (
              <button
                className="btn sm"
                disabled={busy || !modelConfigured || !activePageId}
                onClick={() =>
                  void act(() => call("goals.start", { goalId: goal.goalId, pageIds: [activePageId!] }))
                }
              >
                Start on current tab
              </button>
            )}
            {goal.status === "active" && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() => void act(() => call("goals.pause", { goalId: goal.goalId }))}
              >
                Pause
              </button>
            )}
            {(goal.status === "paused" || goal.status === "blocked") && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() => void act(() => call("goals.resume", { goalId: goal.goalId }))}
              >
                Resume
              </button>
            )}
          {(cancellable.has(goal.status) || goal.status === "draft") && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() => void act(() => call("goals.cancel", { goalId: goal.goalId }))}
              >
                Cancel
              </button>
            )}
            {goal.runId && (
              <button className="btn sm" onClick={() => openRun(goal.runId!)}>
                Open run
              </button>
            )}
          </div>
        </article>
      ))}
      {!modelConfigured && <p className="hint">Set up a model connection before starting a Goal.</p>}
    </section>
  );
}
