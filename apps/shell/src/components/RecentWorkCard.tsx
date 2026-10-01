import { memo } from "react";
import type { ConversationArtifact, ConversationSummary } from "@aux/contracts";
import { draftKey } from "../conversation-drafts";
import { STATUS_LABEL } from "../run-status";
import { useStore } from "../store";
import { shellIconOpen, shellIconResult } from "./icons";
import { ResultExcerpt } from "./ResultCard";
import { AnswerPreview } from "./surfaces";

function previewText(item: ConversationSummary, draft?: string) {
  if (draft?.trim()) return draft.trim();
  const run = item.latestRun;
  if (typeof run.result?.answer === "string" && run.result.answer.trim()) return run.result.answer;
  if (run.status === "failed") return "This chat couldn’t finish. Open it to review or retry.";
  if (run.status === "cancelled") return "This chat was cancelled.";
  if (run.status === "interrupted") return "This chat was interrupted. Open it to continue.";
  return run.statusMessage || run.goal;
}

/** A draft edit updates only its own card, preserving other cards and their focus. */
export const RecentConversationCard = memo(function RecentConversationCard({
  item,
  artifact,
}: {
  item: ConversationSummary;
  artifact?: ConversationArtifact;
}) {
  const draft = useStore((state) => state.conversationDrafts[draftKey(item.chatId)]);
  const hasDraft = !!draft?.trim();
  return (
    <article className="home-card">
      <div className="home-card-meta">
        <time dateTime={new Date(item.updatedAt).toISOString()}>
          {new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </time>
        <span>{hasDraft ? "Draft" : STATUS_LABEL[item.latestRun.status]}</span>
      </div>
      <h3>
        <button
          className="home-card-open"
          onClick={() => useStore.getState().openConversation(item.latestRun.runId)}
        >
          {item.title}
        </button>
      </h3>
      {!hasDraft && artifact?.runId === item.latestRun.runId ? (
        <>
          <ResultExcerpt result={artifact} />
          <button
            className="home-result-open"
            onClick={() => {
              useStore.getState().openConversationDraft(item.chatId);
              useStore.setState({ resultPreview: artifact.artifactId });
            }}
          >
            {shellIconResult}
            <span>{artifact.filename}</span>
            {artifact.revision && <small>v{artifact.revision}</small>}
            {shellIconOpen}
          </button>
        </>
      ) : (
        <div className="home-excerpt" inert>
          <AnswerPreview text={previewText(item, draft)} />
        </div>
      )}
    </article>
  );
});
