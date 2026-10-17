import { useRef, useState } from "react";
import { call, useStore } from "../store";
import { errorMessage } from "../error-message";
import { MAX_BOOKMARK_FILE_SIZE, parseBookmarkFile } from "../bookmark-files";
import { useLibraryReadOwner } from "./LibraryControls";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { nativeAlertRoleProps, nativePoliteLiveProps } from "../ui/native-attribute-props";
import { hostOf } from "../workspace";
import "./BookmarkFileImport.css";

type Preview = Awaited<ReturnType<typeof parseBookmarkFile>>;
type Receipt = { added: number; skipped: number };
/** Both Library and Settings use the same inert parser and reviewed native import. */
export function useBookmarkFileImport({
  active,
  identity,
  onImported,
  onCancel,
  onRead,
}: {
  active: boolean;
  identity: string;
  onImported?: (receipt: Receipt, current: () => boolean) => Promise<void>;
  onCancel?: () => void;
  onRead?: () => void;
}) {
  const owner = useLibraryReadOwner(`bookmark-file:${active}:${identity}`);
  const current = () => active && owner.current();
  const [candidate, setCandidate] = useState<{ owner: typeof owner; file: string; preview: Preview } | null>(
    null,
  );
  const candidateRef = useRef(candidate);
  const [pending, setPending] = useState<typeof owner | null>(null);
  const pendingRef = useRef<typeof owner | null>(null);
  const [message, setMessage] = useState<{
    owner: typeof owner;
    error: string;
    notice: string;
    committed?: boolean;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = candidate?.owner === owner ? candidate : null;
  const busy = pending === owner;
  const begin = () => {
    if (!current() || pendingRef.current === owner) throw new Error("Choose the current bookmark import.");
    pendingRef.current = owner;
    setPending(owner);
    setMessage(null);
  };
  const finish = () => {
    if (!current()) return;
    if (pendingRef.current === owner) pendingRef.current = null;
    setPending(null);
  };
  const choose = () => {
    if (!current() || pendingRef.current === owner) return;
    fileInput.current?.click();
  };
  const readFile = async (file: File) => {
    if (!current() || pendingRef.current === owner) return;
    begin();
    onRead?.();
    candidateRef.current = null;
    setCandidate(null);
    try {
      if (file.size > MAX_BOOKMARK_FILE_SIZE)
        throw new Error("Choose a bookmark HTML file smaller than 5 MB.");
      const preview = await parseBookmarkFile(await file.text());
      if (!current()) return;
      const next = { owner, file: file.name, preview };
      candidateRef.current = next;
      setCandidate(next);
    } catch (reason) {
      if (current()) setMessage({ owner, error: errorMessage(reason), notice: "" });
    } finally {
      finish();
    }
  };
  const cancel = () => {
    if (!current() || pendingRef.current === owner) return;
    candidateRef.current = null;
    setCandidate(null);
    setMessage(null);
    onCancel?.();
  };
  const confirm = async () => {
    if (!selected || candidateRef.current !== selected || !current() || pendingRef.current === owner) return;
    begin();
    let accepted = false;
    try {
      const receipt = await call("bookmarks.import", {
        bookmarks: selected.preview.bookmarks,
        folders: selected.preview.folders,
      });
      accepted = true;
      if (!current()) return;
      candidateRef.current = null;
      setCandidate(null);
      setMessage({
        owner,
        error: "",
        notice: `Imported ${receipt.added} bookmarks. ${receipt.skipped} already saved.`,
        committed: true,
      });
      const bookmarks = await call("bookmarks.list", {});
      if (!current()) return;
      useStore.setState({ bookmarks });
      await onImported?.(receipt, current);
    } catch (reason) {
      if (current())
        setMessage({
          owner,
          error: accepted
            ? `Bookmarks were imported, but the view could not refresh. Reopen Library to see them. ${errorMessage(reason)}`
            : errorMessage(reason),
          notice: "",
          committed: accepted,
        });
    } finally {
      finish();
    }
  };
  return {
    selected,
    available: current(),
    busy,
    choose,
    readFile,
    cancel,
    confirm,
    fileInput,
    error: message?.owner === owner ? message.error : "",
    notice: message?.owner === owner ? message.notice : "",
    committed: message?.owner === owner && !!message.committed,
  };
}
type Flow = ReturnType<typeof useBookmarkFileImport>;
export function BookmarkImportFileControl({
  flow,
  disabled = false,
  label = "Choose bookmark file…",
}: {
  flow: Flow;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <>
      <button
        {...smallButtonProps}
        type="button"
        disabled={disabled || flow.busy || !flow.available}
        onClick={flow.choose}
      >
        {flow.busy ? "Working…" : label}
      </button>
      <input
        ref={flow.fileInput}
        type="file"
        accept=".html,.htm,text/html"
        disabled={disabled || flow.busy || !flow.available}
        hidden
        aria-label="Import bookmark file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void flow.readFile(file);
        }}
      />
    </>
  );
}
export function BookmarkImportReview({
  flow,
  bookmarks,
  disabled = false,
}: {
  flow: Flow;
  bookmarks: readonly { url: string }[];
  disabled?: boolean;
}) {
  const candidate = flow.selected;
  return (
    <>
      {candidate && (
        <section className="bookmark-file-review" aria-label="Bookmark import preview">
          <strong>{candidate.preview.bookmarks.length} web bookmarks ready</strong>
          <p className="hint">
            From {candidate.file} into Bookmarks ·{" "}
            {
              candidate.preview.bookmarks.filter((item) => bookmarks.some((saved) => saved.url === item.url))
                .length
            }{" "}
            already saved · {candidate.preview.folders.length} folders preserved. Existing bookmarks keep
            their titles and folders.{" "}
            {candidate.preview.skipped > 0 &&
              `${candidate.preview.skipped} duplicate or unsupported links skipped.`}
          </p>
          <ul>
            {candidate.preview.bookmarks.slice(0, 4).map((item) => (
              <li key={item.url}>
                {item.title} <span className="hint">{hostOf(item.url)}</span>
              </li>
            ))}
          </ul>
          <div className="bookmark-file-actions">
            <button
              {...smallButtonProps}
              type="button"
              disabled={
                disabled ||
                flow.busy ||
                (!candidate.preview.bookmarks.length && !candidate.preview.folders.length)
              }
              onClick={() => void flow.confirm()}
            >
              Import bookmarks
            </button>
            <button {...smallGhostButtonProps} type="button" disabled={flow.busy} onClick={flow.cancel}>
              Cancel import
            </button>
          </div>
        </section>
      )}
      {flow.error && (
        <p className="hint err" {...nativeAlertRoleProps}>
          {flow.error}
        </p>
      )}
      {flow.notice && (
        <p className="hint" {...nativePoliteLiveProps}>
          {flow.notice}
        </p>
      )}
    </>
  );
}
export function BookmarkImportSetting({ active, onClose }: { active: boolean; onClose(): void }) {
  const bookmarks = useStore((state) => state.bookmarks);
  const flow = useBookmarkFileImport({ active, identity: "settings" });
  if (!active) return null;
  return (
    <div className="bookmark-file-setting">
      <p className="hint">
        Choose an HTML bookmarks file exported by another browser. Review its bookmarks and folders before
        importing into Aux.
      </p>
      <BookmarkImportFileControl flow={flow} />
      <BookmarkImportReview flow={flow} bookmarks={bookmarks} />
      <footer className="bookmark-file-actions">
        <button {...smallGhostButtonProps} type="button" disabled={flow.busy} onClick={onClose}>
          {flow.committed ? "Done" : "Cancel"}
        </button>
      </footer>
    </div>
  );
}
