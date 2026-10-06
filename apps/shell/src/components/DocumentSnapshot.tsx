import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConversationAttachment } from "@aux/contracts";
import { call, useStore } from "../store";
import { useConversationOwner } from "./ConversationControls";
import { useConversationAttachmentOwner } from "./ConversationAttachmentControls";
import { DocumentSnapshotControl } from "./DocumentSnapshotControls";
import { shellIconClose } from "./icons";
import { DocumentContent, DocumentExtractionNote } from "./DocumentContent";
import { ViewerFrame } from "./ViewerFrame";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

type Snapshot = {
  attachment: ConversationAttachment;
  content: string;
  contextCharacters: number;
  contextText?: string;
  contextTotalCharacters?: number;
};

/** Inspect the stored snapshot, including the exact reference text available to the next turn. */
export function DocumentSnapshot({
  chatId,
  attachmentId,
  onClose,
}: {
  chatId: string;
  attachmentId: string;
  onClose(): void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [includedOnly, setIncludedOnly] = useState(false);
  const connected = useStore((state) => state.connected),
    chatCurrent = useConversationOwner(chatId, connected);
  const reference = useMemo(() => ({ attachmentId }), [attachmentId]),
    referenceCurrent = useConversationAttachmentOwner(chatCurrent, [reference]);
  const current = useCallback(() => referenceCurrent(reference), [referenceCurrent, reference]);
  const published = useRef<{ snapshot: Snapshot; current: () => boolean } | null>(null);
  const recordCurrent = useConversationAttachmentOwner(current, snapshot ? [snapshot.attachment] : []);
  const loadedCurrent = () =>
    !!snapshot &&
    snapshot.attachment.attachmentId === attachmentId &&
    published.current?.snapshot === snapshot &&
    published.current.current === current &&
    recordCurrent(snapshot.attachment);

  useEffect(() => {
    let live = true;
    setSnapshot(null);
    setError("");
    setIncludedOnly(false);
    if (!current()) return;
    void call("conversations.attachments.read", { chatId, attachmentId })
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
  }, [chatId, attachmentId, retry, current]);
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
              {!snapshot.attachment.included
                ? "Excluded from new replies"
                : snapshot.contextCharacters === (snapshot.contextTotalCharacters ?? snapshot.content.length)
                  ? "Entire text reference included in new replies"
                  : `${snapshot.contextCharacters.toLocaleString()} of ${(snapshot.contextTotalCharacters ?? snapshot.content.length).toLocaleString()} characters included · shared context limit`}
            </span>
            {snapshot.contextCharacters > 0 &&
              (snapshot.contextText !== undefined ||
                snapshot.contextCharacters < snapshot.content.length) && (
                <DocumentSnapshotControl
                  {...smallGhostButtonProps}
                  aria-pressed={includedOnly}
                  command="toggle-conversation-document-text"
                  current={loadedCurrent}
                  invoke={() => setIncludedOnly((value) => !value)}
                >
                  {includedOnly ? "Show full snapshot" : "Show included text"}
                </DocumentSnapshotControl>
              )}
          </div>
          {includedOnly ? (
            <pre role="group" tabIndex={0} aria-label="Included document text">
              {snapshot.contextText ?? snapshot.content.slice(0, snapshot.contextCharacters)}
            </pre>
          ) : (
            <DocumentContent
              key={attachmentId}
              filename={snapshot.attachment.filename}
              content={snapshot.content}
            />
          )}
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
              Removing this snapshot stops its use in new turns. Earlier turns and retries keep the text they
              used until you delete the chat.
            </p>
            <DocumentExtractionNote filename={snapshot.attachment.filename} />
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
