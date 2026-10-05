import { type ButtonHTMLAttributes } from "react";
import { useCurrentConversationCommand } from "./conversation-control-construction";
import { errToast } from "../store";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";

export function ConversationViewAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "export-conversation-markdown" | "continue-conversation-in-rail" | "toggle-conversation-browser-preview" | "jump-conversation-to-latest";
  current(): boolean; invoke(): unknown;
}) {
  const [controlRef, run] = useCurrentConversationCommand<HTMLButtonElement>(command, current, () => invoke(), "Choose the current conversation view control.", false, errToast);
  return <button {...props} {...auxNativeButtonTypeProps} ref={controlRef} data-command-id={command} onClick={run}/>;
}
