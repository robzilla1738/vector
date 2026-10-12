import { memo } from "react";
import type { ConversationArtifact, ConversationSummary } from "@aux/contracts";
import { draftKey } from "../conversation-drafts";
import { STATUS_LABEL } from "../run-status";
import { useStore } from "../store";
import { MessageCircle, shellIconOpen } from "../ui/icons";
import { AnswerPreview } from "../components/surfaces";
import { ResultExcerpt } from "../components/ResultCard";

export function previewText(item: ConversationSummary, draft?: string) {
  if (draft?.trim()) return draft.trim();
  const run = item.latestRun;
  if (typeof run.result?.answer === "string" && run.result.answer.trim()) return run.result.answer;
  if (run.status === "failed") return "This chat couldn’t finish. Open it to review or retry.";
  if (run.status === "cancelled") return "This chat was cancelled.";
  if (run.status === "interrupted") return "This chat was interrupted. Open it to continue.";
  return run.statusMessage || run.goal;
}

/** A draft edit updates only its own card, preserving other cards and their focus. */
export const ChatCard = memo(function ChatCard({
  item,
  artifact,
}: {
  item: ConversationSummary;
  artifact?: ConversationArtifact;
}) {
  const draft = useStore((state) => state.conversationDrafts[draftKey(item.chatId)]);
  const hasDraft = !!draft?.trim();
  const open = () => useStore.getState().openConversation(item.latestRun.runId);
  return (
    <article className="home-card">
      <button className="home-card-hero" onClick={open} aria-label={item.title}>
        <span className="home-card-hero-icon">
          <MessageCircle width={56} height={56} />
        </span>
        <span className="home-card-status">
          {hasDraft ? "Draft" : STATUS_LABEL[item.latestRun.status]}
        </span>
      </button>
      <h3>
        <button className="home-card-open" onClick={open}>
          {item.title}
        </button>
      </h3>
      {!hasDraft && artifact?.runId === item.latestRun.runId ? (
        <div className="home-excerpt rich" inert>
          <ResultExcerpt result={artifact} />
        </div>
      ) : (
        <div className="home-excerpt" inert>
          <AnswerPreview text={previewText(item, draft)} />
        </div>
      )}
      <div className="home-card-actions">
        <button className="home-card-cta" onClick={open}>
          Open chat
          {shellIconOpen}
        </button>
        {!hasDraft && artifact?.runId === item.latestRun.runId && (
          <button
            className="home-card-cta home-result-open"
            onClick={() => {
              useStore.getState().openConversationDraft(item.chatId);
              useStore.setState({ resultPreview: artifact.artifactId });
            }}
          >
            {artifact.filename}
            {artifact.revision ? ` v${artifact.revision}` : ""}
            {shellIconOpen}
          </button>
        )}
      </div>
    </article>
  );
});
