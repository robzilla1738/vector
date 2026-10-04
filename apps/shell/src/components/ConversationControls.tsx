import { useCallback, useId, useLayoutEffect, useMemo, useRef } from "react";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { PreferenceAction, usePreferenceCommand } from "../settings/sections/preference-command";

/** A committed incarnation never becomes current again after navigation or host retirement. */
export function useConversationOwner(chatId: string | null | undefined, connected: boolean) {
  const windowId = bridge.windowId, privateMode = bridge.privateMode, windowKind = bridge.windowKind;
  const identity = useMemo(() => ([chatId, connected, windowId, privateMode, windowKind]), [chatId, connected, windowId, privateMode, windowKind]);
  const owner = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity };
    owner.current = original;
    return () => { original.active = false; };
  }, [identity]);
  return useCallback(() => {
    const original = owner.current;
    if (!!original?.active && original.identity === identity && bridge.windowId === windowId && bridge.privateMode === privateMode &&
        bridge.windowKind === windowKind && useStore.getState().connected === connected) return true;
    if (original?.identity === identity) original.active = false;
    return false;
  }, [identity, windowId, privateMode, windowKind, connected]);
}
export function ConversationAction({ command, current, invoke, disabled, children }: {
  command: "load-conversation-history" | "reload-conversation-context";
  current(): boolean; invoke(): unknown; disabled?: boolean; children: string;
}) {
  const scopeId = useId();
  return <PreferenceAction type="button" className="btn sm" command={command} scopeId={scopeId} disabled={disabled}
    invoke={() => { if (!current()) throw new Error("Choose the current conversation control."); return invoke(); }}>{children}</PreferenceAction>;
}
export function ConversationDetails({ current, text }: { current(): boolean; text: string }) {
  const scopeId = useId();
  const [controlRef, run] = usePreferenceCommand<HTMLElement>("toggle-conversation-error-details", scopeId, (summary, event) => {
    const details = summary.parentElement;
    if (!current() || !(details instanceof HTMLDetailsElement) || details.firstElementChild !== summary)
      throw new Error("Choose the current conversation details.");
    event?.preventDefault();
    details.open = !details.open;
  });
  return <details><summary ref={controlRef} data-command-id="toggle-conversation-error-details" onClick={run}>Details</summary><p>{text}</p></details>;
}
