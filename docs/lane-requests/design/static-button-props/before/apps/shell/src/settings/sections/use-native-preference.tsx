import { errorMessage } from "../../error-message";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useState } from "react";
import { bridge } from "../../bridge";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../../command-completion";
import { PreferenceAction } from "./preference-command";
type Preference = object;
type OwnerSnapshot = {
  active: boolean;
  available: boolean;
  availableNow?: () => boolean;
  privateMode: boolean;
  windowId: string;
  kind: typeof bridge.windowKind;
};
class PreferenceOwner<T extends Preference> {
  #live = true;
  #pending = false;
  #sequence = 0;
  #value: T | null = null;
  constructor(readonly snapshot: Readonly<OwnerSnapshot>) {}
  current() {
    const original = this.snapshot;
    return (
      this.#live &&
      original.active &&
      original.available &&
      (!original.availableNow || original.availableNow()) &&
      !original.privateMode &&
      original.kind === "normal" &&
      !bridge.privateMode &&
      bridge.windowKind === original.kind &&
      bridge.windowId === original.windowId
    );
  }
  retire() {
    this.#live = false;
  }
  begin() {
    if (!this.current() || this.#pending) return null;
    this.#pending = true;
    return ++this.#sequence;
  }
  matches(sequence: number) {
    return this.current() && sequence === this.#sequence;
  }
  accept(value: T) {
    this.#value = value;
  }
  owns(value: T) {
    return this.current() && this.#value === value;
  }
  finish(sequence: number) {
    if (this.matches(sequence)) this.#pending = false;
  }
}
function invokeNative<T>(producer: () => Promise<T>): Promise<T> {
  try {
    return producer();
  } catch (reason) {
    return Promise.reject(reason);
  }
}
const describeError = (reason: unknown) => (errorMessage(reason));
/** UI delivery lifetime only; each caller keeps its fixed native producer and policy. */
export function useNativePreference<T extends Preference, Input>({
  active,
  available,
  availableNow,
  read,
  write,
  formatReadError = describeError,
  refusal = "Choose the current preference control.",
  writePendingRefusal = refusal,
}: {
  active: boolean;
  available: boolean;
  availableNow?: () => boolean;
  read(): Promise<T>;
  write(input: Input, current: () => boolean): Promise<{ ack: unknown; value?: T }>;
  formatReadError?(reason: unknown): string;
  refusal?: string;
  writePendingRefusal?: string;
}) {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new PreferenceOwner<T>({ active, available, availableNow, privateMode, windowId, kind }),
    [active, available, availableNow, privateMode, windowId, kind],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  const scopeId = useId();
  const [loaded, setLoaded] = useState<{ owner: PreferenceOwner<T>; value: T } | null>(null);
  const [pending, setPending] = useState<PreferenceOwner<T> | null>(null);
  const [failure, setFailure] = useState<{ owner: PreferenceOwner<T>; message: string } | null>(null);
  const value = loaded?.owner === owner ? loaded.value : null;
  const busy = pending === owner;
  const error = failure?.owner === owner ? failure.message : "";
  const perform = useCallback(
    (input?: Input, expected?: T): Promise<unknown> => {
      if (
        input !== undefined &&
        (!expected || !owner.owns(expected) || ("managed" in expected && expected.managed))
      )
        return Promise.reject(new Error("Choose the current unmanaged preference control."));
      const sequence = owner.begin();
      if (sequence === null)
        return Promise.reject(new Error(input === undefined ? refusal : writePendingRefusal));
      setPending(owner);
      setFailure(null);
      const current = () => owner.matches(sequence);
      const producer =
        input === undefined
          ? invokeNative(read).then((result) => ({ ack: result, value: result }))
          : invokeNative(() => write(input, current));
      const original = producer
        .then(
          (result) => {
            if (current() && result.value) {
              owner.accept(result.value);
              setLoaded({ owner, value: result.value });
            }
            return result.ack;
          },
          (reason) => {
            if (current())
              setFailure({
                owner,
                message: input === undefined ? formatReadError(reason) : describeError(reason),
              });
            throw reason;
          },
        )
        .finally(() => {
          if (current()) {
            owner.finish(sequence);
            setPending(null);
          }
        });
      return guardCommandCompletion(original, current);
    },
    [owner, read, write, formatReadError, refusal, writePendingRefusal],
  );
  const refresh = useCallback(() => perform(), [perform]);
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!owner.current()) return;
      const completion = refresh();
      void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, () => {}));
    });
  }, [owner, refresh]);
  return { owner, scopeId, value, busy, error, perform, refresh };
}
export function NativePreferenceRetry({
  command,
  scopeId,
  disabled,
  read,
}: {
  command: string;
  scopeId: string;
  disabled: boolean;
  read(): Promise<unknown>;
}) {
  return (
    <PreferenceAction
      command={command}
      scopeId={scopeId}
      disabled={disabled}
      invoke={read}
      className="btn sm ghost"
    >
      Retry
    </PreferenceAction>
  );
}
