import { smallButtonProps as auxReserveSmallButtonProps } from "../ui/button-props";
import { type ButtonHTMLAttributes } from "react";
import { useCurrentConversationCommand } from "./conversation-control-construction";
import { errToast } from "../store";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";

export function ConversationRecoveryAction({
  command,
  current,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "restore-archived-conversation" | "reopen-conversation-page";
  current(): boolean;
  invoke(): unknown;
}) {
  const [controlRef, run] = useCurrentConversationCommand<HTMLButtonElement>(
    command,
    current,
    () => invoke(),
    "Choose the current conversation recovery control.",
    false,
    errToast,
  );
  return (
    <button
      {...props}
      {...auxNativeButtonTypeProps}
      {...auxReserveSmallButtonProps}
      ref={controlRef}
      data-command-id={command}
      onClick={run}
    />
  );
}
