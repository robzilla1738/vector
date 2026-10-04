import {
  smallButtonProps as auxReserveSmallButtonProps,
} from "../ui/button-props";
import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { errToast } from "../store";

export function ConversationRecoveryAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "restore-archived-conversation" | "reopen-conversation-page";
  current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  const [controlRef, run] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current conversation recovery control.");
    return invoke();
  }, errToast);
  return <button {...props} type="button" {...auxReserveSmallButtonProps} ref={controlRef} data-command-id={command} onClick={run}/>;
}
