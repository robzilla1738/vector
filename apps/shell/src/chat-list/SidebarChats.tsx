import { ChatList, savedChat, type ChatListRow } from "./ChatList";
import { useChatCollection } from "./use-chat-collection";
import { useChatActions } from "./use-chat-actions";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import "./SidebarChats.css";
import { ActionMenu } from "../ui";
import { STATUS_LABEL } from "../run-status";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { errToast, useStore } from "../store";
import { bridge } from "../bridge";
import {
  readChatFolders,
  writeChatFolder,
  removeChatFolder,
  moveChatToFolder,
  type ChatFolder,
} from "../chat-folders";
import {
  shellIconArchive,
  shellIconChats,
  shellIconClose,
  shellIconDown,
  shellIconFolder,
  shellIconPencil,
  shellIconRight,
  shellIconTrash,
} from "../ui/icons";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import {
  staticGhostButtonProps as auxClassGhostButtonProps,
  staticButtonProps as auxClassButtonProps,
} from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

/** Shared session organization for both sidebar layouts. Folder entries belong to this browser profile. */
export function SidebarChats({ compact = false, query = "" }: { compact?: boolean; query?: string }) {
  const privateMode = bridge.privateMode;
  const active = useStore((s) => (s.mode === "conversation" ? s.conversationId : null));
  const [archived, setArchived] = useState(false);
  const {
    collection,
    state: { loading, error },
    items: rows,
  } = useChatCollection({ archived, policy: compact ? "preview" : "complete" });
  const actions = useChatActions(collection);
  const [savedOrganization, setOrganization] = useState(() =>
    privateMode ? { folders: [], members: {} } : readChatFolders(localStorage),
  );
  const organization = privateMode ? { folders: [], members: {} } : savedOrganization;
  const [editing, setEditing] = useState<ChatFolder | null>(null);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [chatName, setChatName] = useState("");
  const [moving, setMoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const busy = actions.busy;
  const root = useRef<HTMLDivElement>(null);
  const projectSelectors = useRef(new Map<string, HTMLSelectElement>());
  const actionTriggers = useRef(new Map<string, HTMLButtonElement>());
  const folderTriggers = useRef(new Map<string, HTMLButtonElement>());
  const headingTrigger = useRef<HTMLButtonElement>(null);
  const editingOrigin = useRef<{ kind: "folder" | "heading"; id?: string }>({ kind: "heading" });
  const focusReturn = useRef<{ kind: "chat" | "folder" | "heading"; id?: string } | null>(null);
  useLayoutEffect(() => {
    if (!focusReturn.current || renaming || moving || deleting || editing) return;
    const { kind, id } = focusReturn.current;
    const target =
      kind === "chat"
        ? actionTriggers.current.get(id ?? "")
        : kind === "folder"
          ? folderTriggers.current.get(id ?? "")
          : headingTrigger.current;
    (target?.isConnected
      ? target
      : (root.current?.querySelector<HTMLButtonElement>(".session-open") ?? headingTrigger.current)
    )?.focus({ preventScroll: true });
    focusReturn.current = null;
  }, [rows, renaming, moving, deleting, editing]);
  useEffect(() => {
    if (moving) projectSelectors.current.get(moving)?.focus();
  }, [moving]);
  function dismiss(chatId: string) {
    focusReturn.current = { kind: "chat", id: chatId };
    setMoving(null);
    setDeleting(null);
    setRenaming(null);
  }
  useEffect(() => {
    const refresh = () => setOrganization(readChatFolders(localStorage));
    if (privateMode) return;
    window.addEventListener("storage", refresh);
    window.addEventListener("aux-chat-folders", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("aux-chat-folders", refresh);
    };
  }, [privateMode]);
  function organize(work: () => void) {
    if (bridge.privateMode) return;
    try {
      work();
      window.dispatchEvent(new Event("aux-chat-folders"));
    } catch (reason) {
      errToast(reason);
    }
  }
  async function mutate(item: ConversationSummary, remove: boolean) {
    if (await actions.perform(remove ? "delete" : "archive", item)) {
      focusReturn.current = { kind: "chat", id: item.chatId };
      setDeleting(null);
      setMoving(null);
    }
  }
  function edit(folder?: ChatFolder) {
    editingOrigin.current = folder ? { kind: "folder", id: folder.id } : { kind: "heading" };
    setEditing(folder ?? { id: crypto.randomUUID(), name: "", collapsed: false });
    setName(folder?.name ?? "");
  }
  function finishEdit() {
    focusReturn.current = editingOrigin.current;
    setEditing(null);
  }
  const showHistory = () => {
    useStore.getState().openConversation(null);
    useStore.setState({ conversationId: "history" });
  };
  const term = query.trim().toLocaleLowerCase();
  const matches = term ? rows.filter((row) => row.title.toLocaleLowerCase().includes(term)) : rows;
  async function rename(item: ConversationSummary) {
    if (!chatName.trim()) return;
    if (await actions.perform("rename", item, chatName)) {
      focusReturn.current = { kind: "chat", id: item.chatId };
      setRenaming(null);
    }
  }

  const chatRow = (item: ConversationSummary): ChatListRow => ({
    entry: savedChat(item),
    selected: active === item.chatId,
    openClassName: "session-open",
    className: `session-item${active === item.chatId ? " active" : ""}`,
    contentClassName: `session-row${active === item.chatId ? " active" : ""}`,
    onKeyDown: (event) => {
      if (
        event.key === "Escape" &&
        (moving === item.chatId || deleting === item.chatId || renaming === item.chatId)
      ) {
        event.preventDefault();
        event.stopPropagation();
        dismiss(item.chatId);
      }
    },
    actions: (
      <div className="session-actions">
        {!["completed", "cancelled"].includes(item.latestRun.status) && (
          <span
            className={`session-status ${item.latestRun.status}`}
            role="status"
            title={STATUS_LABEL[item.latestRun.status]}
            aria-label={STATUS_LABEL[item.latestRun.status]}
          />
        )}
        <ActionMenu
          label={`Actions for ${item.title || "New chat"}`}
          triggerRef={(node) => {
            if (node) actionTriggers.current.set(item.chatId, node);
            else actionTriggers.current.delete(item.chatId);
          }}
          actions={[
            {
              label: "Rename",
              icon: shellIconPencil,
              disabled: busy,
              onSelect: () => {
                setRenaming(item.chatId);
                setChatName(item.title);
                setMoving(null);
                setDeleting(null);
              },
            },
            ...(!privateMode
              ? [
                  {
                    label: "Move to project",
                    icon: shellIconFolder,
                    disabled: busy,
                    onSelect: () => {
                      setMoving(item.chatId);
                      setDeleting(null);
                      setRenaming(null);
                    },
                  },
                ]
              : []),
            {
              label: archived ? "Restore chat" : "Archive chat",
              icon: shellIconArchive,
              disabled: busy,
              onSelect: () => {
                void mutate(item, false);
              },
            },
            {
              label: "Delete chat…",
              icon: shellIconTrash,
              danger: true,
              disabled: busy,
              onSelect: () => {
                setDeleting(item.chatId);
                setMoving(null);
                setRenaming(null);
              },
            },
          ]}
        />
      </div>
    ),
    details: (
      <>
        {renaming === item.chatId && (
          <form
            className="session-editor"
            onSubmit={(event) => {
              event.preventDefault();
              void rename(item);
            }}
          >
            <input
              autoFocus
              aria-label="Conversation name"
              maxLength={160}
              value={chatName}
              onChange={(event) => setChatName(event.target.value)}
            />
            <button {...smallButtonProps} disabled={busy || !chatName.trim()}>
              Save
            </button>
            <button
              {...smallGhostButtonProps}
              {...auxNativeButtonTypeProps}
              onClick={() => dismiss(item.chatId)}
            >
              Cancel
            </button>
          </form>
        )}
        <div
          className={`session-disclosure${moving === item.chatId ? " open" : ""}`}
          aria-hidden={moving !== item.chatId}
          inert={moving !== item.chatId}
        >
          <div>
            <label className="session-move">
              Project
              <select
                ref={(node) => {
                  if (node) projectSelectors.current.set(item.chatId, node);
                  else projectSelectors.current.delete(item.chatId);
                }}
                aria-label={`Project for ${item.title}`}
                value={
                  organization.members[item.chatId] &&
                  organization.folders.some((f) => f.id === organization.members[item.chatId])
                    ? organization.members[item.chatId]
                    : ""
                }
                onChange={(event) => {
                  organize(() => moveChatToFolder(localStorage, item.chatId, event.target.value));
                  focusReturn.current = { kind: "chat", id: item.chatId };
                  setMoving(null);
                }}
              >
                <option value="">No project</option>
                {organization.folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div
          className={`session-disclosure${deleting === item.chatId ? " open" : ""}`}
          aria-hidden={deleting !== item.chatId}
          inert={deleting !== item.chatId}
        >
          <div>
            <div className="session-confirm" role="group" aria-label={`Delete ${item.title} permanently?`}>
              <span>Delete this chat permanently?</span>
              <button className="btn ghost danger" disabled={busy} onClick={() => void mutate(item, true)}>
                Delete permanently
              </button>
              <button {...auxClassGhostButtonProps} onClick={() => dismiss(item.chatId)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    ),
  });
  const renderChats = (items: ConversationSummary[]) => (
    <ChatList
      rows={items.map(chatRow)}
      onOpen={(entry) => {
        if (entry.kind === "saved-chat") useStore.getState().openConversation(entry.item.latestRun.runId);
      }}
    />
  );
  return (
    <div ref={root} className={`chat-sessions${compact ? " compact" : ""}`} aria-busy={loading}>
      <div className="session-heading">
        <span>
          {archived ? "Archived chats" : privateMode ? "Private chats" : compact ? "Recent" : "Chats"}
        </span>
        <ActionMenu
          label="Chat options"
          triggerRef={(node) => {
            headingTrigger.current = node;
          }}
          actions={[
            ...(!privateMode
              ? [{ label: "New chat project", icon: shellIconFolder, onSelect: () => edit() }]
              : []),
            {
              label: archived ? "Active chats" : "Archived chats",
              icon: shellIconArchive,
              onSelect: () => {
                setArchived(!archived);
              },
            },
            {
              label: privateMode ? "All private chats" : "All chats",
              icon: shellIconChats,
              onSelect: showHistory,
            },
          ]}
        />
      </div>
      {!privateMode && (organization.folders.length > 0 || editing) && (
        <div className="session-heading">
          <span>Projects</span>
        </div>
      )}
      {!privateMode && editing && (
        <form
          className="session-editor"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            organize(() => writeChatFolder(localStorage, { ...editing, name: name.trim() }));
            finishEdit();
          }}
        >
          <input
            autoFocus
            aria-label="Chat project name"
            placeholder="Project name"
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                finishEdit();
              }
            }}
          />
          <button {...auxClassButtonProps} disabled={!name.trim()}>
            Save
          </button>
          <button {...auxNativeButtonTypeProps} {...auxClassGhostButtonProps} onClick={finishEdit}>
            Cancel
          </button>
        </form>
      )}
      {organization.folders.map((folder) => {
        const children = matches.filter((row) => organization.members[row.chatId] === folder.id);
        if (term && !children.length) return null;
        return (
          <div className="session-folder" key={folder.id}>
            <div className="session-row">
              <button
                className="session-folder-toggle"
                aria-expanded={!!term || !folder.collapsed}
                onClick={() =>
                  organize(() => writeChatFolder(localStorage, { ...folder, collapsed: !folder.collapsed }))
                }
              >
                {folder.collapsed ? shellIconRight : shellIconDown}
                <span>{folder.name}</span>
                {!compact && (
                  <small>{rows.filter((row) => organization.members[row.chatId] === folder.id).length}</small>
                )}
              </button>
              <div className="session-actions">
                <ActionMenu
                  label={`Actions for project ${folder.name}`}
                  triggerRef={(node) => {
                    if (node) folderTriggers.current.set(folder.id, node);
                    else folderTriggers.current.delete(folder.id);
                  }}
                  actions={[
                    { label: "Rename project", icon: shellIconPencil, onSelect: () => edit(folder) },
                    {
                      label: "Remove folder; keep chats",
                      icon: shellIconClose,
                      onSelect: () => organize(() => removeChatFolder(localStorage, folder.id)),
                    },
                  ]}
                />
              </div>
            </div>
            {(term || !folder.collapsed) && (
              <div className="session-folder-chats">
                {renderChats(children)}
                {!children.length && !compact && (
                  <p className="session-empty">Use a chat’s menu to move it here.</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {renderChats(
        matches.filter(
          (row) => !organization.folders.some((folder) => folder.id === organization.members[row.chatId]),
        ),
      )}
      {compact && (rows.length > 0 || archived || organization.folders.length > 0) && (
        <button className="sb-link sb-show-all" onClick={showHistory}>
          {privateMode ? "All private chats" : "All chats"} {shellIconRight}
        </button>
      )}
      {loading && !rows.length && (
        <output className="session-empty" data-block>
          Loading chats…
        </output>
      )}
      {!loading && !error && !matches.length && (!compact || term || archived) && (
        <p className="session-empty">
          {term ? "No matching chats." : archived ? "No archived chats." : "Your sessions will appear here."}
        </p>
      )}
      {(error || actions.error) && (
        <p className="session-empty" {...nativeAlertRoleProps}>
          {error || actions.error}
          <button
            {...auxClassGhostButtonProps}
            onClick={() => {
              actions.dismissError();
              void collection.retry();
            }}
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
