import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { policyFor } from "@aux/contracts";
import { siteExportUrl } from "../../agent/site-adapters.js";

async function h_sites_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, tasks, turnTabs } = ctx;
  const previewGranted =
    !!client.connectionId && turnTabs.owns(client.connectionId, params.taskId, params.pageId);
  tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
  const exportUrl = siteExportUrl(params);
  const revision = s.settings.agentPolicy().agentPolicyRevision;
  const allowed = (url: URL) => {
    const policy = s.settings.agentPolicy();
    return policy.agentPolicyRevision === revision && ["read", "navigate"].every((category) =>
      policyFor({ mode: policy.agentMode, category: category as "read" | "navigate", site: url.origin, overrides: policy.agentPolicies }).disposition === "allow");
  };
  await ctx.decideEgress({ url: exportUrl, action: "sites.read", taskId: params.taskId, connectionId: client.connectionId, runId: ctx.externalRunId });
  if (!allowed(exportUrl)) throw new AuxError("permission_denied", "Site policy does not allow this export.");
  const result = await s.pages.readSiteContent(params, allowed);
  tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
  if (!allowed(exportUrl)) throw new AuxError("permission_denied", "Site policy changed during extraction.");
  return result;
}

export const sitesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "sites.read": h_sites_read,
};
