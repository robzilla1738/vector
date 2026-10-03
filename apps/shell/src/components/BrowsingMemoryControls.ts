import { useCallback, useRef, type SyntheticEvent } from "react";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { errToast } from "../store";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";

export const BROWSING_MEMORY_COMMANDS = [
  "toggle-browsing-memory",
  "set-browsing-memory-retention",
  "toggle-browsing-memory-pages",
  "toggle-browsing-memory-actions",
  "select-browsing-memory-page",
  "open-browsing-memory-page",
  "forget-browsing-memory-page",
  "close-browsing-memory-detail",
  "prepare-forget-browsing-memory",
  "confirm-forget-browsing-memory",
  "cancel-forget-browsing-memory",
  "retry-browsing-memory-load",
] as const;
type Command = (typeof BROWSING_MEMORY_COMMANDS)[number];
/** Callback refs publish only the actual committed original control, including portal items. */
export function useBrowsingMemoryControl(
  command: Command,
  scopeId: string,
  invoke: (element: HTMLElement) => unknown,
) {
  const retire = useRef<(() => void) | undefined>(undefined);
  const attach = useCallback(
    (element: HTMLElement | null) => {
      retire.current?.();
      retire.current = undefined;
      if (!element) return;
      let active = true,
        used = false;
      const unregister = registerScopedControl(element, command, scopeId, () => {
        if (!active || bridge.privateMode || (command === "retry-browsing-memory-load" && used))
          throw new Error("Choose the current browsing memory control.");
        used = true;
        return invoke(element);
      });
      retire.current = () => {
        active = false;
        unregister();
      };
    },
    [command, scopeId, invoke],
  );
  const run = useCallback(
    (event?: SyntheticEvent) => {
      if (!event) throw new Error("Choose the original browsing memory control.");
      const completion=executeCommand(command, { nativeInputEvent: event.nativeEvent });
      void completion.catch(reason=>reportCommandCompletionFailure(completion,reason,errToast));
    },
    [command],
  );
  return [attach, run] as const;
}
