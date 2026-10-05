import { useId, useMemo, type ButtonHTMLAttributes } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { useStore } from "../store";
import { PreferenceAction } from "../settings/sections/preference-command";
import { useCommittedConversationOwner } from "./conversation-control-construction";

type LiveCommand = "select-conversation-answer" | "select-conversation-steer" | "select-conversation-queue" | "reload-conversation-request";

/** Local mode choices retain the displayed run and typed durable request. */
export function useConversationLiveOwner(current: () => boolean, chatId: string | null | undefined, run: Run | undefined, request: Suspension | null) {
  const runId = run?.runId, status = run?.status, statusMessage = run?.statusMessage;
  const requestId = request?.suspensionId, requestKind = request?.kind, requestState = request?.state;
  const identity = useMemo(() => ({ current, chatId, runId, status, statusMessage, request, requestId, requestKind, requestState }),
    [current, chatId, runId, status, statusMessage, request, requestId, requestKind, requestState]);
  return useCommittedConversationOwner(identity, () => {
    const latest = useStore.getState().runs.filter(value => (value.config?.chatId ?? value.runId) === chatId)
      .sort((a, b) => a.createdAt - b.createdAt).at(-1);
    return (current() && latest?.runId === runId && latest?.status === status && latest?.statusMessage === statusMessage &&
        request?.suspensionId === requestId && request?.kind === requestKind && request?.state === requestState);
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
