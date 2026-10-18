import { useId } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { PreferenceAction } from "../settings/sections/preference-command";
import { shellIconOpen } from "../ui/icons";
import { useConversationOwner } from "./ConversationControls";

/** Main-window page reads have no original Quick Ask source admission. */
export function QuickAskPageContext({
  disabled = false,
  onOpenInAux,
}: {
  disabled?: boolean;
  onOpenInAux?(): void;
}) {
  const scopeId = useId();
  const connected = useStore((state) => state.connected);
  const current = useConversationOwner(null, connected);
  return (
    <PreferenceAction
      command="open-quick-ask-browser-context"
      scopeId={scopeId}
      className="context-choice"
      aria-label="Open in Aux for browser tabs and page capture"
      disabled={disabled || !onOpenInAux}
      title="Open in Aux to use browser tabs or capture a page. Your draft and attachments stay with the conversation."
      invoke={() => {
        if (!current() || bridge.windowKind !== "quick-ask" || !onOpenInAux)
          throw new Error("Open the original Quick Ask conversation in Aux.");
        onOpenInAux();
      }}
    >
      {shellIconOpen}
      <span>
        <strong>Open in Aux</strong>
        <small>Use browser tabs and page capture</small>
      </span>
    </PreferenceAction>
  );
}
