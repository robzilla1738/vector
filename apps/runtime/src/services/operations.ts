import { randomUUID } from "node:crypto";
import { VectorError, type Predicate, type Program, type ProgramResult, type Step } from "@vector/contracts";
import { agentMayEgress } from "../agent/policy.js";
import { evalPredicate } from "../execution/interpreter.js";
import type { Repo } from "../store/repo.js";
import type { EventBus } from "../events.js";
import type { PageService } from "./pages.js";

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
  "unsupported_op",
]);
function isPreDispatchError(e: unknown): boolean {
  return e instanceof VectorError && PRE_DISPATCH_CODES.has(e.code);
}

/**
 * The operation registry (§9) + route selection (§10). An operation is a
 * named, validated way to do something on a site — created from a proven
 * program, promoted through candidate→validated, and invoked with zero
 * model involvement. Every invoke records the route it took and why.
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
    },
  ) {}

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
    if (!steps.length) throw new VectorError("not_found", `run ${opts.runId} has no successful steps to compile`);
    const pageIds = [...new Set(steps.map((s) => s.pageId).filter(Boolean))] as string[];
    if (pageIds.length !== 1) {
      throw new VectorError("invalid_params", `run ${opts.runId} touched ${pageIds.length} pages — only single-page runs compile`);
    }
    const pageId = pageIds[0]!;
    const siteKey = opts.siteKey ?? this.siteKeyOf(pageId);
    if (!siteKey) throw new VectorError("invalid_params", "cannot determine siteKey — pass one explicitly");
    const raw: Step[] = steps.map((s, i) => ({ id: `s${i + 1}`, op: s.op, ...(s.inputs ?? {}) }) as Step);
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
    if (!op) throw new VectorError("not_found", `no operation ${siteKey}/${name}`);
    return { ...op, implementations: this.deps.repo.listImplementations(op.operationId) };
  }

  setImplState(implId: string, state: "candidate" | "validated" | "shadow" | "quarantined") {
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
    ctx: { pageId?: string; allowPageOpen?: boolean },
  ): Promise<RouteDecision> {
    // fetch a fresh observation once, only if a browser-program impl needs it
    const needsObs = op.guards["controls"] != null && impls.some((i) => i.kind === "browser-program" && i.state !== "quarantined");
    let elements: { ref: string; role?: string; name?: string; text?: string }[] | undefined;
    if (needsObs && ctx.pageId) {
      try {
        const obs = await this.deps.pages.observe(ctx.pageId, {});
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
          eligible = false;
          why = "requires a bound session (not implemented)";
        }
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
    if (!op) throw new VectorError("not_found", `no operation ${siteKey}/${name}`);
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
    const op = this.deps.repo.getOperation(opts.siteKey, opts.name);
    if (!op) throw new VectorError("not_found", `no operation ${opts.siteKey}/${opts.name}`);

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
    let route: RouteDecision;
    if (opts.implId) {
      const impl = impls.find((i) => i.implId === opts.implId);
      if (!impl) throw new VectorError("not_found", `no impl ${opts.implId} on ${opts.name}`);
      route = { implId: impl.implId, kind: impl.kind, reason: "explicit impl override", candidates: [], ranked: [{ implId: impl.implId, kind: impl.kind, state: impl.state }] };
    } else {
      route = await this.selectRoute(op, impls, { pageId: opts.pageId });
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
        run.config = { ...(run.config ?? {}), implementation: route.kind, routeReason: route.reason };
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
      try {
        const result = await this.executeImpl(impl, opts);
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
        const stats = { ...(impl.stats ?? {}) } as Record<string, unknown>;
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
          this.deps.repo.markDatasetsStale(opts.pageId, 0);
          this.deps.events.emit("page.invalidated", { pageId: opts.pageId, by: `operation:${opts.siteKey}/${opts.name}` });
        }

        if (status === "completed") {
          return {
            invocationId, status,
            route: { ...route, implId: impl.implId, kind: impl.kind, reason: fellBack ? `${route.reason} → fell back to ${impl.kind}` : route.reason },
            result, error: verifyError,
          };
        }
        // failed result — steps may have dispatched; fall back only when safe
        lastError = errMsg ?? "execution failed";
        if (op.effectClass === "read" && i < ladder.length - 1) { fellBack = true; continue; }
        return { invocationId, status: "failed", route: { ...route, implId: impl.implId, kind: impl.kind }, result, error: lastError };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const pre = isPreDispatchError(e);
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
    opts: { pageId?: string; runId?: string; inputs?: Record<string, unknown> },
  ): Promise<unknown> {
    if (impl.kind === "browser-program") {
      if (!opts.pageId) throw new VectorError("invalid_params", "browser-program impl requires pageId");
      const saved = JSON.parse(impl.executable) as Omit<Program, "pageId">;
      const program: Program = { ...saved, pageId: opts.pageId, inputs: { ...(saved.inputs ?? {}), ...(opts.inputs ?? {}) } };
      return this.deps.pages.execute(program, { runId: opts.runId, allowEval: false });
    }
    if (impl.kind === "session-request") {
      const req = JSON.parse(impl.executable) as { method: string; url: string; body?: unknown; headers?: Record<string, string> };
      return this.runSessionRequest(req, opts.inputs ?? {}, opts.pageId, opts.runId);
    }
    throw new VectorError("backend_unavailable", `unknown impl kind ${impl.kind}`);
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
  ) {
    const sub = (s: string) => s.replace(/\{input:([A-Za-z0-9_.]+)\}/g, (_m, k: string) => encodeURIComponent(String(inputs[k] ?? "")));
    const url = sub(req.url);
    const body = req.body === undefined ? undefined : JSON.parse(sub(JSON.stringify(req.body)));

    // in-page execution: same host as the live page → the browser's session
    // (cookies, storage auth) applies — this is what makes it a SESSION request
    if (pageId) {
      try {
        const pageHost = new URL(this.deps.pages.get(pageId).url).host;
        if (pageHost === new URL(url).host) {
          const expr = `(async () => {
            const res = await fetch(${JSON.stringify(url)}, {
              method: ${JSON.stringify(req.method)},
              headers: ${JSON.stringify({ ...(req.headers ?? {}), ...(body !== undefined ? { "content-type": "application/json" } : {}) })},
              body: ${body !== undefined ? JSON.stringify(JSON.stringify(body)) : "undefined"},
            });
            const text = await res.text();
            return { status: res.status, ok: res.ok, body: text };
          })()`;
          const result = await this.deps.pages.execute(
            { pageId, steps: [{ id: "req", op: "evaluate", expression: expr, as: "response" } as never] },
            // the expression is built here from a validated request template,
            // not from model output — a trusted source
            { runId, allowEval: true },
          );
          const r = (result as ProgramResult).extracted?.response as { status: number; ok: boolean; body: string } | undefined;
          if (!r) throw new VectorError("step_failed", `in-page request ${req.method} ${url} returned no result`);
          let json: unknown;
          try { json = JSON.parse(r.body); } catch { json = r.body; }
          if (!r.ok) throw new VectorError("step_failed", `${req.method} ${url} → ${r.status}`, json);
          return json;
        }
      } catch (e) {
        if (e instanceof VectorError) throw e;
        // page gone or not readable — fall through to runtime fetch
      }
    }

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
      throw new VectorError("permission_denied", `agent egress denied for ${url}`);
    }

    const res = await fetch(url, {
      method: req.method,
      headers: { ...(req.headers ?? {}), ...(body !== undefined ? { "content-type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    if (!res.ok) throw new VectorError("step_failed", `${req.method} ${url} → ${res.status}`, json);
    return json;
  }
}
