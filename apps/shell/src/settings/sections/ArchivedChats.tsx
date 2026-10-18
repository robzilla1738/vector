import { ActionMenu, SearchField } from "../../ui";
import { useConfirm } from "../../ui/dialog";
import { shellIconReopen, shellIconTrash, shellIconSearch } from "../../ui/icons";
import { ChatList, savedChat } from "../../chat-list/ChatList";
import { mergeHistory } from "../../run-history";
import { useChatCollection } from "../../chat-list/use-chat-collection";
import { useChatActions } from "../../chat-list/use-chat-actions";
import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { useStore } from "../../store";
import { SettingsSection } from "../primitives";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

export function ArchivedChatsSettings({ active }: { active: boolean }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null),
    searchTrigger = useRef<HTMLButtonElement>(null);
  const {
    collection,
    state: { loading, more, error: fetchError },
    items: rows,
  } = useChatCollection({ archived: true, query: query.trim(), policy: "paged" }, active);
  const actions = useChatActions(collection);
  const [busyOwner, setBusyOwner] = useState<{ collection: typeof collection; chatId: string } | null>(null);
  const [localError, setLocalError] = useState<{ collection: typeof collection; message: string } | null>(
    null,
  );
  const pending = useRef(new Set<typeof collection>());
  const busyId = busyOwner?.collection === collection ? busyOwner.chatId : null;
  const { confirm, confirmation } = useConfirm();
  const error =
    fetchError || actions.error || (localError?.collection === collection ? localError.message : "");
  async function mutate(action: "archive" | "delete", item: ConversationSummary) {
    if (!collection.current() || pending.current.has(collection)) return;
    pending.current.add(collection);
    setBusyOwner({ collection, chatId: item.chatId });
    setLocalError(null);
    try {
      if (
        action === "delete" &&
        !(await confirm({
          title: "Delete archived chat?",
          description: `Permanently delete “${item.title}” and its saved conversation.`,
          confirmLabel: "Delete chat",
          danger: true,
        }))
      )
        return;
      if (!collection.current()) return;
      if (collection.getSnapshot().byId[item.chatId] !== item || !item.archived) {
        setLocalError({ collection, message: "This archived chat changed. Choose its current actions." });
        return;
      }
      await actions.perform(action, item);
    } finally {
      pending.current.delete(collection);
      setBusyOwner((current) => (current?.collection === collection ? null : current));
    }
  }

  return (
    <SettingsSection name="Archived chats" hidden={!active}>
      {confirmation}
      <div className="settings-archived-tools">
        <p>Chats you archive are kept here until you delete them.</p>
        {searchOpen || query ? (
          <SearchField
            label="Search archived chats"
            controlRef={search}
            value={query}
            placeholder="Search chats…"
            maxLength={500}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onClear={() => setQuery("")}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") {
                event.preventDefault();
                setQuery("");
                setSearchOpen(false);
                requestAnimationFrame(() => searchTrigger.current?.focus());
              }
            }}
          />
        ) : (
          <button
            ref={searchTrigger}
            type="button"
            className="icon-btn"
            aria-label="Search archived chats"
            onClick={() => {
              setSearchOpen(true);
              requestAnimationFrame(() => search.current?.focus());
            }}
          >
            {shellIconSearch}
          </button>
        )}
      </div>
      {error && (
        <p {...nativeAlertRoleProps} {...staticFieldErrorProps}>
          {error}{" "}
          <button
            {...smallButtonProps}
            onClick={() => {
              actions.dismissError();
              setLocalError(null);
              void collection.retry();
            }}
          >
            Try again
          </button>
        </p>
      )}
      <div className="settings-archived-list" aria-busy={loading}>
        <ChatList
          rows={rows.map((item) => ({
            entry: savedChat(item),
            className: "settings-archived-row",
            openClassName: "settings-archived-open",
            detailed: true,
            disabled: busyId !== null,
            actions: (
              <ActionMenu
                label={`Actions for archived chat ${item.title}`}
                actions={[
                  {
                    label: busyId === item.chatId ? "Working…" : "Restore",
                    icon: shellIconReopen,
                    disabled: busyId !== null,
                    onSelect: () => void mutate("archive", item),
                  },
                  {
                    label: "Delete",
                    icon: shellIconTrash,
                    danger: true,
                    disabled: busyId !== null,
                    onSelect: () => void mutate("delete", item),
                  },
                ]}
              />
            ),
          }))}
          onOpen={(entry) => {
            if (entry.kind === "saved-chat") {
              mergeHistory([entry.item.latestRun]);
              useStore.getState().openConversation(entry.item.latestRun.runId);
            }
          }}
        />

        {loading && (
          <output {...staticHintProps} data-block>
            Loading archived chats…
          </output>
        )}
        {!loading && !error && !rows.length && (
          <p {...staticHintProps}>
            {query.trim() ? "No archived chats match your search." : "No archived chats yet."}
          </p>
        )}
        {more && !error && (
          <button
            {...smallButtonProps}
            disabled={loading || busyId !== null}
            onClick={() => void collection.load("append")}
          >
            Load more
          </button>
        )}
      </div>
    </SettingsSection>
  );
}
