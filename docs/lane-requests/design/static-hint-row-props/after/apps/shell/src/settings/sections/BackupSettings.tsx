import { staticRowProps, staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { constructOperationChain } from "../../components/owned-operation-construction";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { MethodResult } from "@aux/contracts";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { call } from "../../store";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
export type LocalBackup = MethodResult<"installation.listBackups">[number];
class BackupOwner {
  #live = true;
  #pending = false;
  #sequence = 0;
  retire() {
    this.#live = false;
  }
  pending() {
    return this.#pending;
  }
  begin() {
    if (!this.current() || this.#pending) return false;
    this.#pending = true;
    return true;
  }
  finish() {
    this.#pending = false;
  }
  sequence() {
    return this.#sequence;
  }
  next() {
    return ++this.#sequence;
  }
  constructor(
    readonly active: boolean,
    readonly privateMode: boolean,
    readonly windowId: string,
    readonly kind: typeof bridge.windowKind,
    readonly refreshVersion: number,
  ) {}
  current() {
    return (
      this.#live &&
      (inMock || inNativeHost) &&
      this.active &&
      !this.privateMode &&
      this.kind === "normal" &&
      !bridge.privateMode &&
      bridge.windowKind === this.kind &&
      bridge.windowId === this.windowId
    );
  }
}
export function BackupSettings({
  active,
  refreshVersion,
  externalBusy,
  restorePending,
  onOperation,
  attended,
  restore,
}: {
  active: boolean;
  refreshVersion: number;
  externalBusy: boolean;
  restorePending: boolean;
  onOperation(token: object, pending: boolean): void;
  attended(busy: boolean): ReactNode;
  restore(item: LocalBackup, busy: boolean): ReactNode;
}) {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new BackupOwner(active, privateMode, windowId, kind, refreshVersion),
    [active, privateMode, windowId, kind, refreshVersion],
  );
  useLayoutEffect(
    () => () => {
      owner.retire();
    },
    [owner],
  );
  const id = useId(),
    details = useRef<HTMLDetailsElement>(null);
  const [inventory, setInventory] = useState<{
    owner: BackupOwner;
    items: LocalBackup[];
    keep: 3 | 5 | 10 | 20;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<{
    inventory: NonNullable<typeof inventory>;
    item: LocalBackup;
  } | null>(null);
  const [pending, setPending] = useState<BackupOwner | null>(null);
  const [message, setMessage] = useState<{ owner: BackupOwner; text: string } | null>(null);
  const loaded = inventory?.owner === owner ? inventory : null,
    busy = externalBusy || pending === owner;
  const current = useCallback(() => owner.current(), [owner]);
  const read = useCallback(async () => {
    if (!current()) return;
    const sequence = owner.next();
    const [items, value] = await Promise.all([
      call("installation.listBackups", {}),
      call("installation.backupRetention", {}),
    ]);
    if (!current() || sequence !== owner.sequence()) return;
    if (![3, 5, 10, 20].includes(value.keep))
      throw new Error("Backup retention is unavailable. Refresh the list.");
    setInventory({ owner, items, keep: value.keep as 3 | 5 | 10 | 20 });
    setConfirmation(null);
  }, [owner, current]);
  useEffect(() => {
    if (!current()) return;
    const sequence = owner.sequence() + 1;
    void Promise.resolve()
      .then(read)
      .catch((reason) => {
        if (current() && sequence === owner.sequence())
          setMessage({ owner, text: String(reason instanceof Error ? reason.message : reason) });
      });
  }, [owner, current, read]);
  function perform<T>(producer: () => Promise<T>, publish: (value: T) => void, refresh = false): Promise<T> {
    if (externalBusy || !owner.begin())
      return Promise.reject(new Error("Choose the current backup control."));
    const token = {};
    onOperation(token, true);
    setPending(owner);
    setMessage(null);
    return constructOperationChain(producer, async (value) => {
        if (current()) publish(value);
        if (refresh && current())
          try {
            await read();
          } catch (reason) {
            if (current())
              setMessage({
                owner,
                text: `The operation completed, but the backup list could not be refreshed: ${errorMessage(reason)}`,
              });
          }
        return value;
      }, (reason) => {
        if (current()) setMessage({ owner, text: errorMessage(reason) });
        throw reason;
      }, () => {
        owner.finish();
        onOperation(token, false);
        if (current()) setPending(null);
      }, current);
  }
  const [retentionRef, retentionChange] = usePreferenceCommand<HTMLSelectElement>(
    "set-runtime-backup-retention",
    id,
    (element) => {
      const keep = Number(element.value);
      if (!loaded || ![3, 5, 10, 20].includes(keep))
        return Promise.reject(new Error("Choose an available backup retention."));
      return perform(
        () => call("installation.setBackupRetention", { keep: keep as 3 | 5 | 10 | 20 }),
        (value) => {
          if (![3, 5, 10, 20].includes(value.keep)) throw new Error("Backup retention was not confirmed.");
          setInventory((previous) =>
            previous?.owner === owner ? { ...previous, keep: value.keep as 3 | 5 | 10 | 20 } : previous,
          );
        },
      );
    },
  );
  const [summaryRef, toggle] = usePreferenceCommand<HTMLElement>("toggle-local-backups", id, () => {
    if (!current() || !details.current) throw new Error("Choose the current backup list.");
    details.current.open = !details.current.open;
  });
  const mayUse = (item: LocalBackup) =>
    current() && !externalBusy && !owner.pending() && loaded?.items.includes(item);
  return (
    <>
      <div {...staticRowProps}>
        <PreferenceAction
          command="create-local-runtime-backup"
          scopeId={id}
          {...smallButtonProps}
          disabled={!current() || busy}
          invoke={() =>
            perform(
              () => bridge.exportRuntimeBackup(),
              (result) =>
                setMessage({
                  owner,
                  text: result
                    ? `Backup saved · ${result.artifactFiles} artifact files${result.missingArtifacts ? ` · ${result.missingArtifacts} unavailable` : ""} · ${result.bytes} bytes`
                    : "Backup cancelled.",
                }),
              true,
            )
          }
        >
          {pending === owner ? "Preparing…" : "Create backup…"}
        </PreferenceAction>
        {attended(busy)}
      </div>
      <label>
        Keep complete backups
        <select
          ref={retentionRef}
          data-command-id="set-runtime-backup-retention"
          aria-label="Backup retention"
          value={loaded?.keep ?? 10}
          disabled={!current() || busy || !loaded}
          onChange={retentionChange}
        >
          {([3, 5, 10, 20] as const).map((keep) => (
            <option key={keep} value={keep}>
              Keep {keep}
            </option>
          ))}
        </select>
      </label>
      <PreferenceAction
        command="refresh-local-backups"
        scopeId={id}
        {...smallGhostButtonProps}
        disabled={!current() || busy}
        invoke={() => perform(read, () => {})}
      >
        Refresh backup list
      </PreferenceAction>
      {!!loaded?.items.length && (
        <details ref={details}>
          <summary
            ref={summaryRef}
            data-command-id="toggle-local-backups"
            onClick={(event) => {
              event.preventDefault();
              toggle(event);
            }}
          >
            {loaded.items.length} local backup{loaded.items.length === 1 ? "" : "s"}
          </summary>
          {loaded.items.map((item) => (
            <div className="hint" key={item.path}>
              {new Date(item.createdAt).toLocaleString()} · schema {item.schemaVersion} · {item.artifactFiles}{" "}
              artifacts{item.missingArtifacts ? ` · ${item.missingArtifacts} unavailable` : ""}
              {!item.restorable
                ? " · Older than current Forget generation — restore refused. Copied files and phrases cannot be revoked."
                : ""}
              {restore(item, busy)}
              {confirmation?.inventory === loaded && confirmation.item === item ? (
                <>
                  <span>Delete this local backup?</span>
                  <PreferenceAction
                    command="delete-reviewed-local-backup"
                    scopeId={`${id}:${item.name}`}
                    {...smallButtonProps}
                    disabled={busy || restorePending}
                    invoke={() => {
                      if (
                        !mayUse(item) ||
                        confirmation.inventory !== loaded ||
                        confirmation.item !== item ||
                        restorePending
                      )
                        return Promise.reject(
                          new Error("This backup changed. Refresh the list before deleting."),
                        );
                      return perform(
                        () =>
                          call("installation.deleteBackup", { name: item.name, expectedSha256: item.sha256 }),
                        () => {
                          setConfirmation(null);
                          setMessage({ owner, text: "Local backup deleted." });
                        },
                        true,
                      );
                    }}
                  >
                    Delete backup
                  </PreferenceAction>
                  <PreferenceAction
                    command="cancel-local-backup-deletion"
                    scopeId={`${id}:${item.name}`}
                    {...smallGhostButtonProps}
                    disabled={busy}
                    invoke={() => {
                      if (!mayUse(item) || confirmation.inventory !== loaded)
                        throw new Error("Choose the original backup confirmation.");
                      setConfirmation(null);
                    }}
                  >
                    Cancel
                  </PreferenceAction>
                </>
              ) : (
                <PreferenceAction
                  command="review-local-backup-deletion"
                  scopeId={`${id}:${item.name}`}
                  {...smallGhostButtonProps}
                  disabled={busy || restorePending}
                  invoke={() => {
                    if (!mayUse(item) || !loaded || restorePending)
                      throw new Error("Choose the current local backup.");
                    setConfirmation({ inventory: loaded, item });
                  }}
                >
                  Delete…
                </PreferenceAction>
              )}
            </div>
          ))}
        </details>
      )}
      {message?.owner === owner && <output {...staticHintProps}>{message.text}</output>}
    </>
  );
}
