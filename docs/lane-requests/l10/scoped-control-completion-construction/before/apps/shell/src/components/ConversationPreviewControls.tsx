import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ButtonHTMLAttributes, type RefObject } from "react";
import type { PageTarget } from "@aux/contracts";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { executeCommand } from "../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";

export function previewPageIdentity(page: PageTarget | undefined) {
  return page ? JSON.stringify([page.pageId, page.targetId, page.backend, page.windowKind, page.url, page.documentEpoch, page.sessionId, page.windowId, page.controller, page.controllerEpoch, page.ownedByRuntime]) : null;
}
/** Retain the actual selected person document, independently of transient paint/status updates. */
export function useConversationPreviewOwner(current: () => boolean, page: PageTarget | undefined, selection: string, layoutIdentity: string, read: () => PageTarget | undefined) {
  const pageIdentity = previewPageIdentity(page);
  const identity = useMemo(() => [current, pageIdentity, selection, layoutIdentity], [current, pageIdentity, selection, layoutIdentity]);
  const committed = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => { const original = { active: true, identity }; committed.current = original; return () => { original.active = false; }; }, [identity]);
  return useCallback(() => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    if (current() && pageIdentity !== null && previewPageIdentity(read()) === pageIdentity) return true;
    original.active = false; return false;
  }, [identity, current, pageIdentity, read]);
}
export function ConversationPreviewAction({ command, current, invoke, controlRef, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "toggle-conversation-preview-menu" | "activate-conversation-preview-page" | "split-conversation-preview-page";
  current(): boolean; invoke(): unknown; controlRef?: RefObject<HTMLButtonElement | null>;
}) {
  const scopeId = useId();
  const [ref] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) return guardCommandCompletion(Promise.reject(new Error("Choose the current conversation preview page.")), current);
    return invoke();
  });
  const originalRef = useCallback((node: HTMLButtonElement | null) => { ref(node); if (controlRef) controlRef.current = node; }, [ref, controlRef]);
  return <button {...props} type="button" ref={originalRef} data-command-id={command} onClick={event => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch(reason => reportCommandCompletionFailure(completion, reason, original => { if (current()) errToast(original); }));
  }}/>;
}
