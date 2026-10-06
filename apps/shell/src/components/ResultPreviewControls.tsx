import { useCallback, useId, type ButtonHTMLAttributes } from "react";
import { useScopedCommandControls } from "../scoped-command-controls";
import { dispatchScopedControlInput } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";
import { errToast } from "../store";
export type ResultCommand =
  | "close-generated-result-preview"
  | "toggle-generated-result-source"
  | "export-generated-result"
  | "select-generated-result-version"
  | "save-generated-result-version"
  | "close-saved-result-preview"
  | "toggle-saved-result-source"
  | "copy-saved-result"
  | "toggle-saved-result-export"
  | "export-saved-result"
  | "export-saved-result-excel"
  | "retry-saved-result-read"
  | "discard-saved-result-edits"
  | "save-saved-result-version"
  | "attach-saved-result-copy";
export function useResultPreviewCommand(
  command: ResultCommand,
  current: () => boolean,
  invoke: (element: HTMLButtonElement, event?: Event) => unknown,
  report = true,
) {
  const scope = useId();
  const [publish] = useScopedCommandControls(scope, () => current);
  const ref = useCallback(
    (element: HTMLButtonElement | null) =>
      publish(command, command, element, () =>
        current() && element
          ? invoke(element)
          : guardCommandCompletion(Promise.reject(new Error("Choose the original result preview.")), current),
      ),
    [publish, command, current, invoke],
  );
  const run = (event: { nativeEvent: Event }) =>
    dispatchScopedControlInput(command, scope, event.nativeEvent, (error) => {
      if (report && current()) errToast(error);
    });
  return [ref, run] as const;
}
export function ResultPreviewControl({
  command,
  current,
  invoke,
  report = true,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: ResultCommand;
  current(): boolean;
  invoke(): unknown;
  report?: boolean;
}) {
  const [ref, run] = useResultPreviewCommand(command, current, invoke, report);
  return <button {...props} ref={ref} data-command-id={command} onClick={run} />;
}
