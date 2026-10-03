/** Each update belongs to its original visible source button, never a recent page. */
const owners = new Set<{ element: HTMLButtonElement; pageId: string; invoke(): unknown }>();
export function registerBrowserSourceUpdate(element: HTMLButtonElement, pageId: string, invoke: () => unknown): () => void {
  const owner = { element, pageId, invoke };
  owners.add(owner);
  return () => { owners.delete(owner); };
}
export function invokeBrowserSourceUpdate({ payload, nativeInputEvent }: { payload?: unknown; nativeInputEvent?: Event } = {}): unknown {
  const pageId = payload && typeof payload === "object" && "pageId" in payload ? payload.pageId : undefined;
  if (pageId !== undefined && (typeof pageId !== "string" || !pageId)) throw new Error("Choose the changed source before updating it.");
  const visible = [...owners].filter(({ element, pageId: original }) => element.isConnected && !element.disabled &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]') && element.getClientRects().length > 0 &&
    (pageId === undefined || original === pageId));
  if (nativeInputEvent) {
    const target = nativeInputEvent.target;
    const clicked = target instanceof Node ? visible.filter(owner => owner.element.contains(target)) : [];
    if (clicked.length !== 1) throw new Error("The source’s controls changed. Choose its current Update control.");
    return clicked[0]!.invoke();
  }
  const focused = visible.filter(owner => owner.element.contains(document.activeElement));
  const candidates = focused;
  if (candidates.length !== 1) throw new Error("Choose the changed source’s Update control.");
  return candidates[0]!.invoke();
}
