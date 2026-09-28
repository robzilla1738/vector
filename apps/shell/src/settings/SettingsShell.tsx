import type { ReactNode, RefObject } from "react";

export function SettingsShell({
  shellRef,
  nav,
  children,
}: {
  shellRef: RefObject<HTMLElement | null>;
  nav: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="settings-page" aria-label="Settings" ref={shellRef}>
      {nav}
      <div className="settings-content">{children}</div>
    </section>
  );
}
