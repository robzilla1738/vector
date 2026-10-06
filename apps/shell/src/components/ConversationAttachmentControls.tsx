import { useMemo, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import {
  useCommittedConversationOwner,
  useCurrentConversationCommand,
} from "./conversation-control-construction";
import { errToast } from "../store";
import { nativeCheckboxTypeProps as auxReuseNativeCheckboxTypeProps } from "../ui/native-attribute-props";

type AttachmentCommand =
  | "preview-conversation-document"
  | "toggle-conversation-document"
  | "remove-conversation-document"
  | "preview-conversation-result"
  | "toggle-conversation-result";
export function useConversationAttachmentOwner(current: () => boolean, records: object[]) {
  const snapshot = JSON.stringify(records);
  const identity = useMemo(
    () => ({
      current,
      records: new Set((JSON.parse(snapshot) as object[]).map((value) => JSON.stringify(value))),
    }),
    [snapshot, current],
  );
  return useCommittedConversationOwner(
    identity,
    (record: object) => {
      return identity.current() && identity.records.has(JSON.stringify(record));
    },
    [current, identity],
  );
}
function useAttachmentControl<T extends HTMLButtonElement | HTMLInputElement>(
  command: AttachmentCommand,
  current: () => boolean,
  invoke: (element: T, event?: Event) => unknown,
) {
  return useCurrentConversationCommand<T>(
    command,
    current,
    invoke,
    "Choose the original conversation attachment.",
    true,
    (error) => {
      if (current()) errToast(error);
    },
  );
}
export function ConversationAttachmentAction({
  command,
  current,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: AttachmentCommand;
  current(): boolean;
  invoke(): unknown;
}) {
  const [ref, run] = useAttachmentControl<HTMLButtonElement>(command, current, invoke);
  return <button {...props} ref={ref} data-command-id={command} onClick={run} />;
}
export function ConversationAttachmentChoice({
  command,
  current,
  invoke,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  command: "toggle-conversation-document" | "toggle-conversation-result";
  current(): boolean;
  invoke(included: boolean): unknown;
}) {
  const [ref, run] = useAttachmentControl<HTMLInputElement>(command, current, (element, event) =>
    invoke(event?.type === "click" || event?.type === "change" ? element.checked : !element.checked),
  );
  return (
    <input
      {...props}
      {...auxReuseNativeCheckboxTypeProps}
      ref={ref}
      data-command-id={command}
      onChange={run}
    />
  );
}
