import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { executeCommand } from "../commands";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
import { bridge } from "../bridge";
import { errToast } from "../store";

/** Construction only: callers retain their original admission and delivery policy. */
export function memoryControlElement(
  kind: "button" | "summary" | "input" | "select",
  props: Record<string, unknown>,
  children?: ReactNode,
) {
  return kind === "input" ? createElement(kind, props) : createElement(kind, props, children);
}
export function useMemoryElementControl(
  command: string,
  scopeId: string,
  action: (element: HTMLElement) => unknown,
  report: (reason: unknown) => void,
  summary = false,
  guarded = true,
) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const original = ref.current;
    if (original) return registerScopedControl(original, command, scopeId, () => action(original));
  });
  const attach = (node: HTMLElement | null) => {
    ref.current = node;
  };
  const run = (event: SyntheticEvent) => {
    if (summary) event.preventDefault();
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch((reason) =>
      guarded ? reportCommandCompletionFailure(completion, reason, report) : report(reason),
    );
  };
  return [attach, run] as const;
}
export function useMemoryCallbackControl(
  command: string,
  scopeId: string,
  invoke: (element: HTMLElement) => unknown,
  currentError: string,
  originalError?: string,
  oneUse = false,
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
        if (!active || bridge.privateMode || (oneUse && used)) throw new Error(currentError);
        used = true;
        return invoke(element);
      });
      retire.current = () => {
        active = false;
        unregister();
      };
    },
    [command, scopeId, invoke, currentError, oneUse],
  );
  const run = useCallback(
    (event?: SyntheticEvent) => {
      if (!event && originalError) throw new Error(originalError);
      const completion = executeCommand(command, { nativeInputEvent: event!.nativeEvent });
      void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
    },
    [command, originalError],
  );
  return [attach, run] as const;
}
