import { ChatList, savedChat } from "../../chat-list/ChatList";
import { mergeHistory } from "../../run-history";
import { useChatCollection } from "../../chat-list/use-chat-collection";
import { useChatActions } from "../../chat-list/use-chat-actions";
import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { useStore } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

export function ArchivedChatsSettings({ active }: { active: boolean }) {
  const [query, setQuery] = useState("");
  const {
    collection,
    state: { loading, more, error: fetchError },
    items: rows,
  } = useChatCollection({ archived: true, query: query.trim(), policy: "paged" }, active);
  const actions = useChatActions(collection);
  const [busyId, setBusyId] = useState<string | null>(null);
  const error = fetchError || actions.error;
  async function restore(item: ConversationSummary) {
    setBusyId(item.chatId);
    await actions.perform("archive", item);
    setBusyId(null);
  }

  return (
    <SettingsSection name="Archived chats" hidden={!active}>
      <SettingsField
        label="Find archived chats"
        hint="Archived chats remain available until you delete them from chat history."
      >
        <input
          aria-label="Search archived chats"
          placeholder="Search archived chats…"
          maxLength={500}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      </SettingsField>
      {error && (
        <p {...nativeAlertRoleProps} {...staticFieldErrorProps}>
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
      <div className="settings-archived-list" aria-busy={loading}>
        <ChatList
          rows={rows.map((item) => ({
            entry: savedChat(item),
            className: "settings-archived-row",
            openClassName: "settings-archived-open",
            detailed: true,
            disabled: busyId !== null,
            actions: (
              <button
                {...smallGhostButtonProps}
                disabled={busyId !== null}
                onClick={() => void restore(item)}
              >
                {busyId === item.chatId ? "Restoring…" : "Restore"}
              </button>
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
