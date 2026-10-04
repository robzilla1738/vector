import { useMemoryCallbackControl } from "./memory-control-construction";
import { type ButtonHTMLAttributes } from "react";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";





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
  return <button {...auxNativeButtonTypeProps} {...props} ref={attach} onClick={run} />;
}
