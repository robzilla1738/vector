import { memo } from "react";
import type { ConversationArtifact, ConversationSummary } from "@aux/contracts";
import { draftKey } from "../conversation-drafts";
import { STATUS_LABEL } from "../run-status";
import { useStore } from "../store";
import { relativeChatTime } from "./relative-chat-time";
import { AnswerPreview } from "../components/surfaces";
import { ResultExcerpt } from "../components/ResultCard";

export function previewText(item: ConversationSummary, draft?: string) {
  if (draft?.trim()) return draft.trim();
  const run = item.latestRun;
  const answer = [run.result?.answer, run.result?.report].find(
    (value): value is string => typeof value === "string" && !!value.trim(),
  );
  if (answer) return answer;
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
  const result =
    !hasDraft && artifact?.runId === item.latestRun.runId && !artifact.automaticReport ? artifact : undefined;
  return (
    <article className="home-card home-chat-card">
      <div className="home-chat-meta">
        <time
          dateTime={new Date(item.updatedAt).toISOString()}
          title={new Date(item.updatedAt).toLocaleString()}
        >
          {relativeChatTime(item.updatedAt)}
        </time>
        {(hasDraft || item.latestRun.status !== "completed") && (
          <span>{hasDraft ? "Draft" : STATUS_LABEL[item.latestRun.status]}</span>
        )}
      </div>
      <h3>
        <button className="home-card-open" onClick={open}>
          {item.title}
        </button>
      </h3>
      <div className="home-chat-excerpt" inert>
        <AnswerPreview text={previewText(item, draft)} />
      </div>
      {result && (
        <button
          className="home-result-open"
          aria-label={`Open ${result.filename}${result.revision ? ` v${result.revision}` : ""}`}
          onClick={() => {
            useStore.getState().openConversationDraft(item.chatId);
            useStore.setState({ resultPreview: result.artifactId });
          }}
        >
          <ResultExcerpt result={result} />
        </button>
      )}
    </article>
  );
});
