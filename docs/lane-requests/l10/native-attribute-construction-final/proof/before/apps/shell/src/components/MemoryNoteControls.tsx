import { useMemoryCallbackControl } from "./memory-control-construction";
import { type ButtonHTMLAttributes } from "react";






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
  return useMemoryCallbackControl(command, scopeId, invoke, "Choose the current memory note control.", "Choose the original memory note control.", false);
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
