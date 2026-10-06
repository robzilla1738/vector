import type { SettingsSearchItem } from "./search";

/** Wait for a routed field to mount before scrolling and announcing its focus. */
export async function focusSettingsDestination(
  root: HTMLElement | null,
  destination: SettingsSearchItem,
  signal: AbortSignal,
): Promise<boolean> {
  if (!root) return false;
  const visibleSections = () =>
    [...root.querySelectorAll<HTMLElement>("[data-settings-section], :scope > section")].filter(
      (section) => !section.closest("[hidden], [inert]"),
    );
  for (let attempt = 0; attempt < 40 && !signal.aborted; attempt++) {
    const sections = visibleSections();
    const section = sections[0];
    const target = destination.target
      ? sections
          .flatMap((section) => [...section.querySelectorAll<HTMLElement>("[data-setting]")])
          .find((node) => node.dataset.setting === destination.target)
      : section;
    if (target) {
      const disclosure = target.closest("details");
      if (disclosure) disclosure.open = true;
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
      target.scrollIntoView?.({ block: "center" });
      target.focus({ preventScroll: true });
      target.classList.remove("settings-search-focus");
      void target.offsetWidth;
      target.classList.add("settings-search-focus");
      window.setTimeout(() => target.classList.remove("settings-search-focus"), 2250);
      return true;
    }
    if (attempt < 39) await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
  }
  if (!signal.aborted) visibleSections()[0]?.scrollIntoView?.({ block: "start" });
  return false;
}
