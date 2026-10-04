import { useCallback, useId, useLayoutEffect, useMemo, useRef, type ButtonHTMLAttributes, type RefObject } from "react";
import { bridge } from "../bridge";
import { useStore, errToast } from "../store";
import { executeCommand } from "../commands";
import { reportCommandCompletionFailure } from "../command-completion";
import { registerScopedControl } from "../scoped-control-commands";
import { usePreferenceCommand } from "../settings/sections/preference-command";

type HomeCommand = "select-home-search" | "select-home-ask" | "open-home-conversation";
export function useHomeEntryOwner(active: boolean) {
  const connected = useStore(state => state.connected);
  const windowId = bridge.windowId, privateMode = bridge.privateMode, windowKind = bridge.windowKind;
  const identity = useMemo(() => ({ active, connected, windowId, privateMode, windowKind }), [active, connected, windowId, privateMode, windowKind]);
  const committed = useRef<{ active: boolean; identity: typeof identity } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity }; committed.current = original;
    return () => { original.active = false; };
  }, [identity]);
  return useCallback(() => {
    const original = committed.current;
    if (original?.active && original.identity === identity && active && !privateMode && windowKind === "normal" &&
        bridge.windowId === windowId && bridge.privateMode === privateMode && bridge.windowKind === windowKind && useStore.getState().connected === connected) return true;
    if (original?.identity === identity) original.active = false;
    return false;
  }, [identity, active, connected, windowId, privateMode, windowKind]);
}
export function runHomeEntry(command: HomeCommand, scopeId: string, event: Event) {
  const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event });
  void completion.catch(reason => reportCommandCompletionFailure(completion, reason, errToast));
}
export function HomeEntryAction({ command, current, invoke, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  command: HomeCommand; current(): boolean; invoke(): unknown;
}) {
  const scopeId = useId();
  const [ref] = usePreferenceCommand<HTMLButtonElement>(command, scopeId, () => {
    if (!current()) throw new Error("Choose the current Home control.");
    return invoke();
  });
  return <button {...props} ref={ref} data-command-id={command} onClick={event => runHomeEntry(command, scopeId, event.nativeEvent)} />;
}
export function useHomeEntryInput(input: RefObject<HTMLInputElement | null>, enabled: boolean, current: () => boolean, invoke: () => unknown) {
  const scopeId = useId();
  useLayoutEffect(() => {
    const original = input.current;
    if (!enabled || !original) return;
    return registerScopedControl(original, "select-home-ask", scopeId, () => {
      if (input.current !== original || !current()) throw new Error("Choose the current Home control.");
      return invoke();
    });
  });
  return scopeId;
}
