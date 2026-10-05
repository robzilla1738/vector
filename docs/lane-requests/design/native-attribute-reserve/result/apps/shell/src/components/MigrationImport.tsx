import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useState } from "react";
import { bridge, type MigrationProgress, type MigrationReview } from "../bridge";
import { applyReviewedMigration } from "../migration-import";
import { Dialog } from "../ui";
import { adoptImportedOrganization } from "../store/persistence";
import { useStore } from "../store";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

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
      setError(errorMessage(cause));
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
      setError(errorMessage(cause));
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
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div {...staticRowProps}>
        <button {...smallGhostButtonProps} disabled={busy} onClick={() => void inspect()}>
          {busy ? "Checking…" : "Review Chromium migration…"}
        </button>
      </div>
      {error && (
        <output {...staticHintProps} {...nativeAlertRoleProps}>
          {error}
        </output>
      )}
      {message && <output {...staticHintProps}>{message}</output>}
      {review && (
        <Dialog
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
          <ul className="migration-counts">
            <li>Spaces: {review.spaces.toLocaleString()}</li>
            <li>Tabs: {review.tabs.toLocaleString()}</li>
            <li>Bookmarks: {review.bookmarks.toLocaleString()}</li>
            <li>Bookmark folders: {review.bookmarkFolders.toLocaleString()}</li>
          </ul>
          <p {...staticHintProps}>
            Manifest SHA-256: <code>{review.manifestSha256}</code>
          </p>
          {(review.omitted.unsafeTabs ||
            review.omitted.unsafeBookmarks ||
            review.omitted.missingArtifacts ||
            review.omitted.layoutMissing) && (
            <p {...staticHintProps}>
              Omitted during preparation: {review.omitted.unsafeTabs} unsafe tabs,{" "}
              {review.omitted.unsafeBookmarks} unsafe bookmarks, {review.omitted.missingArtifacts} missing
              artifacts{review.omitted.layoutMissing ? "; layout export unavailable" : ""}.
            </p>
          )}
          {review.vaultPending && (
            <p {...staticHintProps}>The sealed credential package remains pending a separate OS-backed import.</p>
          )}
          <p {...staticHintProps}>
            Cookies, saved browser passwords, extensions, and downloads are not imported. The Electron source
            profile is left untouched.
          </p>
          {review.status === "interrupted" && (
            <output {...staticHintProps} data-block>
              A previous import stopped. Resume its verified batches or roll back the native changes.
            </output>
          )}
          {progress && (
            <output {...staticHintProps} data-block>
              Imported {progress.folders}/{review.bookmarkFolders} folders · {progress.bookmarks}/
              {review.bookmarks} bookmarks · {progress.tabs}/{review.tabs} tabs
            </output>
          )}
          {review.status === "applied" && (
            <output {...staticHintProps} data-block>
              This migration was already applied to this Profile.
            </output>
          )}
          {error && <p {...nativeAlertRoleProps}>{error}</p>}
          <div {...staticRowProps}>
            {review.status !== "applied" && (
              <button {...smallButtonProps} disabled={busy} onClick={() => void apply()}>
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
            <button {...smallGhostButtonProps} disabled={busy} onClick={() => setReview(null)}>
              Close
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
