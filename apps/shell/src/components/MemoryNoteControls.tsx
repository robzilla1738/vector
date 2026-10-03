import { useCallback, useRef, type SyntheticEvent, type ButtonHTMLAttributes } from "react";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { errToast } from "../store";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";

export const MEMORY_NOTE_COMMANDS = [
  "add-memory-note",
  "filter-memory-notes",
  "select-memory-note",
  "toggle-memory-note-use",
  "toggle-memory-note-actions",
  "edit-memory-note",
  "delete-memory-note",
  "close-memory-note-detail",
  "save-memory-note",
  "discard-memory-note-draft",
  "load-latest-memory-notes",
  "save-memory-note-against-latest",
] as const;
type Command = (typeof MEMORY_NOTE_COMMANDS)[number];
/** Callback refs publish only the actual committed original control, including portal items. */
export function useMemoryNoteControl(
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
        if (!active || bridge.privateMode) throw new Error("Choose the current memory note control.");
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
      if (!event) throw new Error("Choose the original memory note control.");
      const completion = executeCommand(command, { nativeInputEvent: event.nativeEvent });
      void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
    },
    [command],
  );
  return [attach, run] as const;
}

export function MemoryNoteButton({
  command,
  scopeId,
  invoke,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  command: Command;
  scopeId: string;
  invoke(element: HTMLElement): unknown;
}) {
  const [attach, run] = useMemoryNoteControl(command, scopeId, invoke);
  return <button type="button" {...props} ref={attach} onClick={run} />;
}
