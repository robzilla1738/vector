import { useId, useRef, type ReactNode } from "react";
import { bridge } from "../bridge";
import { useSidebarControl } from "./use-sidebar-control";
import { shellIconDown } from "../ui/icons";
import { nativeAriaHiddenProps as auxNativeAriaHiddenProps } from "../ui/native-attribute-props";

export function SidebarSection({
  title,
  open,
  onToggle,
  fill = false,
  children,
}: {
  title: string;
  open: boolean;
  onToggle(): void;
  fill?: boolean;
  children: ReactNode;
}) {
  const id = useId(),
    heading = useRef<HTMLButtonElement>(null);
  const toggle = useSidebarControl(
    heading,
    "toggle-sidebar-section",
    id,
    ["Bookmarks", "Chats", "Tabs"].includes(title) &&
      ["normal", "private"].includes(bridge.windowKind) &&
      (!bridge.privateMode || title === "Tabs"),
    title,
    () => true,
    onToggle,
    "The original sidebar section changed.",
  );
  return (
    <section className={`sidebar-section ${fill ? "fill" : ""}`} aria-label={title}>
      <button
        ref={heading}
        className="sidebar-section-heading"
        aria-expanded={open}
        aria-controls={id}
        data-command-id="toggle-sidebar-section"
        onClick={toggle}
      >
        <span>{title}</span>
        <span className="sidebar-section-chevron" {...auxNativeAriaHiddenProps}>
          {shellIconDown}
        </span>
      </button>
      <div id={id} className={`sidebar-section-body ${open ? "open" : ""}`} inert={!open} aria-hidden={!open}>
        <div className="sidebar-section-inner">{children}</div>
      </div>
    </section>
  );
}
