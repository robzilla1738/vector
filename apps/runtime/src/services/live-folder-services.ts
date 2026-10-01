import { createHash } from "node:crypto";
import { AuxError, LiveFolderItemSchema, type LiveFolderItem } from "@aux/contracts";
import type { MethodCtx, Services } from "../api/methods/context.js";
import { GithubConnectionService } from "./github-connection.js";
import { LiveFolderService } from "./live-folders.js";

const services = new WeakMap<Services, { github: GithubConnectionService; folders: LiveFolderService }>();

async function routineRows(ctx: Pick<MethodCtx, "s" | "routines">, routineId: string, signal: AbortSignal): Promise<LiveFolderItem[]> {
  const { routine, runs } = ctx.routines.get(routineId);
  const active = runs.find(run => ["queued", "running", "waiting_input", "needs_review"].includes(run.status));
  const run = active ?? await ctx.routines.run({ routineId, expectedRevision: routine.revision });
  const deadline = Date.now() + 120_000;
  for (;;) {
    signal.throwIfAborted();
    const current = ctx.routines.get(routineId).runs.find(item => item.routineRunId === run.routineRunId);
    if (!current || ["failed", "cancelled", "uncertain", "needs_review", "waiting_input"].includes(current.status))
      throw new AuxError("needs_input", "Review this routine in Automations before refreshing its folder.");
    if (current.status === "completed" && current.runId) {
      const result = ctx.s.repo.getRun(current.runId)?.result;
      const rows = result?.rows ?? result?.urls;
      if (!Array.isArray(rows)) throw new AuxError("backend_unavailable", "This routine did not return URL rows.");
      return rows.slice(0, 25).map(raw => {
        const row = typeof raw === "string" ? { url: raw, title: raw } : raw;
        if (!row || typeof row !== "object") throw new AuxError("backend_unavailable", "This routine returned invalid URL rows.");
        const item = row as Record<string, unknown>;
        return LiveFolderItemSchema.parse({ id: typeof item.id === "string" ? item.id : createHash("sha256").update(String(item.url)).digest("hex"), url: item.url, title: item.title,
          ...(typeof item.subtitle === "string" ? { subtitle: item.subtitle } : {}), unread: true, updatedAt: 0 });
      });
    }
    if (Date.now() >= deadline) throw new AuxError("backend_unavailable", "This routine is still running. Refresh its folder when it finishes.");
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export function liveFolderServices(ctx: Pick<MethodCtx, "s" | "routines">) {
  const existing = services.get(ctx.s);
  if (existing) return existing;
  if (!ctx.s.native) throw new AuxError("backend_unavailable", "Live folders require Aux desktop.");
  const github = new GithubConnectionService({ repo: ctx.s.repo, native: ctx.s.native,
    endpoint: async () => (await ctx.s.nativeIdentity?.catch(() => undefined))?.loopbackServicesUrl });
  const folders = new LiveFolderService({ repo: ctx.s.repo, github, calendar: ctx.s.calendar,
    sources: async () => {
      if (!ctx.s.native?.liveFolderSources) throw new AuxError("backend_unavailable", "Profile live folders are unavailable.");
      return ctx.s.native.liveFolderSources();
    }, routineItems: (id, signal) => routineRows(ctx, id, signal) });
  const value = { github, folders }; services.set(ctx.s, value); return value;
}

export function stopLiveFolderServices(s: Services) { services.get(s)?.folders.close(); services.delete(s); }
