import { useCallback, useLayoutEffect, useRef, type ButtonHTMLAttributes, type SyntheticEvent } from "react";
import { executeCommand } from "../../commands";
import { reportCommandCompletionFailure } from "../../command-completion";
import { registerScopedControl } from "../../scoped-control-commands";
/** Original input/form ownership; each surface retains its actual native policy. */
export function usePreferenceCommand<E extends HTMLElement>(
  command: string,
  scopeId: string,
  invoke: (original: E, originalEvent?: Event) => unknown,
) {
  const element = useRef<E>(null);
  useLayoutEffect(() => {
    const original = element.current;
    if (!original) return;
    return registerScopedControl(original, command, scopeId, (originalEvent) => {
      if (element.current !== original) throw new Error("Choose the original preference control.");
      return invoke(original, originalEvent);
    });
  }, [command, scopeId, invoke]);
  const controlRef = useCallback((node: E | null) => {
    element.current = node;
  }, []);
  const run = (event: SyntheticEvent<E>) => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, () => {}));
  };
  return [controlRef, run] as const;
}
export function PreferenceAction({
  command,
  scopeId,
  invoke,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: string;
  scopeId: string;
  invoke(): unknown;
}) {
  const [controlRef, run] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, invoke);
  return <button {...props} ref={controlRef} data-command-id={command} onClick={run} />;
}
