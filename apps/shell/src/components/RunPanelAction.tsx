import {
  useId,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type DetailsHTMLAttributes,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import type { Run } from "@aux/contracts";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
import { errToast, useStore } from "../store";

/** Captures the original visible turn and window, while the surface owns its action policy. */
export function useRunPanelCommand<E extends HTMLElement>(
  command: string,
  run: Run,
  invoke: (current: () => boolean, originalEvent?: Event) => unknown,
  identity: object = run,
  valid: () => boolean = () => true,
) {
  const scopeId = useId(),
    element = useRef<E>(null);
  const action = useRef(invoke),
    validity = useRef(valid);
  useLayoutEffect(() => {
    action.current = invoke;
    validity.current = valid;
  }, [invoke, valid]);
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  useLayoutEffect(() => {
    const original = element.current;
    if (!original) return;
    let live = true;
    const current = () =>
      live &&
      validity.current() &&
      element.current === original &&
      original.isConnected &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode &&
      bridge.windowKind === kind &&
      useStore.getState().runs.find((item) => item.runId === run.runId) === run;
    const remove = registerScopedControl(original, command, scopeId, (originalEvent) => {
      if (!current()) throw new Error("Choose this turn’s current control.");
      return guardCommandCompletion(Promise.resolve(action.current(current, originalEvent)), current);
    });
    return () => {
      live = false;
      remove();
    };
  }, [command, scopeId, run, identity, windowId, privateMode, kind]);
  const dispatch = (event: SyntheticEvent<E>) => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, errToast));
  };
  return [element, dispatch] as const;
}
export function RunPanelAction({
  command,
  run,
  invoke,
  identity,
  valid,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: string;
  run: Run;
  invoke(current: () => boolean, originalEvent?: Event): unknown;
  identity?: object;
  valid?: () => boolean;
}) {
  const [element, dispatch] = useRunPanelCommand<HTMLButtonElement>(command, run, invoke, identity, valid);
  return <button {...props} ref={element} data-command-id={command} onClick={dispatch} />;
}
export function RunPanelDisclosure({
  command,
  run,
  summary,
  children,
  ...props
}: DetailsHTMLAttributes<HTMLDetailsElement> & {
  command: string;
  run: Run;
  summary: ReactNode;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const [element, dispatch] = useRunPanelCommand<HTMLElement>(command, run, () => {
    if (details.current) details.current.open = !details.current.open;
  });
  return (
    <details {...props} ref={details}>
      <summary
        ref={element}
        data-command-id={command}
        onClick={(event) => {
          event.preventDefault();
          dispatch(event);
        }}
      >
        {summary}
      </summary>
      {children}
    </details>
  );
}
