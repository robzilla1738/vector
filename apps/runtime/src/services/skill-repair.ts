import { randomUUID } from "node:crypto";
import {
  AuxError,
  PlanStepSchema,
  SkillRepairProposalSchema as Proposal,
  type Routine,
} from "@aux/contracts";
import type { z } from "zod";
import type { Repo } from "../store/repo.js";
import type { PageService } from "./pages.js";
import { skillPageOrigin, skillReplayProofDigest } from "./skill-replay.js";
export type SkillRepairProposal = z.infer<typeof Proposal>;
/** A proposed target diff has no start or approval authority. */
export class SkillReplayRepairs {
  constructor(private readonly repo: Repo) {}
  async propose(
    routine: Routine,
    pageId: string,
    changes: { stepId: string; selector: string }[],
    pages: PageService,
  ) {
    const replay = routine.replay;
    if (!routine.paused || replay?.state !== "needs_repair")
      throw new AuxError(
        "conflict",
        "Pause and review a failed Skill replay before proposing a target repair.",
      );
    if (
      skillReplayProofDigest(replay) !== replay.digest ||
      !replay.siteOrigins.includes(skillPageOrigin(pages, pageId))
    )
      throw new AuxError("conflict", "This Skill or its reviewed site changed.");
    const page = pages.get(pageId),
      attachmentId = page.sessionId,
      epoch = page.documentEpoch;
    if (!attachmentId) throw new AuxError("target_detached", "The repair tab has no current attachment.");
    const observation = await pages.observe(pageId, { scope: "full" });
    const current = pages.get(pageId);
    if (current.sessionId !== attachmentId || current.documentEpoch !== epoch || !pages.isAttached(pageId))
      throw new AuxError("conflict", "The page changed while proposing a repair.");
    const observed = observation.content.elements.flatMap((element) =>
      [
        element.selector.css ? `css:${element.selector.css}` : undefined,
        element.selector.role?.name
          ? `role:${element.selector.role.role}|${element.selector.role.name}`
          : undefined,
        element.selector.label ? `label:${element.selector.label}` : undefined,
        element.selector.testId ? `testid:${element.selector.testId}` : undefined,
      ].filter((value): value is string => !!value),
    );
    const diff = changes.map((change) => {
      const step = replay.steps.find((step) => step.id === change.stepId);
      if (
        !step ||
        !("target" in step) ||
        !step.target ||
        step.target === change.selector ||
        !/^(?:css:(?:[#.][A-Za-z][\w-]*|[a-z][\w-]*(?:[#.][A-Za-z][\w-]*)?)|(?:label|testid):[^\r\n|]{1,200}|role:[a-z][a-z-]*\|[^\r\n|]{1,200})$/.test(
          change.selector,
        ) ||
        /pass(?:word)?|token|secret|otp|cvv|ssn/i.test(change.selector) ||
        observed.filter((selector) => selector === change.selector).length !== 1
      )
        throw new AuxError(
          "invalid_params",
          "Each repair needs one supported, unambiguous target from the current page observation.",
        );
      return { stepId: change.stepId, before: step.target, after: change.selector };
    });
    if (new Set(diff.map((change) => change.stepId)).size !== diff.length)
      throw new AuxError("invalid_params", "Review each step only once.");
    const proposal = Proposal.parse({
      proposalId: randomUUID(),
      routineId: routine.routineId,
      revision: routine.revision,
      digest: replay.digest,
      pageId,
      attachmentId,
      documentEpoch: epoch,
      changes: diff,
    });
    const payload = JSON.stringify(proposal);
    this.repo.db
      .prepare("INSERT INTO skill_replay_repairs VALUES(?,?,'proposed')")
      .run(proposal.proposalId, payload);
    return proposal;
  }
  get(id: string): SkillRepairProposal {
    const row = this.repo.db.prepare("SELECT payload,state FROM skill_replay_repairs WHERE id=?").get(id) as
      { payload: string; state: string } | undefined;
    if (!row || row.state !== "proposed")
      throw new AuxError("conflict", "This repair proposal is no longer current.");
    return Proposal.parse(JSON.parse(row.payload));
  }
  apply(routine: Routine, id: string, pages: PageService): Routine["replay"] {
    const proposal = this.get(id),
      replay = routine.replay,
      page = pages.get(proposal.pageId);
    if (
      !replay ||
      !routine.paused ||
      replay.state !== "needs_repair" ||
      routine.routineId !== proposal.routineId ||
      routine.revision !== proposal.revision ||
      replay.digest !== proposal.digest ||
      skillReplayProofDigest(replay) !== proposal.digest ||
      page.sessionId !== proposal.attachmentId ||
      page.documentEpoch !== proposal.documentEpoch ||
      !replay.siteOrigins.includes(skillPageOrigin(pages, proposal.pageId))
    )
      throw new AuxError(
        "conflict",
        "The Skill, target document or attachment changed. Propose a fresh repair.",
      );
    const steps = replay.steps.map((step) => {
      const change = proposal.changes.find((change) => change.stepId === step.id);
      if (!change) return step;
      if (!("target" in step) || step.target !== change.before)
        throw new AuxError("conflict", "The proposed target changed.");
      return PlanStepSchema.parse({ ...step, target: change.after });
    });
    const next = {
      ...replay,
      steps,
      state: "untested" as const,
      testRunId: undefined,
      testRevision: undefined,
      testedRevision: undefined,
      testedAt: undefined,
    };
    next.digest = skillReplayProofDigest(next);
    if (
      this.repo.db
        .prepare("UPDATE skill_replay_repairs SET state='applied' WHERE id=? AND state='proposed'")
        .run(id).changes !== 1
    )
      throw new AuxError("conflict", "This repair was already reviewed.");
    return next;
  }
}
