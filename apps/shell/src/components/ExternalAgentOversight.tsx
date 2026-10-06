import { staticFieldProps } from "../ui/class-props";
import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { useEffect, useState } from "react";
import type { AgentConnection, Run } from "@aux/contracts";
import { call, useStore } from "../store";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

function safeStatus(run: Run): string {
  const message = run.statusMessage;
  if (
    message &&
    (/^External agent (?:used|action) [a-zA-Z][a-zA-Z0-9.]{0,59}(?: needs review)?$/.test(message) ||
      ["Session idle", "Connection revoked", "Connection expired", "Task revision changed"].includes(message))
  )
    return message;
  return run.status === "running" ? "Session running" : `Session ${run.status.replaceAll("_", " ")}`;
}

/** Owner-only view derived from saved runs; no token or external payload reaches the card. */
export function ExternalAgentOversight({ connections }: { connections: readonly AgentConnection[] }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [pending, setPending] = useState<Record<string, number>>({});
  const [activity, setActivity] = useState<{ runId: string; calls: { op: string; status: string }[] } | null>(
    null,
  );
  const [error, setError] = useState("");
  const openRail = useStore((state) => state.openRail);
  const connectionRevision = JSON.stringify(
    connections.map((connection) => [
      connection.connectionId,
      connection.revokedAt,
      connection.expiresAt,
      connection.lastUsedAt,
    ]),
  );
  async function refresh() {
    const [saved, approvals] = await Promise.all([
      call("runs.list", { limit: 500 }),
      Promise.all(
        connections
          .slice(0, 50)
          .map(
            async (connection) =>
              [
                connection.connectionId,
                (await call("safety.approvals.pending", { threadId: `rpc:${connection.connectionId}` }))
                  .length,
              ] as const,
          ),
      ),
    ]);
    const allowed = new Set(connections.map((connection) => connection.connectionId));
    setRuns(
      saved.filter(
        (run) =>
          run.config?.implementation === "external-agent" &&
          !!run.config.externalConnectionId &&
          allowed.has(run.config.externalConnectionId),
      ),
    );
    setPending(Object.fromEntries(approvals));
    setError("");
  }
  useEffect(() => {
    let live = true;
    const currentIds = (
      JSON.parse(connectionRevision) as [string, number | undefined, number | undefined, number | undefined][]
    ).map(([id]) => id);
    void Promise.all([
      call("runs.list", { limit: 500 }),
      Promise.all(
        currentIds
          .slice(0, 50)
          .map(
            async (connectionId) =>
              [
                connectionId,
                (await call("safety.approvals.pending", { threadId: `rpc:${connectionId}` })).length,
              ] as const,
          ),
      ),
    ])
      .then(([saved, approvals]) => {
        if (!live) return;
        const allowed = new Set(currentIds);
        setRuns(
          saved.filter(
            (run) =>
              run.config?.implementation === "external-agent" &&
              !!run.config.externalConnectionId &&
              allowed.has(run.config.externalConnectionId),
          ),
        );
        setPending(Object.fromEntries(approvals));
      })
      .catch(() => {
        if (live) setError("External activity is unavailable. Refresh and try again.");
      });
    return () => {
      live = false;
    };
  }, [connectionRevision]);
  if (!connections.length) return null;
  async function inspect(run: Run) {
    const details = await call("runs.get", { runId: run.runId });
    if (
      details.run.runId !== run.runId ||
      details.run.config?.externalConnectionId !== run.config?.externalConnectionId
    )
      throw new Error("This external session changed. Refresh before reviewing it.");
    setActivity({
      runId: run.runId,
      calls: details.steps
        .filter(
          (step) =>
            step.runId === run.runId &&
            /^(?:agent\.|pages\.|tasks\.|mcp\.tools\.call|results\.generate)/.test(step.op),
        )
        .slice(-16)
        .map((step) => ({ op: step.op, status: step.outcome?.status ?? "running" })),
    });
  }
  return (
    <section {...staticFieldProps} aria-label="External agent activity">
      <div {...staticRowProps}>
        <strong>External agent activity</strong>
        <button
          {...smallGhostButtonProps}
          onClick={() =>
            void refresh().catch(() => setError("External activity is unavailable. Refresh and try again."))
          }
        >
          Refresh
        </button>
      </div>
      <p {...staticHintProps}>
        Saved sessions appear here and in Tasks. Review their action ledger, approvals and available undo in
        the run panel.
      </p>
      {!runs.length && <p {...staticHintProps}>No saved external session yet.</p>}
      {runs.map((run) => (
        <div className="field" key={run.runId}>
          <span>
            {connections.find((connection) => connection.connectionId === run.config?.externalConnectionId)
              ?.name ?? "External agent"}{" "}
            · {run.status.replaceAll("_", " ")}
          </span>
          <span {...staticHintProps}>
            {safeStatus(run)} · {new Date(run.createdAt).toLocaleString()}
          </span>
          {!!pending[run.config?.externalConnectionId ?? ""] && (
            <span {...staticHintProps}>
              {pending[run.config?.externalConnectionId ?? ""]} approval request(s) need review in Aux.
            </span>
          )}
          <div {...staticRowProps}>
            <button
              {...smallGhostButtonProps}
              onClick={() =>
                void inspect(run).catch(() => setError("External activity changed. Refresh and try again."))
              }
            >
              Show activity
            </button>
            <button {...smallButtonProps} onClick={() => openRail({ kind: "run", runId: run.runId })}>
              Review run
            </button>
          </div>
          {activity?.runId === run.runId && (
            <details open>
              <summary>Recorded external actions · {activity.calls.length}</summary>
              <ol>
                {activity.calls.map((call, index) => (
                  <li key={`${call.op}:${index}`}>
                    {call.op} · {call.status}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      ))}
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
    </section>
  );
}
