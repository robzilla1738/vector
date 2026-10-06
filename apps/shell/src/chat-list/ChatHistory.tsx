import { ChatList, savedChat } from "./ChatList";
import { ChatExcerpt } from "./ChatExcerpt";
import { useChatCollection } from "./use-chat-collection";
import { useChatActions } from "./use-chat-actions";
import { useChatScrollAnchor } from "./use-scroll-anchor";
import {
  staticFieldErrorProps as auxReserveStaticFieldErrorProps,
  staticHintProps as auxReserveStaticHintProps,
} from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { moveListFocus } from "../keyboard-list";
import { useEffect, useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { openSavedTask } from "../task-navigation";
import { errToast, useStore } from "../store";
import {
  shellIconArchive,
  shellIconGrid,
  shellIconLayersSm,
  shellIconMore,
  shellIconPencil,
  shellIconReopen,
  shellIconResult,
  shellIconSearch,
  shellIconTrash,
} from "../ui/icons";
import { ConversationDrafts } from "../components/ConversationDrafts";

import { SkeletonRows } from "../components/Skeleton";
import { Tabs } from "../ui";
import { Menu } from "../ui/dialog";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import {
  staticSpacerProps as auxReuseStaticSpacerProps,
  staticButtonProps as auxReuseStaticButtonProps,
} from "../ui/class-props";
export function ChatHistory() {
  const space = useStore((state) =>
    state.layout.spaces.find((item) => item.id === state.layout.activeSpaceId),
  );
  const [currentSpaceOnly, setCurrentSpaceOnly] = useState(false);
  const workspaceId = currentSpaceOnly ? space?.workspaceId : undefined;
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const {
    collection,
    state: { loading, error, more },
    items: rows,
  } = useChatCollection({ archived, query, workspaceId, policy: "paged" });
  const actions = useChatActions(collection);
  const saving = actions.busy,
    actionError = actions.error;
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const firstConversation = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const menuAnchor = useRef<HTMLButtonElement>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  useChatScrollAnchor(collection, list);
  useEffect(() => {
    setMenu(null);
    setRenaming(null);
    setDeleting(null);
  }, [collection]);
  const closeMenu = () => {
    setMenu(null);
    setDeleting(null);
  };
  const mutate = async (action: "rename" | "archive" | "delete", item: ConversationSummary) => {
    if (await actions.perform(action, item, title)) {
      setMenu(null);
      setDeleting(null);
      setRenaming(null);
    }
  };
  return (
    <section className="conversation conversation-history" aria-label="Conversation history">
      <header className="conversation-head">
        <h1>Chats</h1>
        <div {...auxReuseStaticSpacerProps} />
        <Tabs<"active" | "archived">
          label="Conversation state"
          value={archived ? "archived" : "active"}
          onChange={(value) => setArchived(value === "archived")}
          panelId="conversation-history-panel"
          className="history-segment"
          items={[
            { value: "active", label: "Active", disabled: saving },
            { value: "archived", label: "Archived", disabled: saving },
          ]}
        />
      </header>
      <div
        id="conversation-history-panel"
        role="tabpanel"
        aria-labelledby={`conversation-history-panel-${archived ? "archived" : "active"}`}
        className="conversation-history-list"
        ref={list}
        onKeyDown={(event) => moveListFocus(event, ".history-conversation")}
      >
        <div className="history-toolbar">
          <label className="history-search">
            {shellIconSearch}
            <input
              ref={search}
              disabled={saving}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  firstConversation.current?.focus();
                } else if (event.key === "Enter" && !loading && rows[0]) {
                  event.preventDefault();
                  useStore.getState().openConversation(rows[0].latestRun.runId);
                }
              }}
              aria-label="Search conversations"
              placeholder="Search chats…"
              maxLength={500}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {space?.workspaceId && (
            <div className="history-space-filter" role="group" aria-label="Conversation Space filter">
              <button
                {...smallGhostButtonProps}
                disabled={saving}
                aria-pressed={!currentSpaceOnly}
                onClick={() => setCurrentSpaceOnly(false)}
              >
                All Spaces
              </button>
              <button
                {...smallGhostButtonProps}
                disabled={saving}
                aria-pressed={currentSpaceOnly}
                title={space.name}
                onClick={() => setCurrentSpaceOnly(true)}
              >
                {space.name}
              </button>
            </div>
          )}
          <div className="history-view-tools">
            <Tabs<"grid" | "list">
              label="Chat layout"
              value={viewMode}
              onChange={setViewMode}
              panelId="conversation-layout-panel"
              className="history-segment"
              items={[
                { value: "grid", label: shellIconGrid, ariaLabel: "Grid view" },
                { value: "list", label: shellIconResult, ariaLabel: "List view" },
              ]}
            />
          </div>
        </div>
        {(archived || workspaceId) && (
          <p className="hint history-scope-note">
            {archived
              ? "Archived chats stay available until you delete them."
              : "Searching this Space. Unsent drafts are available in All Spaces."}
          </p>
        )}
        {!archived && !workspaceId && (
          <ConversationDrafts query={query} exclude={rows.map((row) => row.chatId)} />
        )}
        {actionError && (
          <p {...auxReserveStaticFieldErrorProps} role="alert">
            {actionError}{" "}
            <button {...smallGhostButtonProps} onClick={actions.dismissError}>
              Dismiss
            </button>
          </p>
        )}
        <div
          id="conversation-layout-panel"
          role="tabpanel"
          aria-labelledby={`conversation-layout-panel-${viewMode}`}
          className={`history-items ${viewMode}`}
        >
          <ChatList
            rows={rows.map((item, index) => ({
              entry: savedChat(item),
              className: "history-conversation-wrap",
              openClassName: "history-conversation",
              detailed: true,
              disabled: saving,
              buttonRef:
                index === 0
                  ? (node) => {
                      firstConversation.current = node;
                    }
                  : undefined,
              editor:
                renaming === item.chatId ? (
                  <form
                    className="history-rename"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (title.trim()) void mutate("rename", item);
                    }}
                  >
                    <input
                      autoFocus
                      aria-label="Conversation title"
                      maxLength={160}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                    <button {...smallButtonProps} disabled={saving || !title.trim()}>
                      Save
                    </button>
                    <button
                      {...auxNativeButtonTypeProps}
                      {...smallGhostButtonProps}
                      onClick={() => setRenaming(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : undefined,
              preview:
                viewMode === "grid" && renaming !== item.chatId ? (
                  <ChatExcerpt item={item} className="history-card-preview home-excerpt" />
                ) : undefined,
              actions: (
                <>
                  {renaming !== item.chatId && (
                    <button
                      disabled={saving}
                      className="icon-btn history-actions"
                      aria-label={`Conversation actions for ${item.title}`}
                      aria-haspopup="menu"
                      aria-expanded={menu === item.chatId}
                      onClick={(event) => {
                        menuAnchor.current = event.currentTarget;
                        setMenu((value) => (value === item.chatId ? null : item.chatId));
                        setDeleting(null);
                      }}
                    >
                      {shellIconMore}
                    </button>
                  )}
                  {menu === item.chatId && (
                    <Menu
                      className="history-menu"
                      label="Conversation actions"
                      anchor={menuAnchor}
                      returnFocus={menuAnchor}
                      onClose={closeMenu}
                      onMenuKeyDown={(event) => event.stopPropagation()}
                    >
                      {item.taskId ? (
                        <button
                          role="menuitem"
                          disabled={saving}
                          onClick={() => void openSavedTask(item.taskId!).catch(errToast)}
                        >
                          {shellIconLayersSm} Open saved task
                        </button>
                      ) : (
                        <>
                          <button
                            role="menuitem"
                            disabled={saving}
                            onClick={() => {
                              setTitle(item.title);
                              setRenaming(item.chatId);
                              setMenu(null);
                            }}
                          >
                            {shellIconPencil} Rename
                          </button>
                          <button
                            role="menuitem"
                            disabled={saving}
                            onClick={() => void mutate("archive", item)}
                          >
                            {item.archived ? shellIconReopen : shellIconArchive}{" "}
                            {item.archived ? "Restore" : "Archive"}
                          </button>
                          {deleting === item.chatId ? (
                            <div
                              className="history-delete-confirm"
                              role="group"
                              aria-label="Confirm conversation deletion"
                            >
                              <span>Delete permanently?</span>
                              <button
                                role="menuitem"
                                disabled={saving}
                                onClick={() => void mutate("delete", item)}
                              >
                                Delete
                              </button>
                              <button role="menuitem" onClick={() => setDeleting(null)}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              role="menuitem"
                              disabled={saving}
                              className="danger"
                              onClick={() => setDeleting(item.chatId)}
                            >
                              {shellIconTrash} Delete
                            </button>
                          )}
                        </>
                      )}
                    </Menu>
                  )}{" "}
                </>
              ),
            }))}
            onOpen={(entry) => {
              if (entry.kind === "saved-chat")
                useStore.getState().openConversation(entry.item.latestRun.runId);
            }}
          />
        </div>
        {loading &&
          (rows.length ? (
            <output data-block {...auxReserveStaticHintProps}>
              Loading conversations…
            </output>
          ) : (
            <SkeletonRows label="Loading conversations…" rows={5} tall />
          ))}
        {!loading && !error && !rows.length && (
          <p {...auxReserveStaticHintProps}>
            {query.trim()
              ? "No conversations match your search."
              : archived
                ? "No archived conversations."
                : workspaceId
                  ? "No saved conversations in this Space yet."
                  : "Your conversations will appear here."}
          </p>
        )}
        {error && (
          <p role="alert">
            {error}{" "}
            <button
              {...smallButtonProps}
              onClick={() => {
                actions.dismissError();
                void collection.retry();
              }}
            >
              Try again
            </button>
          </p>
        )}
        {more && !error && (
          <button
            {...auxReuseStaticButtonProps}
            disabled={loading}
            onClick={() => void collection.load("append")}
          >
            Load more conversations
          </button>
        )}
      </div>
    </section>
  );
}
