import { staticIconButtonProps, staticMenuItemProps } from "../../ui/class-props";
import { useRef, useState } from "react";
import { useFeature } from "../../use-feature";
import { useStore } from "../../store";
import { bridge } from "../../bridge";
import { executeCommand } from "../../commands";
import { Menu } from "../../ui/dialog";
import { nativeMenuItemRoleProps } from "../../ui/native-attribute-props";
export function NightRunOverflow({ runId }: { runId: string }) {
  const enabled = useFeature("overnightReview");
  const run = useStore((state) => state.runs.find((run) => run.runId === runId));
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  if (!enabled || bridge.privateMode || !run) return null;
  return (
    <div>
      <button
        ref={trigger}
        {...staticIconButtonProps}
        aria-label="Run actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⋯
      </button>
      {open && (
        <Menu
          className="menu"
          label="Run actions"
          anchor={trigger}
          returnFocus={trigger}
          onClose={() => setOpen(false)}
        >
          <button
            {...staticMenuItemProps}
            {...nativeMenuItemRoleProps}
            onClick={() => {
              setOpen(false);
              void executeCommand("queue-for-tonight");
            }}
          >
            Queue for tonight
          </button>
        </Menu>
      )}
    </div>
  );
}
