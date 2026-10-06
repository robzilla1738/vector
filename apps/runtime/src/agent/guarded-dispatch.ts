import type { ObservationContent, Program, Step } from "@aux/contracts";
import type { ExecContext } from "../execution/executor.js";
import type { ExecuteResult, PageService } from "../services/pages.js";
import { compileAndAuthorize } from "./action-compiler.js";
import { beginConsequentialWrite, settleWrite, type DurableWriteLedger } from "./durable.js";
import { collectProgramSteps } from "../services/pages/executor.js";
import type { GrantSource } from "./permissions.js";
import type { SkillGuard } from "./skills.js";

export type GuardedDispatchDeps = {
  pages: Pick<PageService, "execute">;
  durable?: DurableWriteLedger;
  grants?: GrantSource;
};

export type GuardedDispatchOpts = {
  runId: string;
  pageId: string;
  steps: Step[];
  observation: ObservationContent;
  /** Already-redacted pre-dispatch render for evidence-bound reconciliation. */
  beforeText?: string;
  /** Action target labels from the redacted observation, with no control values. */
  actionLabels?: string[];
  expectedNavigationUrlHash?: string;
  modalWasOpen?: boolean;
  beforeHeadingHashes?: string[];
  url: string;
  /** epoch the compiled program must still match */
  documentEpoch: number;
  /** epoch the steps were planned against; a mismatch rejects before dispatch */
  observedEpoch?: number;
  revision?: number;
  guards?: SkillGuard[];
  taskId?: string;
  taskRevision?: number;
  /** Recheck the run's message revision at the synchronous dispatch boundary. */
  isCurrent?: () => boolean;
  /** overrides the compiled program (e.g. drop documentEpoch on later streamed batches) */
  program?: Partial<Program>;
  exec: ExecContext;
  returnObservation?: NonNullable<Parameters<PageService["execute"]>[2]>["returnObservation"];
};

export type GuardedDispatch =
  | { kind: "rejected"; reason: string }
  | { kind: "denied"; reason: string }
  | { kind: "skipped"; reason: string }
  | { kind: "ran"; result: ExecuteResult; program: Program };

/** compile → authorize → persist write intent → execute → settle: the one dispatch path for model-authored steps. */
export async function guardedExecute(
  deps: GuardedDispatchDeps,
  opts: GuardedDispatchOpts,
): Promise<GuardedDispatch> {
  if (opts.isCurrent && !opts.isCurrent())
    return { kind: "rejected", reason: "The user corrected this run; re-plan before acting." };
  const prepared = compileAndAuthorize({
    pageId: opts.pageId,
    documentEpoch: opts.documentEpoch,
    observedEpoch: opts.observedEpoch,
    steps: opts.steps,
    observation: opts.observation,
    url: opts.url,
    guards: opts.guards,
    grants: deps.grants,
  });
  if ("rejected" in prepared) return { kind: "rejected", reason: prepared.rejected };
  if ("denied" in prepared) return { kind: "denied", reason: prepared.denied };
  if (opts.isCurrent && !opts.isCurrent())
    return { kind: "rejected", reason: "The user corrected this run; re-plan before acting." };
  const program = { ...prepared.program, ...opts.program };
  const write = beginConsequentialWrite(deps.durable, {
    runId: opts.runId,
    pageId: opts.pageId,
    documentEpoch: prepared.program.documentEpoch ?? opts.documentEpoch,
    revision: opts.revision,
    steps: collectProgramSteps(program),
    beforeText: opts.beforeText,
    actionLabels: opts.actionLabels,
    expectedNavigationUrlHash: opts.expectedNavigationUrlHash,
    modalWasOpen: opts.modalWasOpen,
    beforeHeadingHashes: opts.beforeHeadingHashes,
    taskId: opts.taskId,
    taskRevision: opts.taskRevision,
  });
  if (write.skip) return { kind: "skipped", reason: write.reason! };
  const result = await deps.pages.execute(
    program,
    {
      ...opts.exec,
      // Navigation has no durable write intent. Let the executor classify it
      // normally instead of claiming a pre-journaled write without an ID.
      ...(write.intentId ? { journaled: true, journalIntentId: write.intentId } : {}),
    },
    opts.returnObservation ? { returnObservation: opts.returnObservation } : {},
  );
  settleWrite(deps.durable, write.intentId, result);
  return { kind: "ran", result, program };
}
