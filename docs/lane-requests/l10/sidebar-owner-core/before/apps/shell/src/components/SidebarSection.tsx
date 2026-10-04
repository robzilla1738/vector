import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
import { shellIconDown } from "./icons";

export function SidebarSection({ title, open, onToggle, fill = false, children }: {
  title: string; open: boolean; onToggle(): void; fill?: boolean; children: ReactNode;
}) {
  const id = useId(), heading = useRef<HTMLButtonElement>(null), action = useRef(onToggle);
  const windowId = bridge.windowId, privateMode = bridge.privateMode, kind = bridge.windowKind;
  useLayoutEffect(() => { action.current = onToggle; }, [onToggle]);
  useLayoutEffect(() => {
    const original = heading.current;
    if (!original || !["Bookmarks", "Chats", "Tabs"].includes(title) ||
      !["normal", "private"].includes(kind) || (privateMode && title !== "Tabs")) return;
    let active = true;
    const retire = registerScopedControl(original, "toggle-sidebar-section", id, () => {
      if (!active || heading.current !== original || bridge.windowId !== windowId ||
        bridge.privateMode !== privateMode || bridge.windowKind !== kind) {
        active = false;
        throw new Error("The original sidebar section changed.");
      }
      return action.current();
    });
    return () => { active = false; retire(); };
  }, [id, title, windowId, privateMode, kind]);
  return <section className={`sidebar-section ${fill ? "fill" : ""}`} aria-label={title}>
    <button ref={heading} className="sidebar-section-heading" aria-expanded={open} aria-controls={id}
      data-command-id="toggle-sidebar-section" onClick={event => runCommand("toggle-sidebar-section", { nativeInputEvent: event.nativeEvent })}>
      <span>{title}</span><span className="sidebar-section-chevron" aria-hidden="true">{shellIconDown}</span>
    </button>
    <div id={id} className={`sidebar-section-body ${open ? "open" : ""}`} inert={!open} aria-hidden={!open}>
      <div className="sidebar-section-inner">{children}</div>
    </div>
  </section>;
}
