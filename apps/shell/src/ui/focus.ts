/** Shared availability check for native overlay and roving-list focus. */
export function availableForFocus(node: HTMLElement): boolean {
  if (!node.isConnected || node.matches(':disabled, [aria-disabled="true"]')) return false;
  if (node.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
  for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse")
      return false;
  }
  return true;
}

export const focusableSelector =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]';

export function availableControls(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (node) => node.tabIndex >= 0 && availableForFocus(node),
  );
}

/** Preserve a newer focus owner when an overlay retires. */
export function ownsFocus(owner: HTMLElement | null): boolean {
  const active = document.activeElement;
  return active === document.body || active === null || !!owner?.contains(active);
}
/** A customizable native select owns Escape until its picker closes. */
export function nativePickerOpen(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("select")?.matches(":open");
}
