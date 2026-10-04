import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { useEffect, useState } from "react";
import type { ConversationAttachment } from "@aux/contracts";
import { call } from "../store";
import { DocumentContent, DocumentExtractionNote } from "./DocumentContent";
import { ViewerFrame } from "./ViewerFrame";

type Snapshot = { attachment: ConversationAttachment; content: string; contextCharacters: number; contextText?: string; contextTotalCharacters?: number };

/** Inspect the stored snapshot, including the exact reference text available to the next turn. */
export function DocumentSnapshot({ chatId, attachmentId, onClose }: { chatId: string; attachmentId: string; onClose(): void }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [includedOnly, setIncludedOnly] = useState(false);
  useEffect(() => {
    let live = true;
    setSnapshot(null); setError(""); setIncludedOnly(false);
    void call("conversations.attachments.read", { chatId, attachmentId })
      .then(value => { if (live) setSnapshot(value); })
      .catch(reason => { if (live) setError(String(reason)); });
    return () => { live = false; };
  }, [chatId, attachmentId, retry]);
  return <ViewerFrame label="Document snapshot" title={snapshot?.attachment.filename ?? "Document snapshot"} onClose={onClose} closeLabel="Close document preview" metadata={snapshot && `Saved ${new Date(snapshot.attachment.createdAt).toLocaleString()}`}>
    {error ? <p role="alert">{error} <button {...smallButtonProps} onClick={() => setRetry(value => value + 1)}>Retry</button></p> : !snapshot ? <output {...staticHintProps} data-block>Loading snapshot…</output> : <>
      <div className="document-snapshot-scope"><span>{!snapshot.attachment.included ? "Excluded from new replies" : snapshot.contextCharacters === (snapshot.contextTotalCharacters ?? snapshot.content.length) ? "Entire text reference included in new replies" : `${snapshot.contextCharacters.toLocaleString()} of ${(snapshot.contextTotalCharacters ?? snapshot.content.length).toLocaleString()} characters included · shared context limit`}</span>
        {snapshot.contextCharacters > 0 && (snapshot.contextText !== undefined || snapshot.contextCharacters < snapshot.content.length) && <button {...smallGhostButtonProps} aria-pressed={includedOnly} onClick={() => setIncludedOnly(value => !value)}>{includedOnly ? "Show full snapshot" : "Show included text"}</button>}
      </div>
      {includedOnly ? <pre role="group" tabIndex={0} aria-label="Included document text">{snapshot.contextText ?? snapshot.content.slice(0, snapshot.contextCharacters)}</pre> : <DocumentContent key={attachmentId} filename={snapshot.attachment.filename} content={snapshot.content} />}
      <details className="snapshot-details"><summary>About this snapshot</summary>
      <p {...staticHintProps}>Saved {new Date(snapshot.attachment.createdAt).toLocaleString()}. Changes to the original {snapshot.attachment.sourceUrl ? "page" : "file"} are not synced.</p>
      <p {...staticHintProps}>Removing this snapshot stops its use in new turns. Earlier turns and retries keep the text they used until you delete the chat.</p>
      <DocumentExtractionNote filename={snapshot.attachment.filename} />
      {snapshot.attachment.sourceUrl && <p className="snapshot-source">{snapshot.attachment.sourceUrl}{snapshot.attachment.sourceTruncated && " · Partial page text"}</p>}
      </details>
    </>}
  </ViewerFrame>;
}
