import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConversationAttachment } from "@aux/contracts";
import type { SavedDocumentPage } from "@aux/contracts/document-snapshot";
import type { DocumentResultCitation } from "@aux/contracts/document-citation";
import { call, useStore } from "../store";
import { useConversationOwner } from "./ConversationControls";
import { useConversationAttachmentOwner } from "./ConversationAttachmentControls";
import { DocumentSnapshotControl } from "./DocumentSnapshotControls";
import { shellIconClose } from "../ui/icons";
import { DocumentPages, locatorLabel } from "./DocumentPages";
import { ViewerFrame } from "./ViewerFrame";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type Snapshot = SavedDocumentPage & { attachment: ConversationAttachment };

/** Inspect the immutable source; model excerpts are selected when each request is prepared. */
export function DocumentSnapshot({
  chatId,
  attachmentId,
  citation,
  ownerCurrent,
  onClose,
}: {
  chatId: string;
  attachmentId: string;
  citation?: DocumentResultCitation;
  ownerCurrent?(): boolean;
  onClose(): void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const connected = useStore((state) => state.connected),
    chatCurrent = useConversationOwner(chatId, connected);
  const expectedSha256 = citation?.source.sha256,
    expectedSnapshotId = citation?.source.snapshotId;
  const reference = useMemo(
    () => ({ attachmentId, expectedSha256, expectedSnapshotId }),
    [attachmentId, expectedSha256, expectedSnapshotId],
  );
  const referenceCurrent = useConversationAttachmentOwner(chatCurrent, [reference]);
  const current = useCallback(
    () => referenceCurrent(reference) && (ownerCurrent?.() ?? true),
    [referenceCurrent, reference, ownerCurrent],
  );
  const read = useCallback(
    async (cursor?: string, sha256 = expectedSha256, snapshotId = expectedSnapshotId) => {
      const value = await call("conversations.attachments.read", { chatId, attachmentId, sha256, cursor });
      if (
        value.attachment.attachmentId !== attachmentId ||
        (sha256 !== undefined && value.sha256 !== sha256) ||
        (snapshotId !== undefined && value.document.snapshotId !== snapshotId)
      )
        throw new Error(
          "The original document snapshot is unavailable. A replacement cannot be used for this citation.",
        );
      return value;
    },
    [chatId, attachmentId, expectedSha256, expectedSnapshotId],
  );
  const published = useRef<{ snapshot: Snapshot; current: () => boolean } | null>(null);
  const recordCurrent = useConversationAttachmentOwner(current, snapshot ? [snapshot.attachment] : []);
  const loadedCurrent = useCallback(
    () =>
      !!snapshot &&
      snapshot.attachment.attachmentId === attachmentId &&
      published.current?.snapshot === snapshot &&
      published.current.current === current &&
      recordCurrent(snapshot.attachment),
    [snapshot, attachmentId, current, recordCurrent],
  );

  useEffect(() => {
    let live = true;
    setSnapshot(null);
    setError("");
    if (!current()) return;
    void read()
      .then((value) => {
        if (live && current()) {
          published.current = { snapshot: value, current };
          setSnapshot(value);
        }
      })
      .catch((reason) => {
        if (live && current()) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [read, retry, current]);
  return (
    <ViewerFrame
      label="Document snapshot"
      title={snapshot?.attachment.filename ?? "Document snapshot"}
      onClose={onClose}
      closeLabel="Close document preview"
      closeControl={
        <DocumentSnapshotControl
          command="close-conversation-document-preview"
          current={current}
          invoke={onClose}
          {...auxClassExtraSmallIconButtonProps}
          aria-label="Close document preview"
        >
          {shellIconClose}
        </DocumentSnapshotControl>
      }
      metadata={snapshot && `Saved ${new Date(snapshot.attachment.createdAt).toLocaleString()}`}
    >
      {citation && (
        <section aria-label="Cited document passage">
          <p {...staticHintProps}>Cited passage · {locatorLabel(citation.locator)}</p>
          <blockquote>{citation.quote}</blockquote>
          {snapshot && <p {...staticHintProps}>The saved document opens at its first section.</p>}
        </section>
      )}
      {error ? (
        <p {...nativeAlertRoleProps}>
          {error}{" "}
          <DocumentSnapshotControl
            {...smallButtonProps}
            command="retry-conversation-document-read"
            current={() => current() && !!error}
            invoke={() => setRetry((value) => value + 1)}
          >
            Retry
          </DocumentSnapshotControl>
        </p>
      ) : !snapshot ? (
        <output {...staticHintProps} data-block>
          Loading snapshot…
        </output>
      ) : (
        <>
          <div className="document-snapshot-scope">
            <span>
              {snapshot.attachment.included
                ? "Selected for new replies · relevant excerpts are chosen within the model’s available context"
                : "Excluded from new replies"}
            </span>
          </div>
          <DocumentPages
            initial={snapshot}
            current={loadedCurrent}
            read={(cursor) => read(cursor, snapshot.sha256, snapshot.document.snapshotId)}
          />
          <details className="snapshot-details">
            <DocumentSnapshotControl
              summary
              command="toggle-conversation-document-details"
              current={loadedCurrent}
              invoke={() => {}}
            >
              About this snapshot
            </DocumentSnapshotControl>
            <p {...staticHintProps}>
              Saved {new Date(snapshot.attachment.createdAt).toLocaleString()}. Changes to the original{" "}
              {snapshot.attachment.sourceUrl ? "page" : "file"} are not synced.
            </p>
            <p {...staticHintProps}>
              Removing this snapshot stops its use in new turns. Earlier turns and retries keep their original
              snapshot until you delete its source chat.
            </p>
            <p {...staticHintProps}>This snapshot stores captured text and source references.</p>
            <p className="snapshot-source">Source SHA-256: {snapshot.document.sourceSha256}</p>
            {snapshot.attachment.sourceUrl && (
              <p className="snapshot-source">
                {snapshot.attachment.sourceUrl}
                {snapshot.attachment.sourceTruncated && " · Partial page text"}
              </p>
            )}
          </details>
        </>
      )}
    </ViewerFrame>
  );
}
