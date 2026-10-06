import { AuxError, type PageTarget, type AgentPageCreate } from "@aux/contracts";
import type { PageService } from "../services/pages.js";

const TURN_TTL_MS = 60 * 60_000;
type Turn = {
  taskId: string;
  connectionId: string;
  expiresAt: number;
  pageIds: Set<string>;
  authority: Map<
    string,
    { runId: string; taskId?: string; taskRevision: number; mode: AgentPageCreate["mode"] }
  >;
  clipboardText?: string;
};

/** Runtime-owned tabs belong to a task turn, not the user's persistent session. */
export class AgentTurnTabs {
  private turns = new Map<string, Turn>();
  private timer: NodeJS.Timeout;
  constructor(
    private pages: Pick<PageService, "open" | "close" | "get">,
    private onHumanTakeover: (page: PageTarget) => void = () => {},
    private now = Date.now,
  ) {
    this.timer = setInterval(() => {
      void this.sweep();
    }, 60_000);
    this.timer.unref();
  }
  private key(connectionId: string, taskId: string, turnId: string) {
    return `${connectionId}:${taskId}:${turnId}`;
  }
  pageIds(connectionId: string): string[] {
    return [...this.turns.values()]
      .filter((turn) => turn.connectionId === connectionId)
      .flatMap((turn) => [...turn.pageIds]);
  }
  owns(connectionId: string, taskId: string, pageId: string): boolean {
    return [...this.turns.values()].some(
      (turn) =>
        turn.connectionId === connectionId &&
        turn.taskId === taskId &&
        turn.pageIds.has(pageId) &&
        this.currentAuthority(turn, pageId),
    );
  }
  private currentAuthority(turn: Turn, pageId: string): boolean {
    try {
      const page = this.pages.get(pageId);
      const saved = turn.authority.get(pageId);
      return (
        page.ownedByRuntime &&
        page.controller !== "human" &&
        (!saved ||
          (page.agentIsolation?.runId === saved.runId &&
            page.agentIsolation.taskId === saved.taskId &&
            page.agentIsolation.taskRevision === saved.taskRevision &&
            page.agentIsolation.mode === saved.mode))
      );
    } catch {
      return false;
    }
  }
  private begin(connectionId: string, taskId: string, turnId: string): Turn {
    const key = this.key(connectionId, taskId, turnId);
    let turn = this.turns.get(key);
    if (!turn) {
      turn = {
        taskId,
        connectionId,
        expiresAt: this.now() + TURN_TTL_MS,
        pageIds: new Set(),
        authority: new Map(),
      };
      this.turns.set(key, turn);
    }
    turn.expiresAt = this.now() + TURN_TTL_MS;
    return turn;
  }
  writeClipboard(connectionId: string, taskId: string, turnId: string, text: string): { bytes: number } {
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > 256_000)
      throw new AuxError("invalid_params", "The turn clipboard is limited to 256 KB of text.");
    this.begin(connectionId, taskId, turnId).clipboardText = text;
    return { bytes };
  }
  readClipboard(connectionId: string, taskId: string, turnId: string): string {
    const turn = this.turns.get(this.key(connectionId, taskId, turnId));
    if (!turn || turn.clipboardText === undefined)
      throw new AuxError("not_found", "This task turn has no clipboard text.");
    return turn.clipboardText;
  }
  async open(input: {
    connectionId: string;
    taskId: string;
    turnId: string;
    url: string;
    skipIfActive?: boolean;
    beforeNavigate?: (target: PageTarget) => Promise<void>;
    agentScope?: Omit<AgentPageCreate, "windowId" | "background">;
  }): Promise<PageTarget> {
    const turn = this.begin(input.connectionId, input.taskId, input.turnId);
    if (input.skipIfActive)
      for (const pageId of turn.pageIds) {
        try {
          const page = this.pages.get(pageId);
          if (
            page.url === input.url &&
            this.currentAuthority(turn, pageId) &&
            (!input.agentScope ||
              (page.agentIsolation?.runId === input.agentScope.runId &&
                page.agentIsolation.taskRevision === input.agentScope.taskRevision &&
                page.agentIsolation.taskId === input.agentScope.taskId &&
                page.agentIsolation.mode === input.agentScope.mode))
          ) {
            turn.expiresAt = this.now() + TURN_TTL_MS;
            return page;
          }
        } catch {
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
        }
      }
    const page = await this.pages.open({
      url: input.url,
      background: true,
      ownedByRuntime: true,
      beforeNavigate: input.beforeNavigate,
      agentScope: input.agentScope,
    });
    turn.pageIds.add(page.pageId);
    if (input.agentScope)
      turn.authority.set(page.pageId, {
        runId: input.agentScope.runId,
        taskId: input.agentScope.taskId,
        taskRevision: input.agentScope.taskRevision,
        mode: input.agentScope.mode,
      });
    turn.expiresAt = this.now() + TURN_TTL_MS;
    return page;
  }
  async close(connectionId: string, taskId: string, pageId: string): Promise<{ok: boolean}> {
    const turn = [...this.turns.values()].find(item => item.connectionId === connectionId && item.taskId === taskId && item.pageIds.has(pageId));
    if (!turn || !this.currentAuthority(turn, pageId))
      throw new AuxError("permission_denied", "The original connection no longer owns this tab.");
    const result = await this.pages.close(pageId);
    if (!result.ok) throw new AuxError("conflict", "Native tab closure was not acknowledged.");
    turn.pageIds.delete(pageId);
    turn.authority.delete(pageId);
    return result;
  }
  async endConnection(connectionId: string): Promise<void> {
    const failures: unknown[] = [];
    for (const [key, turn] of this.turns) {
      if (turn.connectionId !== connectionId) continue;
      try {
        await this.end(connectionId, turn.taskId, key.slice(`${connectionId}:${turn.taskId}:`.length));
        if (this.turns.has(key)) failures.push(new AuxError("conflict", "Original task tabs await native closure acknowledgement."));
      } catch (error) { failures.push(error); }
    }
    if (failures.length) throw new AggregateError(failures, "External task tab cleanup is incomplete.");
  }
  async end(connectionId: string, taskId: string, turnId: string): Promise<{ closed: string[] }> {
    const key = this.key(connectionId, taskId, turnId);
    const turn = this.turns.get(key);
    if (!turn) return { closed: [] };
    delete turn.clipboardText;
    const closed: string[] = [];
    for (const pageId of turn.pageIds) {
      try {
        const page = this.pages.get(pageId);
        if (!page.ownedByRuntime) {
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
          continue;
        }
        if (page.controller === "human") {
          this.onHumanTakeover(page);
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
          continue;
        }
        if (!this.currentAuthority(turn, pageId)) {
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
          continue;
        }
        const result = await this.pages.close(pageId);
        if (result.ok) {
          closed.push(pageId);
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
        }
      } catch {
        try {
          this.pages.get(pageId);
        } catch {
          turn.pageIds.delete(pageId);
          turn.authority.delete(pageId);
        }
      }
    }
    if (turn.pageIds.size) turn.expiresAt = this.now() + 60_000;
    else this.turns.delete(key);
    return { closed };
  }
  async sweep(): Promise<void> {
    for (const [key, turn] of this.turns)
      if (turn.expiresAt <= this.now()) {
        const turnId = key.slice(`${turn.connectionId}:${turn.taskId}:`.length);
        await this.end(turn.connectionId, turn.taskId, turnId);
      }
  }
  async endAll(): Promise<void> {
    const results = await Promise.allSettled([...new Set([...this.turns.values()].map(turn => turn.connectionId))].map(id => this.endConnection(id)));
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected").map(result => result.reason);
    if (failures.length) throw new AggregateError(failures, "Original task tab retirement is incomplete.");
  }
  dispose() {
    clearInterval(this.timer);
  }
}
