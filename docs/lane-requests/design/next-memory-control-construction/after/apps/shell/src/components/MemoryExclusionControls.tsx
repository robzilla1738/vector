import { useMemoryCallbackControl } from "./memory-control-construction";
import { type ButtonHTMLAttributes } from "react";





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
  return useMemoryCallbackControl(command, scopeId, invoke, "Choose the current exclusion control.", undefined, false);
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
