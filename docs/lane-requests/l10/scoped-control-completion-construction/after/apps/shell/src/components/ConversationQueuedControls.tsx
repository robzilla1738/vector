import { useCallback, useId, useLayoutEffect, useMemo, useRef } from "react";
import type { RunMessage } from "@aux/contracts";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { errToast } from "../store";

export function ConversationQueuedControls({ message, current, disabled, onCancel }: {
  message: RunMessage; current(): boolean; disabled?: boolean;
  onCancel(message: RunMessage, edit: boolean, current: () => boolean): unknown;
}) {
  const identity = useMemo(() => ({ message, current, snapshot: JSON.stringify(message) }), [message, current]);
  const committed = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity }; committed.current = original;
    return () => { original.active = false; };
  }, [identity]);
  const delivering = useCallback(() => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    if (current() && JSON.stringify(message) === identity.snapshot) return true;
    original.active = false; return false;
  }, [identity, current, message]);
  return <><QueuedAction edit message={message} current={delivering} disabled={disabled} onCancel={onCancel}/><QueuedAction edit={false} message={message} current={delivering} disabled={disabled} onCancel={onCancel}/></>;
}
function QueuedAction({ edit, message, current, disabled, onCancel }: {
  edit: boolean; message: RunMessage; current(): boolean; disabled?: boolean;
  onCancel(message: RunMessage, edit: boolean, current: () => boolean): unknown;
}) {
  const scopeId = useId();
  const command = edit ? "edit-conversation-queued-message" : "remove-conversation-queued-message";
  const [controlRef, run] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current queued conversation message.");
    return onCancel(message, edit, current);
  }, errToast);
  return <button type="button" ref={controlRef} disabled={disabled} data-command-id={command} onClick={run}>{edit ? "Edit" : "Remove"}</button>;
}
