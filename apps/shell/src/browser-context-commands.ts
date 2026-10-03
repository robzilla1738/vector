export type BrowserContextCommand = "update-browser-source" | "remove-browser-source" | "toggle-browser-source" | "select-browser-context";
type Control = HTMLButtonElement | HTMLInputElement;
const owners = new Set<{ element: Control; command: BrowserContextCommand; value: string; invoke(): unknown }>();
/** Only the original mounted source control can call its captured callback. */
export function registerBrowserContextCommand(element: Control, command: BrowserContextCommand, value: string, invoke: () => unknown): () => void {
  const owner = { element, command, value, invoke }; owners.add(owner);
  return () => { owners.delete(owner); };
}
export function invokeBrowserContextCommand(command: BrowserContextCommand, { payload, nativeInputEvent }: { payload?: unknown; nativeInputEvent?: Event } = {}): unknown {
  const value = payload && typeof payload === "object" && "pageId" in payload ? payload.pageId : undefined;
  if (value !== undefined && (typeof value !== "string" || !value)) throw new Error("Choose the source’s current control.");
  const visible = [...owners].filter(owner => owner.command === command && owner.element.isConnected && !owner.element.disabled &&
    !owner.element.closest('[hidden], [inert], [aria-hidden="true"]') && owner.element.getClientRects().length > 0 &&
    (value === undefined || owner.value === value));
  const target = nativeInputEvent?.target;
  const matches = nativeInputEvent ? (target instanceof Node ? visible.filter(owner => owner.element.contains(target)) : [])
    : visible.filter(owner => owner.element.contains(document.activeElement));
  if (matches.length !== 1) throw new Error(nativeInputEvent ? "The source’s controls changed. Choose its current control." : "Choose the source’s focused control.");
  return matches[0]!.invoke();
}
