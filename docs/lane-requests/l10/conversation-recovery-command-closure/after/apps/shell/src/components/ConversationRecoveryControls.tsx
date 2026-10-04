import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { executeCommand } from "../commands";
import { reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";

export function ConversationRecoveryAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "restore-archived-conversation" | "reopen-conversation-page";
  current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  const [controlRef] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current conversation recovery control.");
    return invoke();
  });
  return <button {...props} type="button" className="btn sm" ref={controlRef} data-command-id={command} onClick={event => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch(reason => reportCommandCompletionFailure(completion, reason, errToast));
  }}/>;
}
