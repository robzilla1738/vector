import { useCallback, useRef, type SyntheticEvent } from "react";
import { executeCommand } from "./commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "./command-completion";
import { registerScopedControl } from "./scoped-control-commands";
import { errToast } from "./store";
/** The surface supplies the original invocation's policy and completion owner. */
export function useScopedCommandControls(
  scopeId: string,
  capture: (command: string) => (() => boolean) | undefined,
) {
  const registrations = useRef(new Map<string, () => void>());
  const publish = useCallback(
    (key: string, command: string, element: HTMLElement | null, invoke: () => unknown) => {
      registrations.current.get(key)?.();
      registrations.current.delete(key);
      if (element) registrations.current.set(key, registerScopedControl(element, command, scopeId, invoke));
    },
    [scopeId],
  );
  function run(command: string, event: SyntheticEvent) {
    const current = capture(command);
    if (!current) return;
    const completion = guardCommandCompletion(
      executeCommand(command, { nativeInputEvent: event.nativeEvent }),
      current,
    );
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
  }
  return [publish, run] as const;
}
