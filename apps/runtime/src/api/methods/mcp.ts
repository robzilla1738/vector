import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { createHash } from "node:crypto";
import { AuxError, EffectRequestSchema } from "@aux/contracts";

async function h_mcp_servers_register(ctx: MethodCtx): Promise<unknown> {
  const { client, method, outboundMcp, params, scope, s } = ctx;
  if (method !== "mcp.tools.call" && (client.external || client.codeMode))
    throw new AuxError("permission_denied", "MCP connections are managed in Aux.");
  if (method === "mcp.tools.call" && (client.external || client.codeMode) && !scope)
    throw new AuxError("permission_denied", "MCP tool calls require a scoped connection.");
  if (method === "mcp.tools.call" && (client.external || client.codeMode) && !ctx.externalRunId)
    throw new AuxError("permission_denied", "MCP tool calls require an active agent session.");
  if (method === "mcp.bundles.inspect") return outboundMcp.inspectBundle(params.path);
  if (method === "mcp.servers.register") return outboundMcp.register(params);
  if (method === "mcp.servers.list") return outboundMcp.list(params.workspaceId);
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
    if (server.source.kind !== "remote" || server.source.auth !== "oauth" || server.state !== "active")
      throw new AuxError("permission_denied", "Add this remote OAuth server before signing in.");
    const remote = server as typeof server & { source: { kind: "remote"; url: string; auth: "oauth" } };
    if (method === "mcp.oauth.requirements") return s.mcpOAuth.requirements(remote);
    if (method === "mcp.oauth.configure") {
      outboundMcp.cancelActive(server.serverId);
      return s.mcpOAuth.configure(remote, params);
    }
    if (method === "mcp.oauth.start") return s.mcpOAuth.start(remote);
    if (method === "mcp.oauth.status") return s.mcpOAuth.status(remote);
    outboundMcp.cancelActive(server.serverId);
    return s.mcpOAuth.clear(remote);
  }
  if (method === "mcp.tools.list") return outboundMcp.listTools(params.serverId);
  if (method === "mcp.tools.setEnabled") return outboundMcp.setEnabled(params);
  const authorizeDispatch = ctx.externalRunId
    ? async () => {
        const runId = ctx.externalRunId!;
        const run = s.repo.getRun(runId);
        if (!run || !["running", "needs_input"].includes(run.status))
          throw new AuxError("permission_denied", "This MCP session is no longer running.");
        const server = outboundMcp.get(params.serverId);
        const threadId = run.config?.chatId ?? runId;
        const request = EffectRequestSchema.parse({
          profileId: s.featureProfileId ?? "default",
          scope: params.context.taskId
            ? { kind: "task", id: params.context.taskId }
            : { kind: "workspace", id: params.context.workspaceId },
          actor: client.codeMode ? "code_mode" : "external_token",
          effect: "external_tool",
          category: "external_tool",
          action: "mcp.tools.call",
          ...(server.source.kind === "remote" ? { origin: new URL(server.source.url).origin } : {}),
          recipient: `mcp:${server.serverId}:${params.toolName}`,
          dataClasses: [],
          provenance: "template",
          invocationDigest: createHash("sha256")
            .update(
              JSON.stringify([
                server.sourceDigest,
                server.toolsRevision,
                params.toolName,
                params.arguments,
                params.context,
              ]),
            )
            .digest("hex"),
          threadId,
          turnId: runId,
          runId,
          requestedAt: Date.now(),
        });
        const policy = JSON.stringify(s.settings.agentPolicy());
        await ctx.safetyGate.checkTrustedEffect(request, {
          profileId: request.profileId,
          scope: request.scope,
          actor: request.actor,
          threadId,
          turnId: runId,
          runId,
        });
        return () => {
          const current = s.repo.getRun(runId);
          if (
            !current ||
            !["running", "needs_input"].includes(current.status) ||
            JSON.stringify(s.settings.agentPolicy()) !== policy
          )
            throw new AuxError("permission_denied", "MCP session or agent permissions changed.");
        };
      }
    : undefined;
  const call = () =>
    outboundMcp.callTool(
      params.serverId,
      params.toolName,
      params.arguments,
      params.context,
      undefined,
      authorizeDispatch,
    );
  if (ctx.externalRunId && s.repo.getRun(ctx.externalRunId)?.config?.mentions?.length)
    return s.turnMentions.useConnector(ctx.externalRunId, `mcp:${params.serverId}`, params.toolName, call);
  return call();
}

export const mcpMethods: Partial<Record<MethodName, MethodHandler>> = {
  "mcp.servers.register": h_mcp_servers_register,
  "mcp.bundles.inspect": h_mcp_servers_register,
  "mcp.servers.list": h_mcp_servers_register,
  "mcp.servers.revoke": h_mcp_servers_register,
  "mcp.oauth.requirements": h_mcp_servers_register,
  "mcp.oauth.configure": h_mcp_servers_register,
  "mcp.oauth.start": h_mcp_servers_register,
  "mcp.oauth.status": h_mcp_servers_register,
  "mcp.oauth.clear": h_mcp_servers_register,
  "mcp.tools.list": h_mcp_servers_register,
  "mcp.tools.setEnabled": h_mcp_servers_register,
  "mcp.tools.call": h_mcp_servers_register,
};
