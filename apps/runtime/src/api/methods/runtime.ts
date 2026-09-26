import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { MethodSchemas } from "@aux/contracts";

async function h_runtime_describe(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  // capability surface for external clients — what this runtime can do (§16.2)
  const backends = [...new Set(s.repo.listPages({ includeDetached: true }).map((p) => p.backend))];
  return {
    version: 1,
    featureStages: await s.featureStages,
    methods: Object.keys(MethodSchemas).sort(),
    entities: [
      "pages",
      "sets",
      "runs",
      "programs",
      "operations",
      "datasets",
      "responses",
      "artifacts",
      "observations",
      "spans",
    ],
    programForms: { steps: true, nodes: true },
    nodeKinds: [
      "step",
      "let",
      "if",
      "forEach",
      "until",
      "observe",
      "assert",
      "emit",
      "checkpoint",
      "return",
      "call",
    ],
    implKinds: ["browser-program", "session-request"],
    effectClasses: ["read", "write", "destructive"],
    implStates: ["candidate", "validated", "shadow", "quarantined"],
    stateEntities: ["controls", "records", "responses", "artifacts", "operations", "datasets"],
    // §16.2 — clients must not assume capabilities the backend lacks
    backends,
    limits: {
      maxStepsPerProgram: 200,
      maxNodesPerProgram: 400,
      maxForEachConcurrency: 8,
      defaultNodeBudget: 2000,
      defaultIterationBudget: 500,
      observeMaxElements: 120,
      observeMaxTextChars: 6000,
    },
    features: {
      responseCapture: !!s.responses,
      operationRegistry: !!s.operations,
      stateIndex: !!s.state,
      tracing: !!s.tracer,
      chromeAttach: true,
      takeover: true,
      // Runs are crash-safe (the ledger marks them interrupted) but NOT
      // resumable after a restart; program checkpoints (`resumeFrom`)
      // are the only resume primitive. Advertise exactly that.
      checkpointResume: false,
      programCheckpoints: true,
      invocationIdempotency: true,
      webmcpTools: typeof s.native?.webmcpList === "function",
      bidi: true,
      crashReview: true,
    },
  };
}

export const runtimeMethods: Partial<Record<MethodName, MethodHandler>> = {
  "runtime.describe": h_runtime_describe,
};
