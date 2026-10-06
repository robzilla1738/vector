import { pageDerivativeCache } from "../../services/ai-result-cache.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AgentImageTools } from "../../agent/image-tools.js";
import { AgentWebTools, permittedWebUrl } from "../../agent/web-tools.js";
import {
  AuxError,
  OriginRuleSchema,
  InlineAssistApplyParamsSchema,
  InlineAssistTextSchema,
} from "@aux/contracts";
import { SpendLedger } from "../../store/spend-ledger.js";
import { authorizeProgram } from "../../agent/permissions.js";
import { proposeTabTidy } from "../../agent/tidy.js";
import { suggestTabName } from "../../agent/tab-name.js";
import { evaluateOriginPolicy } from "../../safety/origin-policy.js";

async function h_agent_tabs_list(ctx: MethodCtx): Promise<unknown> {
  if (!ctx.externalRunId)
    throw new AuxError("permission_denied", "A live authorized agent turn is required.");
  const run = ctx.s.repo.getRun(ctx.externalRunId);
  if (run?.config?.mentions?.length) return ctx.s.turnMentions.list(ctx.externalRunId, ctx.s.pages.list());
  if (!ctx.scope) throw new AuxError("permission_denied", "A current task scope is required.");
  const allowed = ctx.scopedPageIds(ctx.scope, ctx.client.connectionId);
  return ctx.s.pages
    .list()
    .filter((page) => allowed.has(page.pageId))
    .map(({ pageId, title, url }) => ({ pageId, title, url }));
}
async function h_agent_js_run(ctx: MethodCtx): Promise<unknown> {
  const { client, codeMode, params } = ctx;
  return codeMode.run(params, client);
}
async function h_agent_js_reset(ctx: MethodCtx): Promise<unknown> {
  const { client, codeMode, params } = ctx;
  return codeMode.reset(client, params.sessionId);
}
async function h_agent_tidy_propose(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Tab Tidy suggestions must be requested in Aux.");
  const model = s.settings.model();
  if (!model) throw new AuxError("backend_unavailable", "Connect a model in Settings before using AI Tidy.");
  const proposal = await proposeTabTidy(params, s.pages.list(), model, s.settings.agentRoute("fast"), pageDerivativeCache(s, params.pageIds));
  s.events.emit("agent.tidy.proposed", {
    tabCount: proposal.pages.length,
    groupCount: proposal.groups.length,
    modelId: proposal.modelId,
  });
  return proposal;
}
async function h_agent_tabName_suggest(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Tab names must be requested in Aux.");
  const model = s.settings.model();
  if (!model)
    throw new AuxError("backend_unavailable", "Connect a model in Settings before suggesting a tab name.");
  const suggestion = await suggestTabName(
    params,
    s.pages.list().find((page) => page.pageId === params.pageId),
    model,
    s.settings.agentRoute("fast"),
    pageDerivativeCache(s, [params.pageId]),
  );
  s.events.emit("agent.tabName.suggested", { pageId: suggestion.pageId, modelId: suggestion.modelId });
  return suggestion;
}
function inlineAssistGuard(ctx: MethodCtx) {
  const revision = ctx.s.settings.selectionCapture().revision;
  const verify = (url?: string, effect: "read" | "egress" | "write" = "read") => {
    const current = ctx.s.settings.selectionCapture();
    if (!current.inlineAssist)
      throw new AuxError("permission_denied", "Inline assist is off in Selection & Capture settings.");
    if (current.revision !== revision)
      throw new AuxError("conflict", "Selection & Capture changed. Select the field and start again.");
    if (url) {
      const policy = evaluateOriginPolicy({
        url,
        effect,
        action: `inline_assist_${effect}`,
        managed: OriginRuleSchema.array().parse(ctx.s.repo.getSetting("managedOriginPolicies") ?? []),
        user: ctx.s.settings.originPolicies(),
        audit: (decision) => ctx.safetyAudit.record({ ...decision }),
      });
      if (policy.access !== "allow" || ctx.s.settings.safetyCeiling(effect) === "never")
        throw new AuxError(
          "permission_denied",
          policy.access === "ask"
            ? "This site requires an approval that Inline assist cannot request yet."
            : "This site’s policy does not allow this Inline assist action.",
        );
    }
  };
  verify();
  return verify;
}

async function h_agent_inlineAssist_capture(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
  return s.pages.captureInlineAssist(params, inlineAssistGuard(ctx));
}
async function h_agent_inlineAssist_draft(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
  const verifyEnabled = inlineAssistGuard(ctx);
  const model = s.settings.model();
  if (!model)
    throw new AuxError("backend_unavailable", "Connect a model in Settings before drafting field text.");
  return s.pages.draftInlineAssist(params, model, s.settings.agentRoute("fast"), verifyEnabled);
}
async function h_agent_inlineAssist_apply(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
  const verifyEnabled = inlineAssistGuard(ctx);
  const request = InlineAssistApplyParamsSchema.parse(params);
  if (!request.proposalRunId) return s.pages.applyInlineAssist(request, undefined, verifyEnabled);
  const verifyProposal = () => {
    const run = s.runs.coordinator.get(request.proposalRunId!);
    const proposal = InlineAssistTextSchema.safeParse(run.result?.textProposal);
    if (
      run.status !== "completed" ||
      run.config?.implementation !== "agent-loop" ||
      !proposal.success ||
      proposal.data !== request.replacement
    )
      throw new AuxError(
        "conflict",
        "The text proposal changed. Review the completed run before inserting it.",
      );
  };
  verifyProposal();
  return s.pages.applyInlineAssist(request, verifyProposal, verifyEnabled);
}
async function h_agent_inlineAssist_cancel(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
  return s.pages.cancelInlineAssist(params);
}
async function h_agent_web_fetch(ctx: MethodCtx): Promise<unknown> {
  const { client, decideEgress, method, params, s, tasks } = ctx;
  let threadId: string | undefined;
  if (params.taskId) threadId = tasks.details(params.taskId).task.conversationId ?? `task:${params.taskId}`;
  // Every hop — the entry URL and each redirect — passes decide() and
  // the egress grants before a cookieless request leaves the runtime.
  const web = new AgentWebTools(async (url) => {
    await decideEgress({
      url,
      action: method,
      taskId: params.taskId,
      connectionId: client.connectionId,
      threadId,
      runId: ctx.externalRunId,
    });
    return authorizeProgram([{ id: "web-egress", op: "navigate", url: url.href }], s.settings.effectGrants())
      .ok;
  });
  if (method === "agent.web.fetch") return web.fetch(params.url);
  const engine =
    s.featureHost === "chromium-fork" ? await s.native?.searchEngineGet?.() : s.settings.searchEngine();
  if (!engine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
  return web.search(params.query, engine);
}
async function h_agent_images_generate(ctx: MethodCtx): Promise<unknown> {
  const { client, decideEgress, params, s } = ctx;
  const configuredImage = () => {
    if (Object.values(s.settings.budgetLimits()).some((limit) => limit !== undefined))
      throw new AuxError(
        "permission_denied",
        "Image generation is unavailable while a run, day or routine spend cap is set because image spend is not yet included in those caps.",
      );
    const model = s.settings.imageModel();
    if (!model)
      throw new AuxError(
        "permission_denied",
        "Choose an image-generation model in Settings before generating an image.",
      );
    return model;
  };
  const imageModel = configuredImage();
  await decideEgress({
    url: new URL("https://ai-gateway.vercel.sh"),
    action: "agent.images.generate",
    taskId: params.taskId,
    connectionId: client.connectionId,
    runId: ctx.externalRunId,
  });
  const permitted = authorizeProgram(
    [{ id: "image-egress", op: "navigate", url: "https://ai-gateway.vercel.sh" }],
    s.settings.effectGrants(),
  );
  if (!permitted.ok)
    throw new AuxError("permission_denied", "AI Gateway egress is not granted for image generation.");
  if (configuredImage() !== imageModel)
    throw new AuxError("conflict", "The image model changed during approval. Review the request again.");
  const key = s.settings.gatewayKey();
  if (!key)
    throw new AuxError("backend_unavailable", "Connect AI Gateway in Settings before generating an image.");
  const ledger = new SpendLedger();
  try {
    return await AgentImageTools.withGateway(key, s.artifacts, ledger, imageModel).generate(
      params.prompt,
      params.taskId,
    );
  } finally {
    ledger.close();
  }
}
async function h_agent_turn_open(ctx: MethodCtx): Promise<unknown> {
  const { client, decideEgress, params, s, tasks, turnTabs } = ctx;
  const task = tasks.get(params.taskId);
  if (task.revision !== params.expectedRevision)
    throw new AuxError("conflict", "Task revision changed; refresh it before opening a turn tab.");
  const url = permittedWebUrl(params.url);
  await decideEgress({
    url,
    action: "agent.turn.open",
    taskId: params.taskId,
    connectionId: client.connectionId,
    threadId: task.conversationId ?? `task:${params.taskId}`,
    runId: ctx.externalRunId,
  });
  if (!authorizeProgram([{ id: "turn-egress", op: "navigate", url: url.href }], s.settings.effectGrants()).ok)
    throw new AuxError("permission_denied", `Web egress is not granted for ${url.origin}.`);
  let release: (() => void) | undefined;
  let revoke: (() => void) | undefined;
  try {
    if (ctx.externalRunId && !s.turnMentions.has(ctx.externalRunId))
      await s.turnMentions.begin(ctx.externalRunId, [], [], {
        workspaceId: task.workspaceId,
        taskId: task.taskId,
        taskRevision: task.revision,
      });
    const opened = await turnTabs.open({
      connectionId: client.connectionId ?? (client.external ? "owner" : "internal"),
      taskId: params.taskId,
      turnId: params.turnId,
      url: url.href,
      skipIfActive: params.skipIfActive,
      agentScope: ctx.externalRunId ? await s.runs.agentPageScope?.(ctx.externalRunId) : undefined,
      ...(ctx.externalRunId
        ? {
            beforeNavigate: async (page: import("@aux/contracts").PageTarget) => {
              release = s.runs.pageOwnership.tryAcquire({
                pageId: page.pageId,
                actor: "external",
                runId: ctx.externalRunId,
                taskId: params.taskId,
                connectionId: client.connectionId,
              });
              if (client.connectionId) s.externalSessions?.notePage(client.connectionId, page.pageId);
              revoke = await s.runs.acquireBrowserEgress?.(ctx.externalRunId!, page.pageId, url.href);
            },
          }
        : {}),
    });
    if (ctx.externalRunId) s.turnMentions.created(ctx.externalRunId, opened.pageId);
    return opened;
  } finally {
    revoke?.();
    release?.();
  }
}
async function h_agent_turn_end(ctx: MethodCtx): Promise<unknown> {
  const { client, params, turnTabs, s } = ctx;
  if (ctx.externalRunId) s.turnMentions.end(ctx.externalRunId);
  return turnTabs.end(
    client.connectionId ?? (client.external ? "owner" : "internal"),
    params.taskId,
    params.turnId,
  );
}
async function h_agent_turn_clipboard_write(ctx: MethodCtx): Promise<unknown> {
  const { client, params, turnTabs } = ctx;
  return turnTabs.writeClipboard(
    client.connectionId ?? (client.external ? "owner" : "internal"),
    params.taskId,
    params.turnId,
    params.text,
  );
}
async function h_agent_turn_clipboard_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, turnTabs } = ctx;
  return {
    text: turnTabs.readClipboard(
      client.connectionId ?? (client.external ? "owner" : "internal"),
      params.taskId,
      params.turnId,
    ),
  };
}
async function h_agent_turn_clipboard_paste(ctx: MethodCtx): Promise<unknown> {
  const { client, invoke, params, turnTabs } = ctx;
  const text = turnTabs.readClipboard(
    client.connectionId ?? (client.external ? "owner" : "internal"),
    params.taskId,
    params.turnId,
  );
  return invoke(
    "pages.execute",
    {
      taskId: params.taskId,
      expectedRevision: params.expectedRevision,
      program: {
        pageId: params.pageId,
        ...(params.documentEpoch === undefined ? {} : { documentEpoch: params.documentEpoch }),
        steps: [{ id: "turn-clipboard-paste", op: "type", target: params.target, value: text }],
      },
    },
    client,
  );
}

export const agentMethods: Partial<Record<MethodName, MethodHandler>> = {
  "agent.tabs.list": h_agent_tabs_list,
  "agent.js.run": h_agent_js_run,
  "agent.js.reset": h_agent_js_reset,
  "agent.tidy.propose": h_agent_tidy_propose,
  "agent.tabName.suggest": h_agent_tabName_suggest,
  "agent.inlineAssist.capture": h_agent_inlineAssist_capture,
  "agent.inlineAssist.draft": h_agent_inlineAssist_draft,
  "agent.inlineAssist.apply": h_agent_inlineAssist_apply,
  "agent.inlineAssist.cancel": h_agent_inlineAssist_cancel,
  "agent.web.fetch": h_agent_web_fetch,
  "agent.web.search": h_agent_web_fetch,
  "agent.images.generate": h_agent_images_generate,
  "agent.turn.open": h_agent_turn_open,
  "agent.turn.end": h_agent_turn_end,
  "agent.turn.clipboard.write": h_agent_turn_clipboard_write,
  "agent.turn.clipboard.read": h_agent_turn_clipboard_read,
  "agent.turn.clipboard.paste": h_agent_turn_clipboard_paste,
};
