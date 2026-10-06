import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_mcp_servers_register(ctx: MethodCtx): Promise<unknown> {
  const { client, method, outboundMcp, params, scope, s } = ctx;
  if (method !== "mcp.tools.call" && (client.external || client.codeMode))
    throw new AuxError("permission_denied", "MCP connections are managed in Aux.");
  if (method === "mcp.tools.call" && (client.external || client.codeMode) && !scope)
    throw new AuxError("permission_denied", "MCP tool calls require a scoped connection.");
  if (method === "mcp.bundles.inspect") return outboundMcp.inspectBundle(params.path);
  if (method === "mcp.servers.register") return outboundMcp.register(params);
  if (method === "mcp.servers.list") return outboundMcp.list(params.workspaceId);
  if (method === "mcp.servers.approve") return outboundMcp.approve(params.serverId, params.expectedDigest);
  if (method === "mcp.servers.revoke") {
    const revoked = outboundMcp.revoke(params.serverId);
    if (revoked.source.kind === "remote" && revoked.source.auth === "oauth" && s.mcpOAuth)
      await s.mcpOAuth.clear(
        revoked as typeof revoked & { source: { kind: "remote"; url: string; auth: "oauth" } },
      );
    return revoked;
  }
  if (method.startsWith("mcp.oauth.")) {
    if (!s.mcpOAuth) throw new AuxError("backend_unavailable", "MCP OAuth is unavailable in this host.");
    const server = outboundMcp.get(params.serverId);
    if (server.source.kind !== "remote" || server.source.auth !== "oauth" || server.state !== "approved")
      throw new AuxError("permission_denied", "Approve this remote OAuth server before connecting it.");
    const remote = server as typeof server & { source: { kind: "remote"; url: string; auth: "oauth" } };
    if (method === "mcp.oauth.start") return s.mcpOAuth.start(remote);
    if (method === "mcp.oauth.status") return s.mcpOAuth.status(remote);
    outboundMcp.cancelActive(server.serverId);
    return s.mcpOAuth.clear(remote);
  }
  if (method === "mcp.tools.list") return outboundMcp.listTools(params.serverId);
  if (method === "mcp.grants.create") return outboundMcp.grant(params);
  if (method === "mcp.grants.list") return outboundMcp.grants(params.serverId);
  if (method === "mcp.grants.revoke") return outboundMcp.revokeGrant(params.grantId);
  if (ctx.externalRunId && s.repo.getRun(ctx.externalRunId)?.config?.mentions?.length) {
    const grant = outboundMcp.getGrant(params.grantId);
    return s.turnMentions.useConnector(ctx.externalRunId, `mcp:${grant.serverId}`, grant.toolName, () =>
      outboundMcp.callTool(params.grantId, params.arguments, params.context),
    );
  }
  return outboundMcp.callTool(params.grantId, params.arguments, params.context);
}

export const mcpMethods: Partial<Record<MethodName, MethodHandler>> = {
  "mcp.servers.register": h_mcp_servers_register,
  "mcp.bundles.inspect": h_mcp_servers_register,
  "mcp.servers.list": h_mcp_servers_register,
  "mcp.servers.approve": h_mcp_servers_register,
  "mcp.servers.revoke": h_mcp_servers_register,
  "mcp.oauth.start": h_mcp_servers_register,
  "mcp.oauth.status": h_mcp_servers_register,
  "mcp.oauth.clear": h_mcp_servers_register,
  "mcp.tools.list": h_mcp_servers_register,
  "mcp.grants.create": h_mcp_servers_register,
  "mcp.grants.list": h_mcp_servers_register,
  "mcp.grants.revoke": h_mcp_servers_register,
  "mcp.tools.call": h_mcp_servers_register,
};
