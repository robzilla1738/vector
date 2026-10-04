import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { errToast } from "../store";

export function ConversationViewAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "export-conversation-markdown" | "continue-conversation-in-rail" | "toggle-conversation-browser-preview" | "jump-conversation-to-latest";
  current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  const [controlRef, run] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current conversation view control.");
    return invoke();
  }, errToast);
  return <button {...props} {...auxNativeButtonTypeProps} ref={controlRef} data-command-id={command} onClick={run}/>;
}
