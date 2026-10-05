import { useMemo } from "react";
import type { RunMessage } from "@aux/contracts";
import { useCommittedConversationOwner, useCurrentConversationCommand } from "./conversation-control-construction";
import { errToast } from "../store";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";

export function ConversationQueuedControls({ message, current, disabled, onCancel }: {
  message: RunMessage; current(): boolean; disabled?: boolean;
  onCancel(message: RunMessage, edit: boolean, current: () => boolean): unknown;
}) {
  const identity = useMemo(() => ({ message, current, snapshot: JSON.stringify(message) }), [message, current]);
  const delivering = useCommittedConversationOwner(identity, () => {
    return (current() && JSON.stringify(message) === identity.snapshot);
  }, [identity, current, message]);
  return <><QueuedAction edit message={message} current={delivering} disabled={disabled} onCancel={onCancel}/><QueuedAction edit={false} message={message} current={delivering} disabled={disabled} onCancel={onCancel}/></>;
}
function QueuedAction({ edit, message, current, disabled, onCancel }: {
  edit: boolean; message: RunMessage; current(): boolean; disabled?: boolean;
  onCancel(message: RunMessage, edit: boolean, current: () => boolean): unknown;
}) {
  const command = edit ? "edit-conversation-queued-message" : "remove-conversation-queued-message";
  const [controlRef, run] = useCurrentConversationCommand<HTMLButtonElement>(command, current, () => onCancel(message, edit, current), "Choose the current queued conversation message.", false, errToast);
  return <button {...auxNativeButtonTypeProps} ref={controlRef} disabled={disabled} data-command-id={command} onClick={run}>{edit ? "Edit" : "Remove"}</button>;
}
