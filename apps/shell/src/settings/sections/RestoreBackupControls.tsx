import { constructOperationChain } from "../../components/owned-operation-construction";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import type { MethodResult } from "@aux/contracts";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { call } from "../../store";
import { guardCommandCompletion } from "../../command-completion";
import { PreferenceAction } from "./preference-command";
import type { LocalBackup } from "./BackupSettings";
type Status = Awaited<ReturnType<typeof bridge.runtimeRestoreStatus>>;
class RestoreOwner {
  #live = true;
  #pending = false;
  #sequence = 0;
  constructor(
    readonly snapshot: {
      active: boolean;
      privateMode: boolean;
      windowId: string;
      kind: typeof bridge.windowKind;
      refreshVersion: number;
    },
  ) {}
  current() {
    const s = this.snapshot;
    return (
      this.#live &&
      s.active &&
      !s.privateMode &&
      s.kind === "normal" &&
      (inMock || inNativeHost) &&
      !bridge.privateMode &&
      bridge.windowId === s.windowId &&
      bridge.windowKind === s.kind
    );
  }
  retire() {
    this.#live = false;
  }
  begin() {
    if (!this.current() || this.#pending) return false;
    this.#pending = true;
    return true;
  }
  finish() {
    this.#pending = false;
  }
  next() {
    return ++this.#sequence;
  }
  request(sequence: number) {
    return this.current() && this.#sequence === sequence;
  }
}
type Controls = {
  status: Pick<Status, "pending" | "lastAppliedAt">;
  busy: boolean;
  actions: ReactNode;
  listed(item: LocalBackup, busy: boolean): ReactNode;
  statusView: ReactNode;
  staged(): void;
};
export function RestoreBackupControls({
  active,
  refreshVersion,
  externalBusy,
  onOperation,
  children,
}: {
  active: boolean;
  refreshVersion: number;
  externalBusy: boolean;
  onOperation(token: object, pending: boolean): void;
  children(controls: Controls): ReactNode;
}) {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new RestoreOwner({ active, privateMode, windowId, kind, refreshVersion }),
    [active, privateMode, windowId, kind, refreshVersion],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  const current = useCallback(() => owner.current(), [owner]),
    scopeId = useId();
  const [loaded, setLoaded] = useState<{ owner: RestoreOwner; status: Status } | null>(null),
    [pending, setPending] = useState<RestoreOwner | null>(null),
    [message, setMessage] = useState<{ owner: RestoreOwner; text: string } | null>(null);
  const status: Pick<Status, "pending" | "lastAppliedAt"> =
    loaded?.owner === owner ? loaded.status : { pending: false };
  const ready = loaded?.owner === owner,
    busy = externalBusy || pending === owner;
  const read = useCallback(async () => {
    if (!current()) return;
    const sequence = owner.next();
    try {
      const result = await bridge.runtimeRestoreStatus();
      if (owner.request(sequence)) setLoaded({ owner, status: result });
      return result;
    } catch (reason) {
      if (owner.request(sequence))
        setMessage({ owner, text: reason instanceof Error ? reason.message : String(reason) });
      throw reason;
    }
  }, [owner, current]);
  useEffect(() => {
    void Promise.resolve()
      .then(read)
      .catch(() => {});
  }, [read]);
  function perform<T>(
    producer: () => Promise<T>,
    publish: (result: T) => void,
    deliveryCurrent: () => boolean = current,
  ): Promise<T> {
    if (externalBusy || !owner.begin())
      return Promise.reject(new Error("Choose the current restore control."));
    const token = {};
    onOperation(token, true);
    setPending(owner);
    setMessage(null);
    return constructOperationChain(producer, (result) => {
        if (deliveryCurrent()) publish(result);
        return result;
      }, (reason) => {
        if (deliveryCurrent())
          setMessage({ owner, text: reason instanceof Error ? reason.message : String(reason) });
        throw reason;
      }, () => {
        owner.finish();
        onOperation(token, false);
        if (current()) setPending(null);
      }, deliveryCurrent);
  }
  const staged = () => {
    if (current())
      setLoaded((previous) =>
        previous?.owner === owner ? { owner, status: { ...previous.status, pending: true } } : previous,
      );
  };
  const selected = (item: LocalBackup, result: MethodResult<"installation.stageListedRestore">) => {
    if (
      result.source.name !== item.name ||
      result.source.path !== item.path ||
      result.source.sha256 !== item.sha256
    )
      throw new Error("The original reviewed backup was not confirmed.");
    staged();
    setMessage({
      owner,
      text: `Restore staged from ${item.name}. Quit Aux normally and reopen it to apply.`,
    });
  };
  const actions = (
    <>
      <PreferenceAction
        command="choose-runtime-restore"
        scopeId={scopeId}
        className="btn sm"
        disabled={!current() || !ready || busy || status.pending}
        invoke={() => {
          if (!ready || status.pending)
            return Promise.reject(new Error("Refresh the current restore status."));
          return perform(
            () => bridge.stageRuntimeRestore(),
            (result) => {
              if (result) {
                staged();
                setMessage({
                  owner,
                  text: `Restore staged with ${result.artifactFiles} artifact files${result.missingArtifacts ? `; ${result.missingArtifacts} were unavailable when the backup was created` : ""}. Quit Aux normally and reopen it to apply.`,
                });
              } else setMessage({ owner, text: "Restore cancelled." });
            },
          );
        }}
      >
        Restore backup…
      </PreferenceAction>
      {status.pending && (
        <PreferenceAction
          command="cancel-pending-runtime-restore"
          scopeId={scopeId}
          className="btn sm"
          disabled={!current() || busy}
          invoke={() =>
            perform(
              () => bridge.cancelRuntimeRestore(),
              () => {
                setLoaded((previous) =>
                  previous?.owner === owner
                    ? { owner, status: { ...previous.status, pending: false } }
                    : previous,
                );
                setMessage({ owner, text: "Pending restore cancelled." });
              },
            )
          }
        >
          Cancel pending restore
        </PreferenceAction>
      )}
      <PreferenceAction
        command="refresh-runtime-restore-status"
        scopeId={scopeId}
        className="btn sm ghost"
        disabled={!current() || busy}
        invoke={() => perform(read, () => {})}
      >
        Refresh restore status
      </PreferenceAction>
    </>
  );
  const statusView = (
    <>
      {status.pending && (
        <output className="hint">
          A restore is staged for the next launch. Changes made before quitting will be replaced.
        </output>
      )}
      {status.lastAppliedAt && (
        <span className="hint">
          Last restored {new Date(status.lastAppliedAt).toLocaleString()}. Aux kept a private recovery
          snapshot of the prior runtime database.
        </span>
      )}
      {message?.owner === owner && <output className="hint">{message.text}</output>}
    </>
  );
  return children({
    status,
    busy,
    actions,
    statusView,
    staged,
    listed: (item, itemBusy) => (
      <ListedRestoreBackup
        key={item.path}
        item={item}
        parent={owner}
        busy={busy || itemBusy}
        ready={ready}
        restorePending={status.pending}
        perform={perform}
        selected={selected}
      />
    ),
  });
}
class ListedIncarnation {
  #live = true;
  retire() {
    this.#live = false;
  }
  current() {
    return (
      this.#live &&
      (Object.keys(this.snapshot) as (keyof LocalBackup)[]).every(
        (key) => this.item[key] === this.snapshot[key],
      )
    );
  }
  readonly snapshot: LocalBackup;
  constructor(
    readonly item: LocalBackup,
    readonly parent: RestoreOwner,
  ) {
    this.snapshot = { ...item };
  }
}
function ListedRestoreBackup({
  item,
  parent,
  busy,
  ready,
  restorePending,
  perform,
  selected,
}: {
  item: LocalBackup;
  parent: RestoreOwner;
  busy: boolean;
  ready: boolean;
  restorePending: boolean;
  perform<T>(
    producer: () => Promise<T>,
    publish: (result: T) => void,
    deliveryCurrent?: () => boolean,
  ): Promise<T>;
  selected(item: LocalBackup, result: MethodResult<"installation.stageListedRestore">): void;
}) {
  const incarnation = useMemo(() => new ListedIncarnation(item, parent), [item, parent]);
  useLayoutEffect(
    () => () => {
      incarnation.retire();
    },
    [incarnation],
  );
  const scopeId = useId();
  return (
    <PreferenceAction
      command="restore-reviewed-local-backup"
      scopeId={scopeId}
      className="btn sm"
      disabled={busy || !ready || restorePending || !item.restorable || !parent.current()}
      invoke={() => {
        if (!incarnation.current() || !parent.current() || !item.restorable || !ready || restorePending)
          return Promise.reject(new Error("Choose the original current managed backup."));
        const completion = perform(
          () =>
            call("installation.stageListedRestore", {
              name: incarnation.snapshot.name,
              expectedSha256: incarnation.snapshot.sha256,
            }),
          (result) => {
            if (incarnation.current() && parent.current()) selected(incarnation.snapshot, result);
          },
          () => incarnation.current() && parent.current(),
        );
        return guardCommandCompletion(completion, () => incarnation.current() && parent.current());
      }}
    >
      Restore this backup
    </PreferenceAction>
  );
}
