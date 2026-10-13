import { useEffect, useState, type RefObject } from "react";

/** The narrow in-page section rail follows visible, already mounted headings. */
export function SettingsOutline({ shellRef }: { shellRef: RefObject<HTMLElement | null> }) {
  const [headings, setHeadings] = useState<HTMLElement[]>([]);
  const [active, setActive] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    const visible = () =>
      [
        ...root.querySelectorAll<HTMLElement>(
          ".settings-scroll h2, .settings-scroll .ui-settings-group > h4",
        ),
      ].filter((heading) => !heading.closest("[hidden], [inert]"));
    const updateActive = () => {
      const list = visible(),
        top = root.querySelector(".settings-scroll")?.getBoundingClientRect().top ?? 0;
      setActive(list.find((heading) => heading.getBoundingClientRect().top >= top) ?? list.at(-1) ?? null);
    };
    const update = () => {
      const next = visible();
      setHeadings((current) =>
        current.length === next.length && current.every((heading, index) => heading === next[index])
          ? current
          : next,
      );
      updateActive();
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "inert"],
    });
    root.addEventListener("scroll", updateActive, true);
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", updateActive, true);
    };
  }, [shellRef]);
  if (headings.length < 2) return null;
  return (
    <nav className="settings-outline" aria-label="Settings sections">
      {headings.map((heading, index) => (
        <button
          key={index}
          type="button"
          aria-label={heading.textContent ?? "Section"}
          title={heading.textContent ?? undefined}
          aria-current={active === heading ? "location" : undefined}
          onClick={() => {
            heading.tabIndex = -1;
            heading.scrollIntoView?.({
              block: "start",
              behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            });
            heading.focus({ preventScroll: true });
            setActive(heading);
          }}
        >
          <span />
        </button>
      ))}
    </nav>
  );
}
