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
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { openSavedTask } from "../task-navigation";
import { errToast, useStore } from "../store";
import {
  shellIconArchive,
  shellIconArrowDown,
  shellIconSend,
  shellIconFilter,
  shellIconCheck,
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
import { bridge } from "../bridge";

import { SkeletonRows } from "../components/Skeleton";
import { Tabs } from "../ui";
import { Popover } from "../ui/popover";
import "../components/HomeAsk.css";
import { Menu } from "../ui/dialog";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticButtonProps as auxReuseStaticButtonProps } from "../ui/class-props";
export function ChatHistory({ composer }: { composer?: ReactNode }) {
  const space = useStore((state) =>
    state.layout.spaces.find((item) => item.id === state.layout.activeSpaceId),
  );
  const [currentSpaceOnly, setCurrentSpaceOnly] = useState(false);
  const workspaceId = currentSpaceOnly ? space?.workspaceId : undefined;
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [oldestFirst, setOldestFirst] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortTrigger = useRef<HTMLButtonElement>(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const {
    collection,
    state: { loading, error, more: pagedMore },
    items,
  } = useChatCollection({ archived, query, workspaceId, policy: oldestFirst ? "complete" : "paged" });
  // The complete producer publishes only after every page arrives: oldest-first never reverses a partial page.
  const rows = oldestFirst ? [...items].reverse().slice(0, visibleCount) : items;
  const more = oldestFirst ? items.length > visibleCount : pagedMore;
  const actions = useChatActions(collection);
  const saving = actions.busy,
    actionError = actions.error;
  const search = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const firstConversation = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const menuAnchor = useRef<HTMLButtonElement>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  useChatScrollAnchor(collection, list);
  useEffect(() => {
    setVisibleCount(40);
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
      <h1 className="sr-only">{bridge.privateMode ? "Private chats" : "Chats"}</h1>
      {bridge.privateMode && (
        <p className="hint history-scope-note">Available until the last private window closes.</p>
      )}
      <div
        id="conversation-history-panel"
        className="conversation-history-list"
        ref={list}
        onKeyDown={(event) => moveListFocus(event, ".history-conversation")}
      >
        {composer && <div className="home-ask history-composer">{composer}</div>}
        <div className="history-toolbar">
          <Tabs<"grid" | "list">
            label="Chat layout"
            value={viewMode}
            onChange={setViewMode}
            panelId="conversation-layout-panel"
            className="history-segment"
            items={[
              { value: "list", label: <>{shellIconResult} List</>, ariaLabel: "List view" },
              { value: "grid", label: <>{shellIconGrid} Card</>, ariaLabel: "Card view" },
            ]}
          />
          <div className="history-view-tools">
            <label className="history-search" data-input-surface hidden={!searchOpen && !query}>
              {shellIconSearch}
              <input
                ref={search}
                onBlur={() => {
                  if (!query) setSearchOpen(false);
                }}
                disabled={saving}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    setQuery("");
                    setSearchOpen(false);
                    requestAnimationFrame(() => searchTrigger.current?.focus());
                  } else if (event.key === "ArrowDown") {
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
            {!searchOpen && !query && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Search chats"
                ref={searchTrigger}
                disabled={saving}
                onClick={() => {
                  setSearchOpen(true);
                  requestAnimationFrame(() => search.current?.focus());
                }}
              >
                {shellIconSearch}
              </button>
            )}
            <Popover
              label="Filter chats"
              trigger={shellIconFilter}
              disabled={saving}
              className={archived || workspaceId ? "history-filter-active" : ""}
            >
              {() => (
                <div className="history-filters">
                  <fieldset>
                    <legend>Show</legend>
                    {[false, true].map((value) => (
                      <label key={String(value)}>
                        <input
                          type="radio"
                          name="chat-state"
                          checked={archived === value}
                          onChange={() => setArchived(value)}
                        />
                        {value ? "Archived chats" : "Active chats"}
                      </label>
                    ))}
                  </fieldset>
                  {space?.workspaceId && (
                    <fieldset>
                      <legend>Space</legend>
                      {[false, true].map((value) => (
                        <label key={String(value)}>
                          <input
                            type="radio"
                            name="chat-space"
                            checked={currentSpaceOnly === value}
                            onChange={() => setCurrentSpaceOnly(value)}
                          />
                          {value ? space.name : "All Spaces"}
                        </label>
                      ))}
                    </fieldset>
                  )}
                </div>
              )}
            </Popover>
            <button
              ref={sortTrigger}
              type="button"
              className="icon-btn"
              disabled={saving}
              aria-label="Sort chats"
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              title={oldestFirst ? "Oldest first" : "Newest first"}
              onClick={() => setSortOpen((value) => !value)}
            >
              {oldestFirst ? shellIconSend : shellIconArrowDown}
            </button>
            {sortOpen && (
              <Menu
                label="Sort chats"
                className="menu ctx-menu history-sort-menu"
                anchor={sortTrigger}
                returnFocus={sortTrigger}
                onClose={() => setSortOpen(false)}
              >
                {[false, true].map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    role="menuitemradio"
                    aria-checked={oldestFirst === value}
                    disabled={saving}
                    onClick={() => {
                      setOldestFirst(value);
                      setSortOpen(false);
                    }}
                  >
                    <span>{value ? "Oldest first" : "Newest first"}</span>
                    {oldestFirst === value && shellIconCheck}
                  </button>
                ))}
              </Menu>
            )}
          </div>
        </div>
        {(archived || workspaceId) && (
          <p className="hint history-scope-note">
            {archived
              ? bridge.privateMode
                ? "Archived chats stay available for this private session."
                : "Archived chats stay available until you delete them."
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
              now,
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
            onClick={() =>
              oldestFirst ? setVisibleCount((count) => count + 40) : void collection.load("append")
            }
          >
            Load more conversations
          </button>
        )}
      </div>
    </section>
  );
}
