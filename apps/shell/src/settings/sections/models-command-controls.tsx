import { useCallback, useLayoutEffect, useMemo, useRef, type SyntheticEvent } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../../command-completion";
import { executeCommand } from "../../commands";
import { registerScopedControl } from "../../scoped-control-commands";
import { usePreferenceCommand } from "./preference-command";

type WindowSnapshot = {
  identity: string;
  active: boolean;
  available: boolean;
  windowId: string;
  kind: typeof bridge.windowKind;
  privateMode: boolean;
};
/** Presentation lifetime only. Runtime producers retain all credential,
 * destination, authentication and settings-write policies. */
export class ModelControlOwner {
  #live = true;
  #pending = new Set<string>();
  constructor(readonly snapshot: Readonly<WindowSnapshot>) {}
  current() {
    const original = this.snapshot;
    if (!this.#live) return false;
    if (
      !original.active ||
      !original.available ||
      !(inNativeHost || inMock) ||
      bridge.windowId !== original.windowId ||
      bridge.windowKind !== original.kind ||
      bridge.privateMode !== original.privateMode
    ) {
      this.retire();
      return false;
    }
    return true;
  }
  retire() {
    this.#live = false;
  }
  reserve(action: string) {
    if (!this.current() || this.#pending.has(action)) return false;
    this.#pending.add(action);
    return true;
  }
  finish(action: string) {
    this.#pending.delete(action);
  }
  completion<T>(producer: () => Promise<T>, currentDraft: () => boolean = () => true) {
    let original: Promise<T>;
    try {
      original = producer();
    } catch (reason) {
      original = Promise.reject(reason);
    }
    return guardCommandCompletion(original, () => this.current() && currentDraft());
  }
}

export function useModelControlOwner(active: boolean, identity: string) {
  const available = inNativeHost || inMock,
    windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const owner = useMemo(
    () => new ModelControlOwner({ active, available, windowId, kind, privateMode, identity }),
    [active, available, windowId, kind, privateMode, identity],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  return owner;
}

/** One mounted input+button group per save command; Enter and the button share
 * the registration. No hidden owner or duplicate input/button capability. */
export function useModelDraftCommand(
  command: string,
  scopeId: string,
  owner: ModelControlOwner,
  invoke: () => unknown,
  expected: string,
) {
  const input = useRef<HTMLInputElement>(null),
    button = useRef<HTMLButtonElement>(null);
  const draft = useMemo(() => ({ live: true, owner, expected }), [owner, expected]);
  useLayoutEffect(
    () => () => {
      draft.live = false;
    },
    [draft],
  );
  const [controlRef, run] = usePreferenceCommand<HTMLElement>(command, scopeId, (_, originalEvent) => {
    const target = originalEvent?.target ?? document.activeElement;
    if (
      !owner.current() ||
      input.current?.value !== expected ||
      !(target instanceof Node) ||
      !(input.current?.contains(target) || button.current?.contains(target))
    )
      throw new Error("Choose the original current model draft.");
    return owner.completion(
      () => Promise.resolve(invoke()),
      () => draft.live,
    );
  });
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
  }, []);
  const buttonRef = useCallback((node: HTMLButtonElement | null) => {
    button.current = node;
  }, []);
  return [inputRef, buttonRef, controlRef, run] as const;
}

/** ActionMenu mounts its items in its own local state. Enroll the actual item
 * at callback-ref commit, rather than assuming its parent's effect rerenders. */
export function useModelMountedCommand(
  command: string,
  scopeId: string,
  owner: ModelControlOwner,
  invoke: () => unknown,
) {
  const unregister = useRef<(() => void) | null>(null);
  const element = useRef<HTMLButtonElement | null>(null);
  const controlRef = useCallback(
    (node: HTMLButtonElement | null) => {
      unregister.current?.();
      unregister.current = null;
      element.current = node;
      if (node) {
        node.dataset.commandId = command;
        unregister.current = registerScopedControl(node, command, scopeId, () => {
          if (element.current !== node || !owner.current())
            throw new Error("Choose the original current provider control.");
          return invoke();
        });
      }
    },
    [command, scopeId, owner, invoke],
  );
  useLayoutEffect(
    () => () => {
      unregister.current?.();
      unregister.current = null;
    },
    [],
  );
  const run = (event: SyntheticEvent<HTMLButtonElement>) => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event.nativeEvent });
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, () => {}));
  };
  return [controlRef, run] as const;
}
