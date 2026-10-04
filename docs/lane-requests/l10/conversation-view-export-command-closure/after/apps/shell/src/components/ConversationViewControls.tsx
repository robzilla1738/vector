import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { executeCommand } from "../commands";
import { reportCommandCompletionFailure } from "../command-completion";
import { errToast } from "../store";

export function ConversationViewAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: "export-conversation-markdown" | "continue-conversation-in-rail" | "toggle-conversation-browser-preview" | "jump-conversation-to-latest";
  current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  const [controlRef] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current conversation view control.");
    return invoke();
  });
  return <button {...props} type="button" ref={controlRef} data-command-id={command} onClick={event => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch(reason => reportCommandCompletionFailure(completion, reason, errToast));
  }}/>;
}
