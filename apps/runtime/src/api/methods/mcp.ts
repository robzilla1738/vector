import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_mcp_servers_register(ctx: MethodCtx): Promise<unknown> {
  const { client, method, outboundMcp, params, scope } = ctx;
  if (method !== "mcp.tools.call" && (client.external || client.codeMode))
    throw new AuxError("permission_denied", "MCP connections are managed in Aux.");
  if (method === "mcp.tools.call" && (client.external || client.codeMode) && !scope)
    throw new AuxError("permission_denied", "MCP tool calls require a scoped connection.");
  if (method === "mcp.bundles.inspect") return outboundMcp.inspectBundle(params.path);
  if (method === "mcp.servers.register") return outboundMcp.register(params);
  if (method === "mcp.servers.list") return outboundMcp.list(params.workspaceId);
  if (method === "mcp.servers.approve") return outboundMcp.approve(params.serverId, params.expectedDigest);
  if (method === "mcp.servers.revoke") return outboundMcp.revoke(params.serverId);
  if (method === "mcp.tools.list") return outboundMcp.listTools(params.serverId);
  if (method === "mcp.grants.create") return outboundMcp.grant(params);
  if (method === "mcp.grants.list") return outboundMcp.grants(params.serverId);
  if (method === "mcp.grants.revoke") return outboundMcp.revokeGrant(params.grantId);
  return outboundMcp.callTool(params.grantId, params.arguments, params.context);
}

export const mcpMethods: Partial<Record<MethodName, MethodHandler>> = {
  "mcp.servers.register": h_mcp_servers_register,
  "mcp.bundles.inspect": h_mcp_servers_register,
  "mcp.servers.list": h_mcp_servers_register,
  "mcp.servers.approve": h_mcp_servers_register,
  "mcp.servers.revoke": h_mcp_servers_register,
  "mcp.tools.list": h_mcp_servers_register,
  "mcp.grants.create": h_mcp_servers_register,
  "mcp.grants.list": h_mcp_servers_register,
  "mcp.grants.revoke": h_mcp_servers_register,
  "mcp.tools.call": h_mcp_servers_register,
};
