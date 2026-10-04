import { errorMessage } from "../../error-message";
import { useEffect, useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { bridge } from "../../bridge";
import { mergeHistory } from "../../run-history";
import { call, useStore } from "../../store";
import { SettingsField, SettingsSection } from "../primitives";

const PAGE_SIZE = 40;

export function ArchivedChatsSettings({ active }: { active: boolean }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const version = useRef(0);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  async function load(append: boolean, currentQuery = query) {
    const request = ++version.current;
    setLoading(true);
    setError("");
    try {
      const target = append ? PAGE_SIZE : Math.max(PAGE_SIZE, rowsRef.current.length);
      let before = append && rowsRef.current.length
        ? { updatedAt: rowsRef.current[rowsRef.current.length - 1]!.updatedAt, chatId: rowsRef.current[rowsRef.current.length - 1]!.chatId }
        : undefined;
      const found: ConversationSummary[] = [];
      while (found.length <= target) {
        const limit = Math.min(200, target + 1 - found.length);
        const page = await call("conversations.list", {
          archived: true,
          query: currentQuery.trim(),
          limit,
          ...(before ? { before } : {}),
        });
        if (request !== version.current) return;
        found.push(...page);
        if (page.length < limit) break;
        const last = page[page.length - 1]!;
        before = { updatedAt: last.updatedAt, chatId: last.chatId };
      }
      if (request !== version.current) return;
      const page = found.slice(0, target);
      setRows(current => append ? [...current, ...page.filter(item => !current.some(row => row.chatId === item.chatId))] : page);
      setMore(found.length > target);
    } catch (reason) {
      if (request === version.current) setError(errorMessage(reason));
    } finally {
      if (request === version.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!active) { ++version.current; return; }
    const requestVersion = version;
    const timer = window.setTimeout(() => void load(false, query), 180);
    return () => { window.clearTimeout(timer); ++requestVersion.current; };
    // A new query starts at the first page; pagination uses the current rows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query]);

  useEffect(() => {
    if (!active) return;
    return bridge.onEvent(event => {
      if (event.type === "conversation.changed" || event.type === "conversation.deleted") void load(false);
    });
    // Refresh the visible archive when another surface changes a conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query]);

  async function restore(item: ConversationSummary) {
    setBusyId(item.chatId);
    setError("");
    try {
      const restored = await call("conversations.archive", { chatId: item.chatId, archived: false });
      mergeHistory([restored.latestRun]);
      setRows(current => current.filter(row => row.chatId !== item.chatId));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SettingsSection name="Archived chats" hidden={!active}>
      <SettingsField label="Find archived chats" hint="Archived chats remain available until you delete them from chat history.">
        <input
          aria-label="Search archived chats"
          placeholder="Search archived chats…"
          maxLength={500}
          value={query}
          onChange={event => {
            ++version.current;
            rowsRef.current = [];
            setRows([]);
            setMore(false);
            setQuery(event.target.value);
          }}
        />
      </SettingsField>
      {error && <p role="alert" className="field-error">{error} <button className="btn sm" onClick={() => void load(false)}>Try again</button></p>}
      <div className="settings-archived-list" aria-busy={loading}>
        {rows.map(item => <div className="settings-archived-row" key={item.chatId}>
          <button className="settings-archived-open" disabled={busyId !== null} onClick={() => {
            mergeHistory([item.latestRun]);
            useStore.getState().openConversation(item.latestRun.runId);
          }}>
            <strong>{item.title}</strong>
            <span>{new Date(item.updatedAt).toLocaleString()} · {item.turnCount} {item.turnCount === 1 ? "turn" : "turns"}</span>
          </button>
          <button className="btn sm ghost" disabled={busyId !== null} onClick={() => void restore(item)}>
            {busyId === item.chatId ? "Restoring…" : "Restore"}
          </button>
        </div>)}
        {loading && <output className="hint" data-block>Loading archived chats…</output>}
        {!loading && !error && !rows.length && <p className="hint">{query.trim() ? "No archived chats match your search." : "No archived chats yet."}</p>}
        {more && !error && <button className="btn sm" disabled={loading || busyId !== null} onClick={() => void load(true)}>Load more</button>}
      </div>
    </SettingsSection>
  );
}
