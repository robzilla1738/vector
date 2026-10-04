import { useId, type ReactNode } from "react";
import { shellIconDown } from "./icons";

export function SidebarSection({ title, open, onToggle, fill = false, children }: {
  title: string; open: boolean; onToggle(): void; fill?: boolean; children: ReactNode;
}) {
  const id = useId();
  return <section className={`sidebar-section ${fill ? "fill" : ""}`} aria-label={title}>
    <button className="sidebar-section-heading" aria-expanded={open} aria-controls={id} onClick={onToggle}>
      <span>{title}</span><span className="sidebar-section-chevron" aria-hidden="true">{shellIconDown}</span>
    </button>
    <div id={id} className={`sidebar-section-body ${open ? "open" : ""}`} inert={!open} aria-hidden={!open}>
      <div className="sidebar-section-inner">{children}</div>
    </div>
  </section>;
}
