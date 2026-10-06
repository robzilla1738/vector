import { useEffect, useState } from "react";
import type { OutboundMcpServer, OutboundMcpTool, Workspace } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call } from "../../store";
import { errorMessage } from "../../error-message";
import { McpToolAccess } from "./ToolAccess";

type Catalog = { server: OutboundMcpServer; tools: OutboundMcpTool[]; error?: string };
export function McpPermissions({ active }: { active: boolean }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]),
    [workspaceId, setWorkspaceId] = useState("");
  const [catalog, setCatalog] = useState<{ workspaceId: string; items: Catalog[] } | null>(null);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  useEffect(() => {
    if (!active) return;
    let live = true;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === kind &&
      bridge.privateMode === privateMode;
    void call("workspaces.list", {})
      .then((items) => {
        if (!current()) return;
        setWorkspaces(items);
        setWorkspaceId((value) =>
          items.some((item) => item.workspaceId === value) ? value : (items[0]?.workspaceId ?? ""),
        );
      })
      .catch((reason) => {
        if (current()) setError(errorMessage(reason));
      });
    return () => {
      live = false;
    };
  }, [active, windowId, kind, privateMode]);
  useEffect(() => {
    if (!active || !workspaceId) return;
    let live = true;
    const current = () =>
      live &&
      bridge.windowId === windowId &&
      bridge.windowKind === kind &&
      bridge.privateMode === privateMode;
    setLoading(true);
    setError("");
    void (async () => {
      const servers = await call("mcp.servers.list", { workspaceId });
      const records = await Promise.all(
        servers
          .filter((server) => server.state === "active")
          .map(async (server) => {
            try {
              return { server, tools: await call("mcp.tools.list", { serverId: server.serverId }) };
            } catch (reason) {
              return { server, tools: [], error: errorMessage(reason) };
            }
          }),
      );
      // Discovery can advance the catalog revision. Toggle against the post-discovery snapshot.
      const latest = await call("mcp.servers.list", { workspaceId });
      if (current())
        setCatalog({
          workspaceId,
          items: records.flatMap((record) => {
            const server = latest.find(
              (item) =>
                item.serverId === record.server.serverId &&
                item.sourceDigest === record.server.sourceDigest &&
                item.state === "active",
            );
            return server ? [{ ...record, server }] : [];
          }),
        });
    })()
      .catch((reason) => {
        if (current()) setError(errorMessage(reason));
      })
      .finally(() => {
        if (current()) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [active, workspaceId, windowId, kind, privateMode, refresh]);
  const items = catalog?.workspaceId === workspaceId ? catalog.items : [];
  return (
    <div className="mcp-permissions">
      {workspaces.length > 0 && (
        <label>
          Space
          <select
            aria-label="MCP permissions Space"
            value={workspaceId}
            onChange={(event) => setWorkspaceId(event.target.value)}
            disabled={!active || loading}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.workspaceId} value={workspace.workspaceId}>
                {workspace.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {loading && <p role="status">Loading MCP tools…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && !items.length && <p>No connected MCP servers in this Space.</p>}
      {items.map(({ server, tools, error: serverError }) => (
        <section key={server.serverId} aria-label={`${server.name} tool permissions`}>
          <h4>{server.name}</h4>
          {serverError ? (
            <p role="alert">{serverError}</p>
          ) : (
            <McpToolAccess
              server={server}
              tools={tools}
              disabled={!active || loading}
              onChange={(updated) =>
                setCatalog((value) =>
                  value?.workspaceId === workspaceId
                    ? {
                        ...value,
                        items: value.items.map((item) =>
                          item.server.serverId === updated.serverId ? { ...item, server: updated } : item,
                        ),
                      }
                    : value,
                )
              }
            />
          )}
        </section>
      ))}
      <button
        type="button"
        disabled={!active || loading || !workspaceId}
        onClick={() => setRefresh((value) => value + 1)}
      >
        Refresh tools
      </button>
    </div>
  );
}
