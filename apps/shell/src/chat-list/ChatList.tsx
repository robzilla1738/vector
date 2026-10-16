import { openChatEntry } from "./navigation";
import { LocalChatRow } from "./LocalChatRow";
import "./ChatList.css";
import { memo, type ReactNode } from "react";
import type { ConversationSummary, ConversationArtifact } from "@aux/contracts";
import { previewText } from "./ChatCard";
import { PlainAnswerPreview } from "../components/surfaces";
import { relativeChatTime } from "./relative-chat-time";
import { draftKey } from "../conversation-drafts";
import { useStore } from "../store";
import { ChatCard } from "./ChatCard";
import { VirtualList } from "../components/VirtualList";
import { chatId, chatTitle, type ChatEntry, type SavedChatEntry, type LocalChatEntry } from "./model";

const ChatOpen = memo(function ChatOpen({
  entry,
  className,
  selected,
  detailed,
  now,
  disabled,
  buttonRef,
  onOpen,
}: {
  entry: ChatEntry;
  className: string;
  selected?: boolean;
  detailed?: boolean;
  now?: number;
  disabled?: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  onOpen(entry: ChatEntry): void;
}) {
  const id = chatId(entry);
  const draft = useStore((state) => state.conversationDrafts[draftKey(id)]);
  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      disabled={disabled}
      aria-current={selected ? "page" : undefined}
      title={chatTitle(entry)}
      onClick={() => onOpen(entry)}
    >
      {detailed ? (
        <>
          <strong>{chatTitle(entry)}</strong>
          <span>
            {draft?.trim() ? (
              `Draft · ${draft}`
            ) : entry.kind === "saved-chat" ? (
              <PlainAnswerPreview text={previewText(entry.item)} />
            ) : (
              entry.run.goal
            )}
          </span>
          {entry.kind === "saved-chat" && (
            <time
              dateTime={new Date(entry.item.updatedAt).toISOString()}
              title={`${new Date(entry.item.updatedAt).toLocaleString()} · ${entry.item.turnCount} ${entry.item.turnCount === 1 ? "turn" : "turns"}`}
            >
              {relativeChatTime(entry.item.updatedAt, now)}
            </time>
          )}
        </>
      ) : (
        chatTitle(entry)
      )}
    </button>
  );
});

export { ChatOpen };
export type ChatListRow = {
  entry: ChatEntry;
  selected?: boolean;
  openClassName: string;
  className?: string;
  detailed?: boolean;
  now?: number;
  disabled?: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
  actions?: ReactNode;
  preview?: ReactNode;
  editor?: ReactNode;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  contentClassName?: string;
  details?: ReactNode;
};
export type LocalChatListRow = { entry: LocalChatEntry };
export type ChatCardRow = { entry: SavedChatEntry; card: { artifact?: ConversationArtifact } };

/** One identity/focus-preserving row renderer, shared by compact and full chat views. */
export function ChatList({
  rows,
  className,
  onOpen = openChatEntry,
  windowed = false,
  rowHeight = 56,
}: {
  rows: readonly (ChatListRow | ChatCardRow | LocalChatListRow)[];
  className?: string;
  onOpen?(entry: ChatEntry): void;
  windowed?: boolean;
  rowHeight?: number;
}) {
  const render = (row: ChatListRow | ChatCardRow | LocalChatListRow) =>
    "card" in row ? (
      <ChatCard key={chatId(row.entry)} item={row.entry.item} artifact={row.card.artifact} />
    ) : !("openClassName" in row) ? (
      <LocalChatRow key={chatId(row.entry)} runId={row.entry.run.runId} />
    ) : (
      <div
        key={chatId(row.entry)}
        data-chat-id={chatId(row.entry)}
        className={row.className}
        onKeyDown={row.onKeyDown}
      >
        <div className={row.contentClassName ?? "chat-row-content"}>
          {row.editor ?? (
            <ChatOpen
              entry={row.entry}
              className={row.openClassName}
              selected={row.selected}
              detailed={row.detailed}
              now={row.now}
              disabled={row.disabled}
              buttonRef={row.buttonRef}
              onOpen={onOpen}
            />
          )}
          {row.preview}
          {row.actions}
        </div>
        {row.details}
      </div>
    );
  return windowed ? (
    <VirtualList
      items={rows}
      className={className}
      rowHeight={rowHeight}
      keyOf={(row) => chatId(row.entry)}
      renderRow={render}
    />
  ) : className ? (
    <div className={className}>{rows.map(render)}</div>
  ) : (
    <>{rows.map(render)}</>
  );
}
export const savedChat = (item: ConversationSummary): SavedChatEntry => ({ kind: "saved-chat", item });
