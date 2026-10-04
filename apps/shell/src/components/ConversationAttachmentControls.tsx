import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
import { errToast } from "../store";

type AttachmentCommand = "preview-conversation-document" | "toggle-conversation-document" | "remove-conversation-document" | "preview-conversation-result" | "toggle-conversation-result";
export function useConversationAttachmentOwner(current: () => boolean, records: object[]) {
  const snapshot = JSON.stringify(records);
  const identity = useMemo(() => ({ current, records: new Set((JSON.parse(snapshot) as object[]).map(value => JSON.stringify(value))) }), [snapshot,current]);
  const committed = useRef<{ identity: typeof identity; active: boolean } | null>(null);
  useLayoutEffect(() => { const original = { identity, active: true }; committed.current = original; return () => { original.active = false; }; }, [identity]);
  return useCallback((record: object) => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    if (identity.current() && identity.records.has(JSON.stringify(record))) return true;
    original.active = false; return false;
  }, [current,identity]);
}
function useAttachmentControl<T extends HTMLButtonElement | HTMLInputElement>(command: AttachmentCommand, current: () => boolean, invoke: (element: T,event?: Event) => unknown) {
  const scope = useId();
  const [ref, run] = usePreferenceCommand<T>(command,scope,(element,event) => current() ? invoke(element,event) : guardCommandCompletion(Promise.reject(new Error("Choose the original conversation attachment.")),current), error => { if (current()) errToast(error); });

  return [ref,run] as const;
}
export function ConversationAttachmentAction({command,current,invoke,...props}: Omit<ButtonHTMLAttributes<HTMLButtonElement>,"onClick"> & {command: AttachmentCommand; current(): boolean; invoke(): unknown}) {
  const [ref,run] = useAttachmentControl<HTMLButtonElement>(command,current,invoke);
  return <button {...props} ref={ref} data-command-id={command} onClick={run}/>;
}
export function ConversationAttachmentChoice({command,current,invoke,...props}: Omit<InputHTMLAttributes<HTMLInputElement>,"type"|"onChange"> & {command: "toggle-conversation-document" | "toggle-conversation-result"; current(): boolean; invoke(included:boolean): unknown}) {
  const [ref,run] = useAttachmentControl<HTMLInputElement>(command,current,(element,event) => invoke(event?.type === "click" || event?.type === "change" ? element.checked : !element.checked));
  return <input {...props} type="checkbox" ref={ref} data-command-id={command} onChange={run}/>;
}
