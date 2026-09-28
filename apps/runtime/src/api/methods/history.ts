import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { BrowserHistoryLedger } from "../../services/browser-history-ledger.js";

async function h_history_projectSnapshot(ctx: MethodCtx): Promise<unknown> {
  const { client, historyProjection, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Only the native HistoryService can project browsing history.");
  const result = historyProjection.snapshot(params);
  if (result.accepted && result.committed) {
    s.checkpointDeletedData?.();
    s.events.emit("history.changed", {});
  }
  return result;
}
async function h_history_projectDelta(ctx: MethodCtx): Promise<unknown> {
  const { client, historyProjection, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Only the native HistoryService can project browsing history.");
  const newVisits = [...new Map((params.upserts as { url: string; title: string; visitedAt: number }[])
    .filter(visit => !s.repo.db.prepare("SELECT 1 FROM history WHERE url=? AND visited_at=?")
      .get(visit.url, visit.visitedAt))
    .map(visit => [`${visit.url}\u0000${visit.visitedAt}`, visit] as const)).values()];
  const result = historyProjection.delta(params);
  if (result.accepted) {
    new BrowserHistoryLedger(s.repo).record(newVisits, s.pages.list());
    if (params.removals.length || params.clearRange) s.checkpointDeletedData?.();
    s.events.emit("history.changed", {});
  }
  return result;
}
async function h_history_list(ctx: MethodCtx): Promise<unknown> {
  const { historyProjection, host, params, s } = ctx;
  if (host === "chromium-fork" && !historyProjection.isCurrentSessionReady()) return [];
  return s.repo.listHistory(params.query, params.limit, params);
}
async function h_history_clear(ctx: MethodCtx): Promise<unknown> {
  const { client, historyProjection, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
  let removed: number;
  if (historyProjection.isAuthoritative()) {
    if (!s.native?.historyClear)
      throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable.");
    removed = (await s.native.historyClear(params)).removed;
  } else removed = s.repo.clearHistory(params);
  if (removed && !historyProjection.isAuthoritative()) s.checkpointDeletedData?.();
  if (!historyProjection.isAuthoritative()) s.events.emit("history.changed", {});
  return { ok: true, removed };
}
async function h_history_count(ctx: MethodCtx): Promise<unknown> {
  const { historyProjection, params, s } = ctx;
  if (historyProjection.isAuthoritative() && !historyProjection.isCurrentSessionReady())
    throw new AuxError("backend_unavailable", "Chromium history is still loading. Try again shortly.");
  return { count: s.repo.countHistory(params) };
}
async function h_history_remove(ctx: MethodCtx): Promise<unknown> {
  const { client, historyProjection, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
  let removed: boolean;
  if (historyProjection.isAuthoritative()) {
    if (!s.native?.historyRemove)
      throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable.");
    removed = (await s.native.historyRemove(params.url, params.visitedAt)).removed;
  } else removed = s.repo.removeHistory(params.url, params.visitedAt);
  if (removed && !historyProjection.isAuthoritative()) s.checkpointDeletedData?.();
  if (!historyProjection.isAuthoritative()) s.events.emit("history.changed", {});
  return { removed };
}

export const historyMethods: Partial<Record<MethodName, MethodHandler>> = {
  "history.projectSnapshot": h_history_projectSnapshot,
  "history.projectDelta": h_history_projectDelta,
  "history.list": h_history_list,
  "history.count": h_history_count,
  "history.clear": h_history_clear,
  "history.remove": h_history_remove,
};
