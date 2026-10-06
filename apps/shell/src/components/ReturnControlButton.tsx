import { bridge } from "../bridge";
import { runCommand } from "../commands";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";
import { shellIconHandSm } from "../ui/icons";

export function ReturnControlButton({ pageId, compact = false }: { pageId: string; compact?: boolean }) {
  const key = useShortcutLabels();
  if (bridge.windowKind !== "normal") return null;
  return (
    <button
      className={compact ? "icon-btn" : "ctl-chip human"}
      aria-label="Return control to agent"
      title={withShortcut("Return control to agent", key("return-agent-control"))}
      data-command-id="return-agent-control"
      onClick={() => runCommand("return-agent-control", { payload: { pageId } })}
    >
      {shellIconHandSm}
      {!compact && (
        <>
          <span className="ctl-chip-label">You're in control</span>
          <span className="ctl-return">Return</span>
        </>
      )}
    </button>
  );
}
