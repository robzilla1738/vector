import { useSyncExternalStore } from "react";
import { useStore } from "./store";

export type CommandSurfaceMode = "new-tab" | "edit" | "command";
export interface CommandSurfaceRequest {
  mode: CommandSurfaceMode;
  presentation?: "tab-search";
  seed?: string;
  provider?: "split";
  splitEdge?: "right" | "bottom";
  sequence: number;
}
let current: CommandSurfaceRequest | null = null;
let sequence = 0;
const listeners = new Set<() => void>();
export function openCommandSurface(request: Omit<CommandSurfaceRequest, "sequence">): void {
  current = { ...request, sequence: ++sequence };
  useStore.getState().setOverlay("command-surface");
  for (const listener of listeners) listener();
}
/** Cmd-L keeps an unfinished new tab instead of retargeting its existing page. */
export function refocusNewTabSurface(): boolean {
  if (
    current?.mode !== "new-tab" ||
    current.presentation === "tab-search" ||
    useStore.getState().overlay !== "command-surface"
  )
    return false;
  const input = document.querySelector<HTMLInputElement>(
    `[data-command-surface-sequence="${current.sequence}"] input`,
  );
  input?.focus();
  input?.select();
  return true;
}
export function closeCommandSurface(expectedSequence?: number): void {
  if (expectedSequence !== undefined && current?.sequence !== expectedSequence) return;
  current = null;
  if (useStore.getState().overlay === "command-surface") useStore.getState().setOverlay(null);
  for (const listener of listeners) listener();
}
export function useCommandSurfaceRequest(): CommandSurfaceRequest | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      const off = useStore.subscribe(listener);
      return () => {
        listeners.delete(listener);
        off();
      };
    },
    () => (useStore.getState().overlay === "command-surface" ? current : null),
    () => null,
  );
}
