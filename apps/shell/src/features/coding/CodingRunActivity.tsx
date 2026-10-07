import { useCallback, useEffect, useRef, useState } from "react";
import type { CodingFileReceipt, CodingProcessView, Subagent, CoderRecoveryInspection } from "@aux/contracts";
import { call } from "../../store";
import { errorMessage } from "../../error-message";
import { FileChanges } from "./FileChanges";
import "./CodingRunActivity.css";

export function CodingRunActivity({ runId, live }: { runId: string; live: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [receipts, setReceipts] = useState<CodingFileReceipt[]>([]);
  const [agents, setAgents] = useState<Subagent[]>([]);
  const [processes, setProcesses] = useState<CodingProcessView[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const undoRequest = useRef<{ actionId: string; receiptIds: string[] } | null>(null);
  const generation = useRef(0);
  const loading = useRef<number | null>(null);
  const fileRevision = useRef("");
  const refresh = useCallback(async () => {
    const request = generation.current;
    if (loading.current === request) return;
    loading.current = request;
    try {
      const activity = await call("coding.activity", { runId });
      if (request !== generation.current) return;
      setProcesses(activity.processes);
      setAgents(activity.agents);
      if (activity.fileRevision !== fileRevision.current) {
        const changes = await call("coding.changes", { runId });
        if (request !== generation.current) return;
        setReceipts(changes);
        fileRevision.current = activity.fileRevision;
      }
      setError("");
    } catch (reason) {
      if (request === generation.current) throw reason;
    } finally {
      if (loading.current === request) loading.current = null;
    }
  }, [runId]);
  useEffect(() => {
    if (!expanded) return;
    const originalGeneration = ++generation.current;
    void refresh().catch((reason) => setError(errorMessage(reason)));
    const interval = live
      ? setInterval(() => {
          void refresh().catch((reason) => setError(errorMessage(reason)));
        }, 2000)
      : undefined;
    return () => {
      generation.current = originalGeneration + 1;
      clearInterval(interval);
    };
  }, [expanded, live, refresh]);
  const undone = new Set(
    receipts.flatMap((receipt) => (receipt.undoOf && receipt.status === "confirmed" ? [receipt.undoOf] : [])),
  );
  const undoable = receipts.filter(
    (receipt) =>
      ["confirmed", "partially_applied"].includes(receipt.status) &&
      !receipt.undoOf &&
      !undone.has(receipt.receiptId),
  );
  async function undo() {
    setBusy(true);
    setError("");
    undoRequest.current ??= {
      actionId: crypto.randomUUID(),
      receiptIds: undoable.map((receipt) => receipt.receiptId),
    };
    try {
      await call("coding.undo", { runId, ...undoRequest.current });
      undoRequest.current = null;
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="coding-run-activity" onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary>Changes, processes and agents</summary>
      {expanded && (
        <>
          {error && <p role="alert">{error}</p>}
          {!!undoable.length && (
            <button type="button" disabled={busy || live} onClick={() => void undo()}>
              Undo this turn’s file changes
            </button>
          )}
          {receipts.map((receipt) => (
            <section key={receipt.receiptId}>
              <p>
                {receipt.undoOf ? "Undo" : "File changes"} · {receipt.status}
                {undone.has(receipt.receiptId) ? " · reverted" : ""}
              </p>
              {receipt.error && <p>{receipt.error}</p>}
              <FileChanges
                load={async (path, full) => {
                  const [selected] = await call("coding.changes", {
                    runId,
                    receiptId: receipt.receiptId,
                    path,
                    full,
                  });
                  if (!selected) throw new Error("The file receipt is unavailable.");
                  const before = selected.before.find((state) => state.path === path);
                  const after = selected.after.find((state) => state.path === path);
                  return {
                    before: before?.content ?? null,
                    after: after?.content ?? null,
                    truncated: !!(before?.contentTruncated || after?.contentTruncated),
                  };
                }}
                changes={receipt.after.map((state) => ({
                  path: state.path,
                  beforeMode: receipt.before.find((before) => before.path === state.path)?.mode,
                  afterMode: state.mode,
                  kind:
                    state.version === null
                      ? "delete"
                      : receipt.before.find((before) => before.path === state.path)?.version === null
                        ? "create"
                        : "edit",
                  binary:
                    state.contentBase64 !== undefined ||
                    receipt.before.find((before) => before.path === state.path)?.contentBase64 !== undefined,
                  before: receipt.before.find((before) => before.path === state.path)?.content ?? null,
                  after: state.content,
                }))}
              />
            </section>
          ))}
          {!receipts.length && <p>No file changes recorded.</p>}
          {agents.map((agent) => (
            <section key={agent.agentId}>
              <p>
                {agent.goal} · {agent.state}
              </p>
              {agent.recovery && <WorktreeRecovery runId={runId} cellId={agent.agentId} refresh={refresh} />}
            </section>
          ))}
          {processes.map((process) => (
            <Process key={process.processId} process={process} refresh={refresh} />
          ))}
        </>
      )}
    </details>
  );
}
function Process({ process, refresh }: { process: CodingProcessView; refresh: () => Promise<void> }) {
  const [logs, setLogs] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const cursor = useRef(0);
  async function loadLogs() {
    try {
      const next = await call("coding.logs", {
        runId: process.runId,
        processId: process.processId,
        cursor: cursor.current,
      });
      cursor.current = next.cursor;
      setLogs((previous) => (previous + next.text).slice(-65536));
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }
  async function stop() {
    setBusy(true);
    try {
      await call("coding.stop", { runId: process.runId, processId: process.processId });
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p>
        <code>{process.command}</code> ·{" "}
        {process.state === "interrupted" ? "Interrupted · outcome unknown" : process.state}
        {process.exitCode !== undefined && process.exitCode !== null ? ` · exit ${process.exitCode}` : ""}
      </p>
      <button type="button" onClick={() => void loadLogs()}>
        Read new output
      </button>
      {(process.state === "running" || process.state === "starting") && (
        <button type="button" disabled={busy} onClick={() => void stop()}>
          Stop process
        </button>
      )}
      {process.state === "uncertain" && (
        <p>Read the output and ask Aux to reconcile the original process before retrying.</p>
      )}
      {error && <p role="alert">{error}</p>}
      {logs && <pre className="coding-process-log">{logs}</pre>}
    </section>
  );
}

function WorktreeRecovery({
  runId,
  cellId,
  refresh,
}: {
  runId: string;
  cellId: string;
  refresh: () => Promise<void>;
}) {
  const [inspection, setInspection] = useState<CoderRecoveryInspection>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const archiveRequest = useRef<{ actionId: string; expectedDigest: string } | null>(null);
  async function inspect() {
    setBusy(true);
    setError("");
    try {
      setInspection(await call("coding.worktreeInspect", { runId, cellId }));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  async function archive() {
    if (!inspection) return;
    setBusy(true);
    setError("");
    if (archiveRequest.current?.expectedDigest !== inspection.digest)
      archiveRequest.current = { actionId: crypto.randomUUID(), expectedDigest: inspection.digest };
    try {
      setInspection(await call("coding.worktreeArchive", { runId, cellId, ...archiveRequest.current! }));
      archiveRequest.current = null;
      await refresh();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p>Worktree creation was interrupted. Aux preserves its files for inspection.</p>
      <button type="button" disabled={busy} onClick={() => void inspect()}>
        Inspect preserved files
      </button>
      {error && <p role="alert">{error}</p>}
      {inspection && (
        <>
          <p>
            {inspection.exists
              ? `${inspection.files.length} preserved files`
              : "No files at the recorded location"}{" "}
            · {inspection.state}
          </p>
          <code>{inspection.root}</code>
          {inspection.archiveOutcomeUnknown && (
            <p>
              Files are present in the archive location, but the archive outcome is unconfirmed. No action was
              replayed.
            </p>
          )}
          {inspection.blockedPaths.length > 0 && (
            <p>Protected or linked paths remain preserved: {inspection.blockedPaths.join(", ")}</p>
          )}
          <ul>
            {inspection.files.map((file) => (
              <li key={file.path}>
                <code>{file.path}</code> · {file.size} bytes{file.binary ? " · binary" : ""}
                {file.preview && (
                  <details>
                    <summary>Read captured contents</summary>
                    <pre>{file.preview}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
          {inspection.state === "incomplete" &&
            inspection.exists &&
            !inspection.archiveOutcomeUnknown &&
            !inspection.blockedPaths.length && (
              <>
                <p>
                  Archive these inspected files intact and release the interrupted worktree. Aux will keep
                  their contents.
                </p>
                <button type="button" disabled={busy} onClick={() => void archive()}>
                  Archive these files
                </button>
              </>
            )}
        </>
      )}
    </>
  );
}
