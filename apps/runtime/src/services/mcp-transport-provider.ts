import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { isIP } from "node:net";
import { isAbsolute } from "node:path";
import { StreamableHTTPClientTransport, type Transport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { AuxError, McpOAuthTokenSchema, McpStdioLaunchPermitSchema, type OutboundMcpServer } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { McpTransportProvider } from "./outbound-mcp.js";

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const forbiddenHost = (hostname: string) => {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return isIP(host) !== 0 || host === "localhost" || host.endsWith(".localhost") ||
    host.endsWith(".local") || host.endsWith(".internal");
};

/**
 * Real MCP transports behind reviewed source identity. The native host must
 * validate the local command, cwd, source digest and default-deny profile,
 * then make the capability single-use in its launcher before server spawn.
 */
export function createMcpTransportProvider(
  native?: Pick<NativeBridge, "prepareMcpStdioLaunch" | "mcpOAuthToken">,
  networkFetch: typeof fetch = fetch,
): McpTransportProvider {
  return async (server: OutboundMcpServer, signal: AbortSignal): Promise<Transport> => {
    if (signal.aborted) throw new AuxError("cancelled", "MCP connection was cancelled.");
    if (server.state !== "approved" || digest(server.source) !== server.sourceDigest)
      throw new AuxError("permission_denied", "MCP server source is not approved.");
    if (server.source.kind === "remote") {
      const url = new URL(server.source.url);
      if (url.protocol !== "https:" || url.username || url.password || forbiddenHost(url.hostname))
        throw new AuxError("permission_denied", "MCP endpoint must be a reviewed public HTTPS host.");
      const reviewedOrigin = url.origin;
      const exactOriginFetch: typeof fetch = (input, init) => {
        const requestUrl = new URL(input instanceof Request ? input.url : String(input));
        if (requestUrl.protocol !== "https:" || requestUrl.origin !== reviewedOrigin ||
          requestUrl.username || requestUrl.password || signal.aborted)
          throw new AuxError("permission_denied", "MCP request left the reviewed HTTPS origin.");
        const requestSignals = [signal, init?.signal, input instanceof Request ? input.signal : undefined]
          .filter((value): value is AbortSignal => !!value);
        return networkFetch(input, { ...init, redirect: "error", signal: AbortSignal.any(requestSignals) });
      };
      const authProvider = server.source.auth === "oauth" ? {
        token: async () => {
          if (!native?.mcpOAuthToken) throw new AuxError("backend_unavailable", "MCP OAuth is unavailable in this host.");
          const token = McpOAuthTokenSchema.parse(await native.mcpOAuthToken(server));
          if (token.serverId !== server.serverId || token.sourceDigest !== server.sourceDigest ||
            token.expiresAt <= Date.now() || signal.aborted)
            throw new AuxError("permission_denied", "MCP OAuth credential does not match this approved server.");
          return token.token;
        },
      } : undefined;
      const transport = new StreamableHTTPClientTransport(url, {
        fetch: exactOriginFetch, authProvider, onInsufficientScope: "throw",
        reconnectionOptions: { maxReconnectionDelay: 0, initialReconnectionDelay: 0, reconnectionDelayGrowFactor: 1,
          maxRetries: 0 },
      });
      signal.addEventListener("abort", () => { void transport.close(); }, { once: true });
      return transport;
    }
    if (!native?.prepareMcpStdioLaunch)
      throw new AuxError("backend_unavailable", "Supervised local MCP launch is unavailable in this host.");
    if (server.source.kind === "bundle") {
      const info = await stat(server.source.path);
      if (!info.isFile() || info.size > 20_000_000 ||
        createHash("sha256").update(await readFile(server.source.path)).digest("hex") !== server.source.sha256)
        throw new AuxError("conflict", "MCP bundle contents changed since approval.");
    }
    const permit = McpStdioLaunchPermitSchema.parse(await native.prepareMcpStdioLaunch(server));
    if (permit.serverId !== server.serverId || permit.sourceDigest !== server.sourceDigest ||
      permit.expiresAt <= Date.now() || permit.expiresAt > Date.now() + 60_000 ||
      !isAbsolute(permit.launcherPath) || !isAbsolute(permit.cwd) || signal.aborted)
      throw new AuxError("permission_denied", "The native MCP launch capability is invalid or expired.");
    if ((server.source.kind === "local" && permit.launcherPath === server.source.command) ||
      permit.effectiveProfile.readableRoots.some(root => !isAbsolute(root) || root === "/"))
      throw new AuxError("permission_denied", "MCP requires a supervised launcher with bounded readable roots.");
    // Only the host-issued supervisor is executed. The reviewed source command
    // and bundle are never passed to Node's process launcher here.
    const transport = new StdioClientTransport({ command: permit.launcherPath,
      args: [...permit.launcherArgs, permit.capabilityId], cwd: permit.cwd,
      env: {}, stderr: "ignore", maxBufferSize: 1_000_000 });
    signal.addEventListener("abort", () => { void transport.close(); }, { once: true });
    return transport;
  };
}
