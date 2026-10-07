import { cloudSettingsFor } from "../../services/cloud-settings.js";
import { withRunAuthorityMutation, withRunDispatchMutation } from "../../services/overnight-authority.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, EventTypes, MethodSchemas } from "@aux/contracts";
import { usageReport } from "../../services/usage-report.js";

async function h_settings_get(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  const settings = s.settings.all();
  if (s.featureHost !== "chromium-fork") return settings;
  const searchEngine = await s.native?.searchEngineGet?.();
  if (!searchEngine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
  const searchSuggestions = await s.native?.searchSuggestionsGet?.();
  if (searchSuggestions === undefined)
    throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
  return { ...settings, searchEngine, searchSuggestions };
}
async function h_settings_set(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const patch = { ...params };
  if (patch.copilotModelId !== undefined) {
    if (
      ctx.client.external ||
      ctx.client.codeMode ||
      !ctx.client.nativeTurnContext ||
      Object.keys(patch).length !== 1
    )
      throw new AuxError("permission_denied", "Choose Copilot models in the original Aux Settings window.");
    await s.settings.selectCopilotModel(patch.copilotModelId, ctx.client.nativeTurnContext);
    s.events.emit(EventTypes.SettingsChanged, { settings: s.settings.all() });
    return { ok: true };
  }

  if ((ctx.client.external || ctx.client.codeMode) && "downloadNaming" in patch)
    throw new AuxError("permission_denied", "Download naming must be changed in Aux Settings.");
  if (
    (ctx.client.external || ctx.client.codeMode) &&
    ["agentMode", "agentPolicies", "agentPolicyRevision", "fileAccessMode", "fileAccessRevision", "nightShift"].some((key) => key in patch)
  )
    throw new AuxError("permission_denied", "Agent permissions must be changed in Aux Settings.");
  let searchEngine: string | undefined;
  let searchSuggestions: boolean | undefined;
  if (
    s.featureHost === "chromium-fork" &&
    (patch.searchEngine !== undefined || patch.searchSuggestions !== undefined)
  ) {
    if (Object.keys(patch).length !== 1)
      throw new AuxError("invalid_params", "Save Profile search preferences separately from other settings.");
    if (patch.searchEngine !== undefined) {
      if (!s.native?.searchEngineSet)
        throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
      await s.native.searchEngineSet(patch.searchEngine);
      searchEngine = await s.native.searchEngineGet?.();
      if (!searchEngine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
      delete patch.searchEngine;
    } else if (patch.searchSuggestions !== undefined) {
      if (!s.native?.searchSuggestionsSet)
        throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
      await s.native.searchSuggestionsSet(patch.searchSuggestions);
      searchSuggestions = await s.native.searchSuggestionsGet?.();
      if (searchSuggestions === undefined)
        throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
      delete patch.searchSuggestions;
    }
  }
  const r = Object.keys(patch).length
    ? await (patch.agentMode !== undefined || patch.agentPolicies !== undefined || patch.fileAccessMode !== undefined ? withRunDispatchMutation : withRunAuthorityMutation)(s.repo, () => s.settings.set(patch as never))
    : { ok: true as const };
  // worker limits apply live — no restart needed
  s.runs.refreshPool();
  s.events.emit(EventTypes.SettingsChanged, {
    settings: {
      ...s.settings.all(),
      ...(searchEngine ? { searchEngine } : {}),
      ...(searchSuggestions !== undefined ? { searchSuggestions } : {}),
    },
  });
  return r;
}

function cloudSettings(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext || !ctx.s.native)
    throw new AuxError(
      "permission_denied",
      "Cloud accounts must be configured in the original Aux Settings window.",
    );
  return cloudSettingsFor(ctx.s.repo, ctx.s.native);
}
async function h_settings_cloud_status(ctx: MethodCtx): Promise<unknown> {
  const service = cloudSettings(ctx);
  return service.readStatus(ctx.client.nativeTurnContext!);
}
async function h_settings_cloud_configure(ctx: MethodCtx): Promise<unknown> {
  return cloudSettings(ctx).configure(
    MethodSchemas["settings.cloud.configure"].parse(ctx.params),
    ctx.client.nativeTurnContext!,
  );
}
async function h_settings_cloud_clear(ctx: MethodCtx): Promise<unknown> {
  return cloudSettings(ctx).clear(
    MethodSchemas["settings.cloud.clear"].parse(ctx.params).expectedRevision,
    ctx.client.nativeTurnContext!,
  );
}

export const settingsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "settings.get": h_settings_get,
  "settings.set": h_settings_set,
  "settings.cloud.status": h_settings_cloud_status,
  "settings.cloud.configure": h_settings_cloud_configure,
  "settings.cloud.clear": h_settings_cloud_clear,
  "usage.report": h_usage_report,
};

async function h_usage_report(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external)
    throw new AuxError("permission_denied", "Usage details are available in Aux Settings.");
  return usageReport(ctx.s.repo.db, MethodSchemas["usage.report"].parse(ctx.params), Date.now(), ctx.s.repo);
}
