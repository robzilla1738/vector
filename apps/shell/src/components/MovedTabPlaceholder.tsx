import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../store";
import { runCommand } from "../commands";
import { canClaim } from "../tab-window-transfer";
import { movedSelection, observeMovedSelection } from "../features/window-sync/moved-selection";
import "./MovedTabPlaceholder.css";
import {
  staticButtonProps as auxClassButtonProps,
  staticGhostButtonProps as auxClassGhostButtonProps,
} from "../ui/class-props";
import { nativePoliteLiveProps } from "../ui/native-attribute-props";

export function MovedTabPlaceholder() {
  const moved = useSyncExternalStore(observeMovedSelection, movedSelection);
  const page = useStore((state) => state.pages.find((item) => item.pageId === moved?.pageId));
  const stage = document.querySelector(".stage-wrap");
  if (!moved || !page || !stage) return null;
  const working = !canClaim(page);
  return createPortal(
    <section className="moved-tab-placeholder" {...nativePoliteLiveProps}>
      <div className="empty-state">
        <strong>
          {working
            ? `Aux is working in this tab in Window ${moved.windowId}`
            : `This tab moved to Window ${moved.windowId}`}
        </strong>
        <p>
          {working
            ? "Show its window to follow along. Take control there before moving this tab."
            : "Your page, history and media are still together. Bring the tab here to continue."}
        </p>
        <div className="moved-tab-actions">
          {!working && (
            <button
              {...auxClassButtonProps}
              data-command-id="claim-tab"
              onClick={() => runCommand("claim-tab", { payload: { pageId: page.pageId } })}
            >
              Bring it back
            </button>
          )}
          <button
            {...auxClassGhostButtonProps}
            data-command-id="show-tab-window"
            onClick={() => runCommand("show-tab-window", { payload: { pageId: page.pageId } })}
          >
            {working ? "Show window" : `Show Window ${moved.windowId}`}
          </button>
        </div>
      </div>
    </section>,
    stage,
  );
}
