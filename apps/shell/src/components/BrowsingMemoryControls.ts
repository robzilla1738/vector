import { useMemoryCallbackControl } from "./memory-control-construction";







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
  return useMemoryCallbackControl(command, scopeId, invoke, "Choose the current browsing memory control.", "Choose the original browsing memory control.", command === "retry-browsing-memory-load");
}
