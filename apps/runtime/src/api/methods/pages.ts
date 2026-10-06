import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, OriginRuleSchema } from "@aux/contracts";
import type { Condition } from "@aux/contracts";
import { DurableWriteLedger } from "../../agent/durable.js";
import type { PageService } from "../../services/pages.js";
import { accessibilityHtml } from "../../services/observation-render.js";
import {
  programContainsOperationCalls,
  programHasConsequentialSteps,
} from "../../services/pages/executor.js";
import { wireObservation } from "../../services/observation-wire.js";
import { runWebmcp, webmcpTurn } from "../../agent/webmcp.js";

async function h_pages_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope, scopedPageIds } = ctx;
  if (ctx.externalRunId && s.repo.getRun(ctx.externalRunId)?.config?.mentions?.length)
    throw new AuxError("permission_denied", "Use agent.tabs.list for this turn's title and URL catalog.");
  return scope
    ? s.pages
        .list(params as never)
        .filter((page) => scopedPageIds(scope, client.connectionId).has(page.pageId))
    : s.pages.list(params as never);
}
async function h_pages_open(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.pages.open(params as never);
}
async function h_pages_close(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.close(params.pageId));
}
async function h_pages_moveToWindow(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, spaces } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Move tabs through the Aux browser interface.");
  const space = spaces.list().find((space) => space.id === params.spaceId && !space.archived);
  if (!space) throw new AuxError("conflict", "Restore the tab’s space before moving it.");
  if (params.folder && params.folder.spaceId !== params.spaceId)
    throw new AuxError("invalid_params", "The tab folder belongs to another space.");
  return s.pages.moveToWindow(params, space);
}
async function h_pages_reconcileWrite(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope } = ctx;
  if (scope) throw new AuxError("permission_denied", "Only the Aux owner can reconcile an uncertain action");
  const ledger = new DurableWriteLedger(s.repo.db);
  const pending = ledger
    .unresolved(`direct:${params.pageId}`)
    .filter((intent) => !intent.taskId && (!params.intentId || intent.id === params.intentId));
  if (!pending.length) throw new AuxError("conflict", "No unresolved direct action on this page");
  const note = JSON.stringify({
    actor: client.external ? "owner_token" : "desktop_user",
    evidence: params.evidence,
    recordedAt: Date.now(),
  });
  for (const intent of pending) ledger.reconcile(intent.id, params.outcome, note);
  return { reconciled: pending.map((intent) => intent.id) };
}
async function h_pages_activate(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.activate(params.pageId));
}
async function h_pages_navigate(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.navigate(params.pageId, params["url" as never]));
}
async function h_pages_back(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.back(params.pageId));
}
async function h_pages_forward(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.forward(params.pageId));
}
async function h_pages_reload(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.reload(params.pageId));
}
async function h_pages_stop(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, () => s.pages.stop(params.pageId));
}
async function h_pages_observe(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const { format, ...req } = params as { format?: "full" | "compact" } & Record<string, unknown>;
  return withExternalPage(params.pageId, async () =>
    wireObservation(await s.pages.observe(params.pageId, req as never), format),
  );
}
async function h_pages_cuaExecute(ctx: MethodCtx): Promise<unknown> {
  const { client, invoke, params, s } = ctx;
  const current = await s.pages.viewport(params.program.pageId);
  const expected = params.expectedViewport;
  if (
    current.documentEpoch !== params.program.documentEpoch ||
    current.width !== expected.width ||
    current.height !== expected.height ||
    current.scale !== expected.scale
  )
    throw new AuxError(
      "conflict",
      "The viewport changed since capture. Capture the page again before pixel actions.",
    );
  const { expectedViewport: _expectedViewport, ...request } = params;
  return invoke("pages.execute", request, client);
}
async function h_pages_execute(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope, tasks, turnTabs, withExternalPage } = ctx;
  // `call` nodes dispatch through PageService's operation-registry
  // hook ("host/name" explicitly, or bare name → page's host).
  // The owner bearer token (CLI, desktop) authors programs directly and may
  // run page script. A scoped agent connection is limited to its task and
  // never gets evaluate/eval: page access is not code-execution authority.
  const p = params as {
    program: Parameters<PageService["execute"]>[0];
    taskId?: string;
    expectedRevision?: number;
    returnObservation?: { format?: "full" | "compact" } & Record<string, unknown>;
    safety?: import("../../execution/executor.js").ExecContext["safety"];
  };
  if (client.external && p.safety)
    throw new AuxError("permission_denied", "Final approval metadata comes from the Aux interface.");
  if ((scope || client.codeMode) && programContainsOperationCalls(p.program))
    throw new AuxError(
      "permission_denied",
      "Code mode and scoped connections use typed page steps, not operation calls",
    );
  const consequential = programHasConsequentialSteps(p.program);
  const previewGranted =
    !!client.connectionId && !!p.taskId && turnTabs.owns(client.connectionId, p.taskId, p.program.pageId);
  let validateBeforeJournal: (() => void) | undefined;
  let validateDuringExecution: (() => void) | undefined;
  if (p.taskId) {
    if (p.expectedRevision === undefined)
      throw new AuxError("invalid_params", "Task-bound page programs require expectedRevision");
    tasks.preparePageAccess(p.taskId, p.expectedRevision, p.program.pageId, consequential, previewGranted);
    const taskId = p.taskId,
      revision = p.expectedRevision;
    validateBeforeJournal = () => {
      tasks.preparePageAccess(taskId, revision, p.program.pageId, consequential, previewGranted);
    };
    validateDuringExecution = () => {
      tasks.confirmPageExecution(taskId, revision);
    };
  } else if (p.expectedRevision !== undefined)
    throw new AuxError("invalid_params", "expectedRevision requires taskId");
  // act-and-observe (speed P0-2): the caller sees the resulting state in
  // the same round trip via a same-lane follow-up observe
  // (PageService.execute).
  const { format, ...req } = p.returnObservation ?? {};
  const { observation, ...result } = await withExternalPage(
    p.program.pageId,
    () =>
      s.pages.execute(
        p.program,
        {
          allowEval: !scope && !client.codeMode,
          taskId: p.taskId,
          taskRevision: p.expectedRevision,
          taskRead: ctx.taskRead,
          sourcePageCheck: validateDuringExecution,
          ...(ctx.externalRunId ? { runId: ctx.externalRunId } : {}),
          safety: p.safety,
          beforeJournal: validateBeforeJournal,
          checkValid: validateDuringExecution,
        },
        { returnObservation: p.returnObservation ? (req as never) : undefined },
      ),
    p.taskId,
    false,
    consequential ? "required" : "none",
  );
  if (!p.returnObservation) return result;
  const wire = observation
    ? wireObservation(observation, format as "full" | "compact" | undefined)
    : undefined;
  return { ...result, observation: wire && "observation" in wire ? wire.observation : wire };
}
async function h_pages_webmcp(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s, scope, approvals, decisions, safetyAudit, withExternalPage } = ctx;
  if (scope) throw new AuxError("permission_denied", "Scoped connections cannot call site tools.");
  const request = params as { pageId: string; op: "tools" | "call"; name?: string; input?: string };
  const toolName = request.name ?? "";
  if (request.op === "call" && !toolName) {
    throw new AuxError("invalid_params", "WebMCP call requires a tool name.");
  }
  if (request.input !== undefined) {
    try {
      JSON.parse(request.input);
    } catch {
      throw new AuxError("invalid_params", "WebMCP input must be JSON.");
    }
  }
  const page = s.pages.get(request.pageId);
  const snapshot = { sessionId: page.sessionId, documentEpoch: page.documentEpoch, url: page.url };
  const current = () => {
    const live = s.pages.get(request.pageId);
    if (live.sessionId !== snapshot.sessionId || live.documentEpoch !== snapshot.documentEpoch || live.url !== snapshot.url || ["detached", "crashed"].includes(live.viewStatus))
      throw new AuxError("ref_stale", "This page changed while authorizing its site tool. Observe it again.");
  };
  let origin = "";
  try {
    origin = new URL(page.url).origin;
  } catch {
    origin = "";
  }
  return withExternalPage(request.pageId, async () => {
    const outcome = await runWebmcp(
      s.native,
      request.op === "call"
        ? { pageId: request.pageId, op: "call", name: toolName, input: request.input ?? "{}" }
        : { pageId: request.pageId, op: "tools" },
      {
        profileId: s.featureProfileId ?? "default",
        scope: { kind: "workspace", id: "default" },
        actor: client.external ? "external_token" : "user",
        ...webmcpTurn(request.pageId, toolName || "list"),
        ...(ctx.externalRunId ? { runId: ctx.externalRunId } : {}),
      },
      {
        approvals,
        journal: decisions,
        managedRules: () => OriginRuleSchema.array().parse(s.repo.getSetting("managedOriginPolicies") ?? []),
        agentPolicy: () => s.settings.agentPolicy(),
        audit: (event) => safetyAudit.record({ ...event }),
      },
      origin,
      current,
    );
    if (outcome.status === "ask") {
      ctx.safetyGate.park(outcome.request, {
        turnId: outcome.request.turnId, threadId: outcome.request.threadId,
        ...(outcome.request.runId ? { runId: outcome.request.runId } : {}), pageId: request.pageId,
      }, outcome.suspension, origin);
      throw new AuxError("needs_input", outcome.instruction, { suspensionKind: outcome.suspension.kind, requestId: outcome.approvalId });
    }
    if (outcome.status === "tools") return { op: "tools", tools: outcome.tools };
    return { op: "call", result: outcome.result, success: outcome.success };
  });
}
async function h_pages_extract(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const p = params as {
    pageId: string;
    fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>;
  };
  return withExternalPage(p.pageId, () => s.pages.extract(p.pageId, p.fields));
}
async function h_pages_elementInfo(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const obs = await s.pages.observe(params.pageId, {});
  if (params.expectedDocumentEpoch !== undefined && obs.documentEpoch !== params.expectedDocumentEpoch)
    throw new AuxError("conflict", "The page changed since capture. Observe it again.");
  const candidates = obs.content.elements
    .filter((element) => {
      const rect = element.rect;
      return (
        rect &&
        params.x >= rect.x &&
        params.x <= rect.x + rect.w &&
        params.y >= rect.y &&
        params.y <= rect.y + rect.h
      );
    })
    .sort((a, b) => a.rect!.w * a.rect!.h - b.rect!.w * b.rect!.h);
  const element = candidates[0];
  return {
    pageId: params.pageId,
    documentEpoch: obs.documentEpoch,
    revision: obs.revision,
    element: element ? { ...element, ...(element.type === "password" ? { value: undefined } : {}) } : null,
  };
}
async function h_pages_accessibilityHtml(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const { pageId, ...options } = params;
  const obs = await s.pages.observe(pageId, options);
  return {
    pageId,
    documentEpoch: obs.documentEpoch,
    revision: obs.revision,
    text: accessibilityHtml(obs),
  };
}
async function h_pages_read(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const obs = await s.pages.observe(params.pageId, {});
  const query = params.query;
  let value: unknown;
  if (query.kind === "title") value = obs.content.title;
  else if (query.kind === "url") value = obs.content.url;
  else if (query.kind === "text") value = obs.content.text;
  else {
    const extracted = await s.pages.extract(params.pageId, [
      {
        name: "value",
        selector: query.selector,
        ...(query.kind === "attribute" ? { attribute: query.name } : { all: true }),
      },
    ]);
    if (extracted.documentEpoch !== obs.documentEpoch)
      throw new AuxError("conflict", "The page changed while reading it.");
    value =
      query.kind === "count"
        ? Array.isArray(extracted.fields.value)
          ? extracted.fields.value.length
          : 0
        : extracted.fields.value;
  }
  return { pageId: params.pageId, documentEpoch: obs.documentEpoch, revision: obs.revision, value };
}
async function h_pages_waitFor(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as { pageId: string; condition: Condition };
  return s.pages.waitFor(p.pageId, p.condition);
}
async function h_pages_console(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as { pageId: string; since?: number; limit?: number };
  return s.pages.console(p.pageId, p);
}
async function h_pages_dialog(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const p = params as { pageId: string; action?: "list" | "accept" | "dismiss"; promptText?: string };
  return p.action && p.action !== "list"
    ? withExternalPage(p.pageId, () => s.pages.dialog(p.pageId, p.action!, p.promptText))
    : s.pages.dialog(p.pageId, "list", p.promptText);
}
async function h_pages_network(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const p = params as { pageId: string; since?: number; urlIncludes?: string; limit?: number };
  if (!ctx.externalRunId && s.pages.network) return s.pages.network(p.pageId, p);
  if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
  await s.responses.flush();
  if (!ctx.externalRunId) return s.responses.list(p.pageId, p);
  const records = s.responses.listForDocument(s.pages.get(p.pageId), p);
  const checks: Array<() => void> = [];
  for (const record of records)
    checks.push(await s.pages.authorizeAgentResponseRead(ctx.externalRunId, record.requestId, ctx.taskRead));
  checks.forEach((check) => check());
  return records;
}
async function h_pages_capture(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.pages.capture(params.pageId, params as never);
}
async function h_pages_find(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const p = params as { pageId: string; text: string; forward: boolean; findNext: boolean };
  return withExternalPage(p.pageId, () => s.pages.find(p.pageId, p.text, p.forward, p.findNext));
}
async function h_pages_stopFind(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const p = params as { pageId: string; action: "clear" | "keep" };
  return withExternalPage(p.pageId, () => s.pages.stopFind(p.pageId, p.action));
}
async function h_pages_zoom(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  const p = params as {
    pageId: string;
    level?: number;
    delta?: number;
    reset?: boolean;
    direction?: "in" | "out";
  };
  return withExternalPage(p.pageId, () => s.pages.zoom(p.pageId, p.level, p.delta, p.reset, p.direction));
}
async function h_pages_takeover(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.pages.takeover(params.pageId);
}
async function h_pages_pickElement(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Element picks are interactive and run in Aux.");
  return s.pages.pickElement(params.pageId, { timeoutMs: params.timeoutMs });
}
async function h_pages_resume(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Return control through the Aux browser interface.");
  return s.pages.resume(params.pageId, client.nativePersonResume);
}
async function h_pages_openLive(ctx: MethodCtx): Promise<unknown> {
  const { params, s, withExternalPage } = ctx;
  return withExternalPage(params.pageId, async () => {
    const page = s.pages.get(params.pageId);
    const chrome = s.drivers().chrome;
    if (page.backend === "chrome" && chrome?.activateTarget) {
      await chrome.activateTarget(page.targetId);
      return { ok: true };
    }
    if (page.backend === "aux") {
      await s.pages.activate(page.pageId);
      return { ok: true };
    }
    throw new AuxError("capability_unsupported", `cannot focus a ${page.backend} page's native surface`);
  });

  // sets
}

export const pagesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "pages.list": h_pages_list,
  "pages.open": h_pages_open,
  "pages.close": h_pages_close,
  "pages.moveToWindow": h_pages_moveToWindow,
  "pages.reconcileWrite": h_pages_reconcileWrite,
  "pages.activate": h_pages_activate,
  "pages.navigate": h_pages_navigate,
  "pages.back": h_pages_back,
  "pages.forward": h_pages_forward,
  "pages.reload": h_pages_reload,
  "pages.stop": h_pages_stop,
  "pages.observe": h_pages_observe,
  "pages.cuaExecute": h_pages_cuaExecute,
  "pages.execute": h_pages_execute,
  "pages.webmcp": h_pages_webmcp,
  "pages.extract": h_pages_extract,
  "pages.elementInfo": h_pages_elementInfo,
  "pages.accessibilityHtml": h_pages_accessibilityHtml,
  "pages.read": h_pages_read,
  "pages.waitFor": h_pages_waitFor,
  "pages.console": h_pages_console,
  "pages.dialog": h_pages_dialog,
  "pages.network": h_pages_network,
  "pages.capture": h_pages_capture,
  "pages.find": h_pages_find,
  "pages.stopFind": h_pages_stopFind,
  "pages.zoom": h_pages_zoom,
  "pages.takeover": h_pages_takeover,
  "pages.pickElement": h_pages_pickElement,
  "pages.resume": h_pages_resume,
  "pages.openLive": h_pages_openLive,
};
