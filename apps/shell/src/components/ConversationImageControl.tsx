import { useId, type ButtonHTMLAttributes, type RefObject } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
export function ConversationImageAction({ command, current, invoke, originalRef, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: string; current(): boolean; invoke(original: HTMLButtonElement): unknown; originalRef?: RefObject<HTMLButtonElement | null>;
}) {
  const scope = useId();
  const [publish, run] = usePreferenceCommand<HTMLButtonElement>(command, scope, original => {
    if (!current()) throw new Error("Choose the current image control.");
    return invoke(original);
  });
  return <button {...props} data-command-id={command} ref={original => { publish(original); if (originalRef) originalRef.current = original; }} onClick={run} />;
}
export function ConversationImageChoice({ id, checked, disabled, current, invoke }: {
  id: string; checked: boolean; disabled: boolean; current(): boolean; invoke(included: boolean): unknown;
}) {
  const scope = useId();
  const [publish, run] = usePreferenceCommand<HTMLInputElement>("toggle-conversation-image", scope, (original, event) => {
    if (!current()) throw new Error("Choose the current image choice.");
    return invoke(event?.type === "click" || event?.type === "change" ? original.checked : !original.checked);
  });
  return <input id={id} type="checkbox" checked={checked} disabled={disabled} ref={publish} data-command-id="toggle-conversation-image" onChange={run} />;
}
