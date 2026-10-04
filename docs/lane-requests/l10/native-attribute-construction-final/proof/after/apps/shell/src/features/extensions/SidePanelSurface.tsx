import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../../ui/native-attribute-props";
import { staticIconButtonProps } from "../../ui/class-props";
import { useStore as useBoundStore } from "zustand";
import { runCommand } from "../../commands";
import { shellIconClose } from "../../components/icons";
import { extensionPanel } from "./extension-panel";
import "./extensions.css";

export function SidePanelSurface() {
  const panel = useBoundStore(extensionPanel, (state) => state.panel);
  if (!panel?.contentId || !panel.open) return null;
  return (
    <div className="rail-inner extension-side-panel">
      <header className="rail-head">
        <span className="rail-title">{panel.title}</span>
        <span className="sp" />
        <button
          {...auxNativeButtonTypeProps}
          {...staticIconButtonProps}
          aria-label={`Close ${panel.title} side panel`}
          data-command-id="close-extension-panel"
          onClick={() => runCommand("close-extension-panel")}
        >
          {shellIconClose}
        </button>
      </header>
      <div className="rail-body">
        <embed
          key={panel.contentId}
          className="extension-panel-surface"
          type="application/x-chromium-surface-embed"
          data-content-id={panel.contentId}
          aria-label={`${panel.title} side panel`}
        />
      </div>
    </div>
  );
}
