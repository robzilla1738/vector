import { useCallback, useId, useLayoutEffect, useRef } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";

/** Both visible controls retain the original Popover opener; no page authority is inferred. */
export function useConversationContextControls(current: () => boolean) {
  const triggerScope = useId(), summaryScope = useId();
  const target = useRef<{ node: HTMLButtonElement; activate(): void } | null>(null);
  const committed = useRef<{ active: boolean; target: typeof target.current } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, target: target.current }; committed.current = original;
    return () => { original.active = false; };
  });
  const toggle = () => {
    const original = committed.current, opener = original?.target;
    if (!current() || !original?.active || !opener || target.current !== opener || !opener.node.isConnected || opener.node.disabled || opener.node.getAttribute("aria-disabled") === "true" || opener.node.closest('[hidden], [inert], [aria-hidden="true"]') || !opener.node.getClientRects().length)
      throw new Error("Choose the original conversation context control.");
    opener.activate();
  };
  const [triggerRef, onTrigger] = usePreferenceCommand<HTMLButtonElement>("toggle-conversation-context", triggerScope, toggle);
  const [summaryRef, onSummary] = usePreferenceCommand<HTMLButtonElement>("toggle-conversation-context", summaryScope, toggle);
  const triggerControl = useCallback((node: HTMLButtonElement | null, activate: () => void) => {
    triggerRef(node);
    const previous = target.current;
    target.current = node ? previous?.node === node && previous.activate === activate ? previous : { node, activate } : null;
  }, [triggerRef]);
  return { triggerControl, onTrigger, summaryRef, onSummary };
}
