import { useState } from "react";
import { bridge, type MigrationProgress, type MigrationReview } from "../bridge";
import { applyReviewedMigration } from "../migration-import";
import { NativeDialog } from "./NativeDialog";
import { adoptImportedOrganization } from "../store/persistence";
import { useStore } from "../store";

/** Explicit human review for a seed already staged in this Chromium Profile. */
export function MigrationImport() {
  const [review, setReview] = useState<MigrationReview | null>(null);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = review && { contentHash: review.contentHash, manifestSha256: review.manifestSha256 };
  async function inspect() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      setReview(await bridge.migrationReview());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (!review) return;
    setBusy(true);
    setError("");
    try {
      const result = await applyReviewedMigration(bridge, review, setProgress);
      setReview(result);
      useStore.setState({ layout: await adoptImportedOrganization() });
      setMessage(
        "Chromium tabs, Spaces, and bookmarks were imported. The encrypted vault package still needs its separate OS-backed import.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      try {
        setReview(await bridge.migrationReview());
      } catch {
        /* retain the last reviewed token */
      }
    } finally {
      setBusy(false);
    }
  }
  async function rollback() {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      setReview(await bridge.migrationRollback({ ...token, confirmed: true }));
      useStore.setState({ layout: await adoptImportedOrganization() });
      setProgress(null);
      setMessage("The interrupted native import was rolled back.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="row">
        <button className="btn sm ghost" disabled={busy} onClick={() => void inspect()}>
          {busy ? "Checking…" : "Review Chromium migration…"}
        </button>
      </div>
      {error && (
        <output className="hint" role="alert">
          {error}
        </output>
      )}
      {message && <output className="hint">{message}</output>}
      {review && (
        <NativeDialog
          label="Review Chromium migration"
          onClose={() => {
            if (!busy) setReview(null);
          }}
        >
          <h2>Import to this Profile</h2>
          <p>
            This copy of the Electron profile is staged in the current Chromium Profile. Review the counts
            before importing browser state.
          </p>
          <dl>
            <dt>Spaces</dt>
            <dd>{review.spaces.toLocaleString()}</dd>
            <dt>Tabs</dt>
            <dd>{review.tabs.toLocaleString()}</dd>
            <dt>Bookmarks</dt>
            <dd>{review.bookmarks.toLocaleString()}</dd>
            <dt>Bookmark folders</dt>
            <dd>{review.bookmarkFolders.toLocaleString()}</dd>
          </dl>
          <p className="hint">
            Manifest SHA-256: <code>{review.manifestSha256}</code>
          </p>
          {(review.omitted.unsafeTabs ||
            review.omitted.unsafeBookmarks ||
            review.omitted.missingArtifacts ||
            review.omitted.layoutMissing) && (
            <p className="hint">
              Omitted during preparation: {review.omitted.unsafeTabs} unsafe tabs,{" "}
              {review.omitted.unsafeBookmarks} unsafe bookmarks, {review.omitted.missingArtifacts} missing
              artifacts{review.omitted.layoutMissing ? "; layout export unavailable" : ""}.
            </p>
          )}
          {review.vaultPending && (
            <p className="hint">The sealed credential package remains pending a separate OS-backed import.</p>
          )}
          <p className="hint">
            Cookies, saved browser passwords, extensions, and downloads are not imported. The Electron source
            profile is left untouched.
          </p>
          {review.status === "interrupted" && (
            <output className="hint" data-block>
              A previous import stopped. Resume its verified batches or roll back the native changes.
            </output>
          )}
          {progress && (
            <output className="hint" data-block>
              Imported {progress.folders}/{review.bookmarkFolders} folders · {progress.bookmarks}/
              {review.bookmarks} bookmarks · {progress.tabs}/{review.tabs} tabs
            </output>
          )}
          {review.status === "applied" && (
            <output className="hint" data-block>
              This migration was already applied to this Profile.
            </output>
          )}
          {error && <p role="alert">{error}</p>}
          <div className="row">
            {review.status !== "applied" && (
              <button className="btn sm" disabled={busy} onClick={() => void apply()}>
                {busy
                  ? "Importing…"
                  : review.status === "interrupted"
                    ? "Resume import"
                    : "Import reviewed data"}
              </button>
            )}
            {review.status === "interrupted" && (
              <button className="btn sm ghost danger" disabled={busy} onClick={() => void rollback()}>
                Roll back import
              </button>
            )}
            <button className="btn sm ghost" disabled={busy} onClick={() => setReview(null)}>
              Close
            </button>
          </div>
        </NativeDialog>
      )}
    </>
  );
}
