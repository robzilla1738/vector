import { AuxError, type Run, type Suspension } from "@aux/contracts";

/** A pending record only describes the current parked turn. */
export function currentRunSuspension(run: Run, pending: Suspension | undefined): Suspension | null {
  return run.status === "needs_input" &&
    pending?.state === "pending" &&
    pending.runId === run.runId &&
    pending.turnId === run.runId
    ? pending
    : null;
}

/** Called synchronously immediately before waking a parked run. */
export function assertRunAnswerable(
  run: Run,
  pending: Suspension | undefined,
  expectedSuspensionId?: string,
): void {
  if (run.status !== "needs_input")
    throw new AuxError("conflict", "The pending request changed. Review it before answering.");
  if (
    !pending ||
    !currentRunSuspension(run, pending) ||
    !expectedSuspensionId ||
    pending.suspensionId !== expectedSuspensionId
  )
    throw new AuxError("conflict", "The pending request changed. Review it before answering.");
  if (pending.request.cloudSetup)
    throw new AuxError("conflict", "Retry Cloud setup using its review action.");
  if (pending.request.modelLimits)
    throw new AuxError("conflict", "Retry model setup using its review action.");
  if (pending.request.resourceFunding || pending.request.resourceLimits)
    throw new AuxError("conflict", "Continue locally or stop the original cloud resource handoff.");
  if (pending.kind !== "ask-user-question" && pending.kind !== "handoff")
    throw new AuxError("conflict", "This request needs a decision in the approval prompt.");
}
