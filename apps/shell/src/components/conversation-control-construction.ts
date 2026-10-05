import { useCallback, useId, useLayoutEffect, useRef, type DependencyList } from "react";
import type { ShellCommandId } from "@aux/contracts";
import { usePreferenceCommand } from "../settings/sections/preference-command";
import { guardCommandCompletion } from "../command-completion";

/** Each caller retains its own committed identity and original admission predicate. */
export function useCommittedConversationOwner<A extends unknown[]>(
  identity: object,
  admitted: (...args: A) => boolean,
  dependencies: DependencyList,
) {
  const committed = useRef<{ active: boolean; identity: object } | null>(null);
  useLayoutEffect(() => {
    const original = { active: true, identity };
    committed.current = original;
    return () => {
      original.active = false;
    };
  }, [identity]);
  return useCallback((...args: A) => {
    const original = committed.current;
    if (!original?.active || original.identity !== identity) return false;
    if (admitted(...args)) return true;
    original.active = false;
    return false;
  }, dependencies);
}

/** Original synchronous refusals and guarded rejections remain distinct. */
export function useCurrentConversationCommand<T extends HTMLElement>(
  command: ShellCommandId,
  current: () => boolean,
  invoke: (element: T, event?: Event) => unknown,
  refusal: string,
  guarded: boolean,
  report: (reason: unknown) => void,
) {
  const scope = useId();
  return usePreferenceCommand<T>(
    command,
    scope,
    (element, event) => {
      if (!current()) {
        const reason = new Error(refusal);
        if (guarded) return guardCommandCompletion(Promise.reject(reason), current);
        throw reason;
      }
      return invoke(element, event);
    },
    report,
  );
}
