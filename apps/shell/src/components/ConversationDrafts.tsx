import type { ResultSchemas } from "@aux/contracts";
import type { z } from "zod";
import {
  staticHintProps as auxReserveStaticHintProps,
  staticFieldErrorProps as auxReserveStaticFieldErrorProps,
  staticSmallIconButtonProps as auxReserveStaticSmallIconButtonProps,
} from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PreparedConversation } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { conversationDraftEntries } from "../conversation-drafts";
import { shellIconClose, shellIconRight, shellIconTrash } from "../ui/icons";

export function ConversationDrafts({
  query = "",
  limit,
  compact = false,
  exclude = [],
}: {
  query?: string;
  limit?: number;
  compact?: boolean;
  exclude?: string[];
}) {
  const drafts = useStore((state) => state.conversationDrafts);
  const [discarded, setDiscarded] = useState<{ id: string | null; text: string } | null>(null);
  const [prepared, setPrepared] = useState<PreparedConversation[]>([]);
  const [branches, setBranches] = useState<z.infer<(typeof ResultSchemas)["runs.branch.list"]>>([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const draftChatIds = new Set([
    ...Object.keys(drafts)
      .filter((key) => key.startsWith("chat:"))
      .map((key) => key.slice(5)),
    ...prepared.map((item) => item.chatId),
  ]);
  // Only a draft's matching run can change its display title.
  useStore(
    useShallow((state) =>
      state.runs
        .filter((run) => draftChatIds.has(run.config?.chatId ?? run.runId))
        .map((run) => JSON.stringify([run.runId, run.config?.chatId, run.goal])),
    ),
  );
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setRefresh((value) => value + 1), 100);
    };
    window.addEventListener("focus", update);
    const off = bridge.onEvent((event) => {
      if (["conversation.context.changed", "conversation.changed", "conversation.deleted", "run.updated"].includes(event.type))
        update();
    });
    return () => {
      off();
      clearTimeout(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  useEffect(() => {
    let live = true;
    setError("");
    void call("runs.branch.list", {}).then((items) => {
      if (live) setBranches(items);
    }).catch(() => { /* Native original-window admission may be unavailable. */ });
    void call("conversations.prepared", {})
      .then((items) => {
        if (live) setPrepared(items);
      })
      .catch(() => {
        if (live) setError("Saved attachment drafts couldn’t be loaded.");
      });
    return () => {
      live = false;
    };
  }, [refresh]);
  const entries = conversationDraftEntries(drafts, useStore.getState().runs, prepared).filter(
    (item) =>
      !exclude.includes(item.id ?? "") &&
      !branches.some((branch) => branch.chatId === item.id) &&
      `${item.title} ${item.text}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const shown = limit ? entries.slice(0, limit) : entries;
  const deletePrepared = async (chatId: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await call("conversations.delete", { chatId });
      useStore.getState().setConversationDraft(chatId, "");
      useStore.getState().setConversationContext(chatId, "");
      setPrepared((items) => items.filter((item) => item.chatId !== chatId));
      setDeleting(null);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  const visibleBranches = branches.filter((item) => !exclude.includes(item.chatId) && (!query || (item.draftText || "Branched draft").toLocaleLowerCase().includes(query.toLocaleLowerCase()))).slice(0, limit);
  if (!shown.length && !visibleBranches.length && !discarded && !error) return null;
  const setDraft = (id: string | null, text: string) =>
    id ? useStore.getState().setConversationDraft(id, text) : useStore.getState().setAgentDraft(text);
  return (
    <section className={`conversation-drafts${compact ? " compact-drafts" : ""}`} aria-label="Unsent drafts">
      <div className="drafts-heading">
        <h2>
          Unsent drafts <span {...auxReserveStaticHintProps}>{entries.length + visibleBranches.length}</span>
        </h2>
        <span {...auxReserveStaticHintProps}>
          {bridge.privateMode ? "This private session" : "Saved on this Mac"}
        </span>
      </div>
      {error && (
        <p {...auxReserveStaticFieldErrorProps} role="alert">
          {error}{" "}
          <button {...smallGhostButtonProps} onClick={() => setRefresh((value) => value + 1)}>
            Retry
          </button>
        </p>
      )}
      {visibleBranches.map((draft) => (
        <div className="draft-row" key={draft.chatId}>
          <button type="button" className="draft-open" disabled={!draft.available}
            onClick={() => {
              const state = useStore.getState();
              if (!state.conversationDrafts[`chat:${draft.chatId}`]) state.setConversationDraft(draft.chatId, draft.draftText);
              state.setConversationBrowserSources(draft.chatId, draft.contextPageRefs);
              state.setConversationContext(draft.chatId, draft.contextPageRefs[0]?.pageId ?? "none");
              state.openConversationDraft(draft.chatId);
            }}>
            <strong>{draft.available ? (draft.mode === "edit" ? "Edited draft" : "Branched draft") : "Draft source unavailable"}</strong>
            <span>{draft.privateTask ? "Private · " : ""}History retained through the selected boundary</span>
          </button>
          <button {...auxReserveStaticSmallIconButtonProps} aria-label="Delete branched draft"
            onClick={() => void call("conversations.delete", { chatId: draft.chatId }).then(() => setBranches((values) => values.filter((value) => value.chatId !== draft.chatId))).catch((reason) => setError(errorMessage(reason)))}>{shellIconTrash}</button>
        </div>
      ))}
      {shown.map((item) => (
        <div className="draft-row" key={item.key}>
          <button className="draft-open" onClick={() => useStore.getState().openConversationDraft(item.id)}>
            <strong>{item.title}</strong>
            <span>
              {compact && item.text.trimStart().startsWith(item.title)
                ? item.text.trimStart().slice(item.title.length).trim() || "Continue editing"
                : item.text ||
                  `${item.count} saved ${item.count === 1 ? "attachment" : "attachments"} · Add a message to continue`}
            </span>
            {!compact && <small>Continue editing {shellIconRight}</small>}
          </button>
          {!!item.text.trim() && (
            <button
              {...auxReserveStaticSmallIconButtonProps}
              aria-label={`Discard draft text: ${item.title}`}
              title="Discard draft text"
              onClick={() => {
                setDraft(item.id, "");
                setDiscarded({ id: item.id, text: item.text });
              }}
            >
              {shellIconClose}
            </button>
          )}
          {item.id && item.count > 0 && (
            <button
              {...auxReserveStaticSmallIconButtonProps}
              disabled={busy}
              aria-label={`Delete saved draft and attachments: ${item.title}`}
              title="Delete saved draft and attachments"
              onClick={() => setDeleting(deleting === item.id ? null : item.id)}
            >
              {shellIconTrash}
            </button>
          )}
          {item.id && deleting === item.id && (
            <div
              className="draft-undo"
              role="group"
              aria-label={`Delete saved draft and attachments: ${item.title}?`}
            >
              <span>Delete this unsent draft and its saved attachments?</span>
              <button className="btn sm danger" disabled={busy} onClick={() => void deletePrepared(item.id!)}>
                Delete permanently
              </button>
              <button {...smallGhostButtonProps} disabled={busy} onClick={() => setDeleting(null)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
      {limit && entries.length > limit && (
        <button
          {...smallGhostButtonProps}
          onClick={() => {
            useStore.getState().openConversation(null);
            useStore.setState({ conversationId: "history" });
          }}
        >
          View all {entries.length} drafts
        </button>
      )}
      {discarded && (
        <div className="draft-undo" role="status">
          <span>Draft text discarded. Saved messages and attachments are kept.</span>
          <button
            {...smallButtonProps}
            onClick={() => {
              const state = useStore.getState();
              const current = discarded.id
                ? state.conversationDrafts[`chat:${discarded.id}`]
                : state.agentDraft;
              setDraft(discarded.id, current ? `${current}\n\n${discarded.text}` : discarded.text);
              setDiscarded(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
    </section>
  );
}
