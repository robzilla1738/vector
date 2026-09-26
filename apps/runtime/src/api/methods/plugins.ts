import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_plugins_inspect(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
  return plugins.inspect(params.path);
}
async function h_plugins_install(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
  return plugins.install(params.path, params.workspaceId, params.expectedDigest);
}
async function h_plugins_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
  return plugins.list(params);
}
async function h_plugins_assets(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
  return plugins.assets(params.pluginId);
}
async function h_plugins_skills_grant(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Skill access is granted in Aux.");
  return plugins.grantSkill(params);
}
async function h_plugins_skills_grants(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Skill access is managed in Aux.");
  return plugins.skillGrants(params.pluginId);
}
async function h_plugins_skills_revoke(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Skill access is revoked in Aux.");
  return plugins.revokeSkill(params.grantId);
}
async function h_plugins_skills_read(ctx: MethodCtx): Promise<unknown> {
  const { params, plugins, requireScopedTask, scope } = ctx;
  if (scope) requireScopedTask(scope, params.taskId);
  return plugins.readSkill(params);
}
async function h_plugins_uninstall(ctx: MethodCtx): Promise<unknown> {
  const { client, params, plugins } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
  return plugins.uninstall(params.pluginId);
}

export const pluginsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "plugins.inspect": h_plugins_inspect,
  "plugins.install": h_plugins_install,
  "plugins.list": h_plugins_list,
  "plugins.assets": h_plugins_assets,
  "plugins.skills.grant": h_plugins_skills_grant,
  "plugins.skills.grants": h_plugins_skills_grants,
  "plugins.skills.revoke": h_plugins_skills_revoke,
  "plugins.skills.read": h_plugins_skills_read,
  "plugins.uninstall": h_plugins_uninstall,
};
