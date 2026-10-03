import { useCallback, useRef, type SyntheticEvent, type ButtonHTMLAttributes } from "react";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { errToast } from "../store";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
export const MEMORY_EXCLUSION_COMMANDS = [
  "toggle-memory-exclusions",
  "exclude-memory-site",
  "allow-memory-site",
  "reload-memory-exclusions",
] as const;
type Command = (typeof MEMORY_EXCLUSION_COMMANDS)[number];
export function useMemoryExclusionControl(
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
      let active = true;
      const unregister = registerScopedControl(element, command, scopeId, () => {
        if (!active || bridge.privateMode) throw new Error("Choose the current exclusion control.");
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
    (event: SyntheticEvent) => {
      const completion = executeCommand(command, { nativeInputEvent: event.nativeEvent });
      void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
    },
    [command],
  );
  return [attach, run] as const;
}
export function MemoryExclusionButton({
  command,
  scopeId,
  invoke,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  command: Command;
  scopeId: string;
  invoke(element: HTMLElement): unknown;
}) {
  const [attach, run] = useMemoryExclusionControl(command, scopeId, invoke);
  return <button type="button" {...props} ref={attach} onClick={run} />;
}
