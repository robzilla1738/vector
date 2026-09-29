import { AuxError, type PageTarget } from "@aux/contracts";
import type { PageService } from "../services/pages.js";

const TURN_TTL_MS = 60 * 60_000;
const MAX_TABS_PER_TURN = 8;
type Turn = { taskId: string; connectionId: string; expiresAt: number; pageIds: Set<string>; clipboardText?: string };

/** Runtime-owned tabs belong to a task turn, not the user's persistent session. */
export class AgentTurnTabs {
  private turns = new Map<string, Turn>();
  private timer: NodeJS.Timeout;
  constructor(private pages: Pick<PageService, "open" | "close" | "get">,
    private onHumanTakeover: (page: PageTarget) => void = () => {}, private now = Date.now) {
    this.timer = setInterval(() => { void this.sweep(); }, 60_000);
    this.timer.unref();
  }
  private key(connectionId: string, taskId: string, turnId: string) { return `${connectionId}:${taskId}:${turnId}`; }
  pageIds(connectionId: string): string[] {
    return [...this.turns.values()].filter(turn => turn.connectionId === connectionId).flatMap(turn => [...turn.pageIds]);
  }
  owns(connectionId: string, taskId: string, pageId: string): boolean {
    return [...this.turns.values()].some(turn => turn.connectionId === connectionId && turn.taskId === taskId && turn.pageIds.has(pageId));
  }
  private begin(connectionId: string, taskId: string, turnId: string): Turn {
    const key = this.key(connectionId, taskId, turnId);
    let turn = this.turns.get(key);
    if (!turn) {
      turn = { taskId, connectionId, expiresAt: this.now() + TURN_TTL_MS, pageIds: new Set() };
      this.turns.set(key, turn);
    }
    turn.expiresAt = this.now() + TURN_TTL_MS;
    return turn;
  }
  writeClipboard(connectionId: string, taskId: string, turnId: string, text: string): { bytes: number } {
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > 256_000) throw new AuxError("invalid_params", "The turn clipboard is limited to 256 KB of text.");
    this.begin(connectionId, taskId, turnId).clipboardText = text;
    return { bytes };
  }
  readClipboard(connectionId: string, taskId: string, turnId: string): string {
    const turn = this.turns.get(this.key(connectionId, taskId, turnId));
    if (!turn || turn.clipboardText === undefined) throw new AuxError("not_found", "This task turn has no clipboard text.");
    return turn.clipboardText;
  }
  async open(input: { connectionId: string; taskId: string; turnId: string; url: string; skipIfActive?: boolean; beforeNavigate?: (target: PageTarget) => Promise<void> }): Promise<PageTarget> {
    const turn = this.begin(input.connectionId, input.taskId, input.turnId);
    if (input.skipIfActive) for (const pageId of turn.pageIds) {
      try { const page = this.pages.get(pageId); if (page.url === input.url) { turn.expiresAt = this.now() + TURN_TTL_MS; return page; } }
      catch { turn.pageIds.delete(pageId); }
    }
    if (turn.pageIds.size >= MAX_TABS_PER_TURN) throw new AuxError("conflict", "A task turn can hold at most eight temporary tabs.");
    const page = await this.pages.open({ url: input.url, background: true, ownedByRuntime: true, beforeNavigate: input.beforeNavigate });
    turn.pageIds.add(page.pageId);
    turn.expiresAt = this.now() + TURN_TTL_MS;
    return page;
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
        if (!page.ownedByRuntime) { turn.pageIds.delete(pageId); continue; }
        if (page.controller === "human") { this.onHumanTakeover(page); turn.pageIds.delete(pageId); continue; }
        const result = await this.pages.close(pageId);
        if (result.ok) { closed.push(pageId); turn.pageIds.delete(pageId); }
      } catch {
        try { this.pages.get(pageId); } catch { turn.pageIds.delete(pageId); }
      }
    }
    if (turn.pageIds.size) turn.expiresAt = this.now() + 60_000;
    else this.turns.delete(key);
    return { closed };
  }
  async sweep(): Promise<void> {
    for (const [key, turn] of this.turns) if (turn.expiresAt <= this.now()) {
      const turnId = key.slice(`${turn.connectionId}:${turn.taskId}:`.length);
      await this.end(turn.connectionId, turn.taskId, turnId);
    }
  }
  async endAll(): Promise<void> {
    for (const key of this.turns.keys()) {
      const turn = this.turns.get(key)!;
      const turnId = key.slice(`${turn.connectionId}:${turn.taskId}:`.length);
      await this.end(turn.connectionId, turn.taskId, turnId);
    }
  }
  dispose() { clearInterval(this.timer); }
}
