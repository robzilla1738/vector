const owners = new Set<{ element: HTMLElement; command: string; value: string; invoke(originalEvent?: Event): unknown }>();
/** Only the original mounted scoped control can call its captured callback. */
export function registerScopedControl(element: HTMLElement, command: string, value: string, invoke: (originalEvent?: Event) => unknown): () => void {
  const owner = { element, command, value, invoke }; owners.add(owner);
  return () => { owners.delete(owner); };
}
export function invokeScopedControl(command: string, { payload, nativeInputEvent }: { payload?: unknown; nativeInputEvent?: Event } = {}): unknown {
  const value = payload && typeof payload === "object"
    ? ("scopeId" in payload ? payload.scopeId : "pageId" in payload ? payload.pageId : undefined) : undefined;
  if (payload && typeof payload === "object" && "scopeId" in payload && "pageId" in payload) throw new Error("Choose the original control.");
  if (value !== undefined && (typeof value !== "string" || !value)) throw new Error("Choose the original current control.");
  const visible = [...owners].filter(owner => owner.command === command && owner.element.isConnected && !owner.element.matches(":disabled") && owner.element.getAttribute("aria-disabled") !== "true" &&
    !owner.element.closest('[hidden], [inert], [aria-hidden="true"]') && owner.element.getClientRects().length > 0 &&
    (value === undefined || owner.value === value));
  const target = nativeInputEvent?.target;
  const matches = nativeInputEvent ? (target instanceof Node ? visible.filter(owner => owner.element.contains(target)) : [])
    : visible.filter(owner => owner.element.contains(document.activeElement));
  if (matches.length !== 1) throw new Error(nativeInputEvent ? "The original controls changed. Choose its current control." : "Choose the original focused control.");
  return matches[0]!.invoke(nativeInputEvent);
}
