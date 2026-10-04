import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ButtonHTMLAttributes } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { useStore } from "../store";
import { PreferenceAction } from "../settings/sections/preference-command";

type LiveCommand = "select-conversation-answer" | "select-conversation-steer" | "select-conversation-queue" | "reload-conversation-request";

/** Local mode choices retain the displayed run and typed durable request. */
export function useConversationLiveOwner(current: () => boolean, chatId: string | null | undefined, run: Run | undefined, request: Suspension | null) {
  const runId = run?.runId, status = run?.status, statusMessage = run?.statusMessage;
  const requestId = request?.suspensionId, requestKind = request?.kind, requestState = request?.state;
  const identity = useMemo(() => ({ current, chatId, runId, status, statusMessage, request, requestId, requestKind, requestState }),
    [current, chatId, runId, status, statusMessage, request, requestId, requestKind, requestState]);
  const committed = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity }; committed.current = original;
    return () => { original.active = false; };
  }, [identity]);
  return useCallback(() => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    const latest = useStore.getState().runs.filter(value => (value.config?.chatId ?? value.runId) === chatId)
      .sort((a, b) => a.createdAt - b.createdAt).at(-1);
    if (current() && latest?.runId === runId && latest?.status === status && latest?.statusMessage === statusMessage &&
        request?.suspensionId === requestId && request?.kind === requestKind && request?.state === requestState) return true;
    original.active = false;
    return false;
  }, [identity, current, chatId, runId, status, statusMessage, request, requestId, requestKind, requestState]);
}

export function ConversationLiveAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: LiveCommand; current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  return <PreferenceAction {...props} type="button" command={command} scopeId={scopeId} invoke={() => {
    if (!current()) throw new Error("Choose the current conversation request or mode.");
    return invoke();
  }} />;
}
