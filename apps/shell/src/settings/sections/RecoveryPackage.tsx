import { constructOperationChain } from "../../components/owned-operation-construction";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bridge, inNativeHost } from "../../bridge";
import { call } from "../../store";
import { PreferenceAction } from "./preference-command";

type Review = Awaited<ReturnType<typeof call<"installation.inspectRecovery">>>;
class RecoveryOwner {
  #live = true;
  #pending = false;
  constructor(
    readonly active: boolean,
    readonly privateMode: boolean,
    readonly windowId: string,
    readonly kind: typeof bridge.windowKind,
    readonly refreshVersion: number,
    readonly pendingRestore: boolean,
    readonly native: boolean,
  ) {}
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
  current() {
    return (
      this.#live &&
      this.active &&
      !this.privateMode &&
      this.kind === "normal" &&
      this.native &&
      inNativeHost &&
      !this.pendingRestore &&
      !bridge.privateMode &&
      bridge.windowId === this.windowId &&
      bridge.windowKind === this.kind
    );
  }
}
type Draft = { owner: RecoveryOwner; phrase: string; path: string; review: Review | null };
/** Offline copy is a separate, explicitly reviewed recovery path from Aux-managed backups. */
export function RecoveryPackage({
  pending,
  onStaged,
  active,
  refreshVersion,
}: {
  pending: boolean;
  onStaged: () => void;
  active: boolean;
  refreshVersion: number;
}) {
  const privateMode = bridge.privateMode,
    windowId = bridge.windowId,
    kind = bridge.windowKind,
    native = inNativeHost;
  const owner = useMemo(
    () => new RecoveryOwner(active, privateMode, windowId, kind, refreshVersion, pending, native),
    [active, privateMode, windowId, kind, refreshVersion, pending, native],
  );
  useLayoutEffect(
    () => () => {
      owner.retire();
    },
    [owner],
  );
  const empty = useMemo<Draft>(() => ({ owner, phrase: "", path: "", review: null }), [owner]);
  const [stored, setStored] = useState<Draft>(empty),
    [operation, setOperation] = useState<RecoveryOwner | null>(null),
    [notice, setNotice] = useState<{ owner: RecoveryOwner; text: string } | null>(null);
  const draft = stored.owner === owner ? stored : empty,
    original = useRef(draft),
    pendingRef = useRef(pending);
  useLayoutEffect(() => {
    original.current = draft;
    pendingRef.current = pending;
  }, [draft, pending]);
  const { phrase, path, review } = draft,
    busy = operation === owner,
    scopeId = useId(),
    message = notice?.owner === owner ? notice.text : "";
  if (stored.owner !== owner) {
    setStored(empty);
    setNotice(null);
  }
  const current = () => owner.current() && original.current === draft && !pendingRef.current;
  function change(value: Partial<Draft>) {
    const next = { ...draft, ...value };
    original.current = next;
    setStored(next);
    setNotice(null);
    return next;
  }
  function perform<T>(producer: () => Promise<T>, publish: (result: T) => void): Promise<T> {
    if (!current() || !owner.begin())
      return Promise.reject(new Error("Choose the current protected recovery control."));
    setOperation(owner);
    setNotice(null);
    return constructOperationChain(producer, (result) => {
        if (current()) publish(result);
        return result;
      }, (reason) => {
        if (current()) setNotice({ owner, text: reason instanceof Error ? reason.message : String(reason) });
        throw reason;
      }, () => {
        owner.finish();
        setOperation((value) => (value === owner ? null : value));
      }, current);
  }
  function create() {
    return perform(
      () => call("installation.exportRecovery", { phrase }),
      (result) => {
        const published = change({ path: result.path, phrase: "", review: null });
        const text = `Encrypted package created at ${result.path}. Copy it to a place you control and keep the phrase separately.`;
        setNotice({ owner, text });
        // Preserve genuine export ACK; a failed optional reveal remains an active diagnostic.
        const failedReveal = () => {
          if (owner.current() && original.current === published)
            setNotice({ owner, text: `${text} The package location could not be opened.` });
        };
        try {
          void bridge.revealPath(result.path).catch(failedReveal);
        } catch {
          failedReveal();
        }
      },
    );
  }
  function choose() {
    return perform(
      () => bridge.openFile(),
      (selected) => {
        if (selected) change({ path: selected, review: null });
      },
    );
  }
  function inspect() {
    return perform(
      () => call("installation.inspectRecovery", { path, phrase }),
      (result) => {
        change({ review: result });
        setNotice({ owner, text: "Package authenticated. Review its contents before staging recovery." });
      },
    );
  }
  function stage() {
    if (!review) return Promise.reject(new Error("Review the original protected package first."));
    return perform(
      () =>
        call("installation.stageRecovery", {
          path,
          phrase,
          expectedSha256: review.sha256,
          reviewToken: review.reviewToken,
        }),
      (result) => {
        change({ phrase: "", review: null });
        onStaged();
        setNotice({
          owner,
          text: `Recovery staged: ${result.artifactFiles} artifacts, ${result.spaceCount} Space memories, ${result.pageMemoryCount} remembered pages. Quit Aux normally and reopen to apply.`,
        });
      },
    );
  }
  return (
    <section aria-label="Protected recovery package">
      <h3>Protected recovery package</h3>
      <p className="hint">
        Create a phrase-encrypted offline copy of this Profile's task data, saved evidence, remembered pages,
        and current Space memory. It excludes browser cookies, passwords, Keychain credentials, connector
        tokens, and deleted memory. The reviewed package is limited to 64 MB; larger Profiles fail without a
        partial export. Settle active work before exporting. Imported grants are revoked and routines pause
        for review. Previously exported copies remain restorable with their original phrase after Forget.
        Copies and phrases kept outside Aux cannot be revoked.
      </p>
      <p className="hint">Creating or staging a package asks for fresh device authentication.</p>
      <label>
        Recovery phrase
        <input
          type="password"
          autoComplete="new-password"
          minLength={16}
          maxLength={200}
          value={phrase}
          disabled={busy}
          onChange={(event) => {
            change({ phrase: event.target.value, review: null });
          }}
        />
      </label>
      <div className="row">
        <PreferenceAction
          command="create-protected-recovery"
          scopeId={scopeId}
          className="btn sm"
          disabled={!owner.current() || pending || busy || phrase.length < 16}
          invoke={create}
        >
          Create encrypted package…
        </PreferenceAction>
        <PreferenceAction
          command="choose-protected-recovery"
          scopeId={scopeId}
          className="btn sm ghost"
          disabled={!owner.current() || pending || busy}
          invoke={choose}
        >
          Choose package…
        </PreferenceAction>
      </div>
      <label>
        Package path
        <input
          type="text"
          value={path}
          disabled={busy || pending}
          onChange={(event) => {
            change({ path: event.target.value, review: null });
          }}
        />
      </label>
      <PreferenceAction
        command="review-protected-recovery"
        scopeId={scopeId}
        className="btn sm"
        disabled={!owner.current() || pending || busy || !path || !phrase}
        invoke={inspect}
      >
        Review package
      </PreferenceAction>
      {review && (
        <div className="hint" aria-label="Recovery package review">
          <p>
            Created {new Date(review.manifest.createdAt).toLocaleString()} ·{" "}
            {review.manifest.artifactIds.length} artifacts · {review.manifest.pageMemoryCount} remembered
            pages · {review.manifest.spaceMemory.length} Spaces with memory. SQLite tables:{" "}
            {review.manifest.sqliteTables.length} protected plans.
          </p>
          <p>Excluded: {review.manifest.excluded.join("; ")}.</p>
          <p>
            Recovery replaces data in a new, empty Profile on restart. It uses that Profile's own OS keys.
            Existing Profiles and their credentials are not merged.
          </p>
          <PreferenceAction
            command="stage-protected-recovery"
            scopeId={scopeId}
            className="btn sm danger"
            disabled={!owner.current() || pending || busy}
            invoke={stage}
          >
            Stage reviewed recovery…
          </PreferenceAction>
        </div>
      )}
      {message && <output className="hint">{message}</output>}
    </section>
  );
}
