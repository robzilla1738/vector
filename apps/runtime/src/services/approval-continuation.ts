import type { SafetyAction } from "@aux/contracts";
import type { Services } from "../api/methods/context.js";
import type { SuspensionStore } from "../safety/suspensions.js";
import { resumeSkillApproval } from "./skill-continuation.js";

/** Shared ordinary and native-device continuation; both retain the same exact saved approval. */
export async function resumeApproval(s: Pick<Services, "repo" | "pages" | "events" | "runs"> & { suspensions: SuspensionStore }, action: SafetyAction, approvalId: string, approved = true): Promise<void> {
  const { suspensions } = s;
  const resolved = suspensions.resolveByApprovalId(
    approvalId,
    approved ? "answered" : "cancelled",
  );
  // The parked run waits on an answer — wake it with the decision so the
  // planner sees consent (retries through decide() and is authorized) or
  // refusal (chooses a different action) instead of a silent timeout.
  if (resolved) {
    try {
      if (action.action === "browser.request") {
        // The native request is already waiting. Do not queue an answer that
        // could accidentally answer the run's next unrelated user question.
        if (s.repo.getRun(resolved.runId)?.status === "needs_input")
          await s.runs.coordinator.setStatus(
            resolved.runId,
            "running",
            approved ? "Browser request approved" : "Browser request declined",
          );
      } else if (
        await resumeSkillApproval(
          { repo: s.repo, pages: s.pages, events: s.events },
          resolved.runId,
          approvalId,
          approved,
        )
      ) {
        // Continue only the pending reviewed step through its actual safety gate.
      } else
        await s.runs.coordinator.answer(
          resolved.runId,
          approved
            ? "The user approved the requested action."
            : "The user declined the requested action. Do not retry it; choose a different action.",
        );
    } catch {
      /* the run ended between park and decision */
    }
  }
}
