import { useLayoutEffect, useRef, type ButtonHTMLAttributes } from "react";
import { bridge } from "../bridge";
import { errToast } from "../store";
import { executeCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";

export function MemorySettingsControl({
  command,
  scopeId,
  invoke,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  command: "select-memory-space" | "retry-memory-search" | "retry-memory-load";
  scopeId: string;
  invoke(): unknown;
}) {
  const element = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    let active = true,
      used = false;
    const retire = registerScopedControl(element.current!, command, scopeId, () => {
      if (!active || bridge.privateMode || (command !== "select-memory-space" && used))
        throw new Error("The memory control changed. Choose its current control.");
      used = true;
      return invoke();
    });
    return () => {
      active = false;
      retire();
    };
  });
  return (
    <button
      type="button"
      {...props}
      ref={element}
      data-command-id={command}
      onClick={(event) => {
        void executeCommand(command, { nativeInputEvent: event.nativeEvent }).catch(errToast);
      }}
    />
  );
}
