import { useScopedCommandControls } from "../scoped-command-controls";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { bridge, inNativeHost } from "../bridge";
import { guardCommandCompletion } from "../command-completion";
import { useShortcutLabels } from "../use-shortcut-label";
import "./QuickAskSetting.css";

type Status = { enabled: boolean; registered: boolean; error: string };
type Owner = { active: boolean; identity: object; pending: boolean; sequence: number; status: Status | null };
export function QuickAskSetting() {
  const key = useShortcutLabels(),
    windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => ({ windowId, privateMode }), [windowId, privateMode]);
  const lifetime = useRef<Owner>({ active: false, identity, pending: false, sequence: 0, status: null });
  useLayoutEffect(() => {
    const owner = { active: true, identity, pending: false, sequence: 0, status: null };
    lifetime.current = owner;
    return () => {
      owner.active = false;
    };
  }, [identity]);
  const [measured, setMeasured] = useState<{ owner: Owner; value: Status } | null>(null);
  const [failure, setFailure] = useState<{ owner: Owner; message: string } | null>(null);
  const [busyOwner, setBusyOwner] = useState<Owner | null>(null);
  const status = measured?.owner.active && measured.owner.identity === identity ? measured.value : null;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const current = useCallback(
    (owner: Owner) =>
      owner.active &&
      owner === lifetime.current &&
      owner.identity === identity &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode,
    [identity, windowId, privateMode],
  );
  useEffect(() => {
    const owner = lifetime.current,
      sequence = ++owner.sequence;
    void (async () => {
      try {
        const value = await bridge.quickAskShortcut();
        if (current(owner) && owner.sequence === sequence) {
          owner.status = value;
          setMeasured({ owner, value });
        }
      } catch (reason) {
        if (current(owner) && owner.sequence === sequence)
          setFailure({ owner, message: reason instanceof Error ? reason.message : String(reason) });
      }
    })();
  }, [current]);
  const change = useCallback(
    (enabled: boolean) => {
      const owner = lifetime.current;
      if (!inNativeHost || !current(owner) || owner.pending || owner.status !== status)
        throw new Error("Choose the current Quick Ask shortcut control.");
      owner.pending = true;
      ++owner.sequence;
      setBusyOwner(owner);
      setFailure(null);
      const completion = (async () => {
        try {
          const value = await bridge.quickAskShortcut(enabled);
          if (current(owner)) {
            owner.status = value;
            setMeasured({ owner, value });
          }
          return value;
        } catch (reason) {
          if (current(owner))
            setFailure({ owner, message: reason instanceof Error ? reason.message : String(reason) });
          throw reason;
        } finally {
          owner.pending = false;
          setBusyOwner((value) => (value === owner ? null : value));
        }
      })();
      return guardCommandCompletion(completion, () => current(owner));
    },
    [current, status],
  );
  const toggle = useCallback(() => {
    if (!status) throw new Error("Wait for the Quick Ask shortcut status.");
    return change(!status.enabled);
  }, [change, status]);
  const retry = useCallback(() => {
    if (!error && !status?.error) throw new Error("Choose the current Quick Ask recovery control.");
    return change(true);
  }, [change, error, status]);
  const [publish, run] = useScopedCommandControls(`${windowId}:quick-ask`, (command) => {
    const owner = lifetime.current;
    if (!current(owner) || !inNativeHost || (command === "quick-ask" && privateMode)) return;
    return () => current(owner);
  });
  const toggleRef = useCallback(
    (node: HTMLInputElement | null) => publish("toggle-quick-ask-shortcut", "toggle-quick-ask-shortcut", node, toggle),
    [publish, toggle],
  );
  const retryRef = useCallback(
    (node: HTMLButtonElement | null) => publish("retry-quick-ask-shortcut", "retry-quick-ask-shortcut", node, retry),
    [publish, retry],
  );
  return (
    <div className="quick-ask-setting">
      <button
        className="btn sm"
        disabled={!inNativeHost || privateMode}
        onClick={(event) => run("quick-ask", event)}
      >
        Open Quick Ask
      </button>
      <p className="hint">
        A compact chat that expands into a full browser window. Your draft stays with it.
      </p>
      {status && (
        <label className="memory-use-toggle">
          <input
            ref={toggleRef}
            type="checkbox"
            disabled={busy || !inNativeHost}
            checked={status.enabled}
            onChange={(event) => run("toggle-quick-ask-shortcut", event)}
          />
          <span>
            Open from any app with {key("quick-ask")}
            <small>
              Optional · available while Aux is running. Other apps and their contents are not captured.
            </small>
          </span>
        </label>
      )}
      {(error || status?.error) && (
        <p className="field-error" role="alert">
          {error || status?.error}{" "}
          <button
            ref={retryRef}
            className="btn sm ghost"
            disabled={busy || !inNativeHost}
            onClick={(event) => run("retry-quick-ask-shortcut", event)}
          >
            Try again
          </button>
        </p>
      )}
      {!inNativeHost && <p className="hint">Available in the Aux desktop app.</p>}
      {inNativeHost && privateMode && <p className="hint">Open Quick Ask from a regular window.</p>}
    </div>
  );
}
