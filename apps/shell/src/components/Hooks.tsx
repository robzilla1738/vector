import { useEffect, useState } from "react";
import type { Hook, HookInvocation, OutboundMcpGrant, OutboundMcpServer, WorkspaceFolder } from "@aux/contracts";
import { call } from "../store";

type GrantChoice = { grant: OutboundMcpGrant; server: OutboundMcpServer };

async function loadHooks(workspaceId: string): Promise<{ hooks: Hook[]; choices: GrantChoice[] }> {
  const hooks = await call("hooks.list", { workspaceId });
  const servers = await call("mcp.servers.list", { workspaceId });
  const choices: GrantChoice[] = [];
  for (const server of servers) {
    if (server.state !== "approved") continue;
    const grants = await call("mcp.grants.list", { serverId: server.serverId });
    for (const grant of grants) {
      if (
        grant.mode === "standing" &&
        !grant.revokedAt &&
        !grant.consumedAt &&
        grant.scope.kind === "workspace" &&
        grant.scope.workspaceId === workspaceId
      ) choices.push({ grant, server });
    }
  }
  return { hooks, choices };
}

export function Hooks({ workspaceId }: { workspaceId: string }) {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [choices, setChoices] = useState<GrantChoice[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [handlerType, setHandlerType] = useState<"mcp_tool" | "command">("mcp_tool");
  const [command, setCommand] = useState("");
  const [workdir, setWorkdir] = useState("");
  const [grantId, setGrantId] = useState("");
  const [hookEvent, setHookEvent] = useState<"run.start" | "run.end">("run.end");
  const [argumentsText, setArgumentsText] = useState("{}");
  const [selectedId, setSelectedId] = useState("");
  const [invocations, setInvocations] = useState<HookInvocation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const loaded = await loadHooks(workspaceId);
    setHooks(loaded.hooks);
    setChoices(loaded.choices);
    setFolders(await call("workspaces.folders.list", { workspaceId }));
    if (selectedId) setInvocations(await call("hooks.invocations", { hookId: selectedId, limit: 20 }));
  }

  useEffect(() => {
    let live = true;
    setHooks([]);
    setChoices([]);
    setFolders([]);
    setSelectedId("");
    setInvocations([]);
    void Promise.all([loadHooks(workspaceId), call("workspaces.folders.list", { workspaceId })])
      .then(([{ hooks: nextHooks, choices: nextChoices }, nextFolders]) => {
        if (!live) return;
        setHooks(nextHooks);
        setChoices(nextChoices);
        setFolders(nextFolders);
      })
      .catch((reason) => {
        if (live) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [workspaceId]);

  async function act(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  const chosen = choices.find((item) => item.grant.grantId === grantId);
  const selected = hooks.find((item) => item.hookId === selectedId);
  let argumentsValue: Record<string, unknown> | undefined;
  try {
    const parsed: unknown = JSON.parse(argumentsText);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
      argumentsValue = parsed as Record<string, unknown>;
  } catch {
    /* Save stays disabled until JSON is an object. */
  }

  return (
    <section className="field hooks-panel" aria-label="Hooks">
      <div className="row">
        <h4 className="grow">Hooks</h4>
        <button className="btn sm" disabled={busy} onClick={() => void act(async () => {})}>
          Refresh
        </button>
      </div>
      <p className="hint">
        A run lifecycle Hook calls a granted MCP tool or a sandboxed local command. Review its exact handler
        before approving it; revoking its grant, folder, or Hook stops future calls.
      </p>
      {error && <p role="alert">{error}</p>}
      {handlerType === "mcp_tool" && !choices.length && !error && <p className="hint">No standing MCP tool grants in this Space. Create one in MCP &amp; Connectors.</p>}
      <label>Handler
        <select aria-label="Hook handler" value={handlerType} onChange={event => setHandlerType(event.target.value as "mcp_tool" | "command")}>
          <option value="mcp_tool">Granted MCP tool</option>
          <option value="command">Sandboxed command</option>
        </select>
      </label>
      <label>Run event
        <select aria-label="Hook run event" value={hookEvent} onChange={event => setHookEvent(event.target.value as "run.start" | "run.end")}>
          <option value="run.start">Run starts</option>
          <option value="run.end">Run ends</option>
        </select>
      </label>
      {handlerType === "mcp_tool" && <label>
        Granted MCP tool
        <select
          aria-label="Hook MCP tool grant"
          value={grantId}
          onChange={(event) => setGrantId(event.target.value)}
        >
          <option value="">Choose a standing Space grant</option>
          {choices.map(({ grant, server }) => (
            <option key={grant.grantId} value={grant.grantId}>
              {server.name} · {grant.toolName}
            </option>
          ))}
        </select>
      </label>}
      {handlerType === "mcp_tool" && <label>
        Tool arguments as JSON
        <textarea
          aria-label="Hook tool arguments"
          rows={3}
          value={argumentsText}
          onChange={(event) => setArgumentsText(event.target.value)}
        />
      </label>}
      {handlerType === "command" && <>
        <label>Reviewed writable folder
          <select aria-label="Hook command folder" value={workdir} onChange={event => setWorkdir(event.target.value)}>
            <option value="">Choose a bound folder</option>
            {folders.filter(item => item.access === "readWrite" && !item.archivedAt).map(item =>
              <option key={item.folderId} value={item.path}>{item.path}</option>)}
          </select>
        </label>
        <label>Command
          <textarea aria-label="Hook command" rows={2} maxLength={8000} value={command}
            onChange={event => setCommand(event.target.value)} />
        </label>
        <p className="hint">The exact command runs without network access inside this folder and Aux's sandbox. Archive the folder or revoke the Hook to stop future runs.</p>
      </>}
      <button
        className="btn sm"
        disabled={busy || handlerType === "mcp_tool" && (!chosen || !argumentsValue || argumentsText.length > 64_000)
          || handlerType === "command" && (!command.trim() || !workdir)}
        onClick={() =>
          void act(async () => {
            const hook = await call("hooks.register", {
              workspaceId,
              event: hookEvent,
              handler: handlerType === "command"
                ? { type: "command", command: command.trim(), workdir }
                : { type: "mcp_tool", serverId: chosen!.server.serverId, grantId: chosen!.grant.grantId,
                    toolName: chosen!.grant.toolName, arguments: argumentsValue },
            });
            setSelectedId(hook.hookId);
          })
        }
      >
        Save Hook for review
      </button>
      <label>
        Review Hook
        <select
          aria-label="Review Hook"
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setInvocations([]);
            if (event.target.value)
              void call("hooks.invocations", { hookId: event.target.value, limit: 20 })
                .then(setInvocations)
                .catch((reason) => setError(String(reason)));
          }}
        >
          <option value="">Choose a Hook</option>
          {hooks.map((hook) => (
            <option key={hook.hookId} value={hook.hookId}>
              {hook.event} · {hook.handler.type === "mcp_tool" ? hook.handler.toolName : hook.handler.type} ·{" "}
              {hook.trust}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <div className="hooks-review">
          <p>
            <strong>{selected.event}</strong> · {selected.trust}
          </p>
          <p>
            Handler fingerprint <code>{selected.handlerDigest}</code>
          </p>
          {selected.handler.type === "mcp_tool" && (
            <>
              <p>
                Server <code>{selected.handler.serverId}</code> · grant{" "}
                <code>{selected.handler.grantId}</code> · tool <code>{selected.handler.toolName}</code>
              </p>
              <p>
                Arguments <code>{JSON.stringify(selected.handler.arguments ?? {})}</code>
              </p>
            </>
          )}
          {selected.handler.type === "command" && <>
            <p>Working folder <code>{selected.handler.workdir}</code></p>
            <p>Command <code>{selected.handler.command}</code></p>
          </>}
          <div className="row">
            {selected.trust === "untrusted" && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() =>
                  void act(() =>
                    call("hooks.approve", {
                      hookId: selected.hookId,
                      expectedDigest: selected.handlerDigest,
                    }),
                  )
                }
              >
                Approve exact Hook
              </button>
            )}
            {selected.trust !== "revoked" && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() => void act(() => call("hooks.revoke", { hookId: selected.hookId }))}
              >
                Revoke Hook
              </button>
            )}
            {selected.trust === "approved" && (
              <button
                className="btn sm"
                disabled={busy}
                onClick={() => void act(() => call("hooks.test", { hookId: selected.hookId }))}
              >
                Test Hook now
              </button>
            )}
          </div>
          <h5>Invocations</h5>
          {!invocations.length && <p className="hint">No invocations yet.</p>}
          {invocations.map((item) => (
            <p key={item.invocationId}>
              {item.state} · {new Date(item.createdAt).toLocaleString()}
              {item.error ? ` · ${item.error}` : ""}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
