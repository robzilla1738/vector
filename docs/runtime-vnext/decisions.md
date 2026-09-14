# Architecture decision records — Runtime vNext

## ADR-1: Control flow lives in a small interpreter, not a new language

Decision: `Program.nodes` is a typed union (`step|let|if|forEach|until|observe|assert|emit|checkpoint|return|call`) interpreted by `execution/interpreter.ts` against a variable environment. Rejected: a JS-expression DSL or an embedded scripting language — heavier than needed and unsafe to expose to model output. Cost: expressions are limited to a small predicate/expr grammar (`{input|variable|literal|call}` refs and `eq/ne/contains/in/gt/gte/lt/lte/exists/and/or/not` predicates); complex transforms go through registered `call` operations or dataset helpers.

## ADR-2: Operation = registry record with versioned implementations

Decision: `operations`/`operation_implementations` tables hold the compiled unit; kinds are `browser-program | session-request | observed-data` (site-tool/visual-program reserved). Rejected: storing ops only as `programs` rows — programs have no input schema, guards, implementations, or validation state, which the selection/invalidation rules require. Cost: one more store + compile path; existing `programs` remain for ad-hoc saved scripts.

## ADR-3: Session requests execute inside the page via the driver

Decision: `session-request` implementations run `page.evaluate(fetch)` in the live tab so cookies/session ride along; responses feed the response store. Rejected: Node-side `fetch` replay — breaks cookie/session fidelity and browser request semantics (9.4 warns exactly this). Cost: requires an attached page; an ineligible page falls back to the browser-program impl.

## ADR-4: Spans are lightweight rows, not an OTel dependency

Decision: `services/tracing.ts` records {spanId,parentId,name,runId,pageId,start,end,outcome,attrs} into a `spans` table + optional JSONL export; counters aggregate into `kv`. Rejected: OpenTelemetry SDK — hosted-observability machinery for a local single-user app (6.1 allows "a small structured event and span layer"). Cost: no ecosystem integrations; a `spans.export` command produces JSONL for tooling.

## ADR-5: Guards are route-family + required-control fingerprints

Decision: an operation's applicability guard = `siteKey` (origin + structural path, IDs globbed) plus required control fingerprints (role+name) re-checked against a fresh observation before dispatch. Rejected: whole-page hashing — clocks/ads invalidate constantly (10.7 warns this). Cost: guards can be too loose on genuinely changed structure — postconditions + demotion cover the residual risk.

## ADR-6: Model stays a chunk planner; control flow is optional in plans

Decision: `PlanChunk` keeps `steps`; an optional `program` field lets the model emit bounded control flow when it understands the whole shape. Rejected: forcing all plans through node form — bigger schema, more ways for a small model to fail validation, no benefit when the plan is a linear chunk anyway.

## ADR-7: Interruption semantics — mark interrupted, never auto-replay mutations

Decision: on startup, runs still `planning|running|needs_input` become `interrupted`; steps already dispatched keep recorded outcomes; resume re-observes rather than re-executing. Rejected: re-running tails — duplicates external mutations (0.4, 13.3). Cost: a run may need a fresh goal after interruption; acceptable for a local single-user app.

## ADR-8: Promotion gate (initial)

Decision: an implementation starts `candidate`; replaying it successfully on ≥1 distinct input (or held-out seed) promotes to `validated`; a postcondition failure demotes to `degraded`. The roadmap's 3-input+held-out bar stays the documented target for the `promoted` state; honest reporting lists validation evidence count. Cost: early ops carry thinner evidence than the ideal gate — recorded in `stats`, never hidden.
