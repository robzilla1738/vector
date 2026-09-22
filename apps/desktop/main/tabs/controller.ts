import { TabCommandEnvelopeSchema, type TabCatalogSnapshot, type TabCommandAck, type TabCommandEnvelope, type TabPatch, type TabPatchOp, type TabPlacement } from "@aux/contracts";
import { newTabRecord, type TabCatalog } from "./catalog.js";

/**
 * Side effects the controller needs from the desktop main. Implemented over
 * the existing native-view machinery in index.ts — kept as a narrow port so
 * the command path stays testable without Electron.
 */
export interface TabPorts {
  /** Create the native view and register it in the owning window. */
  open(input: { pageId: string; windowId: string; url: string; background: boolean; activate: boolean }): Promise<void> | void;
  /** Returns false when the page refused to close (beforeunload veto). */
  close(pageId: string): Promise<boolean>;
  focus(pageId: string): Promise<void> | void;
  navigate(pageId: string, url: string): Promise<void> | void;
  back(pageId: string): void;
  forward(pageId: string): void;
  reload(pageId: string, hard: boolean): Promise<void> | void;
  stop(pageId: string): void;
  setMuted(pageId: string, muted: boolean): void;
  /** Move the view to `windowId`, creating the window when it is omitted. */
  move(pageId: string, windowId: string | undefined, activate: boolean): Promise<{ windowId: string; sourceActivePageId: string | null; activePageId: string | null }>;
  /** The window a pageId currently lives in — cross-window scope check. */
  windowOf(pageId: string): string | undefined;
  /** Mint a pageId when the command did not carry an optimistic one. */
  mintPageId(): string;
}

const REJECT = (commandId: string, catalogVersion: number, code: string, message: string): TabCommandAck =>
  ({ commandId, status: "rejected", catalogVersion, error: { code, message } });

const DEDUP_LIMIT = 512;

/**
 * Typed human tab commands (§7.2). Validates the sender's window scope,
 * deduplicates repeated commandIds, checks the caller's catalog version
 * against the target tab's last mutation, actuates through `ports`, and
 * publishes the resulting catalog patch. Navigation starts immediately —
 * progress reports ride the patch stream, not the ack.
 */
export class TabController {
  /** commandId → the ack that was issued. Repeated sends replay the ack. */
  private seen = new Map<string, TabCommandAck>();

  constructor(
    private deps: {
      catalog: TabCatalog;
      ports: TabPorts;
      publish(patch: TabPatch): void;
      /** Relay a move's workspace placement to the shells (browser truth stays in the patch). */
      placement?(payload: { pageId: string; windowId: string; placement: TabPlacement }): void;
    },
  ) {}

  execute(raw: unknown, senderWindowId: string, opts?: { trusted?: boolean }): Promise<TabCommandAck> {
    const parsed = TabCommandEnvelopeSchema.safeParse(raw);
    if (!parsed.success) {
      return Promise.resolve(REJECT("", this.deps.catalog.currentVersion, "invalid_params", "This tab command could not be understood."));
    }
    const env = parsed.data;
    const catalog = this.deps.catalog;
    const prior = this.seen.get(env.commandId);
    if (prior) return Promise.resolve({ ...prior, status: "duplicate" });
    if (env.windowId !== senderWindowId) {
      return Promise.resolve(this.record(env, REJECT(env.commandId, catalog.currentVersion, "wrong_window", "This command belongs to another Aux window.")));
    }
    const targetId = "pageId" in env.command ? env.command.pageId : undefined;
    const target = targetId ? catalog.tab(targetId) : undefined;
    if (targetId) {
      const owner = this.deps.ports.windowOf(targetId) ?? target?.windowId;
      // Cross-window commands are legal only through the catalog's own move
      // surface; a renderer never actuates another window's tab directly.
      if (owner && owner !== senderWindowId) {
        return Promise.resolve(this.record(env, REJECT(env.commandId, catalog.currentVersion, "wrong_window", "That tab belongs to another Aux window.")));
      }
      if (!target && env.command.kind !== "open") {
        return Promise.resolve(this.record(env, REJECT(env.commandId, catalog.currentVersion, "not_found", "This browser tab is no longer available.")));
      }
      const revision = catalog.revisionOf(targetId);
      if (env.catalogVersion !== undefined && revision !== undefined && env.catalogVersion < revision) {
        return Promise.resolve(this.record(env, REJECT(env.commandId, catalog.currentVersion, "stale_tab", "This tab changed after the command was issued — send it again on current state.")));
      }
    }
    return this.apply(env, opts?.trusted === true).then(
      ack => this.record(env, ack),
      () => this.record(env, REJECT(env.commandId, catalog.currentVersion, "unavailable", "The tab could not be reached. Try again.")),
    );
  }

  private record(env: TabCommandEnvelope, ack: TabCommandAck): TabCommandAck {
    this.seen.set(env.commandId, ack);
    if (this.seen.size > DEDUP_LIMIT) this.seen.delete(this.seen.keys().next().value!);
    return ack;
  }

  private applied(env: TabCommandEnvelope, ops: TabPatchOp[], pageId?: string, windowId?: string): TabCommandAck {
    const patch = ops.length ? this.deps.catalog.apply(ops) : null;
    const version = this.deps.catalog.currentVersion;
    if (patch) this.deps.publish(patch);
    return { commandId: env.commandId, status: "applied", catalogVersion: version, pageId, ...(windowId ? { windowId } : {}) };
  }

  private async apply(env: TabCommandEnvelope, trusted: boolean): Promise<TabCommandAck> {
    const { catalog, ports } = this.deps;
    const command = env.command;
    switch (command.kind) {
      case "open": {
        const pageId = command.pageId ?? ports.mintPageId();
        const existing = catalog.tab(pageId);
        const activate = command.activate ?? !command.background;
        if (existing) {
          // Renderer's optimistic-id contract: a colliding id is a bug, never a rebind.
          if (!trusted) return REJECT(env.commandId, catalog.currentVersion, "duplicate_page", "That tab id is already in use.");
          // Agent opens are idempotent — a live tab is focused, a persisted
          // record with no view is materialized (session restore/retry). The
          // fresh WebContents bumps the generation so commands aimed at the
          // dead instance stay rejected.
          const live = ports.windowOf(pageId) !== undefined;
          await ports.open({ pageId, windowId: env.windowId, url: command.url ?? existing.url, background: command.background === true, activate });
          const owner = catalog.window(existing.windowId);
          const ops: TabPatchOp[] = [{ op: "upsert", tab: live ? { ...existing, lastActiveAt: activate ? Date.now() : existing.lastActiveAt } : { ...existing, generation: catalog.nextGeneration(pageId) } }];
          if (activate) ops.push({ op: "window", window: { windowId: existing.windowId, order: owner?.order ?? [pageId], activePageId: pageId } });
          return this.applied(env, ops, pageId);
        }
        const url = command.url ?? "about:blank";
        await ports.open({ pageId, windowId: env.windowId, url, background: command.background === true, activate });
        const owner = catalog.window(env.windowId);
        const runtimeOwned = trusted && command.runtimeOwned === true;
        const tab = newTabRecord({ pageId, windowId: env.windowId, url, runtimeOwned, generation: catalog.nextGeneration(pageId) });
        return this.applied(env, [
          { op: "upsert", tab, origin: runtimeOwned ? "runtime" : "human" },
          { op: "window", window: { windowId: env.windowId, order: [...(owner?.order ?? []), pageId], activePageId: activate ? pageId : owner?.activePageId ?? null } },
        ], pageId);
      }
      case "close": {
        const tab = catalog.tab(command.pageId)!;
        const ok = await ports.close(command.pageId);
        if (!ok) return REJECT(env.commandId, catalog.currentVersion, "close_vetoed", "The page asked to stay open.");
        const owner = catalog.window(tab.windowId);
        const order = (owner?.order ?? []).filter(id => id !== command.pageId);
        // Closing the active tab focuses its neighbour, like every browser.
        let activePageId = owner?.activePageId ?? null;
        if (activePageId === command.pageId) {
          const index = (owner?.order ?? []).indexOf(command.pageId);
          activePageId = order[Math.min(Math.max(index, 0), order.length - 1)] ?? null;
          if (activePageId) await ports.focus(activePageId);
        }
        const ops: TabPatchOp[] = [{ op: "remove", pageId: command.pageId }];
        const next = activePageId ? catalog.tab(activePageId) : undefined;
        if (next) ops.push({ op: "upsert", tab: { ...next, lastActiveAt: Date.now() } });
        ops.push({ op: "window", window: { windowId: tab.windowId, order, activePageId } });
        return this.applied(env, ops, command.pageId);
      }
      case "activate": {
        const tab = catalog.tab(command.pageId)!;
        await ports.focus(command.pageId);
        const owner = catalog.window(tab.windowId);
        return this.applied(env, [
          { op: "upsert", tab: { ...tab, lastActiveAt: Date.now() } },
          { op: "window", window: { windowId: tab.windowId, order: owner?.order ?? [tab.pageId], activePageId: tab.pageId } },
        ], tab.pageId);
      }
      case "navigate": {
        const tab = catalog.tab(command.pageId)!;
        await ports.navigate(command.pageId, command.url);
        return this.applied(env, [{ op: "upsert", tab: { ...tab, url: command.url, loading: true, crashed: false, navigationError: undefined } }], tab.pageId);
      }
      case "back": ports.back(command.pageId); return this.applied(env, [], command.pageId);
      case "forward": ports.forward(command.pageId); return this.applied(env, [], command.pageId);
      case "reload": await ports.reload(command.pageId, command.hard === true); return this.applied(env, [], command.pageId);
      case "stop": {
        const tab = catalog.tab(command.pageId)!;
        ports.stop(command.pageId);
        return this.applied(env, [{ op: "upsert", tab: { ...tab, loading: false } }], tab.pageId);
      }
      case "setMuted": {
        const tab = catalog.tab(command.pageId)!;
        ports.setMuted(command.pageId, command.muted);
        return this.applied(env, [{ op: "upsert", tab: { ...tab, muted: command.muted } }], tab.pageId);
      }
      case "reorder": {
        const owner = catalog.window(env.windowId);
        // Every id must already be this window's tab — a reorder never moves
        // tabs across windows or resurrects ones that were removed.
        if (command.order.some(pageId => catalog.tab(pageId)?.windowId !== env.windowId)) {
          return REJECT(env.commandId, catalog.currentVersion, "wrong_window", "Reorder only accepts tabs inside the issuing window.");
        }
        const order = [...command.order];
        for (const pageId of owner?.order ?? []) if (!order.includes(pageId)) order.push(pageId);
        return this.applied(env, [{ op: "window", window: { windowId: env.windowId, order, activePageId: owner?.activePageId ?? null } }]);
      }
      case "move": {
        const tab = catalog.tab(command.pageId)!;
        const moved = await ports.move(command.pageId, command.windowId, command.activate ?? true);
        if (moved.windowId === tab.windowId) return this.applied(env, [], command.pageId, moved.windowId);
        const source = catalog.window(tab.windowId);
        const destination = catalog.window(moved.windowId);
        const ack = this.applied(env, [
          { op: "upsert", tab: { ...tab, windowId: moved.windowId }, origin: trusted ? "runtime" : "human" },
          { op: "window", window: { windowId: tab.windowId, order: (source?.order ?? []).filter(pageId => pageId !== command.pageId), activePageId: moved.sourceActivePageId } },
          { op: "window", window: { windowId: moved.windowId, order: [...(destination?.order ?? []).filter(pageId => pageId !== command.pageId), command.pageId], activePageId: moved.activePageId } },
        ], command.pageId, moved.windowId);
        if (command.placement) this.deps.placement?.({ pageId: command.pageId, windowId: moved.windowId, placement: command.placement });
        return ack;
      }
    }
  }

  snapshot(): TabCatalogSnapshot {
    return this.deps.catalog.snapshot();
  }
}
