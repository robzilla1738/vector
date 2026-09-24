import { createHash, randomUUID } from "node:crypto";
import { AuxError, type CalendarTaskEventsQuery, type Observation, type Predicate, type Program, type ProgramResult, type Step } from "@aux/contracts";
import { compileAndAuthorize } from "../agent/action-compiler.js";
import { beginConsequentialWrite, settleWrite, type DurableWriteLedger } from "../agent/durable.js";
import { DEFAULT_GRANTS, grantAllows, parseGrant, resolveGrants, type GrantSource } from "../agent/permissions.js";
import { agentMayEgress } from "../agent/policy.js";
import { evalPredicate } from "../execution/interpreter.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { PageService } from "./pages.js";
import type { CalendarConnectionService } from "./calendar-connections.js";
import { TaskService } from "./tasks.js";

export interface OperationRow {
  operationId: string;
  siteKey: string;
  name: string;
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
  effectClass: string;
  guards: Record<string, unknown>;
}

export interface ImplRow {
  implId: string;
  operationId: string;
  kind: string;
  executable: string;
  state: string;
  evidence: unknown[];
  stats: Record<string, unknown>;
}

export interface RouteDecision {
  implId?: string;
  kind?: string;
  reason: string;
  candidates: { implId: string; kind: string; state: string; eligible: boolean; why: string }[];
  /** eligible impls in preference order — the fallback ladder (§11.5) */
  ranked?: { implId: string; kind: string; state: string }[];
}

const newId = (p: string) => `${p}_${randomUUID().slice(0, 12)}`;

/** Rough relative cost — cheaper routes win when both are eligible. */
const KIND_COST: Record<string, number> = {
  "session-request": 1,
  "browser-program": 5,
};

const STATE_RANK: Record<string, number> = { validated: 0, candidate: 1, shadow: 2, quarantined: 9 };
const MAX_REQUEST_RESPONSE_BYTES=1024*1024;
const SECRET_HEADER=/^(authorization|proxy-authorization|cookie|set-cookie)$/i;
const CONNECTOR_SITE = "aux.connector.google-calendar";
const CONNECTOR_NAME = "events.list";
const CONNECTOR_OPERATION_ID = "aux-connector-google-calendar-events-list";
const CONNECTOR_IMPL_ID = "aux-connector-google-calendar-readonly";
const PROJECT_SITE = "aux.project";
type ProjectMutation = "file.write" | "file.create" | "file.rename" | "file.delete" | "command.start" | "commit.create";
const PROJECT_EFFECT: Record<ProjectMutation, "write" | "destructive"> = {
  "file.write": "write", "file.create": "write", "file.rename": "write", "file.delete": "destructive",
  "command.start": "destructive", "commit.create": "write",
};
const PROJECT_AUDIT_FIELDS: Record<ProjectMutation, readonly string[]> = {
  "file.write": ["name", "expectedHash", "contentSha256", "contentBytes"],
  "file.create": ["name", "contentSha256", "contentBytes"],
  "file.rename": ["name", "nextName", "expectedHash"],
  "file.delete": ["name", "expectedHash"],
  "command.start": ["mode", "commandSha256", "commandBytes"],
  "commit.create": ["expectedPatchHash", "expectedTree", "messageSha256"],
};

/**
 * Error codes that mean the impl never got to act — nothing was dispatched,
 * so falling back to another route cannot double-apply a mutation (§11.5).
 * Anything else (step_failed mid-program, network error after send, timeout)
 * leaves effect outcome unknown and must stop the ladder for writes.
 */
const PRE_DISPATCH_CODES = new Set([
  "invalid_params",
  "backend_unavailable",
  "not_found",
  "target_detached",
  "ref_stale",
  "unsupported_op",
  "conflict",
  "permission_denied",
]);
function isPreDispatchError(e: unknown): boolean {
  return e instanceof AuxError && PRE_DISPATCH_CODES.has(e.code);
}

/**
 * Operation registry and execution broker. Site routes can be learned from
 * proven programs; sealed connector routes retain their provider authority.
 * Every invocation records the chosen route and its outcome.
 */
export class OperationService {
  constructor(
    private deps: {
      repo: Repo;
      events: EventBus;
      pages: PageService;
      /** converts ephemeral rN refs into stable role/css selectors for replay */
      translateSteps?: (pageId: string, steps: Step[]) => Step[];
      fetchJson?: (url: string, init?: RequestInit) => Promise<unknown>;
      egressAllowlist?: () => string[];
      /** User-started invokes; defaults to USER_RUN_GRANTS like runs.start. */
      grants?: GrantSource;
      durableWrites?: DurableWriteLedger;
      calendar?: CalendarConnectionService;
    },
  ) {}

  private connectorOperation() {
    const existing = this.deps.repo.getOperation(CONNECTOR_SITE, CONNECTOR_NAME);
    if (existing && existing.operationId !== CONNECTOR_OPERATION_ID)
      throw new AuxError("conflict", "The reserved Calendar operation key is already in use.");
    if (!existing) this.deps.repo.saveOperation({ operationId: CONNECTOR_OPERATION_ID, siteKey: CONNECTOR_SITE,
      name: CONNECTOR_NAME, description: "Read events from one task-granted Google Calendar account", effectClass: "read" });
    if (!this.deps.repo.listImplementations(CONNECTOR_OPERATION_ID).some(impl => impl.implId === CONNECTOR_IMPL_ID))
      this.deps.repo.saveImplementation({ implId: CONNECTOR_IMPL_ID, operationId: CONNECTOR_OPERATION_ID,
        kind: "connector-read", executable: JSON.stringify({ provider: "google-calendar", method: "events.list" }), state: "validated" });
  }

  /** A sealed provider route. Task authority is rechecked immediately before and after the network read. */
  async invokeCalendarTaskEvents(input: CalendarTaskEventsQuery, opts: { runId?: string; signal?: AbortSignal } = {}) {
    const calendar = this.deps.calendar;
    if (!calendar) throw new AuxError("backend_unavailable", "Calendar connector is unavailable.");
    const run = opts.runId ? this.deps.repo.getRun(opts.runId) : undefined;
    if (opts.runId && (!run || !["planning", "running"].includes(run.status) || run.config?.taskId !== input.taskId))
      throw new AuxError("permission_denied", "This run cannot read Calendar events for that task.");
    const grant = calendar.taskGrants(input.taskId).find(item => item.grantId === input.grantId &&
      (!run || item.taskRevision === run.config?.taskRevision));
    if (!grant) throw new AuxError("permission_denied", "That Calendar account is not granted to this task revision.");
    if (opts.signal?.aborted) throw new AuxError("cancelled", "Calendar read was cancelled.");
    this.connectorOperation();
    const invocationId = newId("inv"), startedAt = Date.now();
    const record = (status: string, error?: string, effectOutcome = "not-applicable", endedAt?: number) =>
      this.deps.repo.saveInvocation({ invocationId, operationId: CONNECTOR_OPERATION_ID, implId: CONNECTOR_IMPL_ID,
        runId: opts.runId, inputs: input, status, effectOutcome, routeReason: "task-granted Google Calendar read", startedAt, endedAt, error });
    record("running");
    try {
      const result = await calendar.taskEvents(input, opts.signal);
      if (opts.signal?.aborted) throw new AuxError("cancelled", "Calendar read was cancelled.");
      record("completed", undefined, "observed", Date.now());
      this.deps.events.emit("operation.invoked", { invocationId, operation: `${CONNECTOR_SITE}/${CONNECTOR_NAME}`, kind: "connector-read", status: "completed" });
      return { invocationId, result };
    } catch (error) {
      const safe = error instanceof AuxError ? error : new AuxError("backend_unavailable", "Calendar read failed.");
      record(safe.code === "cancelled" ? "interrupted" : "failed", safe.message, "not-applicable", Date.now());
      this.deps.events.emit("operation.invoked", { invocationId, operation: `${CONNECTOR_SITE}/${CONNECTOR_NAME}`, kind: "connector-read", status: "failed", error: safe.message });
      throw safe;
    }
  }

  /** Native project effects have one sealed route and retain the desktop approval boundary. */
  async invokeProjectMutation<T>(input: {
    name: ProjectMutation; taskId: string; taskRevision: number; projectId: string;
    audit: Record<string, string | number | boolean | undefined>; execute: (invocationId: string) => Promise<T | null>;
  }): Promise<T | null> {
    const tasks = new TaskService(this.deps.repo, this.deps.events);
    if (input.name === "command.start") tasks.prepareLocalCommand(input.taskId, input.taskRevision, input.projectId);
    else tasks.prepareProjectAccess(input.taskId, input.taskRevision, input.projectId, true);
    const operationId = `aux-project-${input.name.replace(".", "-")}`;
    const implId = `${operationId}-native`;
    const existing = this.deps.repo.getOperation(PROJECT_SITE, input.name);
    if (existing && (existing.operationId !== operationId || existing.effectClass !== PROJECT_EFFECT[input.name]))
      throw new AuxError("conflict", "A reserved project operation key is in use.");
    if (!existing) this.deps.repo.saveOperation({ operationId, siteKey: PROJECT_SITE, name: input.name,
      description: "Human-approved native project operation", effectClass: PROJECT_EFFECT[input.name] });
    const implementation = this.deps.repo.listImplementations(operationId).find(impl => impl.implId === implId);
    if (implementation && (implementation.kind !== "native-project" || implementation.state !== "validated" || implementation.executable !== "{}"))
      throw new AuxError("conflict", "The reserved native project route changed.");
    if (!implementation)
      this.deps.repo.saveImplementation({ implId, operationId, kind: "native-project", executable: "{}", state: "validated" });
    const invocationId = newId("inv"), startedAt = Date.now();
    const audit = Object.fromEntries(PROJECT_AUDIT_FIELDS[input.name].flatMap(key =>
      input.audit[key] === undefined ? [] : [[key, input.audit[key]]]));
    const inputs = { ...audit, taskId: input.taskId, taskRevision: input.taskRevision, projectId: input.projectId };
    const record = (status: string, effectOutcome: string, error?: string) => this.deps.repo.saveInvocation({
      invocationId, operationId, implId, inputs, status, effectOutcome, routeReason: "task-attached native project operation",
      startedAt, endedAt: status === "running" ? undefined : Date.now(), error,
    });
    record("running", "unknown");
    try {
      const result = await input.execute(invocationId);
      record(result === null ? "denied" : "completed", result === null ? "not-dispatched" : "observed");
      this.deps.events.emit("operation.invoked", { invocationId, operation: `${PROJECT_SITE}/${input.name}`,
        kind: "native-project", status: result === null ? "denied" : "completed" });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 1000) : "Native project operation failed.";
      record("failed", "unknown", message);
      this.deps.events.emit("operation.invoked", { invocationId, operation: `${PROJECT_SITE}/${input.name}`,
        kind: "native-project", status: "failed", error: message });
      throw error;
    }
  }

  // ---------- registry ----------

  /** Register an operation from a proven program (§9.1 saveProgram → operation). */
  saveFromProgram(opts: {
    /** pageId optional — stripped from the executable, bound per-invocation */
    program: Omit<Program, "pageId"> & { pageId?: string };
    siteKey: string;
    name: string;
    description?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    effectClass?: "read" | "write" | "destructive";
    guards?: Record<string, unknown>;
  }) {
    if (opts.siteKey === CONNECTOR_SITE || opts.siteKey === PROJECT_SITE) throw new AuxError("permission_denied", "System operations are managed by Aux.");
    const existing = this.deps.repo.getOperation(opts.siteKey, opts.name);
    const operationId = existing?.operationId ?? newId("op");
    this.deps.repo.saveOperation({
      operationId,
      siteKey: opts.siteKey,
      name: opts.name,
      description: opts.description,
      inputSchema: opts.inputSchema ?? {},
      outputSchema: opts.outputSchema ?? {},
      effectClass: opts.effectClass ?? "read",
      guards: opts.guards ?? {},
    });
    const implId = newId("impl");
    // the executable is the program minus its page binding — pageId is
    // resolved per-invocation against the caller's target. Steps carry
    // ephemeral rN refs from the proving run — translate them into stable
    // role/css selectors or the impl can't replay on a fresh observation.
    const { pageId: _drop, ...executable } = opts.program;
    if (this.deps.translateSteps && opts.program.pageId && executable.steps?.length) {
      executable.steps = this.deps.translateSteps(opts.program.pageId, executable.steps);
    }
    this.deps.repo.saveImplementation({
      implId,
      operationId,
      kind: "browser-program",
      executable: JSON.stringify(executable),
      state: "candidate",
      evidence: [],
    });
    this.deps.events.emit("operation.saved", { operationId, siteKey: opts.siteKey, name: opts.name, implId });
    return { operationId, implId };
  }

  /** Register a session-request impl — direct HTTP against a site's API. */
  saveRequestImpl(opts: {
    siteKey: string;
    name: string;
    description?: string;
    method?: string;
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
    inputSchema?: unknown;
    outputSchema?: unknown;
    effectClass?: "read" | "write" | "destructive";
    guards?: Record<string, unknown>;
    validated?: boolean;
  }) {
    if (opts.siteKey === CONNECTOR_SITE || opts.siteKey === PROJECT_SITE) throw new AuxError("permission_denied", "System operations are managed by Aux.");
    let destination:URL;try{destination=new URL(opts.url);}catch{throw new AuxError('invalid_params','Session request URL must be an absolute HTTP(S) URL.');}
    if(!['http:','https:'].includes(destination.protocol)||destination.username||destination.password)throw new AuxError('permission_denied','Session request URL must be HTTP(S) and cannot contain credentials.');
    if(destination.host!==opts.siteKey)throw new AuxError('permission_denied',`Session request host ${destination.host} does not match operation site ${opts.siteKey}.`);
    for(const [name,value] of Object.entries(opts.headers??{})){
      if(SECRET_HEADER.test(name))throw new AuxError('permission_denied',`Do not save ${name} in an operation. Session credentials stay inside the browser.`);
      if(/[\r\n]/.test(name)||/[\r\n]/.test(value))throw new AuxError('invalid_params','Session request headers cannot contain line breaks.');
    }
    const existing = this.deps.repo.getOperation(opts.siteKey, opts.name);
    const operationId = existing?.operationId ?? newId("op");
    this.deps.repo.saveOperation({
      operationId,
      siteKey: opts.siteKey,
      name: opts.name,
      description: opts.description,
      inputSchema: opts.inputSchema ?? {},
      outputSchema: opts.outputSchema ?? {},
      effectClass: opts.effectClass ?? "read",
      guards: opts.guards ?? {},
    });
    const implId = newId("impl");
    this.deps.repo.saveImplementation({
      implId,
      operationId,
      kind: "session-request",
      executable: JSON.stringify({ method: opts.method ?? "GET", url: opts.url, body: opts.body, headers: opts.headers }),
      state: opts.validated ? "validated" : "candidate",
    });
    this.deps.events.emit("operation.saved", { operationId, siteKey: opts.siteKey, name: opts.name, implId });
    return { operationId, implId };
  }

  /**
   * §10.3 — trace-derived compilation. Rebuild a replayable program from a
   * run's persisted step ledger: ok outcomes in order, refs translated to
   * stable selectors, registered as a candidate impl carrying its evidence.
   * Only single-page runs compile — a candidate is bound to one site.
   */
  compileFromRun(opts: { runId: string; siteKey?: string; name?: string }) {
    const steps = this.deps.repo.listSteps(opts.runId).filter((s) => s.outcome?.status === "ok");
    if (!steps.length) throw new AuxError("not_found", `run ${opts.runId} has no successful steps to compile`);
    const pageIds = [...new Set(steps.map((s) => s.pageId).filter(Boolean))] as string[];
    if (pageIds.length !== 1) {
      throw new AuxError("invalid_params", `run ${opts.runId} touched ${pageIds.length} pages — only single-page runs compile`);
    }
    const pageId = pageIds[0]!;
    const siteKey = opts.siteKey ?? this.siteKeyOf(pageId);
    if (!siteKey) throw new AuxError("invalid_params", "cannot determine siteKey — pass one explicitly");
    const raw: Step[] = steps.map((s, i) => ({ id: `s${i + 1}`, op: s.op, ...s.inputs }) as Step);
    const translated = this.deps.translateSteps ? this.deps.translateSteps(pageId, raw) : raw;
    const name = opts.name ?? `trace:${opts.runId.slice(0, 12)}`;
    const saved = this.saveFromProgram({
      program: { pageId, steps: translated },
      siteKey,
      name,
      description: `compiled from run ${opts.runId} (${translated.length} steps)`,
    });
    // attach provenance evidence — the impl exists because a trace proved it
    const impls = this.deps.repo.listImplementations(saved.operationId) as ImplRow[];
    const impl = impls.find((i) => i.implId === saved.implId);
    if (impl) {
      this.deps.repo.saveImplementation({
        implId: impl.implId, operationId: impl.operationId, kind: impl.kind,
        executable: impl.executable, state: impl.state,
        evidence: [...(impl.evidence ?? []), { kind: "trace", runId: opts.runId, steps: translated.length, compiledAt: Date.now() }],
        stats: impl.stats,
      });
    }
    return { ...saved, siteKey, name, steps: translated.length };
  }

  list(siteKey?: string) {
    return this.deps.repo.listOperations(siteKey).map((o) => ({
      ...o,
      implementations: this.deps.repo.listImplementations(o.operationId),
    }));
  }

  get(siteKey: string, name: string) {
    const op = this.deps.repo.getOperation(siteKey, name);
    if (!op) throw new AuxError("not_found", `no operation ${siteKey}/${name}`);
    return { ...op, implementations: this.deps.repo.listImplementations(op.operationId) };
  }

  forget(siteKey: string, name: string) {
    if (siteKey === CONNECTOR_SITE || siteKey === PROJECT_SITE) throw new AuxError("permission_denied", "System operations are managed by Aux.");
    const op = this.get(siteKey, name);
    this.deps.repo.deleteOperation(op.operationId);
    return { ok: true as const };
  }

  setImplState(implId: string, state: "candidate" | "validated" | "shadow" | "quarantined") {
    if (implId === CONNECTOR_IMPL_ID) throw new AuxError("permission_denied", "Connector implementations are managed by Aux.");
    this.deps.repo.setImplState(implId, state);
    return { ok: true };
  }

  // ---------- route selection ----------

  /**
   * Pick the implementation an invoke would take — cheapest eligible route,
   * validated over candidate. `explain` (§10.4) exposes the same decision.
   * Browser-program impls declaring `guards.controls` are checked against a
   * FRESH observation — a control that disappeared means the page drifted
   * and the impl is not eligible right now.
   */
  async selectRoute(
    op: OperationRow,
    impls: ImplRow[],
    ctx: { pageId?: string; allowPageOpen?: boolean; observed?: { obs?: Observation } },
  ): Promise<RouteDecision> {
    // fetch a fresh observation once, only if a browser-program impl needs it
    const needsObs = op.guards["controls"] != null && impls.some((i) => i.kind === "browser-program" && i.state !== "quarantined");
    let elements: { ref: string; role?: string; name?: string; text?: string }[] | undefined;
    if (needsObs && ctx.pageId) {
      try {
        const obs = await this.deps.pages.observe(ctx.pageId, {});
        if (ctx.observed) ctx.observed.obs = obs;
        elements = obs.content.elements as typeof elements;
      } catch {
        elements = undefined;
      }
    }
    const controlCheck = (matcher: unknown): boolean => {
      if (!elements) return false;
      if (typeof matcher === "string") return elements.some((e) => e.ref === matcher);
      const m = matcher as { ref?: string; role?: string; name?: string; text?: string };
      return elements.some(
        (e) =>
          (m.ref === undefined || e.ref === m.ref) &&
          (m.role === undefined || e.role === m.role) &&
          (m.name === undefined || e.name === m.name || e.text === m.name) &&
          (m.text === undefined || e.text === m.text),
      );
    };
    const requiredControls = Array.isArray(op.guards["controls"]) ? (op.guards["controls"] as unknown[]) : [];

    const candidates = impls.map((impl) => {
      let eligible = true;
      let why = "ok";
      if (impl.state === "quarantined") {
        eligible = false;
        why = "quarantined";
      } else if (impl.kind === "browser-program") {
        const host = this.siteKeyOf(ctx.pageId);
        if (!host) {
          eligible = false;
          why = "no live page for the site";
        } else if (host !== op.siteKey) {
          eligible = false;
          why = `page is on ${host}, not ${op.siteKey}`;
        } else if (requiredControls.length) {
          const missing = requiredControls.filter((c) => !controlCheck(c));
          if (missing.length) {
            eligible = false;
            why = `missing ${missing.length} required control(s) — page drifted`;
          }
        }
      } else if (impl.kind === "session-request") {
        // direct HTTP — eligible whenever the runtime can reach the site;
        // session-bound APIs additionally require guards.session
        if (op.guards["session"] === "required") {
          const host=this.siteKeyOf(ctx.pageId);
          if(!host){eligible=false;why='requires a live signed-in page';}
          else if(host!==op.siteKey){eligible=false;why=`session page is on ${host}, not ${op.siteKey}`;}
          else why='live same-site browser session available';
        }
      } else if (impl.kind === "connector-read") {
        eligible = false;
        why = "task grant required; use the connector read route";
      } else {
        eligible = false;
        why = `unknown impl kind ${impl.kind}`;
      }
      return { implId: impl.implId, kind: impl.kind, state: impl.state, eligible, why };
    });
    const ranked = candidates
      .filter((c) => c.eligible)
      .sort((a, b) => {
        const sa = STATE_RANK[a.state] ?? 5;
        const sb = STATE_RANK[b.state] ?? 5;
        if (sa !== sb) return sa - sb;
        return (KIND_COST[a.kind] ?? 50) - (KIND_COST[b.kind] ?? 50);
      });
    const winner = ranked[0];
    return {
      implId: winner?.implId,
      kind: winner?.kind,
      reason: winner
        ? `${winner.kind} (${winner.state}) — cheapest eligible route`
        : "no eligible implementation",
      candidates,
      ranked: ranked.map((r) => ({ implId: r.implId, kind: r.kind, state: r.state })),
    };
  }

  async explain(siteKey: string, name: string, ctx: { pageId?: string }): Promise<RouteDecision> {
    const op = this.deps.repo.getOperation(siteKey, name);
    if (!op) throw new AuxError("not_found", `no operation ${siteKey}/${name}`);
    const impls = this.deps.repo.listImplementations(op.operationId) as ImplRow[];
    return this.selectRoute(op, impls, ctx);
  }

  private siteKeyOf(pageId?: string): string | undefined {
    if (!pageId) return undefined;
    try {
      const p = this.deps.pages.get(pageId);
      return new URL(p.url).host;
    } catch {
      return undefined;
    }
  }

  // ---------- invocation ----------

  /**
   * Zero-model invoke (§10–§13). Route selection ranks eligible impls;
   * each attempt persists its intent BEFORE dispatch (§13.3) so a crash
   * mid-mutation leaves a `running`/`unknown` row for reconciliation.
   * On failure the next eligible impl is tried ONLY when safe (§11.5):
   * reads always may fall back; writes only on provably pre-dispatch
   * errors — a mutation that may have been dispatched is never blindly
   * re-issued through another route. `requestKey` deduplicates (§16.4).
   */
  async invoke(opts: {
    siteKey: string;
    name: string;
    inputs?: Record<string, unknown>;
    pageId?: string;
    runId?: string;
    implId?: string; // explicit override — bypasses route selection
    requestKey?: string; // §16.4 idempotency key
  }): Promise<{ invocationId: string; status: string; route: RouteDecision; result?: ProgramResult | unknown; error?: string; deduplicated?: boolean }> {
    if (opts.siteKey === CONNECTOR_SITE || opts.siteKey === PROJECT_SITE) throw new AuxError("permission_denied", "Use the task-scoped system route for this operation.");
    const op = this.deps.repo.getOperation(opts.siteKey, opts.name);
    if (!op) throw new AuxError("not_found", `no operation ${opts.siteKey}/${opts.name}`);

    // §16.4 — a repeated requestKey returns the existing invocation, it
    // does NOT create a second dispatch (retries after timeout rely on this)
    if (opts.requestKey) {
      const prior = this.deps.repo.findInvocationByRequest(opts.requestKey, op.operationId);
      if (prior) {
        return {
          invocationId: prior.invocationId,
          status: prior.status,
          route: { implId: prior.implId, reason: `idempotent replay of ${prior.invocationId}`, candidates: [] },
          error: prior.error,
          deduplicated: true,
        };
      }
    }

    const impls = this.deps.repo.listImplementations(op.operationId) as ImplRow[];
    // the route guard's observation is also the first attempt's program base
    const observed: { obs?: Observation } = {};
    let route: RouteDecision;
    if (opts.implId) {
      const impl = impls.find((i) => i.implId === opts.implId);
      if (!impl) throw new AuxError("not_found", `no impl ${opts.implId} on ${opts.name}`);
      route = { implId: impl.implId, kind: impl.kind, reason: "explicit impl override", candidates: [], ranked: [{ implId: impl.implId, kind: impl.kind, state: impl.state }] };
    } else {
      route = await this.selectRoute(op, impls, { pageId: opts.pageId, observed });
    }
    const ladder = route.ranked ?? [];
    if (!ladder.length) {
      const invocationId = newId("inv");
      this.deps.repo.saveInvocation({
        invocationId, operationId: op.operationId, runId: opts.runId, requestKey: opts.requestKey,
        inputs: opts.inputs, status: "failed", effectOutcome: "not-applicable",
        routeReason: route.reason, startedAt: Date.now(), endedAt: Date.now(), error: route.reason,
      });
      return { invocationId, status: "failed", route, error: route.reason };
    }

    // stamp the owning run with the primary route so cards can badge it (§10.4)
    if (opts.runId) {
      const run = this.deps.repo.getRun(opts.runId);
      if (run) {
        run.config = { ...run.config, implementation: route.kind, routeReason: route.reason };
        this.deps.repo.saveRun(run);
      }
    }

    let lastError: string | undefined;
    let lastInvocationId = "";
    let fellBack = false;
    for (let i = 0; i < ladder.length; i++) {
      const entry = ladder[i]!;
      const impl = impls.find((x) => x.implId === entry.implId);
      if (!impl) continue;
      const invocationId = newId("inv");
      lastInvocationId = invocationId;
      const startedAt = Date.now();
      const attemptReason = i === 0 ? route.reason : `fallback #${i} after ${lastError ?? "prior failure"}`;
      // §13.3 — intent persisted BEFORE dispatch; a crash here leaves
      // status 'running' + effect 'unknown' for restart reconciliation
      const record = (status: string, error?: string, effectOutcome = "unknown", endedAt?: number) =>
        this.deps.repo.saveInvocation({
          invocationId, operationId: op.operationId, implId: impl.implId, runId: opts.runId,
          requestKey: opts.requestKey, inputs: opts.inputs, status, effectOutcome,
          routeReason: attemptReason, startedAt, endedAt, error,
        });
      record("running");
      let intentId: string | undefined;
      const journalWrites = op.effectClass !== "read" && !!this.deps.durableWrites;
      if (journalWrites) {
        const inputKey = opts.requestKey ?? createHash("sha256").update(JSON.stringify(opts.inputs ?? {})).digest("hex").slice(0, 24);
        const logicalActionId = i === 0
          ? `operation:${opts.siteKey}/${opts.name}:${inputKey}`
          : `operation:${opts.siteKey}/${opts.name}:${inputKey}:retry:${i}`;
        const journal = beginConsequentialWrite(this.deps.durableWrites, {
          runId: opts.runId ?? `operation:${opts.siteKey}/${opts.name}`,
          pageId: opts.pageId ?? `operation:${opts.siteKey}`,
          documentEpoch: 0,
          steps: [{ op: "fill" }],
          logicalActionId,
        });
        if (journal.skip) {
          record("failed", journal.reason, "not-dispatched", Date.now());
          return { invocationId, status: "failed", route: { ...route, implId: impl.implId, kind: impl.kind }, error: journal.reason };
        }
        intentId = journal.intentId;
      }
      try {
        // a fallback runs after a failed attempt touched the page — it observes afresh
        const result = await this.executeImpl(impl, { ...opts, journaled: journalWrites || undefined, observation: i === 0 ? observed.obs : undefined }, op.guards);
        const failed = result && typeof result === "object" && (result as ProgramResult).status === "failed";

        // postcondition: guards.verify predicate over {result, extracted, inputs}
        let effectOutcome = "observed";
        let verifyError: string | undefined;
        const opGuards = op.guards as Record<string, unknown>;
        if (!failed && opGuards["verify"] != null) {
          const env = {
            inputs: opts.inputs ?? {},
            vars: { result, extracted: (result as ProgramResult)?.extracted ?? {} },
          };
          const verified = evalPredicate(opGuards["verify"] as Predicate, env, false);
          effectOutcome = verified ? "verified" : "unverified";
          if (!verified) verifyError = "postcondition verify failed — effect did not land";
        }

        // promote/degrade from evidence (§9.9): ≥3 distinct successful
        // input sets validates a candidate; unverified demotes a validated impl
        const stats = { ...impl.stats } as Record<string, unknown>;
        let newState = impl.state;
        if (!failed && effectOutcome !== "unverified") {
          const key = JSON.stringify(opts.inputs ?? {});
          const succ = new Set([...((stats.successInputs as string[]) ?? []), key]);
          stats.successInputs = [...succ];
          stats.successCount = ((stats.successCount as number) ?? 0) + 1;
          stats.lastSuccessAt = Date.now();
          if (impl.state === "candidate" && succ.size >= 3) newState = "validated";
        } else if (effectOutcome === "unverified" && impl.state === "validated") {
          newState = "candidate";
        } else if (failed) {
          stats.lastErrorAt = Date.now();
          stats.errorCount = ((stats.errorCount as number) ?? 0) + 1;
        }
        if (newState !== impl.state || JSON.stringify(stats) !== JSON.stringify(impl.stats ?? {})) {
          this.deps.repo.saveImplementation({
            implId: impl.implId, operationId: impl.operationId, kind: impl.kind,
            executable: impl.executable, state: newState, evidence: impl.evidence, stats,
          });
          impl.state = newState; impl.stats = stats;
        }

        const status = !failed && effectOutcome !== "unverified" ? "completed" : "failed";
        const errMsg = verifyError ?? (failed ? (result as ProgramResult).error : undefined);
        record(status, errMsg, failed ? "unknown" : effectOutcome, Date.now());
        this.deps.events.emit("operation.invoked", {
          invocationId, operation: `${opts.siteKey}/${opts.name}`, kind: impl.kind, status, attempt: i,
        });

        // §9.6 — a landed write invalidates page-held state; reads don't
        if (!failed && effectOutcome !== "unverified" && op.effectClass !== "read" && opts.pageId) {
          this.deps.repo.markDatasetsStale(opts.pageId);
          this.deps.events.emit("page.invalidated", { pageId: opts.pageId, by: `operation:${opts.siteKey}/${opts.name}` });
        }

        if (status === "completed") {
          settleWrite(this.deps.durableWrites, intentId, true);
          return {
            invocationId, status,
            route: { ...route, implId: impl.implId, kind: impl.kind, reason: fellBack ? `${route.reason} → fell back to ${impl.kind}` : route.reason },
            result, error: verifyError,
          };
        }
        // failed result — steps may have dispatched; fall back only when safe
        settleWrite(this.deps.durableWrites, intentId, false);
        lastError = errMsg ?? "execution failed";
        if (op.effectClass === "read" && i < ladder.length - 1) { fellBack = true; continue; }
        return { invocationId, status: "failed", route: { ...route, implId: impl.implId, kind: impl.kind }, result, error: lastError };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const pre = isPreDispatchError(e);
        if (intentId && this.deps.durableWrites) {
          if (pre) this.deps.durableWrites.abortUndispatched(intentId, msg);
          else settleWrite(this.deps.durableWrites, intentId, false);
        }
        record("failed", msg, pre ? "not-dispatched" : "unknown", Date.now());
        this.deps.events.emit("operation.invoked", {
          invocationId, operation: `${opts.siteKey}/${opts.name}`, kind: impl.kind, status: "failed", attempt: i, error: msg,
        });
        lastError = msg;
        // §11.5 — never blindly re-issue a possibly-dispatched mutation
        const safeToRetry = op.effectClass === "read" || pre;
        if (!safeToRetry || i === ladder.length - 1) break;
        fellBack = true;
      }
    }
    return { invocationId: lastInvocationId, status: "failed", route, error: lastError ?? "all routes failed" };
  }

  /** Execute one implementation against the invoke context. */
  private async executeImpl(
    impl: ImplRow,
    opts: { pageId?: string; runId?: string; inputs?: Record<string, unknown>; journaled?: boolean; observation?: Observation },
    guards:Record<string,unknown>,
  ): Promise<unknown> {
    if (impl.kind === "browser-program") {
      if (!opts.pageId) throw new AuxError("invalid_params", "browser-program impl requires pageId");
      const saved = JSON.parse(impl.executable) as Omit<Program, "pageId">;
      const obs = opts.observation ?? await this.deps.pages.observe(opts.pageId, {});
      const live = this.deps.pages.get(opts.pageId);
      const prepared = compileAndAuthorize({
        pageId: opts.pageId,
        documentEpoch: live.documentEpoch ?? obs.documentEpoch,
        observedEpoch: obs.documentEpoch,
        steps: saved.steps ?? [],
        observation: obs.content,
        url: live.url ?? obs.content.url,
        grants: this.deps.grants ?? DEFAULT_GRANTS,
      });
      if ("rejected" in prepared) throw new AuxError("conflict", prepared.rejected);
      if ("denied" in prepared) throw new AuxError("permission_denied", prepared.denied);
      const program: Program = {
        ...prepared.program,
        nodes: saved.nodes,
        inputs: { ...saved.inputs, ...opts.inputs },
      };
      return this.deps.pages.execute(program, { runId: opts.runId, allowEval: false, journaled: opts.journaled });
    }
    if (impl.kind === "session-request") {
      const req = JSON.parse(impl.executable) as { method: string; url: string; body?: unknown; headers?: Record<string, string> };
      return this.runSessionRequest(req, opts.inputs ?? {}, opts.pageId, opts.runId, guards['session']==='required', opts.journaled);
    }
    throw new AuxError("backend_unavailable", `unknown impl kind ${impl.kind}`);
  }

  /**
   * Session-request execution — URL/body templates take {input:name} slots.
   * When a live page on the same host is available the fetch runs INSIDE the
   * page via evaluate — real session cookies, same-origin, no cookie export.
   * Otherwise it falls back to a plain runtime fetch (no session state).
   */
  private async runSessionRequest(
    req: { method: string; url: string; body?: unknown; headers?: Record<string, string> },
    inputs: Record<string, unknown>,
    pageId?: string,
    runId?: string,
    requireSession=false,
    journaled?: boolean,
  ) {
    const sub = (s: string) => s.replace(/\{input:([A-Za-z0-9_.]+)\}/g, (_m, k: string) => encodeURIComponent(String(inputs[k] ?? "")));
    const url = sub(req.url);
    const body = req.body === undefined ? undefined : JSON.parse(sub(JSON.stringify(req.body)));

    const destination = new URL(url);
    if (!["http:", "https:"].includes(destination.protocol)) throw new AuxError("permission_denied", "request protocol denied");
    const grants = resolveGrants(this.deps.grants).map(parseGrant).filter(g => g !== null);
    const effect = ["GET", "HEAD", "OPTIONS"].includes(req.method.toUpperCase()) ? "read" : req.method.toUpperCase() === "DELETE" ? "destructive" : "write";
    for (const needed of [effect, "egress"] as const) {
      if (!grants.some(g => grantAllows(g, needed, destination.origin, Date.now()))) {
        throw new AuxError("permission_denied", `agent ${needed} denied for ${url}`);
      }
    }
    let pageOrigin: string | undefined;
    if (pageId) {
      try { pageOrigin = new URL(this.deps.pages.get(pageId).url).origin; } catch { /* no live session */ }
    }

    // In-page execution requires the exact origin; the browser session
    // (cookies, storage auth) applies — this is what makes it a SESSION request
    if (pageId && pageOrigin === destination.origin) {
      const expr = `(async () => {
        const res = await fetch(${JSON.stringify(url)}, {
          method: ${JSON.stringify(req.method)},
          redirect: "error",
          headers: ${JSON.stringify({ ...req.headers, ...(body !== undefined ? { "content-type": "application/json" } : {}) })},
          body: ${body !== undefined ? JSON.stringify(JSON.stringify(body)) : "undefined"},
        });
        const text = await res.text();
        return { status: res.status, ok: res.ok, body: text.slice(0, ${MAX_REQUEST_RESPONSE_BYTES}), truncated: text.length > ${MAX_REQUEST_RESPONSE_BYTES} };
      })()`;
      const result = await this.deps.pages.execute(
        { pageId, steps: [{ id: "req", op: "evaluate", expression: expr, as: "response" } as never] },
        // the expression is built here from a validated request template,
        // not from model output — a trusted source
        { runId, allowEval: true, journaled },
      );
      const r = (result as ProgramResult).extracted?.response as { status: number; ok: boolean; body: string;truncated?:boolean } | undefined;
      if (!r) throw new AuxError("step_failed", `in-page request ${req.method} ${url} returned no result`);
      let json: unknown;
      try { json = JSON.parse(r.body); } catch { json = r.body; }
      if (!r.ok) throw new AuxError("step_failed", `${req.method} ${url} → ${r.status}`, json);
      return r.truncated?{value:json,truncated:true}:json;
    }

    if(requireSession)throw new AuxError('permission_denied','This operation requires a live page on the exact destination origin. Aux did not export or replay browser credentials.');

    let pageHost: string | undefined;
    if (pageId) {
      try {
        pageHost = new URL(this.deps.pages.get(pageId).url).host;
      } catch {
        pageHost = undefined;
      }
    }
    const allow = this.deps.egressAllowlist?.() ?? [];
    const hosts = allow.length > 0 ? allow : pageHost ? [pageHost] : [];
    if (!agentMayEgress(url, hosts)) {
      throw new AuxError("permission_denied", `agent egress denied for ${url}`);
    }

    const res = await fetch(url, {
      method: req.method,
      redirect: "error",
      headers: { ...req.headers, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const bytes=new Uint8Array(await res.arrayBuffer());const truncated=bytes.byteLength>MAX_REQUEST_RESPONSE_BYTES;const text=new TextDecoder().decode(bytes.slice(0,MAX_REQUEST_RESPONSE_BYTES));
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    if (!res.ok) throw new AuxError("step_failed", `${req.method} ${url} → ${res.status}`, json);
    return truncated?{value:json,truncated:true}:json;
  }
}
