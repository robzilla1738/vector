import { useId, type ButtonHTMLAttributes } from "react";
import { usePreferenceCommand, dispatchScopedControlInput } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
import { errToast } from "../store";
type DocumentCommand =
  | "previous-document-section"
  | "next-document-section"
  | "retry-conversation-document-read"
  | "toggle-conversation-document-details"
  | "close-conversation-document-preview";
export function DocumentSnapshotControl({
  command,
  current,
  invoke,
  summary,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: DocumentCommand;
  current(): boolean;
  invoke(): unknown;
  summary?: boolean;
}) {
  const scope = useId();
  const [ref] = usePreferenceCommand<HTMLElement>(command, scope, (element, event) => {
    if (!current())
      return guardCommandCompletion(
        Promise.reject(new Error("Choose the original document snapshot.")),
        current,
      );
    if (summary) {
      const details = element.parentElement;
      if (!(details instanceof HTMLDetailsElement) || details.firstElementChild !== element)
        throw new Error("Choose the original snapshot disclosure.");
      event?.preventDefault();
      details.open = !details.open;
      return;
    }
    return invoke();
  });
  const run = (event: { nativeEvent: Event }) => {
    if (summary) event.nativeEvent.preventDefault();
    dispatchScopedControlInput(command, scope, event.nativeEvent, (error) => {
      if (current()) errToast(error);
    });
  };
  return summary ? (
    <summary ref={ref} data-command-id={command} onClick={run}>
      {props.children}
    </summary>
  ) : (
    <button {...props} ref={ref} data-command-id={command} onClick={run} />
  );
}
