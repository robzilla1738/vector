/** Contextual actions belong to the original visible controls, never a recent run. */
export const RUN_CONTROL_COMMANDS = ["pause-run", "resume-run", "stop-run", "take-run-control", "return-run-control", "open-run-tab"] as const;
export type RunControlCommand = (typeof RUN_CONTROL_COMMANDS)[number];
type Registration = {
  element: HTMLElement;
  runId: string;
  invoke: (command: RunControlCommand, originalEvent?: Event) => unknown;
};
const owners = new Set<Registration>();

export function registerRunControlCommands(element: HTMLElement, runId: string, invoke: Registration["invoke"]): () => void {
  const owner = { element, runId, invoke };
  owners.add(owner);
  return () => { owners.delete(owner); };
}

export function invokeRunControlCommand(command: RunControlCommand, context: { payload?: unknown; nativeInputEvent?: Event } = {}): unknown {
  const payload = context.payload;
  const runId = payload && typeof payload === "object" && "runId" in payload ? payload.runId : undefined;
  if (runId !== undefined && (typeof runId !== "string" || !runId)) throw new Error("Choose a valid run before using this command.");
  const visible = [...owners].filter(owner => owner.element.isConnected &&
    !owner.element.closest('[hidden], [inert], [aria-hidden="true"]') && owner.element.getClientRects().length > 0 &&
    (runId === undefined || owner.runId === runId));
  const focused = visible.filter(owner => owner.element.contains(document.activeElement));
  const candidates = focused.length ? focused : visible;
  if (candidates.length !== 1) throw new Error("Choose the run’s controls before using this command.");
  const owner = candidates[0]!;
  const event = context.nativeInputEvent;
  // This only passes through the original event. Native code alone can admit a
  // fixture measurement; keyboard and programmatic calls carry no event.
  if (event && (!(event.target instanceof Node) || !owner.element.contains(event.target)))
    throw new Error("The run’s controls changed. Try again from its controls.");
  return owner.invoke(command, event);
}
