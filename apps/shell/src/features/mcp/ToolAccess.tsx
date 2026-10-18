import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { OutboundMcpServer, OutboundMcpTool } from "@aux/contracts";
import { call } from "../../store";
import { bridge } from "../../bridge";
import { Switch, Button } from "../../ui";
import { errorMessage } from "../../error-message";
import "./ToolAccess.css";

/** Both server inspection and Permissions mutate the same revision-bound tool switches. */
export function McpToolAccess({
  server,
  tools,
  disabled = false,
  onChange,
  onCall,
}: {
  server: OutboundMcpServer;
  tools: readonly OutboundMcpTool[];
  disabled?: boolean;
  onChange(server: OutboundMcpServer): void;
  onCall?(tool: OutboundMcpTool): void;
}) {
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(
    () => ({ server, disabled, windowId, kind, privateMode }),
    [server, disabled, windowId, kind, privateMode],
  );
  const currentRef = useRef<typeof owner | null>(null);
  useLayoutEffect(() => {
    currentRef.current = owner;
    return () => {
      if (currentRef.current === owner) currentRef.current = null;
    };
  }, [owner]);
  const current = (original: typeof owner) =>
    currentRef.current === original &&
    bridge.windowId === original.windowId &&
    bridge.windowKind === original.kind &&
    bridge.privateMode === original.privateMode;
  const pending = useRef(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function toggle(tool: OutboundMcpTool, enabled: boolean) {
    const original = owner;
    if (pending.current || disabled || server.state !== "active" || !current(original)) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await call("mcp.tools.setEnabled", {
        serverId: server.serverId,
        toolName: tool.name,
        enabled,
        expectedRevision: server.toolsRevision,
      });
      if (current(original)) onChange(updated);
    } catch (reason) {
      if (current(original)) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="mcp-tool-access">
      {!tools.length && <p>The server reported no tools.</p>}
      {tools.map((tool) => {
        const enabled = !server.disabledTools.includes(tool.name);
        return (
          <div className="mcp-tool-access-row" key={tool.name}>
            <label>
              <Switch
                aria-label={`Enable ${tool.name}`}
                checked={enabled}
                disabled={disabled || busy || server.state !== "active"}
                onChange={(event) => void toggle(tool, event.target.checked)}
              />
              <span>
                <strong>{tool.name}</strong>
                {tool.description && <span>{tool.description}</span>}
                <span>
                  {tool.effect === "read"
                    ? "Documented read"
                    : tool.effect === "write"
                      ? "Writes external data"
                      : "Effect unverified; treated as an external action"}
                </span>
              </span>
            </label>
            {onCall && (
              <Button
                size={28}
                disabled={disabled || busy || !enabled || server.state !== "active"}
                onClick={() => onCall(tool)}
              >
                Call tool…
              </Button>
            )}
          </div>
        );
      })}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
