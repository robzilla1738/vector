import { memo } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { useStore } from "../store";
import { draftKey } from "../conversation-drafts";
import { AnswerPreview } from "../components/surfaces";
import { previewText } from "./ChatCard";

export const ChatExcerpt = memo(function ChatExcerpt({
  item,
  className,
}: {
  item: ConversationSummary;
  className?: string;
}) {
  const draft = useStore((state) => state.conversationDrafts[draftKey(item.chatId)]);
  return (
    <div className={className} inert>
      <AnswerPreview text={previewText(item, draft)} />
    </div>
  );
});
