import { runCommand } from "../commands";
import { shellIconSidebarOpen } from "../ui/icons";
import "./SidebarReveal.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

export interface SidebarRevealProps {
  minimal: boolean;
  horizontal: boolean;
  hidden: boolean;
  toolbarHidden: boolean;
  peek: boolean;
}

export function SidebarReveal({ minimal, horizontal, hidden, toolbarHidden, peek }: SidebarRevealProps) {
  if (minimal || horizontal || !hidden || !toolbarHidden || peek) return null;
  return (
    <button
      {...auxNativeButtonTypeProps}
      className="sidebar-reveal-button icon-btn"
      aria-label="Show sidebar"
      aria-expanded={false}
      title="Show sidebar"
      data-command-id="sidebar"
      onClick={() => runCommand("sidebar")}
    >
      {shellIconSidebarOpen}
    </button>
  );
}
